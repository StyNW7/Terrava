"""Virtual fleet of Terrava ear tags and barn sensors.

Every reading goes through the real binary codec (encode -> bytes -> decode),
exactly as it would over LoRa, so the simulator exercises the same protocol as
the firmware. Scenarios inject realistic problems so the backend's rule engine
and the AI layer can be demonstrated without hardware.
"""

from __future__ import annotations

import math
import random
import time
from dataclasses import dataclass, field

from . import codec

SCENARIOS = ("normal", "fever", "heat-stress", "respiratory", "lameness", "estrus", "geofence", "low-battery", "offline")


@dataclass
class VirtualTag:
    serial: str
    lat: float
    lng: float
    scenario: str = "normal"
    base_temp: float = 38.6
    base_hr: float = 68.0
    base_activity: float = 60.0
    base_spo2: float = 97.0
    battery: float = 95.0
    interval: int = 300
    firmware: tuple[int, int, int] = (2, 4, 1)
    fcnt: int = 0
    started_at: float = field(default_factory=time.time)
    last_cmd_seq: int = 0
    last_cmd_result: int = 0
    pending_status: bool = True  # boot status uplink
    rng: random.Random = field(default_factory=random.Random)

    def progress(self, now: float, ramp_minutes: float = 90) -> float:
        """0 -> 1 as the scenario develops over `ramp_minutes` of simulated time."""
        return min(1.0, max(0.0, (now - self.started_at) / (ramp_minutes * 60)))

    def reading(self, now: float, thi: float, stamp: float | None = None) -> codec.Vitals | None:
        """`now` drives scenario progress (may be accelerated); `stamp` is the real sample time."""
        stamp = stamp if stamp is not None else now
        if self.scenario == "offline" and self.progress(now, 10) >= 1:
            return None
        local = time.localtime(stamp)
        hour = local.tm_hour + local.tm_min / 60
        rhythm = 0.6 * math.sin((hour - 6) / 24 * 2 * math.pi)
        g = self.rng.gauss
        p = self.progress(now)

        temp = self.base_temp + 0.15 * rhythm + g(0, 0.06)
        hr = self.base_hr + 3 * rhythm + g(0, 2)
        spo2 = self.base_spo2 + g(0, 0.5)
        activity = self.base_activity * (1 + 0.35 * rhythm) + g(0, 4)
        lat, lng = self.lat + g(0, 0.0004), self.lng + g(0, 0.0004)
        drain = 0.002 if self.scenario != "low-battery" else 0.5

        if self.scenario == "fever":
            temp += 2.1 * p
            hr += 40 * p
            activity *= 1 - 0.6 * p
        elif self.scenario == "heat-stress":
            heat = max(0.0, (thi - 72) / 15)
            temp += 1.2 * heat
            hr += 22 * heat
            activity *= 1 - 0.35 * heat
        elif self.scenario == "respiratory":
            spo2 -= 9 * p
            hr += 30 * p
            temp += 0.8 * p
        elif self.scenario == "lameness":
            activity *= 1 - 0.75 * p
        elif self.scenario == "estrus":
            activity *= 1 + 1.3 * p
            temp += 0.3 * p
        elif self.scenario == "geofence":
            # Leave the farm boundary heading north. The seeded demo boundaries are
            # wide (they wrap every animal of a farm), so the escape is large too.
            lat += 0.5 * p

        self.battery = max(0.0, self.battery - drain * self.interval / 60)
        steps = max(0, int(activity * self.interval / 60 * 0.9 + g(0, 15)))
        return codec.Vitals(
            temperature=round(temp, 2),
            heart_rate=round(hr),
            oxygen=round(min(100, spo2)),
            activity=round(max(0, min(100, activity))),
            steps=steps,
            latitude=round(lat, 6),
            longitude=round(lng, 6),
            battery=round(self.battery),
            flags=codec.FLAG_CHARGING if 9 <= hour <= 15 and self.battery < 100 else 0,
            timestamp=int(stamp),
        )

    def uplink(self, now: float, thi: float, stamp: float | None = None) -> tuple[int, bytes] | None:
        """Next uplink as (fPort, payload bytes), status first after boot / commands."""
        if self.pending_status:
            self.pending_status = False
            status = codec.Status(
                firmware=self.firmware,
                uptime_hours=int((now - self.started_at) / 3600),
                report_interval=self.interval,
                battery=int(self.battery),
                buffered=0,
                last_command_seq=self.last_cmd_seq,
                last_command_result=self.last_cmd_result,
            )
            return codec.FPORT[codec.TYPE_STATUS], codec.encode_status(status)
        vitals = self.reading(now, thi, stamp)
        if vitals is None:
            return None
        self.fcnt += 1
        return codec.FPORT[codec.TYPE_VITALS], codec.encode_vitals(vitals)

    def apply(self, command: codec.Command) -> int:
        """Execute a downlink; returns 0 ok / 1 rejected."""
        self.last_cmd_seq = command.seq
        result = 0
        if command.name == "set-interval":
            self.interval = int(command.params["interval"])
        elif command.name == "restart":
            self.fcnt = 0
        elif command.name == "firmware-update":
            parts = command.params.get("version", "v0.0.0").lstrip("v").split(".")
            self.firmware = tuple(int(x) for x in (parts + ["0", "0"])[:3])  # type: ignore[assignment]
        elif command.name not in ("locate", "run-diagnostics"):
            result = 1
        self.last_cmd_result = result
        self.pending_status = True
        return result


@dataclass
class VirtualBarnSensor:
    serial: str
    base_temp: float = 28.0
    base_humidity: float = 70.0
    hot: bool = False
    battery: float = 90.0
    rng: random.Random = field(default_factory=random.Random)

    def reading(self, now: float) -> codec.Environment:
        hour = time.localtime(now).tm_hour + time.localtime(now).tm_min / 60
        daily = math.sin((hour - 8) / 24 * 2 * math.pi)
        temp = self.base_temp + 3.5 * daily + (5 if self.hot else 0) + self.rng.gauss(0, 0.3)
        humidity = max(30.0, min(98.0, self.base_humidity - 10 * daily + (8 if self.hot else 0) + self.rng.gauss(0, 1.5)))
        self.battery = max(0.0, self.battery - 0.001)
        return codec.Environment(round(temp, 2), round(humidity, 2), int(self.battery))

    def thi(self, now: float) -> float:
        r = self.reading(now)
        return 0.8 * r.temperature + (r.humidity / 100) * (r.temperature - 14.4) + 46.4


# Ear tags of the seeded demo organization (backend/prisma/seed.ts) and their paddock positions.
DEMO_TAGS = [
    ("DEV-001", -7.0000, 107.8000), ("DEV-002", -6.9053, 107.7213), ("DEV-003", -7.0895, 107.7354),
    ("DEV-004", -7.1437, 107.8762), ("DEV-005", -7.1817, 107.6239), ("DEV-006", -7.3855, 107.6619),
    ("DEV-007", -7.3126, 108.0510), ("DEV-008", -7.4635, 107.6195), ("DEV-009", -7.2390, 107.6225),
    ("DEV-010", -6.9443, 108.1811), ("DEV-011", -7.2197, 108.1189), ("DEV-012", -7.2894, 107.7120),
]
DEMO_SENSORS = ["DEV-017", "DEV-018", "DEV-019", "DEV-020"]


def build_fleet(count: int = 12, scenarios: dict[str, str] | None = None, interval: int = 300, seed: int = 7, hot_barns: bool = False):
    rng = random.Random(seed)
    scenarios = scenarios or {}
    tags = []
    for i in range(count):
        if i < len(DEMO_TAGS):
            serial, lat, lng = DEMO_TAGS[i]
        else:
            serial, lat, lng = f"TAG-{i + 1:03d}", -7.2 + rng.uniform(-0.2, 0.2), 107.9 + rng.uniform(-0.2, 0.2)
        tags.append(
            VirtualTag(
                serial=serial,
                lat=lat,
                lng=lng,
                scenario=scenarios.get(serial, "normal"),
                base_temp=rng.gauss(38.6, 0.15),
                base_hr=rng.gauss(68, 5),
                base_activity=rng.uniform(45, 70),
                base_spo2=rng.uniform(96, 98.5),
                battery=rng.uniform(60, 100) if scenarios.get(serial) != "low-battery" else 24,
                interval=interval,
                rng=random.Random(seed + i),
            )
        )
    sensors = [VirtualBarnSensor(serial, base_temp=rng.uniform(26, 29), base_humidity=rng.uniform(62, 75), hot=hot_barns, rng=random.Random(seed + 100 + i)) for i, serial in enumerate(DEMO_SENSORS)]
    return tags, sensors
