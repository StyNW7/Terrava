import { hasPermission, Permission, ROLE_PERMISSIONS } from './permissions';
import { fromApiEnum, roleFromLabel, roleLabel, toApiEnum } from './utils/enums';
import { toCsv } from './utils/csv';
import { asLocalized } from './utils/localized';
import { mapTtnUplink } from '../modules/telemetry/ttn.mapper';
import { describeUserAgent, initials } from '../modules/auth/auth.utils';
import { compareVersions } from '../domain/firmware';

describe('RBAC matrix (mirrors the dashboard Team page)', () => {
  const frontendMatrix: Record<string, boolean[]> = {
    [Permission.VIEW_LIVESTOCK]: [true, true, true, true, true, true, true],
    [Permission.EDIT_LIVESTOCK]: [true, true, true, true, true, false, false],
    [Permission.MANAGE_ALERTS]: [true, true, true, true, true, false, false],
    [Permission.MANAGE_DEVICES]: [true, true, true, false, false, false, false],
    [Permission.MANAGE_TEAM]: [true, true, true, false, false, true, false],
    [Permission.EXPORT_REPORTS]: [true, true, true, false, true, true, false],
    [Permission.EDIT_SETTINGS]: [true, false, false, false, false, false, false],
  };
  const roles = [
    'OWNER',
    'FARM_MANAGER',
    'OPERATIONAL',
    'STAFF',
    'VETERINARIAN',
    'COOPERATIVE_ADMIN',
    'VIEWER',
  ] as const;

  it.each(Object.entries(frontendMatrix))('%s matches the frontend matrix', (permission, allowed) => {
    roles.forEach((role, i) => expect(hasPermission(role, permission as Permission)).toBe(allowed[i]));
  });

  it('gives the owner every permission', () => {
    expect(ROLE_PERMISSIONS.OWNER).toHaveLength(Object.values(Permission).length);
  });
});

describe('enum mapping', () => {
  it('round-trips database enums and API strings', () => {
    expect(toApiEnum('LOW_BATTERY')).toBe('low-battery');
    expect(toApiEnum('ENVIRONMENTAL_SENSOR')).toBe('environmental-sensor');
    expect(fromApiEnum('up-to-date')).toBe('UP_TO_DATE');
    expect(toApiEnum(null)).toBeNull();
  });

  it('maps role labels both ways', () => {
    expect(roleLabel('COOPERATIVE_ADMIN')).toBe('Cooperative Admin');
    expect(roleFromLabel('Farm Manager')).toBe('FARM_MANAGER');
    expect(() => roleFromLabel('Admin')).toThrow();
  });
});

describe('csv', () => {
  it('escapes quotes, commas and newlines and adds a BOM', () => {
    const csv = toCsv(['Name', 'Note'], [['Bella', 'says "moo", loudly\nnow']]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"says ""moo"", loudly\nnow"');
  });

  it('neutralises spreadsheet formula injection', () => {
    expect(toCsv(['x'], [['=HYPERLINK("evil")']])).toContain(`"'=HYPERLINK(""evil"")"`);
  });
});

describe('localized', () => {
  it('accepts stored objects and legacy strings', () => {
    expect(asLocalized({ id: 'Halo', en: 'Hello' })).toEqual({ id: 'Halo', en: 'Hello' });
    expect(asLocalized('Catatan')).toEqual({ id: 'Catatan', en: 'Catatan' });
  });
});

describe('TTN uplink mapping', () => {
  it('maps a decoded uplink and picks the strongest gateway', () => {
    const reading = mapTtnUplink({
      end_device_ids: { dev_eui: '70b3d57ed0005a10' },
      received_at: '2026-10-17T03:00:00Z',
      uplink_message: {
        f_cnt: 42,
        decoded_payload: {
          type: 'vitals',
          temperature: 38.9,
          heartRate: 74,
          oxygen: 97,
          activity: 55,
          battery: 81,
          latitude: -7.5,
          longitude: 110.6,
        },
        rx_metadata: [
          { rssi: -110, snr: -2 },
          { rssi: -92, snr: 8 },
        ],
      },
    });
    expect(reading).toMatchObject({ devEui: '70B3D57ED0005A10', sequence: 42, temperature: 38.9, rssi: -92, snr: 8 });
  });

  it('ignores uplinks without decoded vitals', () => {
    expect(mapTtnUplink({ end_device_ids: { dev_eui: 'x' }, uplink_message: {} })).toBeNull();
    expect(
      mapTtnUplink({ end_device_ids: { dev_eui: 'x' }, uplink_message: { decoded_payload: { type: 'status' } } }),
    ).toBeNull();
  });
});

describe('auth helpers', () => {
  it('derives initials, ignoring academic titles', () => {
    expect(initials('drh. Andi Prasetyo')).toBe('AP');
    expect(initials('Stanley Nathanael Wijaya')).toBe('SN');
  });

  it('describes user agents for the sessions list', () => {
    expect(
      describeUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36'),
    ).toBe('Chrome - Windows');
    expect(describeUserAgent(null)).toBe('Unknown device');
  });
});

it('compares firmware versions numerically', () => {
  expect(compareVersions('v2.10.0', 'v2.4.0')).toBe(1);
  expect(compareVersions('v2.3.5', 'v2.4.0')).toBe(-1);
  expect(compareVersions('2.4.0', 'v2.4.0')).toBe(0);
});
