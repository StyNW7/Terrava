import { evaluateEnvironment, evaluateReading, SEVERITY_RANK } from './alert-rules';
import { DEFAULT_THRESHOLDS } from './thresholds';

const ctx = { thresholds: DEFAULT_THRESHOLDS, hasDevice: true };
const keys = (candidates: { ruleKey: string }[]) => candidates.map((c) => c.ruleKey).sort();

describe('evaluateReading', () => {
  it('raises nothing for a healthy reading', () => {
    expect(
      evaluateReading({ temperature: 38.6, heartRate: 70, oxygen: 97, activity: 60, battery: 80, signal: 70 }, ctx),
    ).toEqual([]);
  });

  it('flags fever with severity scaling by temperature', () => {
    const warning = evaluateReading({ temperature: 39.6 }, ctx)[0];
    const high = evaluateReading({ temperature: 40.1 }, ctx)[0];
    const critical = evaluateReading({ temperature: 40.6 }, ctx)[0];
    expect([warning.severity, high.severity, critical.severity]).toEqual(['WARNING', 'HIGH', 'CRITICAL']);
    expect(critical.ruleKey).toBe('tempHigh');
    expect(critical.recommendations).toContain('Contact veterinarian');
    expect(critical.title.en).toBe('Body temperature rising sharply');
  });

  it('flags hypothermia, tachycardia and low oxygen together', () => {
    const result = evaluateReading({ temperature: 36.2, heartRate: 130, oxygen: 86 }, ctx);
    expect(keys(result)).toEqual(['heartRate', 'oxygenLow', 'tempLow']);
    expect(result.find((r) => r.ruleKey === 'heartRate')!.severity).toBe('CRITICAL');
  });

  it('compares activity with the animal baseline, not an absolute value', () => {
    expect(evaluateReading({ activity: 20 }, { ...ctx, activityBaseline: 25 })).toEqual([]);
    const drop = evaluateReading({ activity: 20 }, { ...ctx, activityBaseline: 60 });
    expect(drop[0].ruleKey).toBe('activityDrop');
    expect(drop[0].category).toBe('BEHAVIOR');
  });

  it('ignores activity when no baseline is known yet', () => {
    expect(evaluateReading({ activity: 5 }, { ...ctx, activityBaseline: null })).toEqual([]);
  });

  it('raises a geofence alert only after the configured duration', () => {
    expect(evaluateReading({}, { ...ctx, minutesOutsideGeofence: 10 })).toEqual([]);
    expect(keys(evaluateReading({}, { ...ctx, minutesOutsideGeofence: 20 }))).toEqual(['geofence']);
  });

  it('checks device battery and signal only when a device is present', () => {
    expect(keys(evaluateReading({ battery: 10, signal: 10 }, ctx))).toEqual(['batteryLow', 'signalWeak']);
    expect(evaluateReading({ battery: 10, signal: 10 }, { ...ctx, hasDevice: false })).toEqual([]);
  });

  it('honours custom organisation thresholds', () => {
    const strict = { ...ctx, thresholds: { ...DEFAULT_THRESHOLDS, tempHigh: 39.0 } };
    expect(keys(evaluateReading({ temperature: 39.1 }, strict))).toEqual(['tempHigh']);
    expect(evaluateReading({ temperature: 39.1 }, ctx)).toEqual([]);
  });

  it('keeps confidence within a sensible range', () => {
    for (const c of evaluateReading({ temperature: 42, heartRate: 200, oxygen: 60, battery: 1, signal: 1 }, ctx)) {
      expect(c.confidence).toBeGreaterThanOrEqual(55);
      expect(c.confidence).toBeLessThanOrEqual(98);
    }
  });
});

describe('evaluateEnvironment', () => {
  it('returns null inside the comfort band', () => {
    expect(evaluateEnvironment(68, 24, 60)).toBeNull();
  });

  it('maps THI bands to severities', () => {
    expect(evaluateEnvironment(75, 29, 70)!.severity).toBe('WARNING');
    expect(evaluateEnvironment(84, 33, 75)!.severity).toBe('HIGH');
    expect(evaluateEnvironment(92, 38, 80)!.severity).toBe('CRITICAL');
  });
});

it('ranks severities for escalation', () => {
  expect(SEVERITY_RANK.CRITICAL).toBeGreaterThan(SEVERITY_RANK.HIGH);
  expect(SEVERITY_RANK.HIGH).toBeGreaterThan(SEVERITY_RANK.WARNING);
});
