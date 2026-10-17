"""LoRaWAN network server -> Terrava backend bridge (MQTT).

Subscribes to uplinks from The Things Stack (TTN v3) or ChirpStack v4,
decodes the raw FRMPayload with the Terrava codec (no network-side formatter
required), forwards readings to the backend through the durable outbox, and
turns pending backend commands into LoRaWAN downlinks.

    python -m terrava_iot bridge --network ttn --mqtt-host au1.cloud.thethings.network \\
        --mqtt-user terrava@ttn --mqtt-password NNSXS... --app terrava \\
        --api http://localhost:4000/api/v1 --key trv_gw_...
"""

from __future__ import annotations

import base64
import json
import logging
import threading
import time
from dataclasses import dataclass
from datetime import datetime

from . import codec
from .backend import BackendClient

log = logging.getLogger("terrava.iot.bridge")


@dataclass
class Uplink:
    dev_eui: str
    fport: int
    payload: bytes
    fcnt: int | None
    rssi: int | None
    snr: float | None
    received_at: float


def parse_ttn(message: dict) -> Uplink | None:
    up = message.get("uplink_message")
    if not up or "frm_payload" not in up:
        return None
    best = max(up.get("rx_metadata", [{}]), key=lambda m: m.get("rssi", m.get("channel_rssi", -999)), default={})
    received = message.get("received_at")
    return Uplink(
        dev_eui=message["end_device_ids"]["dev_eui"].upper(),
        fport=up.get("f_port", 0),
        payload=base64.b64decode(up["frm_payload"]),
        fcnt=up.get("f_cnt"),
        rssi=best.get("rssi", best.get("channel_rssi")),
        snr=best.get("snr"),
        received_at=datetime.fromisoformat(received).timestamp() if received else time.time(),
    )


def parse_chirpstack(message: dict) -> Uplink | None:
    if "data" not in message:
        return None
    rx = max(message.get("rxInfo", [{}]), key=lambda m: m.get("rssi", -999), default={})
    return Uplink(
        dev_eui=message["deviceInfo"]["devEui"].upper(),
        fport=message.get("fPort", 0),
        payload=base64.b64decode(message["data"]),
        fcnt=message.get("fCnt"),
        rssi=rx.get("rssi"),
        snr=rx.get("snr"),
        received_at=time.time(),
    )


def uplink_to_readings(uplink: Uplink) -> tuple[list[dict], list[dict]]:
    """Returns (telemetry readings, environment readings) for the backend."""
    try:
        message = codec.decode(uplink.payload)
    except codec.PayloadError as error:
        log.warning("Undecodable uplink from %s: %s", uplink.dev_eui, error)
        return [], []
    if isinstance(message, codec.Vitals):
        reading = codec.to_api_reading("", message, uplink.fcnt, uplink.rssi, uplink.snr, uplink.received_at)
        reading.pop("deviceSerial", None)
        reading["devEui"] = uplink.dev_eui
        return [reading], []
    if isinstance(message, codec.Environment):
        # Environment readings are keyed by serial; map the DevEUI via --sensor EUI=SERIAL.
        return [], [{"devEui": uplink.dev_eui, "temperature": message.temperature, "humidity": message.humidity, "battery": message.battery, "rssi": uplink.rssi, "snr": uplink.snr}]
    log.info("Status from %s: firmware v%s, battery %s%%, buffered %s", uplink.dev_eui, ".".join(map(str, message.firmware)), message.battery, message.buffered)
    return [], []


class MqttBridge:
    def __init__(self, backend: BackendClient, network: str, app: str, host: str, port: int = 8883, username: str | None = None, password: str | None = None, tls: bool = True, sensors: dict[str, str] | None = None, command_poll_seconds: int = 30):
        import paho.mqtt.client as mqtt

        self.backend = backend
        self.network = network
        self.app = app
        self.sensors = {k.upper(): v for k, v in (sensors or {}).items()}
        self.command_poll_seconds = command_poll_seconds
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"terrava-bridge-{int(time.time())}")
        if username:
            self.client.username_pw_set(username, password)
        if tls:
            self.client.tls_set()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.host, self.port = host, port
        self._seq = 0
        self._stop = threading.Event()

    @property
    def uplink_topic(self) -> str:
        return f"v3/{self.app}/devices/+/up" if self.network == "ttn" else f"application/{self.app}/device/+/event/up"

    def _on_connect(self, client, _userdata, _flags, reason, _props=None):
        log.info("Connected to %s MQTT (%s); subscribing to %s", self.network, reason, self.uplink_topic)
        client.subscribe(self.uplink_topic, qos=1)

    def _on_message(self, _client, _userdata, msg):
        try:
            payload = json.loads(msg.payload)
            uplink = parse_ttn(payload) if self.network == "ttn" else parse_chirpstack(payload)
        except (ValueError, KeyError) as error:
            log.warning("Ignoring malformed message on %s: %s", msg.topic, error)
            return
        if not uplink:
            return
        telemetry, environment = uplink_to_readings(uplink)
        mapped = []
        for reading in environment:
            eui = reading.pop("devEui")
            serial = self.sensors.get(eui)
            if serial:
                mapped.append({**reading, "deviceSerial": serial})
            else:
                log.warning("Environment sensor %s is not mapped to a serial (use --sensor EUI=SERIAL)", eui)
        self.backend.send_telemetry(telemetry)
        if mapped:
            self.backend.send_environment(mapped)

    def _downlink(self, command: dict):
        if not command.get("devEui"):
            log.warning("Command %s has no DevEUI; cannot route over LoRaWAN", command["id"])
            self.backend.ack_command(command["id"], False, {"error": "device has no DevEUI"})
            return
        self._seq = (self._seq + 1) % 256
        data = base64.b64encode(codec.encode_command(command["type"], self._seq, command.get("payload") or {})).decode()
        dev = command["devEui"].lower()
        if self.network == "ttn":
            topic = f"v3/{self.app}/devices/eui-{dev}/down/push"
            body = {"downlinks": [{"f_port": codec.FPORT_COMMANDS, "frm_payload": data, "priority": "NORMAL"}]}
        else:
            topic = f"application/{self.app}/device/{dev}/command/down"
            body = {"devEui": dev, "confirmed": False, "fPort": codec.FPORT_COMMANDS, "data": data}
        self.client.publish(topic, json.dumps(body), qos=1)
        # LoRaWAN class A delivers on the next uplink; the tag confirms in its status uplink.
        self.backend.ack_command(command["id"], True, {"queuedAs": topic, "seq": self._seq})
        log.info("Queued %s for %s", command["type"], dev)

    def run(self):
        self.client.connect(self.host, self.port, keepalive=60)
        self.client.loop_start()
        started = time.time()
        try:
            while not self._stop.wait(self.command_poll_seconds):
                for command in self.backend.pull_commands():
                    self._downlink(command)
                self.backend.send_telemetry([])  # flush any outbox backlog
                self.backend.heartbeat("bridge-1.0.0", int(time.time() - started), self.backend.stats["sent"])
        finally:
            self.client.loop_stop()
            self.client.disconnect()

    def stop(self):
        self._stop.set()
