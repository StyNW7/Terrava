export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

/** Offset of an IANA zone from UTC, in minutes, at a given instant. */
function zoneOffsetMinutes(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/**
 * Next time a report schedule fires, honouring the organisation's timezone
 * (WIB/WITA/WIT). Same semantics as the dashboard's `nextRun` helper:
 * weekly `day` is 1-7 (Mon-Sun), monthly `day` is 1-28.
 */
export function nextRun(
  schedule: { frequency: Frequency; day: number; time: string },
  from: Date = new Date(),
  timeZone = 'Asia/Jakarta',
): Date {
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const offset = zoneOffsetMinutes(timeZone, from);
  // Work in "local wall clock" expressed as a UTC date, then shift back.
  const local = new Date(from.getTime() + offset * 60_000);
  const candidate = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), hours, minutes, 0, 0),
  );

  if (schedule.frequency === 'DAILY') {
    if (candidate <= local) candidate.setUTCDate(candidate.getUTCDate() + 1);
  } else if (schedule.frequency === 'WEEKLY') {
    const target = schedule.day % 7; // 7 (Sunday) -> 0
    let diff = (target - candidate.getUTCDay() + 7) % 7;
    if (diff === 0 && candidate <= local) diff = 7;
    candidate.setUTCDate(candidate.getUTCDate() + diff);
  } else {
    candidate.setUTCDate(Math.min(Math.max(schedule.day, 1), 28));
    if (candidate <= local) candidate.setUTCMonth(candidate.getUTCMonth() + 1);
  }
  return new Date(candidate.getTime() - offset * 60_000);
}

export const TIMEZONES: Record<string, string> = {
  wib: 'Asia/Jakarta',
  wita: 'Asia/Makassar',
  wit: 'Asia/Jayapura',
};

export function ageInMonths(dateOfBirth: Date, now = new Date()): number {
  return Math.max(0, (now.getFullYear() - dateOfBirth.getFullYear()) * 12 + (now.getMonth() - dateOfBirth.getMonth()));
}
