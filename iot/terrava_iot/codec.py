"""Python implementation of the Terrava payload protocol v1 (see protocol/PAYLOAD.md)."""

from __future__ import annotations

import math
import struct
from dataclasses import asdict, dataclass, field

VERSION = 1
TYPE_VITALS, TYPE_STATUS, TYPE_ENVIRONMENT = 1, 2, 3
FPORT = {TYPE_VITALS: 1, TYPE_STATUS: 2, TYPE_ENVIRONMENT: 3}
FPORT_COMMANDS = 10
P2P_MAGIC = 0xA5

NA_U8, NA_U16, NO_FIX = 0xFF, 0xFFFF, 0x7FFFFFFF

FLAG_GPS_FIX = 1 << 0
FLAG_CHARGING = 1 << 1
FLAG_REPLAYED = 1 << 2
FLAG_TEMP_FAULT = 1 << 3
FLAG_HR_FAULT = 1 << 4
FLAG_LOW_POWER = 1 << 5

COMMANDS = {"restart": 0x01, "run-diagnostics": 0x02, "set-interval": 0x03, "locate": 0x04, "firmware-update": 0x05}
COMMAND_NAMES = {code: name for name, code in COMMANDS.items()}

_VITALS = struct.Struct(">BHBBBHiiBBI")  # 22 bytes
_STATUS = struct.Struct(">BBBBHHBHBB")  # 13 bytes
_ENV = struct.Struct(">BhHBH")  # 8 bytes


class PayloadError(ValueError):
    pass


@dataclass
class Vitals:
    temperature: float | None = None
    heart_rate: int | None = None
    oxygen: int | None = None
    activity: int = 0
    steps: int = 0
    latitude: float | None = None
    longitude: float | None = None
    battery: int = 100
    flags: int = 0
    timestamp: int = 0

    @property
    def replayed(self) -> bool:
        return bool(self.flags & FLAG_REPLAYED)


@dataclass
class Status:
    firmware: tuple[int, int, int] = (2, 4, 0)
    uptime_hours: int = 0
    report_interval: int = 300
    battery: int = 100
    buffered: int = 0
    last_command_seq: int = 0
    last_command_result: int = 0


@dataclass
class Environment:
    temperature: float = 0.0
    humidity: float = 0.0
    battery: int = 100


@dataclass
class Command:
    name: str
    seq: int
    params: dict = field(default_factory=dict)


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def _round(value: float) -> int:
    """Round half away from zero, exactly like the C implementation (Python's round() is banker's rounding)."""
    return math.floor(value + 0.5) if value >= 0 else -math.floor(-value + 0.5)


# ---------------------------------------------------------------------------
# Uplinks
# ---------------------------------------------------------------------------

def encode_vitals(v: Vitals) -> bytes:
    has_fix = v.latitude is not None and v.longitude is not None
    flags = (v.flags | FLAG_GPS_FIX) if has_fix else (v.flags & ~FLAG_GPS_FIX)
    return _VITALS.pack(
        (VERSION << 4) | TYPE_VITALS,
        NA_U16 if v.temperature is None else _clamp(_round(v.temperature * 100), 0, 0xFFFE),
        NA_U8 if v.heart_rate is None else _clamp(int(v.heart_rate), 0, 0xFE),
        NA_U8 if v.oxygen is None else _clamp(int(v.oxygen), 0, 100),
        _clamp(int(v.activity), 0, 100),
        _clamp(int(v.steps), 0, 0xFFFF),
        _round(v.latitude * 1e6) if has_fix else NO_FIX,
        _round(v.longitude * 1e6) if has_fix else NO_FIX,
        _clamp(int(v.battery), 0, 100),
        flags & 0xFF,
        _clamp(int(v.timestamp), 0, 0xFFFFFFFF),
    )


def encode_status(s: Status) -> bytes:
    return _STATUS.pack(
        (VERSION << 4) | TYPE_STATUS,
        *s.firmware,
        _clamp(s.uptime_hours, 0, 0xFFFF),
        _clamp(s.report_interval, 0, 0xFFFF),
        _clamp(s.battery, 0, 100),
        _clamp(s.buffered, 0, 0xFFFF),
        s.last_command_seq & 0xFF,
        s.last_command_result & 0xFF,
    )


def encode_environment(e: Environment) -> bytes:
    return _ENV.pack((VERSION << 4) | TYPE_ENVIRONMENT, _round(e.temperature * 100), _clamp(_round(e.humidity * 100), 0, 10000), _clamp(e.battery, 0, 100), 0)


def decode(payload: bytes) -> Vitals | Status | Environment:
    if not payload:
        raise PayloadError("empty payload")
    version, kind = payload[0] >> 4, payload[0] & 0x0F
    if version != VERSION:
        raise PayloadError(f"unsupported protocol version {version}")
    try:
        if kind == TYPE_VITALS:
            _, t, hr, ox, act, steps, lat, lng, bat, flags, ts = _VITALS.unpack(payload)
            fix = lat != NO_FIX and lng != NO_FIX
            return Vitals(
                temperature=None if t == NA_U16 else t / 100,
                heart_rate=None if hr == NA_U8 else hr,
                oxygen=None if ox == NA_U8 else ox,
                activity=act,
                steps=steps,
                latitude=lat / 1e6 if fix else None,
                longitude=lng / 1e6 if fix else None,
                battery=bat,
                flags=flags,
                timestamp=ts,
            )
        if kind == TYPE_STATUS:
            _, major, minor, patch, uptime, interval, bat, buffered, seq, result = _STATUS.unpack(payload)
            return Status((major, minor, patch), uptime, interval, bat, buffered, seq, result)
        if kind == TYPE_ENVIRONMENT:
            _, t, h, bat, _ = _ENV.unpack(payload)
            return Environment(t / 100, h / 100, bat)
    except struct.error as error:
        raise PayloadError(f"payload length {len(payload)} is invalid for type {kind}") from error
    raise PayloadError(f"unknown message type {kind}")


# ---------------------------------------------------------------------------
# Downlinks
# ---------------------------------------------------------------------------

def encode_command(name: str, seq: int, params: dict | None = None) -> bytes:
    if name not in COMMANDS:
        raise PayloadError(f"unknown command {name}")
    params = params or {}
    body = bytes([COMMANDS[name], seq & 0xFF])
    if name == "set-interval":
        interval = int(params.get("interval", 0))
        if not 30 <= interval <= 86_400:
            raise PayloadError("interval must be 30-86400 seconds")
        # Values above 65535 s are sent in minutes with the top bit set.
        body += struct.pack(">H", interval if interval <= 0x7FFF else 0x8000 | (interval // 60))
    elif name == "firmware-update":
        parts = [int(p) for p in str(params.get("version", "0.0.0")).lstrip("v").split(".")[:3]]
        body += bytes((parts + [0, 0, 0])[:3])
    return body


def decode_command(payload: bytes) -> Command:
    if len(payload) < 2 or payload[0] not in COMMAND_NAMES:
        raise PayloadError("invalid command payload")
    name, seq = COMMAND_NAMES[payload[0]], payload[1]
    params: dict = {}
    if name == "set-interval":
        raw = struct.unpack(">H", payload[2:4])[0]
        params["interval"] = (raw & 0x7FFF) * 60 if raw & 0x8000 else raw
    elif name == "firmware-update":
        params["version"] = "v" + ".".join(str(b) for b in payload[2:5])
    return Command(name, seq, params)


# ---------------------------------------------------------------------------
# P2P framing
# ---------------------------------------------------------------------------

def crc16_ccitt(data: bytes) -> int:
    crc = 0xFFFF
    for byte in data:
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if crc & 0x8000 else (crc << 1) & 0xFFFF
    return crc


def p2p_frame(device_id: int, fcnt: int, payload: bytes) -> bytes:
    head = struct.pack(">BIH", P2P_MAGIC, device_id & 0xFFFFFFFF, fcnt & 0xFFFF) + payload
    return head + struct.pack(">H", crc16_ccitt(head))


def p2p_unframe(frame: bytes) -> tuple[int, int, bytes]:
    if len(frame) < 9 or frame[0] != P2P_MAGIC:
        raise PayloadError("not a Terrava P2P frame")
    if crc16_ccitt(frame[:-2]) != struct.unpack(">H", frame[-2:])[0]:
        raise PayloadError("CRC mismatch")
    _, device_id, fcnt = struct.unpack(">BIH", frame[:7])
    return device_id, fcnt, frame[7:-2]


def serial_to_id(serial: str) -> int:
    """`DEV-001` -> 1, `TAG-013` -> 0x0100000D (namespaced so the two series never collide)."""
    prefix, _, number = serial.upper().partition("-")
    base = {"DEV": 0, "TAG": 0x01000000, "ENV": 0x02000000}.get(prefix)
    if base is None or not number.isdigit():
        raise PayloadError(f"unsupported serial {serial}")
    return base + int(number)


def id_to_serial(device_id: int) -> str:
    prefix = {0: "DEV", 1: "TAG", 2: "ENV"}.get(device_id >> 24, "DEV")
    return f"{prefix}-{device_id & 0xFFFFFF:03d}"


# ---------------------------------------------------------------------------
# Backend API mapping
# ---------------------------------------------------------------------------

def to_api_reading(serial: str, v: Vitals, sequence: int | None = None, rssi: int | None = None, snr: float | None = None, received_at: float | None = None) -> dict:
    """Shape a decoded reading for `POST /api/v1/ingest/telemetry`."""
    from datetime import UTC, datetime

    ts = v.timestamp or received_at
    reading = {
        "deviceSerial": serial,
        "sequence": sequence,
        "temperature": v.temperature,
        "heartRate": v.heart_rate,
        "oxygen": v.oxygen,
        "activity": v.activity,
        "steps": v.steps,
        "latitude": v.latitude,
        "longitude": v.longitude,
        "battery": v.battery,
        "rssi": rssi,
        "snr": snr,
        "recordedAt": datetime.fromtimestamp(ts, UTC).isoformat().replace("+00:00", "Z") if ts else None,
    }
    return {k: value for k, value in reading.items() if value is not None}


def as_dict(message: Vitals | Status | Environment) -> dict:
    data = asdict(message)
    data["type"] = {Vitals: "vitals", Status: "status", Environment: "environment"}[type(message)]
    return data
