import type { EarTagVariant } from "@/data/earTagVariants";

/**
 * A software twin of one Terrava ear tag on one animal. It integrates the
 * animal's physiology, the tag's energy budget and the radio link in
 * simulated time, and every uplink is encoded to the real 22-byte vitals
 * payload from `iot/protocol/PAYLOAD.md` (v1), exactly as the firmware sends it.
 */

export type Scenario = "normal" | "fever" | "heatStress" | "lameness" | "geofence";
export type AlertKind = "fever" | "hypothermia" | "tachycardia" | "activity" | "heat" | "battery" | "geofence" | "signal";
export type Severity = "critical" | "warning" | "info";

/** Thresholds match the backend's DEFAULT_THRESHOLDS (backend/src/domain/thresholds.ts). */
export const THRESHOLDS = {
  tempHigh: 39.5,
  tempLow: 37.5,
  heartRate: 100,
  activityDrop: 30,
  batteryLow: 20,
  signalWeak: 25,
  geofenceMinutes: 15,
} as const;

export const ACTIVITY_BASELINE = 50;

/** Farm origin used for GPS (Boyolali, Central Java), same as the IoT test vectors. */
export const FARM_ORIGIN = { lat: -7.53149, lng: 110.602113 };

/** Scene metres are scaled up so the pasture represents a realistic LoRa range. */
const RADIO_DISTANCE_SCALE = 60;

export interface Vitals {
  temperature: number;
  heartRate: number;
  oxygen: number;
  activity: number;
  steps: number;
  latitude: number;
  longitude: number;
  battery: number;
  flags: { gpsFix: boolean; charging: boolean; replayed: boolean; temperatureFault: boolean; heartRateFault: boolean; lowPower: boolean };
  timestamp: number;
}

export interface LinkInfo {
  rssi: number;
  snr: number;
  sf: number;
  airtimeMs: number;
  quality: number;
}

export type LogEntry =
  | { kind: "vitals"; id: number; fcnt: number; simTime: number; vitals: Vitals; hex: string; link: LinkInfo }
  | { kind: "status"; id: number; fcnt: number; simTime: number; hex: string; link: LinkInfo; intervalSeconds: number; battery: number }
  | { kind: "downlink"; id: number; simTime: number; hex: string; command: string };

export interface SimAlert {
  id: number;
  kind: AlertKind;
  severity: Severity;
  simTime: number;
  value: string;
  resolvedAt: number | null;
}

export interface Environment {
  airTemp: number;
  humidity: number;
  thi: number;
  sunlight: number;
}

export interface FrameInput {
  /** Instant activity index of the animal, 0-100, from its current behaviour. */
  activityNow: number;
  /** Position in scene metres (x east, z south). */
  x: number;
  z: number;
  insideFence: boolean;
  /** Scene-metre distance from the tag to the gateway antenna. */
  gatewayDistance: number;
}

export interface SimSnapshot {
  simTime: number;
  temperature: number;
  heartRate: number;
  oxygen: number;
  activity: number;
  batteryPct: number;
  batteryMah: number;
  harvestMw: number;
  consumptionMahDay: number;
  harvestMahDay: number;
  runtimeDays: number | null;
  environment: Environment;
  link: LinkInfo;
  fcnt: number;
  nextUplinkIn: number;
  insideFence: boolean;
  outsideMinutes: number;
  offline: boolean;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Daily consumption of the two firmware profiles from the spec sheets (mAh/day). */
const CONSUMPTION_MAH_DAY: Record<number, number> = { 5: 85, 15: 9 };

/** Spreading factor -> airtime of a 22-byte payload + 13 bytes LoRaWAN overhead at 125 kHz. */
const AIRTIME_MS: Record<number, number> = { 7: 72, 8: 133, 9: 247, 10: 452 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Deterministic-enough Gaussian-ish noise. */
function noise() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

function hex(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function u16(value: number) {
  const v = Math.round(value) & 0xffff;
  return [(v >> 8) & 0xff, v & 0xff];
}

function i32(value: number) {
  const v = Math.round(value) | 0;
  return [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
}

/** Encode a vitals reading as the 22-byte FPort 1 payload. */
export function encodeVitals(v: Vitals): number[] {
  const flags =
    (v.flags.gpsFix ? 1 : 0) |
    (v.flags.charging ? 2 : 0) |
    (v.flags.replayed ? 4 : 0) |
    (v.flags.temperatureFault ? 8 : 0) |
    (v.flags.heartRateFault ? 16 : 0) |
    (v.flags.lowPower ? 32 : 0);
  return [
    0x11,
    ...u16(v.temperature * 100),
    clamp(Math.round(v.heartRate), 0, 254),
    clamp(Math.round(v.oxygen), 0, 254),
    clamp(Math.round(v.activity), 0, 100),
    ...u16(v.steps),
    ...i32(v.latitude * 1e6),
    ...i32(v.longitude * 1e6),
    clamp(Math.round(v.battery), 0, 100),
    flags,
    ...i32(Math.floor(v.timestamp / 1000)),
  ];
}

/** Ambient conditions for a tropical lowland pasture at a given hour. */
export function environmentAt(hour: number, scenario: Scenario): Environment {
  const day = clamp(Math.sin(((hour - 7) / 14) * Math.PI), 0, 1);
  const hot = scenario === "heatStress";
  const airTemp = (hot ? 27 : 23.5) + (hot ? 10.5 : 6) * day;
  const humidity = (hot ? 88 : 86) - (hot ? 14 : 22) * day;
  const thi = 1.8 * airTemp + 32 - (0.55 - 0.0055 * humidity) * (1.8 * airTemp - 26);
  const sunlight = clamp(Math.sin(((hour - 6) / 12) * Math.PI), 0, 1);
  return { airTemp, humidity, thi, sunlight };
}

export class TagSimulation {
  variant: EarTagVariant;
  scenario: Scenario = "normal";
  intervalMinutes: 5 | 15 = 15;
  solarEdition = false;
  /** Simulated seconds per real second; widens the activity window when time runs fast. */
  timeScale = 60;

  simTime: number;
  private scenarioSince: number;
  private nextUplinkAt: number;
  private batteryMah: number;
  private temperature = 38.6;
  private heartRate = 66;
  private oxygen = 97;
  private activityAccumulator = 0;
  private activityWeight = 0;
  private activityWindow: number[] = [];
  private outsideSince: number | null = null;
  private fcnt = 0;
  private downlinkSeq = 0;
  private lastLink: LinkInfo = { rssi: -96, snr: 6, sf: 7, airtimeMs: AIRTIME_MS[7], quality: 40 };
  private lastHarvestMw = 0;
  private lastInput: FrameInput = { activityNow: 50, x: 0, z: 0, insideFence: true, gatewayDistance: 20 };
  private nextId = 1;
  private activeAlerts = new Map<AlertKind, SimAlert>();
  private uplinkRequested = false;
  private statusRequested = false;

  log: LogEntry[] = [];
  alerts: SimAlert[] = [];
  history: Array<{ simTime: number; temperature: number; heartRate: number; activity: number; battery: number }> = [];

  /** Fired for every radio transmission so the 3D scene can animate it. */
  onTransmit: ((entry: LogEntry) => void) | null = null;

  constructor(variant: EarTagVariant) {
    this.variant = variant;
    const start = new Date();
    start.setHours(7, 30, 0, 0);
    this.simTime = start.getTime();
    this.scenarioSince = this.simTime;
    this.nextUplinkAt = this.simTime + 20_000;
    this.batteryMah = variant.batteryMah * 0.86;
  }

  setVariant(variant: EarTagVariant) {
    const pct = this.batteryMah / this.variant.batteryMah;
    this.variant = variant;
    this.batteryMah = variant.batteryMah * pct;
  }

  setScenario(scenario: Scenario) {
    if (scenario === this.scenario) return;
    this.scenario = scenario;
    this.scenarioSince = this.simTime;
  }

  /** Downlink `set-interval` (command 0x03), applied from the next cycle. */
  setInterval(minutes: 5 | 15) {
    if (minutes === this.intervalMinutes) return;
    this.intervalMinutes = minutes;
    const seconds = minutes * 60;
    this.pushDownlink("set-interval", [0x03, this.downlinkSeq & 0xff, ...u16(seconds)]);
    this.nextUplinkAt = Math.min(this.nextUplinkAt, this.simTime + minutes * MINUTE);
    this.statusRequested = true;
  }

  /** Downlink `locate` (0x04): immediate GPS fix, LED blink and uplink. */
  locate() {
    this.pushDownlink("locate", [0x04, this.downlinkSeq & 0xff]);
    this.uplinkRequested = true;
  }

  /** Downlink `run-diagnostics` (0x02): answered with a status uplink. */
  diagnostics() {
    this.pushDownlink("run-diagnostics", [0x02, this.downlinkSeq & 0xff]);
    this.statusRequested = true;
    this.uplinkRequested = true;
  }

  /** Top the battery up, as if charged over USB-C. */
  recharge() {
    this.batteryMah = this.variant.batteryMah;
  }

  get hasSolar() {
    return this.variant.solar === "standard" || this.solarEdition;
  }

  get hour() {
    const date = new Date(this.simTime);
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  }

  get environment() {
    return environmentAt(this.hour, this.scenario);
  }

  private get harvestMahDay() {
    if (!this.hasSolar) return 0;
    const [min, max] = this.variant.solarHarvestMah;
    return (min + max) / 2;
  }

  private pushDownlink(command: string, bytes: number[]) {
    this.downlinkSeq += 1;
    const entry: LogEntry = { kind: "downlink", id: this.nextId++, simTime: this.simTime, hex: hex(bytes), command };
    this.pushLog(entry);
  }

  private pushLog(entry: LogEntry) {
    this.log = [entry, ...this.log].slice(0, 40);
    this.onTransmit?.(entry);
  }

  /** Advance by `simMs` of simulated time with the latest observation from the scene. */
  advance(simMs: number, input: FrameInput) {
    this.lastInput = input;
    const offline = this.batteryMah <= 0.5;
    const start = this.simTime;
    this.simTime += simMs;
    const env = this.environment;

    // --- Energy ------------------------------------------------------------
    const consumption = CONSUMPTION_MAH_DAY[this.intervalMinutes];
    // The sunlight curve integrates to 24/pi hours per day, so scale the peak to the daily figure.
    const harvestPerMs = this.hasSolar ? (this.harvestMahDay / (24 / Math.PI)) * env.sunlight / HOUR : 0;
    this.lastHarvestMw = this.hasSolar ? (this.variant.solar === "standard" ? 154 : 95) * 0.1 * env.sunlight * 0.75 : 0;
    this.batteryMah = clamp(this.batteryMah + (harvestPerMs - consumption / DAY) * simMs, 0, this.variant.batteryMah);

    // --- Physiology ----------------------------------------------------------
    const onset = clamp((this.simTime - this.scenarioSince) / (45 * MINUTE), 0, 1);
    const daySwing = Math.sin(((this.hour - 9) / 24) * Math.PI * 2);
    const heatLoad = Math.max(0, env.thi - 78);
    let tempTarget = 38.55 + 0.25 * daySwing + ((input.activityNow - 50) / 100) * 0.25;
    let hrTarget = 58 + input.activityNow * 0.22;
    let oxygenTarget = 97.5;
    if (this.scenario === "fever") {
      tempTarget += 1.85 * onset;
      hrTarget += 24 * onset;
      oxygenTarget -= 2.5 * onset;
    } else if (this.scenario === "heatStress") {
      tempTarget += heatLoad * 0.13;
      hrTarget += heatLoad * 2.4;
      oxygenTarget -= heatLoad * 0.25;
    } else if (this.scenario === "lameness") {
      hrTarget += 7 * onset;
    }
    const k = (minutes: number) => 1 - Math.exp(-simMs / (minutes * MINUTE));
    this.temperature += (tempTarget - this.temperature) * k(22);
    this.heartRate += (hrTarget - this.heartRate) * k(4);
    this.oxygen += (oxygenTarget - this.oxygen) * k(10);

    this.activityAccumulator += input.activityNow * simMs;
    this.activityWeight += simMs;

    // --- Geofence -------------------------------------------------------------
    if (input.insideFence) this.outsideSince = null;
    else if (this.outsideSince === null) this.outsideSince = start;

    // --- Radio -----------------------------------------------------------------
    if (offline) return;
    if (this.uplinkRequested || this.simTime >= this.nextUplinkAt) {
      this.uplinkRequested = false;
      this.transmit();
      this.nextUplinkAt = this.simTime + this.intervalMinutes * MINUTE;
    }
  }

  private link(): LinkInfo {
    const distance = Math.max(1, this.lastInput.gatewayDistance) * RADIO_DISTANCE_SCALE;
    const rssi = Math.round(-30 - 22 * Math.log10(distance) + noise() * 2);
    const snr = Math.round((18 - 11 * Math.log10(distance / 100) + noise() * 1.5) * 10) / 10;
    const sf = snr > 7 ? 7 : snr > 4 ? 8 : snr > 1 ? 9 : 10;
    return { rssi, snr, sf, airtimeMs: AIRTIME_MS[sf], quality: clamp(Math.round(((rssi + 120) / 60) * 100), 0, 100) };
  }

  private transmit() {
    const env = this.environment;
    const activity = this.activityWeight > 0 ? this.activityAccumulator / this.activityWeight : this.lastInput.activityNow;
    this.activityAccumulator = 0;
    this.activityWeight = 0;
    const position = toLatLng(this.lastInput.x, this.lastInput.z);
    const batteryPct = (this.batteryMah / this.variant.batteryMah) * 100;
    const vitals: Vitals = {
      temperature: Math.round((this.temperature + noise() * 0.04) * 100) / 100,
      heartRate: Math.round(this.heartRate + noise() * 2),
      oxygen: Math.round(clamp(this.oxygen + noise() * 0.6, 80, 100)),
      activity: Math.round(clamp(activity, 0, 100)),
      // Pedometer count for the interval, scaled from the IMU activity index.
      steps: Math.round(activity * 0.9 * (this.intervalMinutes / 15) * (0.85 + Math.random() * 0.3)),
      latitude: Math.round(position.lat * 1e6) / 1e6,
      longitude: Math.round(position.lng * 1e6) / 1e6,
      battery: Math.round(batteryPct),
      flags: {
        gpsFix: true,
        charging: this.hasSolar && env.sunlight > 0.05,
        replayed: false,
        temperatureFault: false,
        heartRateFault: false,
        lowPower: batteryPct <= THRESHOLDS.batteryLow,
      },
      timestamp: this.simTime,
    };
    this.fcnt += 1;
    this.lastLink = this.link();

    this.pushLog({ kind: "vitals", id: this.nextId++, fcnt: this.fcnt, simTime: this.simTime, vitals, hex: hex(encodeVitals(vitals)), link: this.lastLink });

    if (this.statusRequested) {
      this.statusRequested = false;
      this.fcnt += 1;
      const uptimeHours = Math.floor((this.simTime - this.scenarioSince) / HOUR) + 412;
      const bytes = [0x12, 1, 4, 0, ...u16(uptimeHours), ...u16(this.intervalMinutes * 60), vitals.battery, 0, 0, this.downlinkSeq & 0xff, 0];
      this.pushLog({
        kind: "status",
        id: this.nextId++,
        fcnt: this.fcnt,
        simTime: this.simTime,
        hex: hex(bytes),
        link: this.lastLink,
        intervalSeconds: this.intervalMinutes * 60,
        battery: vitals.battery,
      });
    }

    this.history = [...this.history, { simTime: this.simTime, temperature: vitals.temperature, heartRate: vitals.heartRate, activity: vitals.activity, battery: vitals.battery }].slice(-36);
    this.activityWindow = [...this.activityWindow, vitals.activity].slice(-40);
    this.evaluateAlerts(vitals, env);
  }

  private evaluateAlerts(vitals: Vitals, env: Environment) {
    // Average over at least a minute of on-screen behaviour, so fast-forwarding does not judge one bout of rest.
    const windowSize = clamp(Math.ceil((60 * this.timeScale) / (this.intervalMinutes * 60)), 4, 40);
    const recent = this.activityWindow.slice(-windowSize);
    const rollingActivity = recent.reduce((sum, value) => sum + value, 0) / recent.length;
    const outsideMinutes = this.outsideSince === null ? 0 : (this.simTime - this.outsideSince) / MINUTE;
    const checks: Array<[AlertKind, boolean, Severity, string]> = [
      ["fever", vitals.temperature >= THRESHOLDS.tempHigh, vitals.temperature >= 40 ? "critical" : "warning", `${vitals.temperature.toFixed(1)} °C`],
      ["hypothermia", vitals.temperature <= THRESHOLDS.tempLow, "critical", `${vitals.temperature.toFixed(1)} °C`],
      ["tachycardia", vitals.heartRate >= THRESHOLDS.heartRate, "warning", `${vitals.heartRate} bpm`],
      [
        "activity",
        recent.length >= Math.min(4, windowSize) && rollingActivity <= ACTIVITY_BASELINE * (1 - THRESHOLDS.activityDrop / 100),
        "warning",
        `−${Math.round((1 - rollingActivity / ACTIVITY_BASELINE) * 100)}%`,
      ],
      ["heat", env.thi >= 82 && vitals.temperature >= 39.2, env.thi >= 88 ? "critical" : "warning", `THI ${env.thi.toFixed(0)}`],
      ["battery", vitals.battery <= THRESHOLDS.batteryLow, "warning", `${vitals.battery}%`],
      ["geofence", outsideMinutes >= THRESHOLDS.geofenceMinutes, "critical", `${Math.round(outsideMinutes)} min`],
      ["signal", this.lastLink.quality <= THRESHOLDS.signalWeak, "info", `${this.lastLink.rssi} dBm`],
    ];
    for (const [kind, active, severity, value] of checks) {
      const existing = this.activeAlerts.get(kind);
      if (active && !existing) {
        const alert: SimAlert = { id: this.nextId++, kind, severity, simTime: this.simTime, value, resolvedAt: null };
        this.activeAlerts.set(kind, alert);
        this.alerts = [alert, ...this.alerts].slice(0, 12);
      } else if (active && existing) {
        existing.value = value;
        existing.severity = severity;
      } else if (!active && existing) {
        existing.resolvedAt = this.simTime;
        this.activeAlerts.delete(kind);
      }
    }
    this.alerts = [...this.alerts];
  }

  get activeAlertKinds() {
    return [...this.activeAlerts.keys()];
  }

  snapshot(): SimSnapshot {
    const env = this.environment;
    const consumption = CONSUMPTION_MAH_DAY[this.intervalMinutes];
    const harvest = this.harvestMahDay;
    const net = consumption - harvest;
    return {
      simTime: this.simTime,
      temperature: this.temperature,
      heartRate: this.heartRate,
      oxygen: this.oxygen,
      activity: this.lastInput.activityNow,
      batteryPct: (this.batteryMah / this.variant.batteryMah) * 100,
      batteryMah: this.batteryMah,
      harvestMw: this.lastHarvestMw,
      consumptionMahDay: consumption,
      harvestMahDay: harvest,
      runtimeDays: net <= 0 ? null : this.batteryMah / net,
      environment: env,
      link: this.lastLink,
      fcnt: this.fcnt,
      nextUplinkIn: Math.max(0, this.nextUplinkAt - this.simTime),
      insideFence: this.lastInput.insideFence,
      outsideMinutes: this.outsideSince === null ? 0 : (this.simTime - this.outsideSince) / MINUTE,
      offline: this.batteryMah <= 0.5,
    };
  }
}

/** Scene metres (x east, z south) to WGS84 around the farm origin. */
export function toLatLng(x: number, z: number) {
  // The 3D paddock is drawn at 1:4 so the herd's range reads like a real paddock on the map.
  const metres = 4;
  return {
    lat: FARM_ORIGIN.lat + (-z * metres) / 111_320,
    lng: FARM_ORIGIN.lng + (x * metres) / (111_320 * Math.cos((FARM_ORIGIN.lat * Math.PI) / 180)),
  };
}
