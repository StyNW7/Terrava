import type { Localized } from '../common/utils/localized';
import { CATTLE_NORMALS, type AlertThresholds } from './thresholds';
import { thiBand } from './environment';

export type RuleSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type RuleCategory = 'HEALTH' | 'BEHAVIOR' | 'LOCATION' | 'DEVICE' | 'ENVIRONMENTAL' | 'WEATHER';

/**
 * Canonical action labels. They match the labels the dashboard localises with
 * `tt("action", ...)`, so alerts raised here render translated out of the box.
 */
export const ACTIONS = {
  inspect: 'Inspect livestock',
  hydration: 'Check hydration',
  vet: 'Contact veterinarian',
  monitor: 'Monitor for next 6 hours',
  observation: 'Move to observation barn',
  task: 'Create task',
} as const;

export interface AlertCandidate {
  ruleKey: string;
  category: RuleCategory;
  severity: RuleSeverity;
  title: Localized;
  description: Localized;
  cause: Localized;
  recommendations: string[];
  confidence: number;
}

export interface ReadingInput {
  temperature?: number | null;
  heartRate?: number | null;
  oxygen?: number | null;
  activity?: number | null;
  battery?: number | null;
  signal?: number | null;
}

export interface RuleContext {
  thresholds: AlertThresholds;
  /** Mean activity over the previous 7 days, if known. */
  activityBaseline?: number | null;
  /** Minutes the animal has been continuously outside every active geofence. */
  minutesOutsideGeofence?: number | null;
  hasDevice?: boolean;
}

const clampConfidence = (value: number) => Math.max(55, Math.min(98, Math.round(value)));

/**
 * Evaluate one ear tag reading against the organisation's thresholds.
 * Pure and synchronous so it can be unit tested and reused by the simulator.
 */
export function evaluateReading(reading: ReadingInput, ctx: RuleContext): AlertCandidate[] {
  const { thresholds } = ctx;
  const out: AlertCandidate[] = [];

  // --- Body temperature ----------------------------------------------------
  if (reading.temperature != null && reading.temperature >= thresholds.tempHigh) {
    const over = reading.temperature - thresholds.tempHigh;
    const severity: RuleSeverity = reading.temperature >= 40.5 ? 'CRITICAL' : over >= 0.5 ? 'HIGH' : 'WARNING';
    out.push({
      ruleKey: 'tempHigh',
      category: 'HEALTH',
      severity,
      title: { id: 'Suhu tubuh meningkat signifikan', en: 'Body temperature rising sharply' },
      description: {
        id: `Suhu tubuh ${reading.temperature.toFixed(1)}°C, di atas ambang ${thresholds.tempHigh}°C.`,
        en: `Body temperature is ${reading.temperature.toFixed(1)}°C, above the ${thresholds.tempHigh}°C threshold.`,
      },
      cause: {
        id: 'Kemungkinan indikasi awal infeksi atau demam ringan.',
        en: 'Possibly an early indication of infection or a mild fever.',
      },
      recommendations: [ACTIONS.inspect, ACTIONS.hydration, ACTIONS.vet],
      confidence: clampConfidence(72 + over * 30),
    });
  }

  if (reading.temperature != null && reading.temperature <= thresholds.tempLow) {
    const under = thresholds.tempLow - reading.temperature;
    out.push({
      ruleKey: 'tempLow',
      category: 'HEALTH',
      severity: under >= 1 ? 'CRITICAL' : 'HIGH',
      title: { id: 'Suhu tubuh di bawah normal', en: 'Body temperature below normal' },
      description: {
        id: `Suhu tubuh ${reading.temperature.toFixed(1)}°C, di bawah ambang ${thresholds.tempLow}°C.`,
        en: `Body temperature is ${reading.temperature.toFixed(1)}°C, below the ${thresholds.tempLow}°C threshold.`,
      },
      cause: {
        id: 'Kemungkinan hipotermia, syok, atau sensor tidak menempel dengan baik.',
        en: 'Possible hypothermia, shock, or a sensor that is not seated properly.',
      },
      recommendations: [ACTIONS.inspect, ACTIONS.vet],
      confidence: clampConfidence(70 + under * 20),
    });
  }

  // --- Heart rate ----------------------------------------------------------
  if (reading.heartRate != null && reading.heartRate >= thresholds.heartRate) {
    const over = reading.heartRate - thresholds.heartRate;
    out.push({
      ruleKey: 'heartRate',
      category: 'HEALTH',
      severity: over >= 25 ? 'CRITICAL' : over >= 10 ? 'HIGH' : 'WARNING',
      title: { id: 'Detak jantung tidak stabil', en: 'Unstable heart rate' },
      description: {
        id: `Detak jantung ${reading.heartRate} bpm melewati ambang ${thresholds.heartRate} bpm.`,
        en: `Heart rate of ${reading.heartRate} bpm exceeds the ${thresholds.heartRate} bpm threshold.`,
      },
      cause: {
        id: 'Kemungkinan stres akut atau gangguan ringan pada sistem kardiovaskular.',
        en: 'Possibly acute stress or a mild cardiovascular disturbance.',
      },
      recommendations: [ACTIONS.inspect, ACTIONS.vet, ACTIONS.monitor],
      confidence: clampConfidence(68 + over),
    });
  }

  // --- Oxygen saturation ---------------------------------------------------
  if (reading.oxygen != null && reading.oxygen < CATTLE_NORMALS.oxygen.min - 3) {
    out.push({
      ruleKey: 'oxygenLow',
      category: 'HEALTH',
      severity: reading.oxygen < 88 ? 'CRITICAL' : 'HIGH',
      title: { id: 'Saturasi oksigen rendah', en: 'Low oxygen saturation' },
      description: {
        id: `Saturasi oksigen turun ke ${reading.oxygen}%.`,
        en: `Oxygen saturation has dropped to ${reading.oxygen}%.`,
      },
      cause: {
        id: 'Kemungkinan gangguan pernapasan; periksa tanda batuk atau napas cepat.',
        en: 'Possible respiratory trouble; check for coughing or rapid breathing.',
      },
      recommendations: [ACTIONS.inspect, ACTIONS.vet],
      confidence: clampConfidence(75 + (92 - reading.oxygen) * 3),
    });
  }

  // --- Activity versus the animal's own baseline -----------------------------
  if (reading.activity != null && ctx.activityBaseline && ctx.activityBaseline > 5) {
    const dropPct = ((ctx.activityBaseline - reading.activity) / ctx.activityBaseline) * 100;
    if (dropPct >= thresholds.activityDrop) {
      out.push({
        ruleKey: 'activityDrop',
        category: 'BEHAVIOR',
        severity: dropPct >= thresholds.activityDrop * 2 ? 'HIGH' : 'WARNING',
        title: { id: 'Penurunan aktivitas drastis', en: 'Sharp drop in activity' },
        description: {
          id: `Aktivitas turun ${Math.round(dropPct)}% dibandingkan baseline 7 hari terakhir.`,
          en: `Activity is ${Math.round(dropPct)}% below the seven-day baseline.`,
        },
        cause: {
          id: 'Kemungkinan tanda awal ketidaknyamanan atau kelelahan.',
          en: 'Possibly an early sign of discomfort or fatigue.',
        },
        recommendations: [ACTIONS.monitor, ACTIONS.inspect, ACTIONS.observation],
        confidence: clampConfidence(60 + dropPct / 2),
      });
    }
  }

  // --- Geofence ----------------------------------------------------------------
  if (ctx.minutesOutsideGeofence != null && ctx.minutesOutsideGeofence >= thresholds.geofenceDuration) {
    out.push({
      ruleKey: 'geofence',
      category: 'LOCATION',
      severity: ctx.minutesOutsideGeofence >= thresholds.geofenceDuration * 4 ? 'CRITICAL' : 'HIGH',
      title: { id: 'Ternak keluar dari geofence', en: 'Animal left the geofence' },
      description: {
        id: `Ternak berada di luar batas area selama ${Math.round(ctx.minutesOutsideGeofence)} menit.`,
        en: `The animal has been outside its boundary for ${Math.round(ctx.minutesOutsideGeofence)} minutes.`,
      },
      cause: {
        id: 'Kemungkinan pagar rusak atau ternak lepas dari kandang.',
        en: 'A damaged fence or an animal that has escaped the barn.',
      },
      recommendations: [ACTIONS.inspect, ACTIONS.task],
      confidence: 90,
    });
  }

  // --- Device health -------------------------------------------------------------
  if (ctx.hasDevice !== false && reading.battery != null && reading.battery <= thresholds.batteryLow) {
    out.push({
      ruleKey: 'batteryLow',
      category: 'DEVICE',
      severity: reading.battery <= 5 ? 'HIGH' : 'WARNING',
      title: { id: 'Baterai perangkat rendah', en: 'Low device battery' },
      description: {
        id: `Baterai smart ear tag tersisa ${reading.battery}%.`,
        en: `The smart ear tag battery is down to ${reading.battery}%.`,
      },
      cause: {
        id: 'Perangkat mendekati akhir siklus daya sebelum pengisian ulang.',
        en: 'The device is nearing the end of its power cycle before a recharge.',
      },
      recommendations: [ACTIONS.task],
      confidence: 97,
    });
  }

  if (ctx.hasDevice !== false && reading.signal != null && reading.signal <= thresholds.signalWeak) {
    out.push({
      ruleKey: 'signalWeak',
      category: 'DEVICE',
      severity: 'INFO',
      title: { id: 'Sinyal perangkat lemah', en: 'Weak device signal' },
      description: {
        id: `Kualitas sinyal LoRa ${reading.signal}%, di bawah ambang ${thresholds.signalWeak}%.`,
        en: `LoRa link quality is ${reading.signal}%, below the ${thresholds.signalWeak}% threshold.`,
      },
      cause: {
        id: 'Ternak berada jauh dari gateway atau antena terhalang.',
        en: 'The animal is far from the gateway or the antenna is obstructed.',
      },
      recommendations: [ACTIONS.task],
      confidence: 85,
    });
  }

  return out;
}

/** Barn climate rule: Temperature-Humidity Index above the comfort band. */
export function evaluateEnvironment(thi: number, temperature: number, humidity: number): AlertCandidate | null {
  const band = thiBand(thi);
  if (band === 'normal') return null;
  const severity: RuleSeverity = band === 'severe' ? 'CRITICAL' : band === 'moderate' ? 'HIGH' : 'WARNING';
  return {
    ruleKey: 'heatStress',
    category: 'ENVIRONMENTAL',
    severity,
    title: { id: 'Suhu kandang di luar batas nyaman', en: 'Barn temperature outside comfort range' },
    description: {
      id: `THI ${thi} (suhu ${temperature.toFixed(1)}°C, kelembapan ${Math.round(humidity)}%).`,
      en: `THI ${thi} (temperature ${temperature.toFixed(1)}°C, humidity ${Math.round(humidity)}%).`,
    },
    cause: {
      id: 'Potensi risiko heat stress pada ternak di kandang tersebut.',
      en: 'A potential heat stress risk for the livestock in that barn.',
    },
    recommendations: [ACTIONS.monitor, ACTIONS.observation],
    confidence: clampConfidence(70 + (thi - 72) * 1.5),
  };
}

export const SEVERITY_RANK: Record<RuleSeverity, number> = { INFO: 0, WARNING: 1, HIGH: 2, CRITICAL: 3 };
