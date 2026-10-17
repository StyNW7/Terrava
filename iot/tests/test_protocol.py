"""The Python codec, the TTN JavaScript formatter and the shared vectors must agree."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from terrava_iot import codec

ROOT = Path(__file__).resolve().parents[1]
VECTORS = json.loads((ROOT / "protocol" / "test-vectors.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("vector", VECTORS["uplinks"], ids=lambda v: v["name"])
def test_uplink_vectors_decode(vector):
    decoded = codec.as_dict(codec.decode(bytes.fromhex(vector["hex"])))
    expected = dict(vector["decoded"])
    if "firmware" in expected:
        expected["firmware"] = tuple(expected["firmware"])
    assert decoded == expected


@pytest.mark.parametrize("vector", VECTORS["uplinks"], ids=lambda v: v["name"])
def test_uplink_vectors_round_trip(vector):
    message = codec.decode(bytes.fromhex(vector["hex"]))
    encoder = {codec.Vitals: codec.encode_vitals, codec.Status: codec.encode_status, codec.Environment: codec.encode_environment}[type(message)]
    assert encoder(message).hex() == vector["hex"]


@pytest.mark.parametrize("vector", VECTORS["commands"], ids=lambda v: f"{v['command']}-{v['seq']}")
def test_command_vectors(vector):
    assert codec.encode_command(vector["command"], vector["seq"], vector["params"]).hex() == vector["hex"]
    decoded = codec.decode_command(bytes.fromhex(vector["hex"]))
    assert decoded.name == vector["command"] and decoded.seq == vector["seq"]
    for key, value in vector["params"].items():
        assert decoded.params[key] == value


@pytest.mark.parametrize("vector", VECTORS["p2p"], ids=lambda v: v["name"])
def test_p2p_frames(vector):
    device_id, fcnt, payload = codec.p2p_unframe(bytes.fromhex(vector["hex"]))
    assert (device_id, fcnt) == (vector["deviceId"], vector["fcnt"])
    assert codec.id_to_serial(device_id) == vector["serial"]
    assert codec.p2p_frame(device_id, fcnt, payload).hex() == vector["hex"]


def test_p2p_rejects_corruption():
    frame = bytearray.fromhex(VECTORS["p2p"][0]["hex"])
    frame[10] ^= 0xFF
    with pytest.raises(codec.PayloadError, match="CRC"):
        codec.p2p_unframe(bytes(frame))


def test_invalid_payloads():
    with pytest.raises(codec.PayloadError):
        codec.decode(b"")
    with pytest.raises(codec.PayloadError):
        codec.decode(bytes([0x21]) + bytes(21))  # wrong version
    with pytest.raises(codec.PayloadError):
        codec.decode(bytes([0x11, 0x00]))  # truncated
    with pytest.raises(codec.PayloadError):
        codec.encode_command("set-interval", 1, {"interval": 5})


def test_crc16_reference_value():
    # CRC-16/CCITT-FALSE check value for "123456789".
    assert codec.crc16_ccitt(b"123456789") == 0x29B1


def test_api_reading_matches_backend_contract():
    v = codec.decode(bytes.fromhex(VECTORS["uplinks"][0]["hex"]))
    reading = codec.to_api_reading("DEV-001", v, sequence=12, rssi=-97, snr=7.5)
    assert reading["deviceSerial"] == "DEV-001"
    assert reading["heartRate"] == 72 and reading["sequence"] == 12
    assert reading["recordedAt"].endswith("Z")


@pytest.mark.skipif(shutil.which("node") is None, reason="Node.js not installed")
def test_ttn_formatter_agrees_with_python():
    script = f"""
      const f = require({json.dumps(str(ROOT / 'protocol' / 'ttn-formatter.js'))});
      const v = require({json.dumps(str(ROOT / 'protocol' / 'test-vectors.json'))});
      const hex = (h) => h.match(/../g).map((x) => parseInt(x, 16));
      const out = {{
        uplinks: v.uplinks.map((u) => f.decodeUplink({{ bytes: hex(u.hex), fPort: u.fPort }}).data),
        commands: v.commands.map((c) => Buffer.from(f.encodeDownlink({{ data: {{ command: c.command, seq: c.seq, ...c.params }} }}).bytes).toString('hex')),
      }};
      console.log(JSON.stringify(out));
    """
    result = json.loads(subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True).stdout)
    for vector, decoded in zip(VECTORS["uplinks"], result["uplinks"]):
        expected = vector["decoded"]
        assert decoded["type"] == expected["type"]
        if expected["type"] == "vitals":
            assert decoded["temperature"] == expected["temperature"]
            assert decoded["heartRate"] == expected["heart_rate"]
            assert decoded["latitude"] == expected["latitude"]
            assert decoded["flags"]["replayed"] == bool(expected["flags"] & codec.FLAG_REPLAYED)
        elif expected["type"] == "environment":
            assert decoded["temperature"] == expected["temperature"]
            assert decoded["humidity"] == expected["humidity"]
        else:
            assert decoded["firmware"] == "v" + ".".join(map(str, expected["firmware"]))
    assert result["commands"] == [c["hex"] for c in VECTORS["commands"]]
