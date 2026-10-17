"""HTTP client for the Terrava backend ingest API, with a durable outbox.

Rural backhaul (Wi-Fi, 4G) drops often. Readings that cannot be delivered are
kept in a small SQLite outbox and retried with exponential backoff, so no data
is lost when the gateway or bridge goes offline for a while. The backend
de-duplicates replays by (device, frame counter, timestamp).
"""

from __future__ import annotations

import json
import logging
import sqlite3
import threading
import time
from pathlib import Path

import httpx

log = logging.getLogger("terrava.iot.backend")


class Outbox:
    def __init__(self, path: Path | str = ":memory:"):
        self.db = sqlite3.connect(str(path), check_same_thread=False)
        self.lock = threading.Lock()
        self.db.execute("CREATE TABLE IF NOT EXISTS outbox (id INTEGER PRIMARY KEY, endpoint TEXT, body TEXT, attempts INTEGER DEFAULT 0, next_try REAL DEFAULT 0)")
        self.db.commit()

    def put(self, endpoint: str, items: list[dict]):
        with self.lock:
            self.db.executemany("INSERT INTO outbox (endpoint, body) VALUES (?, ?)", [(endpoint, json.dumps(item)) for item in items])
            self.db.commit()

    def due(self, endpoint: str, limit: int = 200) -> list[tuple[int, dict, int]]:
        with self.lock:
            rows = self.db.execute("SELECT id, body, attempts FROM outbox WHERE endpoint = ? AND next_try <= ? ORDER BY id LIMIT ?", (endpoint, time.time(), limit)).fetchall()
        return [(row[0], json.loads(row[1]), row[2]) for row in rows]

    def done(self, ids: list[int]):
        with self.lock:
            self.db.executemany("DELETE FROM outbox WHERE id = ?", [(i,) for i in ids])
            self.db.commit()

    def retry_later(self, ids: list[int], attempts: int):
        delay = min(600, 2 ** min(attempts, 9))
        with self.lock:
            self.db.executemany("UPDATE outbox SET attempts = attempts + 1, next_try = ? WHERE id = ?", [(time.time() + delay, i) for i in ids])
            self.db.commit()

    def size(self) -> int:
        with self.lock:
            return self.db.execute("SELECT COUNT(*) FROM outbox").fetchone()[0]


class BackendClient:
    """Thin wrapper over /api/v1/ingest/* authenticated with a gateway key."""

    def __init__(self, base_url: str, device_key: str, outbox: Outbox | None = None, timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.http = httpx.Client(base_url=self.base_url, headers={"x-device-key": device_key, "User-Agent": "terrava-iot/1.0"}, timeout=timeout)
        self.outbox = outbox or Outbox()
        self.stats = {"sent": 0, "accepted": 0, "duplicates": 0, "rejected": 0, "alerts": 0, "failed": 0}

    def _deliver(self, endpoint: str) -> None:
        batch = self.outbox.due(endpoint)
        if not batch:
            return
        ids = [row[0] for row in batch]
        try:
            response = self.http.post(endpoint, json={"readings": [row[1] for row in batch]})
        except httpx.HTTPError as error:
            log.warning("Backend unreachable (%s); %d reading(s) kept in outbox", error.__class__.__name__, len(ids))
            self.outbox.retry_later(ids, max(row[2] for row in batch))
            self.stats["failed"] += len(ids)
            return
        if response.status_code in (200, 202):
            result = response.json()
            self.outbox.done(ids)
            self.stats["sent"] += len(ids)
            for key, field in (("accepted", "accepted"), ("duplicates", "duplicates"), ("alerts", "alertsRaised")):
                self.stats[key] += int(result.get(field, 0))
            self.stats["rejected"] += len(result.get("rejected", []))
            for rejected in result.get("rejected", []):
                log.warning("Rejected reading: %s", rejected.get("reason"))
        elif response.status_code in (400, 401, 403, 422):
            # Not retryable: drop and log so a bad payload cannot block the queue.
            log.error("Backend refused batch (%s): %s", response.status_code, response.text[:300])
            self.outbox.done(ids)
            self.stats["rejected"] += len(ids)
        else:
            log.warning("Backend error %s; will retry", response.status_code)
            self.outbox.retry_later(ids, max(row[2] for row in batch))

    def send_telemetry(self, readings: list[dict]) -> None:
        if readings:
            self.outbox.put("/ingest/telemetry", readings)
        self._deliver("/ingest/telemetry")

    def send_environment(self, readings: list[dict]) -> None:
        if readings:
            self.outbox.put("/ingest/environment", readings)
        self._deliver("/ingest/environment")

    def heartbeat(self, firmware: str, uptime_seconds: int, packets: int) -> bool:
        try:
            return self.http.post("/ingest/heartbeat", json={"firmware": firmware, "uptimeSeconds": uptime_seconds, "packetsForwarded": packets, "backhaul": "wifi"}).status_code == 200
        except httpx.HTTPError:
            return False

    def pull_commands(self) -> list[dict]:
        try:
            response = self.http.get("/ingest/commands")
            return response.json() if response.status_code == 200 else []
        except httpx.HTTPError:
            return []

    def ack_command(self, command_id: str, success: bool, result: dict | None = None) -> None:
        try:
            self.http.post(f"/ingest/commands/{command_id}/ack", json={"success": success, "result": result or {}})
        except httpx.HTTPError as error:
            log.warning("Could not acknowledge command %s: %s", command_id, error)

    def close(self):
        self.http.close()
