import base64
import json
import time

import httpx

from terrava_iot import codec
from terrava_iot.backend import BackendClient, Outbox
from terrava_iot.bridge import parse_chirpstack, parse_ttn, uplink_to_readings
from terrava_iot.simulator import build_fleet


def _vitals(tag, minutes, thi=70.0):
    start = tag.started_at
    return tag.reading(start + minutes * 60, thi, stamp=start)


def test_normal_tag_stays_in_normal_ranges():
    tags, _ = build_fleet(3)
    for tag in tags:
        for minute in range(0, 300, 30):
            v = _vitals(tag, minute)
            assert 37.8 < v.temperature < 39.4
            assert 45 < v.heart_rate < 95
            assert 0 <= v.activity <= 100


def test_fever_scenario_develops():
    tags, _ = build_fleet(1, {"DEV-001": "fever"})
    early, late = _vitals(tags[0], 0), _vitals(tags[0], 120)
    assert late.temperature - early.temperature > 1.5
    assert late.heart_rate > early.heart_rate + 25


def test_geofence_and_offline_scenarios():
    tags, _ = build_fleet(2, {"DEV-001": "geofence", "DEV-002": "offline"})
    assert _vitals(tags[0], 120).latitude - tags[0].lat > 0.4
    assert _vitals(tags[1], 30) is None


def test_commands_change_tag_behaviour():
    tags, _ = build_fleet(1)
    tag = tags[0]
    tag.pending_status = False
    assert tag.apply(codec.decode_command(codec.encode_command("set-interval", 9, {"interval": 900}))) == 0
    assert tag.interval == 900
    fport, payload = tag.uplink(time.time(), 70)
    status = codec.decode(payload)
    assert fport == 2 and status.last_command_seq == 9 and status.report_interval == 900


def test_parse_ttn_and_chirpstack_uplinks():
    payload = codec.encode_vitals(codec.Vitals(39.9, 98, 95, 30, 100, -7.5, 110.6, 70, 0, 0))
    ttn = {
        "end_device_ids": {"dev_eui": "70b3d57ed0005a10"},
        "received_at": "2026-10-17T03:00:00.123456789Z".replace("123456789", "123456"),
        "uplink_message": {"f_port": 1, "f_cnt": 7, "frm_payload": base64.b64encode(payload).decode(), "rx_metadata": [{"rssi": -99, "snr": 4}]},
    }
    up = parse_ttn(ttn)
    telemetry, environment = uplink_to_readings(up)
    assert telemetry[0]["devEui"] == "70B3D57ED0005A10" and telemetry[0]["temperature"] == 39.9 and telemetry[0]["sequence"] == 7
    assert environment == []

    chirp = {"deviceInfo": {"devEui": "70b3d57ed0005a11"}, "fPort": 3, "fCnt": 2, "data": base64.b64encode(codec.encode_environment(codec.Environment(31.2, 75, 90))).decode(), "rxInfo": [{"rssi": -90, "snr": 6}]}
    telemetry, environment = uplink_to_readings(parse_chirpstack(chirp))
    assert telemetry == [] and environment[0]["humidity"] == 75


def test_outbox_keeps_readings_when_backend_is_down():
    calls = {"n": 0}

    def handler(request: httpx.Request):
        calls["n"] += 1
        if calls["n"] == 1:
            raise httpx.ConnectError("down")
        body = json.loads(request.content)
        return httpx.Response(202, json={"accepted": len(body["readings"]), "duplicates": 0, "rejected": [], "alertsRaised": 0})

    client = BackendClient("http://backend/api/v1", "trv_gw_test_key_000000000000", Outbox())
    client.http = httpx.Client(base_url="http://backend/api/v1", transport=httpx.MockTransport(handler))
    client.send_telemetry([{"deviceSerial": "DEV-001", "temperature": 38.6}])
    assert client.outbox.size() == 1  # kept after the failure
    # Make the queued item due again and retry.
    client.outbox.db.execute("UPDATE outbox SET next_try = 0")
    client.send_telemetry([])
    assert client.outbox.size() == 0
    assert client.stats["accepted"] == 1
