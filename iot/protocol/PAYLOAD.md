# Terrava Ear Tag Payload Protocol — v1

A compact binary format so a reading fits comfortably in a single LoRa frame,
even at the slowest data rates. Every multi-byte field is **big-endian**.

The same layout is implemented in three places and verified against
[`test-vectors.json`](test-vectors.json):

| Implementation | Used by |
| --- | --- |
| [`terrava_payload.h`](terrava_payload.h) (C/C++, header-only) | ear tag and gateway firmware |
| [`terrava_iot/codec.py`](../terrava_iot/codec.py) | simulator, bridge, tests |
| [`ttn-formatter.js`](ttn-formatter.js) | The Things Network / ChirpStack payload formatter |

## Transport

| Mode | Framing | Path to the cloud |
| --- | --- | --- |
| **LoRaWAN** (production) | payload = LoRaWAN FRMPayload; message type is the **FPort** | TTN / ChirpStack → webhook `POST /api/v1/ingest/ttn` or MQTT → `terrava_iot bridge` → `POST /api/v1/ingest/telemetry` |
| **LoRa P2P** (pilots without LoRaWAN coverage) | `P2P frame` below | Terrava gateway firmware (ESP32) → Wi-Fi → `POST /api/v1/ingest/telemetry` |

## Header byte (every uplink)

```
bit 7..4  protocol version (1)
bit 3..0  message type: 1 = vitals, 2 = status, 3 = environment
```

## Type 1 — Vitals (FPort 1, 22 bytes)

| Offset | Size | Field | Encoding |
| ---: | ---: | --- | --- |
| 0 | 1 | header | `0x11` |
| 1 | 2 | temperature | uint16, °C × 100 (`0xFFFF` = n/a) |
| 3 | 1 | heart rate | uint8, bpm (`0xFF` = n/a) |
| 4 | 1 | oxygen (SpO₂) | uint8, % (`0xFF` = n/a) |
| 5 | 1 | activity | uint8, index 0–100 |
| 6 | 2 | steps | uint16, steps since the previous uplink |
| 8 | 4 | latitude | int32, degrees × 10⁶ (`0x7FFFFFFF` = no fix) |
| 12 | 4 | longitude | int32, degrees × 10⁶ |
| 16 | 1 | battery | uint8, % |
| 17 | 1 | flags | bit0 GPS fix · bit1 solar charging · bit2 replayed from flash buffer · bit3 temperature sensor fault · bit4 heart-rate sensor fault · bit5 low-power mode |
| 18 | 4 | timestamp | uint32, Unix seconds when the sample was taken (`0` = use receive time) |

## Type 2 — Status (FPort 2, 13 bytes)

Sent after boot, after every downlink command and once a day.

| Offset | Size | Field | Encoding |
| ---: | ---: | --- | --- |
| 0 | 1 | header | `0x12` |
| 1 | 3 | firmware | major, minor, patch |
| 4 | 2 | uptime | uint16, hours |
| 6 | 2 | report interval | uint16, seconds |
| 8 | 1 | battery | uint8, % |
| 9 | 2 | buffered readings | uint16, readings waiting in flash |
| 11 | 1 | last command sequence | uint8 (echo of the downlink `seq`) |
| 12 | 1 | last command result | 0 = ok, 1 = rejected, 2 = failed |

## Type 3 — Environment (FPort 3, 8 bytes)

Barn sensors (same radio stack, no vital-sign sensors).

| Offset | Size | Field | Encoding |
| ---: | ---: | --- | --- |
| 0 | 1 | header | `0x13` |
| 1 | 2 | temperature | int16, °C × 100 |
| 3 | 2 | humidity | uint16, % × 100 |
| 5 | 1 | battery | uint8, % |
| 6 | 2 | reserved | `0x0000` |

## Downlink commands (FPort 10)

```
byte 0  command
byte 1  sequence number (echoed in the next status uplink)
byte 2+ parameters
```

| Command | Code | Parameters | Effect |
| --- | --- | --- | --- |
| restart | `0x01` | — | Reboot the tag after acknowledging |
| run-diagnostics | `0x02` | — | Sensor self-test; result in the status uplink |
| set-interval | `0x03` | uint16: bit 15 = 0 → seconds (30–32767); bit 15 = 1 → minutes in bits 0–14 (up to 1440 = 24 h) | Change the reporting interval |
| locate | `0x04` | — | Immediate GPS fix + LED blink |
| firmware-update | `0x05` | 3 bytes version | Enter maintenance mode for an over-the-air update |

The backend's command names (`restart`, `run-diagnostics`, `set-interval`,
`locate`, `firmware-update`) map one-to-one to these codes.

## P2P frame (LoRa without LoRaWAN)

```
0      1          5        7               7+n      9+n
+------+----------+--------+---------------+--------+
| 0xA5 | device id| fcnt   | payload (n)   | CRC-16 |
+------+----------+--------+---------------+--------+
  magic  uint32     uint16                   CCITT-FALSE over bytes 0..6+n
```

- **device id** — numeric part of the serial (`DEV-001` → 1, `TAG-013` → 13 + 0x01000000).
- **fcnt** — frame counter for duplicate suppression (`sequence` in the API).
- Downlinks use the same frame with the gateway as sender and the command bytes as payload; the tag listens for 2 s after each uplink.
