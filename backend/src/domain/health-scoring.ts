import { CATTLE_NORMALS } from './thresholds';

export interface Vitals {
  temperature?: number | null;
  heartRate?: number | null;
  oxygen?: number | null;
  activity?: number | null;
}

export type HealthBand = 'HEALTHY' | 'ATTENTION' | 'CRITICAL' | 'INACTIVE';

export interface HealthAssessment {
  score: number;
  status: HealthBand;
  factors: { key: keyof Vitals; penalty: number }[];
}

/** Distance outside [min, max], 0 when inside. */
function excess(value: number, min: number, max: number) {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

/**
 * Deterministic health score (0-100) from the latest vital signs.
 *
 * Each vital loses points in proportion to how far it sits outside the normal
 * cattle range, weighted by clinical importance (fever weighs most). This is the
 * backend's always-available baseline; the AI service refines it with
 * per-animal baselines and a trained classifier.
 */
export function assessHealth(vitals: Vitals, opts: { hasRecentData?: boolean } = {}): HealthAssessment {
  if (opts.hasRecentData === false) return { score: 50, status: 'INACTIVE', factors: [] };

  const factors: HealthAssessment['factors'] = [];
  const add = (key: keyof Vitals, penalty: number) => {
    if (penalty > 0) factors.push({ key, penalty: Math.round(penalty * 10) / 10 });
  };

  if (vitals.temperature != null) {
    const { min, max } = CATTLE_NORMALS.temperature;
    add('temperature', excess(vitals.temperature, min, max) * 28);
  }
  if (vitals.heartRate != null) {
    const { min, max } = CATTLE_NORMALS.heartRate;
    add('heartRate', excess(vitals.heartRate, min, max) * 0.9);
  }
  if (vitals.oxygen != null) {
    const { min, max } = CATTLE_NORMALS.oxygen;
    add('oxygen', excess(vitals.oxygen, min, max) * 4);
  }
  if (vitals.activity != null) {
    const { min, max } = CATTLE_NORMALS.activity;
    add('activity', excess(vitals.activity, min, max) * 0.8);
  }

  const totalPenalty = factors.reduce((sum, factor) => sum + factor.penalty, 0);
  const score = Math.max(0, Math.min(100, Math.round(98 - totalPenalty)));
  return { score, status: bandFor(score), factors: factors.sort((a, b) => b.penalty - a.penalty) };
}

export function bandFor(score: number): HealthBand {
  if (score >= 80) return 'HEALTHY';
  if (score >= 58) return 'ATTENTION';
  return 'CRITICAL';
}

/** Smooth a new score into the previous one so a single noisy reading cannot flip the status. */
export function smoothScore(previous: number | null | undefined, next: number, weight = 0.35): number {
  if (previous == null) return next;
  return Math.round(previous * (1 - weight) + next * weight);
}
