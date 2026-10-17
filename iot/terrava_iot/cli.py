"""Terrava IoT command line.

  python -m terrava_iot simulate            virtual ear tags on the console
  python -m terrava_iot simulate --api URL --key KEY --scenario DEV-001=fever
                                            stream to the backend (closed loop with commands)
  python -m terrava_iot decode 110f19...    decode a payload (hex or base64)
  python -m terrava_iot command set-interval --seq 1 --interval 600
  python -m terrava_iot bridge ...          TTN / ChirpStack MQTT -> backend
"""

from __future__ import annotations

import argparse
import base64
import json
import logging
import signal
import sys
import time

from . import codec
from .simulator import SCENARIOS, build_fleet

DEMO_KEY = "trv_gw_demo_green_valley_key_change_me_0001"


def _parse_scenarios(values: list[str]) -> dict[str, str]:
    scenarios = {}
    for item in values or []:
        serial, _, scenario = item.partition("=")
        if scenario not in SCENARIOS:
            raise SystemExit(f"Unknown scenario '{scenario}'. Choose from: {', '.join(SCENARIOS)}")
        scenarios[serial.upper()] = scenario
    return scenarios


def cmd_simulate(args):
    scenarios = _parse_scenarios(args.scenario)
    tags, sensors = build_fleet(args.devices, scenarios, interval=args.interval, hot_barns=args.hot)
    backend = None
    if args.api:
        from .backend import BackendClient, Outbox

        backend = BackendClient(args.api, args.key, Outbox(args.outbox) if args.outbox else None)

    real_start = time.time()
    for tag in tags:
        tag.started_at = real_start  # scenario clock origin
    running = True

    def stop(*_):
        nonlocal running
        running = False

    def collect(virtual_now: float, stamp: float, verbose: bool):
        thi = sensors[0].thi(stamp) if sensors else 70.0
        telemetry, environment = [], []
        for tag in tags:
            uplink = tag.uplink(virtual_now, thi, stamp)
            if not uplink:
                continue
            _, payload = uplink
            message = codec.decode(payload)  # exactly what a gateway decodes from the air
            if isinstance(message, codec.Vitals):
                telemetry.append(codec.to_api_reading(tag.serial, message, tag.fcnt, rssi=int(-85 - tag.rng.random() * 20), snr=round(9 - tag.rng.random() * 8, 1)))
                if verbose:
                    flag = "" if tag.scenario == "normal" else f"  [{tag.scenario}]"
                    print(f"  {tag.serial}  {payload.hex()}  T={message.temperature:.2f}°C HR={message.heart_rate} SpO2={message.oxygen} ACT={message.activity:>3} BAT={message.battery}%{flag}")
            elif verbose:
                print(f"  {tag.serial}  status {payload.hex()}  fw v{'.'.join(map(str, message.firmware))} interval {message.report_interval}s")
        for sensor in sensors:
            env = codec.decode(codec.encode_environment(sensor.reading(stamp)))
            environment.append({"deviceSerial": sensor.serial, "temperature": env.temperature, "humidity": env.humidity, "battery": env.battery, "recordedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(stamp))})
        return telemetry, environment

    signal.signal(signal.SIGINT, stop)
    mode = f"-> {args.api}" if backend else "(console only; add --api to stream to the backend)"
    print(f"Simulating {len(tags)} ear tags + {len(sensors)} barn sensors, interval {args.interval}s, scenarios x{args.speed} {mode}")
    if scenarios:
        print("Scenarios: " + ", ".join(f"{k}={v}" for k, v in scenarios.items()))

    # Optional history so the backend has baselines (e.g. 7-day activity) before the live demo.
    if args.backfill:
        stamp = real_start - args.backfill * 3600
        sent = 0
        while stamp < real_start and running:
            telemetry, environment = collect(real_start, stamp, verbose=False)  # scenarios not active yet
            if backend:
                backend.send_telemetry(telemetry)
                backend.send_environment(environment)
            sent += len(telemetry)
            stamp += args.interval
        print(f"Backfilled {args.backfill} h of history ({sent} readings).")

    tick = 0
    deadline = time.time() + args.duration if args.duration else None
    while running and (deadline is None or time.time() < deadline):
        tick += 1
        stamp = time.time()
        virtual_now = real_start + (stamp - real_start) * args.speed
        telemetry, environment = collect(virtual_now, stamp, verbose=args.verbose or not backend)

        if backend:
            backend.send_telemetry(telemetry)
            backend.send_environment(environment)
            if tick % 3 == 1:
                backend.heartbeat("simulator-1.0.0", int(stamp - real_start), backend.stats["sent"])
                for command in backend.pull_commands():
                    tag = next((t for t in tags if t.serial == command["deviceSerial"]), None)
                    if not tag:
                        backend.ack_command(command["id"], False, {"error": "device not simulated"})
                        continue
                    # Round-trip through the binary downlink format like a real tag.
                    downlink = codec.decode_command(codec.encode_command(command["type"], tick % 256, command.get("payload") or {}))
                    result = tag.apply(downlink)
                    backend.ack_command(command["id"], result == 0, {"executedBy": "simulator", "interval": tag.interval})
                    print(f"  <- {tag.serial} executed {command['type']} {command.get('payload') or ''}")
            s = backend.stats
            print(f"[tick {tick}] sent {s['sent']} | accepted {s['accepted']} | duplicates {s['duplicates']} | alerts raised {s['alerts']} | outbox {backend.outbox.size()}")
        time.sleep(max(0.2, args.interval / args.speed))

    if backend:
        backend.close()
    print("Simulation stopped.")


def cmd_decode(args):
    raw = args.payload.strip()
    try:
        payload = bytes.fromhex(raw)
    except ValueError:
        payload = base64.b64decode(raw)
    if payload and payload[0] == codec.P2P_MAGIC:
        device_id, fcnt, payload = codec.p2p_unframe(payload)
        print(f"P2P frame from {codec.id_to_serial(device_id)} (fcnt {fcnt})")
    if args.downlink:
        print(json.dumps(codec.decode_command(payload).__dict__, indent=2))
    else:
        print(json.dumps(codec.as_dict(codec.decode(payload)), indent=2))


def cmd_command(args):
    params = {"interval": args.interval} if args.interval else {"version": args.version} if args.version else {}
    payload = codec.encode_command(args.name, args.seq, params)
    print(f"hex    {payload.hex()}\nbase64 {base64.b64encode(payload).decode()}\nfPort  {codec.FPORT_COMMANDS}")


def cmd_bridge(args):
    from .backend import BackendClient, Outbox
    from .bridge import MqttBridge

    sensors = dict(item.split("=", 1) for item in args.sensor or [])
    backend = BackendClient(args.api, args.key, Outbox(args.outbox))
    bridge = MqttBridge(backend, args.network, args.app, args.mqtt_host, args.mqtt_port, args.mqtt_user, args.mqtt_password, not args.no_tls, sensors)
    signal.signal(signal.SIGINT, lambda *_: bridge.stop())
    bridge.run()


def main(argv: list[str] | None = None):
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    parser = argparse.ArgumentParser(prog="terrava_iot", description="Terrava IoT tools")
    sub = parser.add_subparsers(dest="command", required=True)

    sim = sub.add_parser("simulate", help="run a virtual fleet of ear tags")
    sim.add_argument("--devices", type=int, default=12)
    sim.add_argument("--scenario", action="append", metavar="SERIAL=SCENARIO", help=f"one of: {', '.join(SCENARIOS)}")
    sim.add_argument("--interval", type=int, default=300, help="simulated seconds between readings")
    sim.add_argument("--speed", type=float, default=60.0, help="acceleration: readings every interval/speed real seconds and scenarios develop speed x faster; timestamps stay real")
    sim.add_argument("--backfill", type=float, default=0, help="first send N hours of past history (builds activity baselines)")
    sim.add_argument("--duration", type=float, default=0, help="stop after N real seconds (0 = run until Ctrl+C)")
    sim.add_argument("--hot", action="store_true", help="simulate a heat wave in the barns")
    sim.add_argument("--api", help="backend base URL, e.g. http://localhost:4000/api/v1")
    sim.add_argument("--key", default=DEMO_KEY, help="gateway API key (default: the seeded demo key)")
    sim.add_argument("--outbox", help="SQLite file for undelivered readings (default: in memory)")
    sim.add_argument("-v", "--verbose", action="store_true")
    sim.set_defaults(func=cmd_simulate)

    dec = sub.add_parser("decode", help="decode a payload (hex or base64)")
    dec.add_argument("payload")
    dec.add_argument("--downlink", action="store_true")
    dec.set_defaults(func=cmd_decode)

    com = sub.add_parser("command", help="encode a downlink command")
    com.add_argument("name", choices=list(codec.COMMANDS))
    com.add_argument("--seq", type=int, default=1)
    com.add_argument("--interval", type=int)
    com.add_argument("--version")
    com.set_defaults(func=cmd_command)

    br = sub.add_parser("bridge", help="LoRaWAN network server (MQTT) -> backend")
    br.add_argument("--network", choices=["ttn", "chirpstack"], default="ttn")
    br.add_argument("--app", required=True, help="TTN application id (e.g. terrava@ttn for the user) or ChirpStack application id")
    br.add_argument("--mqtt-host", required=True)
    br.add_argument("--mqtt-port", type=int, default=8883)
    br.add_argument("--mqtt-user")
    br.add_argument("--mqtt-password")
    br.add_argument("--no-tls", action="store_true")
    br.add_argument("--sensor", action="append", metavar="DEVEUI=SERIAL", help="map environmental sensors to their serials")
    br.add_argument("--api", required=True)
    br.add_argument("--key", required=True)
    br.add_argument("--outbox", default="terrava-outbox.sqlite3")
    br.set_defaults(func=cmd_bridge)

    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    sys.exit(main())
