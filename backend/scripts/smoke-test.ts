/**
 * End-to-end smoke test against a running API with the demo seed loaded.
 *
 *   npm run start:prod   (or npm run dev)
 *   npm run test:smoke
 *
 * Exercises auth, every dashboard module, IoT ingest with the demo gateway key,
 * the rule engine, reports (JSON/PDF/CSV) and RBAC. Exits non-zero on failure.
 */
export {};

const BASE = process.env.API_URL ?? 'http://localhost:4000/api/v1';
const GATEWAY_KEY = process.env.GATEWAY_KEY ?? 'trv_gw_demo_green_valley_key_change_me_0001';

let token = '';
let passed = 0;
const failures: string[] = [];

async function call(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const type = response.headers.get('content-type') ?? '';
  const data = type.includes('json') ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { status: response.status, data: data as any, type };
}

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  ✗ ${name}\n      ${(error as Error).message}`);
  }
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Terrava smoke test -> ${BASE}\n`);

  await check('health', async () => {
    const r = await call('GET', '/health');
    ensure(r.status === 200 && r.data.database === 'up', `unexpected ${r.status}`);
  });

  await check('rejects unauthenticated requests', async () => {
    const r = await call('GET', '/livestock');
    ensure(r.status === 401, `expected 401, got ${r.status}`);
  });

  await check('login (demo owner)', async () => {
    const r = await call('POST', '/auth/login', { email: 'demo@terrava.id', password: 'Terrava123', rememberMe: true });
    ensure(r.status === 200, `status ${r.status}: ${JSON.stringify(r.data)}`);
    ensure(r.data.user.role === 'Owner' && r.data.refreshToken, 'missing role or refresh token');
    token = r.data.accessToken;
  });

  await check('refresh token rotation + reuse detection', async () => {
    const login = await call('POST', '/auth/login', { email: 'manager@terrava.id', password: 'Terrava123' });
    const first = login.data.refreshToken;
    const rotated = await call('POST', '/auth/refresh', { refreshToken: first });
    ensure(rotated.status === 200 && rotated.data.refreshToken !== first, 'rotation failed');
    const replay = await call('POST', '/auth/refresh', { refreshToken: first });
    ensure(replay.status === 401, `replayed token should be rejected, got ${replay.status}`);
    const afterTheft = await call('POST', '/auth/refresh', { refreshToken: rotated.data.refreshToken });
    ensure(afterTheft.status === 401, 'all sessions should be revoked after reuse');
  });

  await check('me + permissions', async () => {
    const r = await call('GET', '/auth/me');
    ensure(r.data.permissions.includes('edit-settings'), 'owner should edit settings');
  });

  await check('dashboard overview', async () => {
    const r = await call('GET', '/dashboard/overview?range=7d');
    ensure(r.data.kpis.totalLivestock === 40, `expected 40 animals, got ${r.data.kpis.totalLivestock}`);
    ensure(r.data.charts.healthTrend.length === 7, 'health trend should have 7 days');
  });

  let animalId = '';
  await check('livestock list, filters and detail', async () => {
    const list = await call('GET', '/livestock?healthStatus=critical&pageSize=5');
    ensure(list.status === 200 && list.data.data.length > 0, 'no critical animals');
    animalId = list.data.data[0].id;
    const detail = await call('GET', `/livestock/${animalId}`);
    ensure(detail.data.code && detail.data.location, 'missing detail fields');
    const vitals = await call('GET', `/livestock/${animalId}/vitals?range=7d`);
    ensure(vitals.data.series.length > 0, 'no vitals series');
    const timeline = await call('GET', `/livestock/${animalId}/timeline`);
    ensure(Array.isArray(timeline.data), 'timeline not an array');
  });

  await check('livestock CSV export', async () => {
    const r = await call('GET', '/livestock/export.csv');
    ensure(r.status === 200 && r.type.includes('text/csv'), `got ${r.type}`);
  });

  await check('create livestock + uniqueness', async () => {
    const barns = await call('GET', '/barns?farmId=farm-4');
    const barn = barns.data.find((b: { occupancy: number; capacity: number }) => b.occupancy < b.capacity);
    ensure(barn, 'no barn with free capacity');
    const code = `TRV-SMK-${Date.now() % 100000}`;
    const created = await call('POST', '/livestock', {
      name: 'Smoke',
      animalType: 'Dairy Cattle',
      breed: 'Friesian Holstein',
      gender: 'Female',
      dateOfBirth: '2023-02-01',
      internalId: code,
      earTagId: `EAR-${code}`,
      weightKg: 400,
      bodyConditionScore: 3,
      farmId: 'farm-4',
      barnId: barn.id,
      herdGroup: 'Herd 1',
      arrivalDate: '2024-01-01',
      acquisitionSource: 'Internal breeding',
      initialHealthStatus: 'healthy',
      vaccinationStatus: 'up-to-date',
    });
    ensure(created.status === 201, `status ${created.status}: ${JSON.stringify(created.data)}`);
    const dup = await call('GET', `/livestock/check-unique?code=${code}`);
    ensure(dup.data.codeAvailable === false, 'code should be taken');
    await call('POST', `/livestock/${created.data.id}/archive`);
  });

  await check('farms with live stats', async () => {
    const r = await call('GET', '/farms');
    ensure(r.data.length === 4 && typeof r.data[0].healthScore === 'number', 'farm stats missing');
  });

  let alertId = '';
  await check('alerts center: list, acknowledge, note, task, resolve', async () => {
    const list = await call('GET', '/alerts?status=active&pageSize=5');
    ensure(list.data.data.length > 0, 'no active alerts');
    alertId = list.data.data[0].id;
    const ack = await call('PATCH', `/alerts/${alertId}/acknowledge`);
    ensure(ack.data.status === 'acknowledged', `status is ${ack.data.status}`);
    const note = await call('POST', `/alerts/${alertId}/notes`, { text: 'Smoke test note' });
    ensure(
      note.data.notes.some((n: { text: string }) => n.text === 'Smoke test note'),
      'note missing',
    );
    const task = await call('POST', `/alerts/${alertId}/tasks`, {});
    ensure(task.status === 201 && task.data.source.id === alertId, 'task not linked');
    const resolved = await call('PATCH', `/alerts/${alertId}/resolve`, { note: 'Handled' });
    ensure(resolved.data.status === 'resolved' && resolved.data.timeline.length >= 3, 'resolve/timeline failed');
    const stats = await call('GET', '/alerts/stats');
    ensure(typeof stats.data.open === 'number', 'stats missing');
  });

  await check('IoT ingest: fever reading raises a critical alert', async () => {
    const r = await call(
      'POST',
      '/ingest/telemetry',
      {
        readings: [
          {
            deviceSerial: 'DEV-001',
            temperature: 40.8,
            heartRate: 112,
            oxygen: 95,
            activity: 20,
            battery: 80,
            rssi: -95,
            snr: 7,
            latitude: -7.0,
            longitude: 107.8,
          },
        ],
      },
      { 'x-device-key': GATEWAY_KEY },
    );
    ensure(r.status === 202 && r.data.accepted === 1, `ingest failed: ${JSON.stringify(r.data)}`);
    const alerts = await call('GET', '/alerts?status=active&category=health&pageSize=50');
    ensure(
      alerts.data.data.some(
        (a: { ruleKey: string; severity: string }) => a.ruleKey === 'tempHigh' && a.severity === 'critical',
      ),
      'no critical fever alert',
    );
  });

  await check('IoT ingest: duplicates suppressed, bad key rejected', async () => {
    const reading = {
      deviceSerial: 'DEV-002',
      sequence: 999_001,
      recordedAt: new Date().toISOString(),
      temperature: 38.6,
      heartRate: 70,
    };
    await call('POST', '/ingest/telemetry', { readings: [reading] }, { 'x-device-key': GATEWAY_KEY });
    const again = await call('POST', '/ingest/telemetry', { readings: [reading] }, { 'x-device-key': GATEWAY_KEY });
    ensure(again.data.duplicates === 1, `expected duplicate, got ${JSON.stringify(again.data)}`);
    const bad = await call(
      'POST',
      '/ingest/telemetry',
      { readings: [reading] },
      { 'x-device-key': 'trv_gw_not_a_real_key_000000000' },
    );
    ensure(bad.status === 401, `expected 401, got ${bad.status}`);
  });

  await check('IoT: environment reading computes THI', async () => {
    const r = await call(
      'POST',
      '/ingest/environment',
      { readings: [{ deviceSerial: 'DEV-017', temperature: 33, humidity: 80 }] },
      { 'x-device-key': GATEWAY_KEY },
    );
    ensure(r.data.accepted === 1, JSON.stringify(r.data));
  });

  await check('device commands: restart queued, pulled by gateway, acknowledged', async () => {
    await call('POST', '/devices/DEV-001/restart');
    const pulled = await call('GET', '/ingest/commands', undefined, { 'x-device-key': GATEWAY_KEY });
    const command = pulled.data.find(
      (c: { deviceSerial: string; type: string }) => c.deviceSerial === 'DEV-001' && c.type === 'restart',
    );
    ensure(command, 'restart command not delivered');
    const ack = await call(
      'POST',
      `/ingest/commands/${command.id}/ack`,
      { success: true },
      { 'x-device-key': GATEWAY_KEY },
    );
    ensure(ack.data.ok, 'ack failed');
  });

  await check('device diagnostics', async () => {
    const r = await call('POST', '/devices/DEV-001/diagnostics');
    ensure(Array.isArray(r.data.checks) && r.data.metrics.readings24h >= 1, 'diagnostics incomplete');
  });

  await check('live monitoring snapshot', async () => {
    const r = await call('GET', '/telemetry/live');
    ensure(r.data.animals.length === 40, `expected 40, got ${r.data.animals.length}`);
  });

  await check('AI insights: generate, review, dismiss/restore, summary', async () => {
    const generated = await call('POST', '/insights/generate');
    ensure(typeof generated.data.created === 'number', 'generator failed');
    const list = await call('GET', '/insights');
    const id = list.data[0].id;
    await call('PATCH', `/insights/${id}/dismiss`);
    const restored = await call('PATCH', `/insights/${id}/restore`);
    ensure(restored.data.dismissed === false, 'restore failed');
    const summary = await call('GET', '/insights/summary');
    ensure(Array.isArray(summary.data.riskTrend), 'summary missing trend');
  });

  await check('reports: catalog, analytics, preview, PDF and CSV', async () => {
    const types = await call('GET', '/reports/types?lang=en');
    ensure(types.data.length === 7, 'expected 7 report types');
    const analytics = await call('GET', '/reports/analytics?range=30d');
    ensure(analytics.data.healthTrend.length === 30, 'analytics range wrong');
    const preview = await call('GET', '/reports/health/preview?lang=en');
    ensure(preview.data.kpis.length > 0 && preview.data.tables.length > 0, 'empty preview');
    const pdf = await call('GET', '/reports/alerts/download?format=pdf&lang=id');
    ensure(
      pdf.type.includes('application/pdf') && (pdf.data as Buffer).subarray(0, 4).toString() === '%PDF',
      'not a PDF',
    );
    const csv = await call('GET', '/reports/devices/download?format=csv');
    ensure(csv.type.includes('text/csv'), 'not CSV');
    const history = await call('GET', '/reports/history');
    ensure(history.data.length >= 2, 'history not recorded');
  });

  await check('report schedule upsert', async () => {
    const r = await call('PUT', '/reports/schedules/devices', {
      frequency: 'weekly',
      day: 1,
      time: '07:30',
      format: 'pdf',
      recipients: ['demo@terrava.id'],
    });
    ensure(r.data.nextRunAt, 'no next run');
  });

  await check('team: list, matrix, invite, protections', async () => {
    const list = await call('GET', '/team');
    ensure(list.data.length >= 10, 'staff missing');
    const matrix = await call('GET', '/team/permissions');
    ensure(matrix.data.roles.length === 7, 'matrix roles');
    const invite = await call('POST', '/team/invitations', {
      email: `smoke${Date.now()}@example.com`,
      role: 'Staff',
      farmId: 'farm-1',
    });
    ensure(invite.status === 201 && invite.data.status === 'invited', `invite failed ${invite.status}`);
    const self = await call('PATCH', '/team/STF-001', { role: 'Viewer' });
    ensure(self.status === 403, `changing own role should be forbidden, got ${self.status}`);
  });

  await check('settings: read, preferences, thresholds', async () => {
    const s = await call('GET', '/settings');
    ensure(s.data.thresholds.tempHigh === 39.5, 'default threshold');
    const prefs = await call('PATCH', '/settings/preferences', { appearance: { compact: true } });
    ensure(prefs.data.appearance.compact === true, 'preference not saved');
    const bad = await call('PATCH', '/settings/thresholds', { tempHigh: 36, tempLow: 37 });
    ensure(bad.status === 400, 'invalid thresholds accepted');
  });

  await check('global search + map + weather endpoint', async () => {
    const search = await call('GET', '/search?q=bella');
    ensure(search.data.livestock.length > 0, 'search found nothing');
    const map = await call('GET', '/map');
    ensure(map.data.livestock.length > 0 && map.data.geofences.length === 4, 'map layers missing');
    const weather = await call('GET', '/weather?farmId=farm-1');
    ensure(weather.status === 200, `weather status ${weather.status}`);
  });

  await check('RBAC: viewer cannot manage devices', async () => {
    const owner = token;
    const vet = await call('POST', '/auth/login', { email: 'vet@terrava.id', password: 'Terrava123' });
    token = vet.data.accessToken;
    const r = await call('POST', '/devices/DEV-002/restart');
    token = owner;
    ensure(r.status === 403, `veterinarian restart should be 403, got ${r.status}`);
  });

  await check('public contact form', async () => {
    const saved = token;
    token = '';
    const r = await call('POST', '/contact', {
      fullName: 'Smoke Test',
      email: 'smoke@example.com',
      inquiryType: 'demo',
      message: 'Please contact me about a pilot.',
      consent: true,
    });
    token = saved;
    ensure(r.status === 201, `status ${r.status}`);
  });

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
