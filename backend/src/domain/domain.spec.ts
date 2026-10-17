import { assessHealth, bandFor, smoothScore } from './health-scoring';
import { signalQuality, temperatureHumidityIndex, thiBand } from './environment';
import { haversineMeters, isValidPolygon, pointInPolygon, squareAround, type LatLng } from './geo';
import { ageInMonths, nextRun } from './schedule';

describe('health scoring', () => {
  it('scores normal vitals as healthy', () => {
    const result = assessHealth({ temperature: 38.6, heartRate: 70, oxygen: 97, activity: 65 });
    expect(result.status).toBe('HEALTHY');
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.factors).toEqual([]);
  });

  it('penalises fever most heavily and lists it first', () => {
    const result = assessHealth({ temperature: 40.5, heartRate: 95, oxygen: 96, activity: 30 });
    expect(result.status).toBe('CRITICAL');
    expect(result.factors[0].key).toBe('temperature');
  });

  it('marks animals without recent data as inactive', () => {
    expect(assessHealth({}, { hasRecentData: false }).status).toBe('INACTIVE');
  });

  it('bands scores at 80 and 58', () => {
    expect([bandFor(80), bandFor(79), bandFor(58), bandFor(57)]).toEqual([
      'HEALTHY',
      'ATTENTION',
      'ATTENTION',
      'CRITICAL',
    ]);
  });

  it('smooths a noisy reading into the previous score', () => {
    expect(smoothScore(90, 40)).toBe(73);
    expect(smoothScore(null, 40)).toBe(40);
  });
});

describe('environment', () => {
  it('computes the cattle Temperature-Humidity Index', () => {
    expect(temperatureHumidityIndex(30, 70)).toBe(81.3);
    expect(thiBand(70)).toBe('normal');
    expect(thiBand(75)).toBe('mild');
    expect(thiBand(85)).toBe('moderate');
    expect(thiBand(95)).toBe('severe');
  });

  it('normalises LoRa link quality to 0-100', () => {
    expect(signalQuality(-40, 10)).toBe(100);
    expect(signalQuality(-120, -20)).toBe(0);
    expect(signalQuality(null)).toBe(0);
    const mid = signalQuality(-90, 5);
    expect(mid).toBeGreaterThan(30);
    expect(mid).toBeLessThan(70);
  });
});

describe('geo', () => {
  const square: LatLng[] = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ];

  it('detects points inside and outside a polygon', () => {
    expect(pointInPolygon([0.5, 0.5], square)).toBe(true);
    expect(pointInPolygon([1.5, 0.5], square)).toBe(false);
  });

  it('builds a square boundary of the requested size', () => {
    const fence = squareAround([-7.5, 110.6], 500);
    expect(pointInPolygon([-7.5, 110.6], fence)).toBe(true);
    expect(pointInPolygon([-7.51, 110.6], fence)).toBe(false);
    expect(Math.round(haversineMeters(fence[0], fence[1]))).toBeGreaterThan(990);
  });

  it('validates polygons', () => {
    expect(isValidPolygon(square)).toBe(true);
    expect(
      isValidPolygon([
        [0, 0],
        [1, 1],
      ]),
    ).toBe(false);
    expect(
      isValidPolygon([
        [0, 0],
        [1, 1],
        [200, 1],
      ]),
    ).toBe(false);
  });
});

describe('report scheduling', () => {
  // Friday 17 Oct 2026, 10:00 WIB (03:00 UTC)
  const from = new Date('2026-10-17T03:00:00Z');

  it('schedules daily runs later today or tomorrow in WIB', () => {
    expect(nextRun({ frequency: 'DAILY', day: 1, time: '07:00' }, from).toISOString()).toBe('2026-10-18T00:00:00.000Z');
    expect(nextRun({ frequency: 'DAILY', day: 1, time: '18:30' }, from).toISOString()).toBe('2026-10-17T11:30:00.000Z');
  });

  it('schedules weekly runs on the requested weekday (1 = Monday)', () => {
    expect(nextRun({ frequency: 'WEEKLY', day: 1, time: '07:00' }, from).toISOString()).toBe(
      '2026-10-19T00:00:00.000Z',
    );
  });

  it('schedules monthly runs on the requested day', () => {
    expect(nextRun({ frequency: 'MONTHLY', day: 5, time: '08:00' }, from).toISOString()).toBe(
      '2026-11-05T01:00:00.000Z',
    );
  });

  it('honours other Indonesian timezones', () => {
    expect(nextRun({ frequency: 'DAILY', day: 1, time: '07:00' }, from, 'Asia/Jayapura').toISOString()).toBe(
      '2026-10-17T22:00:00.000Z',
    );
  });

  it('computes age in months', () => {
    expect(ageInMonths(new Date('2024-01-15'), new Date('2026-10-17'))).toBe(33);
  });
});
