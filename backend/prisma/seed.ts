/**
 * Seeds a demo organization that mirrors the frontend prototype one-to-one
 * (same ids, names and figures), plus the history a real deployment would have
 * accumulated: 7 days of hourly ear tag telemetry, barn climate readings,
 * health records, device events and alert timelines.
 *
 *   npm run db:seed
 *
 * Re-running wipes the demo organization and recreates it.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma, type StaffRole } from '../src/generated/prisma/client';
import { createHash } from 'node:crypto';
import {
  DEMO_LOGINS,
  DEMO_PASSWORD,
  createSeededRandom,
  farms,
  generateAlerts,
  generateBarns,
  generateDevices,
  generateInsights,
  generateLivestock,
  generateStaff,
  relative,
  seedTasks,
} from './seed-data';

const DEMO_ORG_SLUG = 'terrava-demo';
/** Fixed gateway key so the IoT simulator works out of the box against a seeded database. */
export const DEMO_GATEWAY_KEY = 'trv_gw_demo_green_valley_key_change_me_0001';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const now = Date.now();
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');
const upper = (v: string) => v.toUpperCase().replace(/-/g, '_');
const ROLE: Record<string, StaffRole> = {
  Owner: 'OWNER',
  'Farm Manager': 'FARM_MANAGER',
  Operational: 'OPERATIONAL',
  Staff: 'STAFF',
  Veterinarian: 'VETERINARIAN',
  'Cooperative Admin': 'COOPERATIVE_ADMIN',
  Viewer: 'VIEWER',
};

function thi(t: number, h: number) {
  return Math.round((0.8 * t + (h / 100) * (t - 14.4) + 46.4) * 10) / 10;
}

async function chunked<T>(rows: T[], size: number, insert: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await insert(rows.slice(i, i + size));
}

async function main() {
  const started = Date.now();
  console.log('Seeding Terrava demo data...');

  // Clean slate for the demo organization (cascades to everything it owns).
  const existing = await prisma.organization.findUnique({ where: { slug: DEMO_ORG_SLUG } });
  if (existing) {
    await prisma.livestock.deleteMany({ where: { organizationId: existing.id } });
    await prisma.device.deleteMany({ where: { organizationId: existing.id } });
    await prisma.organization.delete({ where: { id: existing.id } });
  }
  const staff = generateStaff();
  await prisma.user.deleteMany({
    where: { email: { in: [...staff.map((s) => s.email), ...Object.values(DEMO_LOGINS)] } },
  });

  const barns = generateBarns();
  const livestock = generateLivestock(barns);
  const { devices, logs } = generateDevices(livestock);
  const alerts = generateAlerts(livestock);
  const insights = generateInsights(livestock);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 11);

  // --- Organization ------------------------------------------------------------
  const org = await prisma.organization.create({
    data: {
      name: 'Terrava Farm Boyolali',
      slug: DEMO_ORG_SLUG,
      type: 'COMMERCIAL',
      province: 'Jawa Tengah',
      city: 'Boyolali',
      settings: {
        thresholds: {
          tempHigh: 39.5,
          tempLow: 37.5,
          heartRate: 100,
          activityDrop: 30,
          batteryLow: 20,
          signalWeak: 25,
          geofenceDuration: 15,
        },
        timezone: 'Asia/Jakarta',
      },
    },
  });

  // --- Farms, barns, geofences ---------------------------------------------------
  for (const farm of farms) {
    const animals = livestock.filter((a) => a.farmId === farm.id);
    const lats = animals.map((a) => a.location.lat);
    const lngs = animals.map((a) => a.location.lng);
    const center = {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    };
    const pad = 0.02;
    await prisma.farm.create({
      data: {
        id: farm.id,
        organizationId: org.id,
        name: farm.name,
        location: farm.location,
        region: farm.region,
        imageUrl: farm.image,
        latitude: Number(center.lat.toFixed(5)),
        longitude: Number(center.lng.toFixed(5)),
        areaHectares: 40 + animals.length * 3,
        geofences: {
          create: {
            name: `${farm.name.split(' ')[0]} boundary`,
            type: 'BOUNDARY',
            polygon: [
              [Math.max(...lats) + pad, Math.min(...lngs) - pad],
              [Math.max(...lats) + pad, Math.max(...lngs) + pad],
              [Math.min(...lats) - pad, Math.max(...lngs) + pad],
              [Math.min(...lats) - pad, Math.min(...lngs) - pad],
            ],
          },
        },
      },
    });
  }
  // --- Users and memberships ---------------------------------------------------
  const memberByName = new Map<string, string>();
  for (const person of staff) {
    const email = DEMO_LOGINS[person.id] ?? person.email;
    const user = await prisma.user.create({
      data: {
        email,
        name: person.name,
        passwordHash: person.status === 'invited' ? '!' : passwordHash,
        avatarUrl: person.avatar,
        phone: '+62 812 3456 7890',
        status: person.status === 'invited' ? 'INVITED' : 'ACTIVE',
        emailVerifiedAt: person.status === 'invited' ? null : new Date(now - 90 * 86_400_000),
        lastActiveAt: person.lastActive ? relative(person.lastActive, now) : null,
        preferences: {},
      },
    });
    await prisma.membership.create({
      data: {
        id: person.id,
        userId: user.id,
        organizationId: org.id,
        role: ROLE[person.role],
        title: person.title,
        farmId: person.farmId,
        status: person.status === 'invited' ? 'INVITED' : person.status === 'disabled' ? 'DISABLED' : 'ACTIVE',
      },
    });
    if (person.status === 'invited') {
      await prisma.invitation.create({
        data: {
          organizationId: org.id,
          email,
          name: person.name,
          role: ROLE[person.role],
          farmId: person.farmId,
          tokenHash: sha256(`demo-invite-${person.id}`),
          expiresAt: new Date(now + 7 * 86_400_000),
        },
      });
    }
    memberByName.set(person.name, person.id);
  }

  // Farm managers can only be linked once their memberships exist.
  for (const farm of farms) {
    await prisma.farm.update({ where: { id: farm.id }, data: { managerId: memberByName.get(farm.manager) } });
  }
  await prisma.barn.createMany({
    data: barns.map((b) => ({
      id: b.id,
      farmId: b.farmId,
      name: b.name,
      capacity: Math.max(b.capacity, livestock.filter((a) => a.barnId === b.id).length),
      managerId: memberByName.get(b.manager),
    })),
  });

  // --- Devices -------------------------------------------------------------------
  const farmCenter = new Map(
    (await prisma.farm.findMany({ select: { id: true, latitude: true, longitude: true } })).map((f) => [f.id, f]),
  );
  const deviceRows: Prisma.DeviceCreateManyInput[] = devices.map((d, index) => {
    const center = farmCenter.get(d.farmId)!;
    return {
      id: d.id,
      organizationId: org.id,
      farmId: d.farmId,
      barnId: d.type === 'environmental-sensor' ? barns.find((b) => b.farmId === d.farmId)!.id : null,
      serial: d.id,
      devEui: `70B3D57ED00${(0x5a10 + index).toString(16).toUpperCase().padStart(5, '0')}`,
      name: d.name,
      type: upper(d.type) as Prisma.DeviceCreateManyInput['type'],
      status: upper(d.status) as Prisma.DeviceCreateManyInput['status'],
      firmware: d.firmware,
      battery: d.battery,
      signal: d.signal,
      rssi: Math.round(-120 + (d.signal / 100) * 80),
      snr: Number((-20 + (d.signal / 100) * 30).toFixed(1)),
      uptime: d.uptime,
      dataPackets: d.dataPackets,
      lastSyncAt: relative(d.lastSync, now),
      reportInterval: d.type === 'ear-tag' ? 300 : d.type === 'gateway' ? 60 : 600,
      latitude: d.type === 'gateway' ? center.latitude : null,
      longitude: d.type === 'gateway' ? center.longitude : null,
      apiKeyHash: d.id === 'DEV-013' ? sha256(DEMO_GATEWAY_KEY) : null,
    };
  });
  // Animals 13-40 that wear a tag in the prototype get their own ear tag records (TAG-xxx).
  const extraTags = livestock.slice(12).filter((a) => a.hasDevice);
  for (const animal of extraTags) {
    const n = animal.id.slice(4);
    deviceRows.push({
      id: `TAG-${n}`,
      organizationId: org.id,
      farmId: animal.farmId,
      serial: `TAG-${n}`,
      devEui: `70B3D57ED01${Number(n).toString(16).toUpperCase().padStart(5, '0')}`,
      name: `Smart Ear Tag ${n}`,
      type: 'EAR_TAG',
      status: upper(animal.deviceStatus) as Prisma.DeviceCreateManyInput['status'],
      firmware: 'v2.4.1',
      battery: animal.batteryLevel,
      signal: animal.deviceStatus === 'offline' ? 5 : 70,
      rssi: animal.deviceStatus === 'offline' ? -118 : -98,
      snr: animal.deviceStatus === 'offline' ? -18 : 6.5,
      uptime: animal.deviceStatus === 'offline' ? 84 : 96,
      dataPackets: 2000 + Number(n) * 37,
      lastSyncAt: animal.deviceStatus === 'offline' ? new Date(now - 5 * 3_600_000) : relative(animal.lastUpdate, now),
      reportInterval: 300,
    });
  }
  await prisma.device.createMany({ data: deviceRows });

  // --- Livestock -------------------------------------------------------------------
  const wornBy = new Map<string, string>(); // livestockId -> deviceId
  devices.filter((d) => d.assignedLivestockId).forEach((d) => wornBy.set(d.assignedLivestockId!, d.id));
  extraTags.forEach((a) => wornBy.set(a.id, `TAG-${a.id.slice(4)}`));

  await prisma.livestock.createMany({
    data: livestock.map((a) => ({
      id: a.id,
      organizationId: org.id,
      farmId: a.farmId,
      barnId: a.barnId,
      code: a.code,
      name: a.name,
      earTagId: a.earTagId,
      photoUrl: a.photo,
      type: a.type,
      breed: a.breed,
      gender: a.gender === 'Male' ? 'MALE' : 'FEMALE',
      dateOfBirth: new Date(a.dateOfBirth),
      weightKg: a.weightKg,
      bodyConditionScore: a.bodyConditionScore,
      herdGroup: a.herdGroup,
      healthStatus: upper(a.healthStatus) as Prisma.LivestockCreateManyInput['healthStatus'],
      healthScore: a.healthScore,
      vaccinationStatus: upper(a.vaccinationStatus) as Prisma.LivestockCreateManyInput['vaccinationStatus'],
      arrivalDate: new Date(a.arrivalDate),
      acquisitionSource: a.acquisitionSource,
      notes: a.notes,
      deviceId: wornBy.get(a.id) ?? null,
      temperature: a.temperature,
      heartRate: a.heartRate,
      activityLevel: a.activityLevel,
      oxygenLevel: a.oxygenLevel,
      latitude: a.location.lat,
      longitude: a.location.lng,
      lastReadingAt: relative(a.lastUpdate, now),
    })),
  });

  // --- Telemetry history: 7 days hourly for every animal wearing a tag ----------------
  const random = createSeededRandom(7007);
  const jitter = (scale: number) => (random() - 0.5) * 2 * scale;
  const telemetry: Prisma.TelemetryReadingCreateManyInput[] = [];
  const HOURS = 7 * 24;
  for (const animal of livestock) {
    const deviceId = wornBy.get(animal.id);
    if (!deviceId) continue;
    const last = relative(animal.lastUpdate, now).getTime();
    const deteriorating = animal.healthStatus === 'critical' || animal.healthStatus === 'attention';
    for (let h = HOURS - 1; h >= 0; h--) {
      const at = new Date(last - h * 3_600_000);
      const hour = (at.getUTCHours() + 7) % 24; // WIB
      const daylight = Math.sin(((hour - 6) / 24) * 2 * Math.PI); // cattle are active by day
      // Sick animals drift from a healthy baseline toward their current values over the last 36 h.
      const drift = deteriorating ? Math.max(0, 1 - h / 36) : 1;
      const baseTemp = deteriorating ? 38.6 + (animal.temperature - 38.6) * drift : animal.temperature;
      const baseHr = deteriorating ? 70 + (animal.heartRate - 70) * drift : animal.heartRate;
      const baseAct = deteriorating ? 62 + (animal.activityLevel - 62) * drift : animal.activityLevel;
      const isLast = h === 0;
      telemetry.push({
        deviceId,
        livestockId: animal.id,
        recordedAt: at,
        receivedAt: new Date(at.getTime() + 2_000),
        sequence: HOURS - h,
        temperature: isLast ? animal.temperature : Number((baseTemp + daylight * 0.15 + jitter(0.12)).toFixed(2)),
        heartRate: isLast ? animal.heartRate : Math.round(baseHr + daylight * 3 + jitter(3)),
        oxygen: isLast ? animal.oxygenLevel : Math.round(Math.min(100, animal.oxygenLevel + jitter(1.2))),
        activity: isLast
          ? animal.activityLevel
          : Math.max(0, Math.min(100, Math.round(baseAct + daylight * 18 + jitter(6)))),
        steps: Math.max(0, Math.round((baseAct + daylight * 18) * 6 + jitter(40))),
        latitude: Number((animal.location.lat + jitter(0.0015)).toFixed(6)),
        longitude: Number((animal.location.lng + jitter(0.0015)).toFixed(6)),
        battery: Math.min(100, Math.round(animal.batteryLevel + (h / HOURS) * 6)),
        rssi: Math.round(-100 + jitter(8)),
        snr: Number((6 + jitter(3)).toFixed(1)),
      });
    }
  }
  await chunked(telemetry, 2000, (batch) => prisma.telemetryReading.createMany({ data: batch }));

  // --- Barn climate: hourly readings from each farm's environmental sensor ----------------
  const environment: Prisma.EnvironmentReadingCreateManyInput[] = [];
  for (const sensor of devices.filter((d) => d.type === 'environmental-sensor')) {
    const barn = barns.find((b) => b.farmId === sensor.farmId)!;
    for (let h = HOURS - 1; h >= 0; h--) {
      const at = new Date(now - h * 3_600_000);
      const hour = (at.getUTCHours() + 7) % 24;
      const daily = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
      const temperature = Number((barn.temperature + daily * 3.2 + jitter(0.6)).toFixed(1));
      const humidity = Math.max(35, Math.min(98, Math.round(barn.humidity - daily * 9 + jitter(3))));
      environment.push({
        farmId: sensor.farmId,
        barnId: barn.id,
        deviceId: sensor.id,
        recordedAt: at,
        temperature,
        humidity,
        thi: thi(temperature, humidity),
      });
    }
  }
  await chunked(environment, 2000, (batch) => prisma.environmentReading.createMany({ data: batch }));

  // --- Health records ------------------------------------------------------------------
  const vet = 'Andi Wirawan';
  const records: Prisma.HealthRecordCreateManyInput[] = livestock.flatMap((a) => {
    const nextDue =
      a.vaccinationStatus === 'overdue'
        ? new Date(now - 20 * 86_400_000)
        : a.vaccinationStatus === 'due'
          ? new Date(now + 7 * 86_400_000)
          : new Date(now + 90 * 86_400_000);
    return [
      {
        livestockId: a.id,
        type: 'EXAMINATION',
        title: 'Routine examination',
        performedAt: new Date(now - 12 * 86_400_000),
        performedByName: vet,
        temperature: a.temperature,
      },
      {
        livestockId: a.id,
        type: 'EXAMINATION',
        title: 'Body condition assessment',
        performedAt: new Date(now - 40 * 86_400_000),
        performedByName: vet,
        bodyConditionScore: a.bodyConditionScore,
      },
      {
        livestockId: a.id,
        type: 'VACCINATION',
        title: 'Routine vaccination (FMD)',
        vaccineName: 'Aftovax',
        dosage: '2 ml',
        performedAt: new Date(now - 90 * 86_400_000),
        performedByName: vet,
        nextDueAt: nextDue,
      },
      {
        livestockId: a.id,
        type: 'TREATMENT',
        title: 'Vitamin supplementation',
        medication: 'Vitamin ADE',
        dosage: '5 ml',
        performedAt: new Date(now - 60 * 86_400_000),
        performedByName: vet,
      },
      {
        livestockId: a.id,
        type: 'WEIGHING',
        title: 'Monthly weighing',
        weightKg: Math.max(110, a.weightKg - 24),
        performedAt: new Date(now - 60 * 86_400_000),
        performedByName: 'Budi Santoso',
      },
      {
        livestockId: a.id,
        type: 'WEIGHING',
        title: 'Monthly weighing',
        weightKg: Math.max(120, a.weightKg - 12),
        performedAt: new Date(now - 30 * 86_400_000),
        performedByName: 'Budi Santoso',
      },
      {
        livestockId: a.id,
        type: 'WEIGHING',
        title: 'Monthly weighing',
        weightKg: a.weightKg,
        bodyConditionScore: a.bodyConditionScore,
        performedAt: new Date(now - 86_400_000),
        performedByName: 'Budi Santoso',
      },
    ];
  });
  await chunked(records, 1000, (batch) => prisma.healthRecord.createMany({ data: batch }));

  // --- Device events and maintenance logs ------------------------------------------------
  await prisma.deviceEvent.createMany({
    data: logs.map((log) => ({
      deviceId: log.deviceId,
      type: upper(log.type) as Prisma.DeviceEventCreateManyInput['type'],
      message: log.message,
      createdAt: relative(log.timestamp, now),
    })),
  });
  const inMaintenance = devices.filter((d) => d.status === 'maintenance');
  if (inMaintenance.length) {
    await prisma.maintenanceLog.createMany({
      data: inMaintenance.map((d) => ({
        deviceId: d.id,
        note: 'Scheduled antenna and battery inspection',
        byName: 'Reza Aditama',
        createdAt: new Date(now - 3 * 3_600_000),
      })),
    });
  }

  // --- Alerts with timelines ---------------------------------------------------------------
  for (const a of alerts) {
    const detectedAt = relative(a.detectedAt, now);
    const assigneeId = a.assignedTo ? memberByName.get(a.assignedTo) : undefined;
    const ackAt = a.status !== 'active' ? new Date(detectedAt.getTime() + 25 * 60_000) : null;
    const resolvedAt = a.status === 'resolved' ? new Date(detectedAt.getTime() + 4 * 3_600_000) : null;
    const events: Prisma.AlertEventCreateWithoutAlertInput[] = [
      { type: 'CREATED', actorName: 'Terrava AI', createdAt: detectedAt },
    ];
    if (assigneeId)
      events.push({
        type: 'ASSIGNED',
        actorName: 'Ratna Kusuma',
        metadata: { assignee: a.assignedTo },
        createdAt: new Date(detectedAt.getTime() + 10 * 60_000),
      });
    if (ackAt) events.push({ type: 'ACKNOWLEDGED', actorName: a.assignedTo ?? 'Ratna Kusuma', createdAt: ackAt });
    if (resolvedAt) events.push({ type: 'RESOLVED', actorName: a.assignedTo ?? 'Ratna Kusuma', createdAt: resolvedAt });

    await prisma.alert.create({
      data: {
        id: a.id,
        organizationId: org.id,
        farmId: a.farmId,
        barnId: a.barnId,
        livestockId: a.category === 'weather' ? null : a.livestockId,
        deviceId: a.category === 'device' ? (wornBy.get(a.livestockId) ?? null) : null,
        title: a.title,
        description: a.description,
        severity: upper(a.severity) as Prisma.AlertCreateInput['severity'],
        category: upper(a.category) as Prisma.AlertCreateInput['category'],
        status: upper(a.status) as Prisma.AlertCreateInput['status'],
        source: a.category === 'weather' ? 'WEATHER' : a.category === 'device' ? 'DEVICE' : 'RULE',
        ruleKey: a.ruleKey,
        aiConfidence: a.aiConfidence,
        aiCause: a.aiCause,
        recommendations: a.recommendations,
        dataAtDetection: a.dataAtDetection,
        detectedAt,
        assignedToId: assigneeId,
        acknowledgedAt: ackAt,
        acknowledgedBy: ackAt ? (a.assignedTo ?? 'Ratna Kusuma') : null,
        resolvedAt,
        resolvedBy: resolvedAt ? (a.assignedTo ?? 'Ratna Kusuma') : null,
        resolutionNote: resolvedAt ? 'Checked on site; condition back to normal.' : null,
        events: { create: events },
        notes:
          a.status !== 'active'
            ? {
                create: {
                  authorName: a.assignedTo ?? 'Ratna Kusuma',
                  text: 'Inspected the animal and logged the findings.',
                  createdAt: ackAt ?? detectedAt,
                },
              }
            : undefined,
      },
    });
  }

  // --- AI insights -----------------------------------------------------------------------------
  await prisma.aIInsight.createMany({
    data: insights.map((i) => ({
      id: i.id,
      organizationId: org.id,
      priority: upper(i.priority) as Prisma.AIInsightCreateManyInput['priority'],
      category: upper(i.category) as Prisma.AIInsightCreateManyInput['category'],
      title: i.title,
      summary: i.summary,
      recommendation: i.recommendation,
      confidence: i.confidence,
      affectedLivestock: [...new Set(i.affectedLivestock)],
      generatedAt: relative(i.generatedAt, now),
      reviewed: i.reviewed,
      reviewedAt: i.reviewed ? new Date(now - 3_600_000) : null,
      source: 'rules/herd-analytics',
    })),
  });

  // --- Tasks -------------------------------------------------------------------------------------
  await prisma.task.createMany({
    data: seedTasks.map((t) => ({
      id: t.id,
      organizationId: org.id,
      farmId: t.farmId,
      titleKey: t.titleKey,
      kind: t.kind,
      assigneeId: memberByName.get(t.assignee),
      assigneeName: t.assignee,
      dueDate: new Date(new Date(now + t.dueInDays * 86_400_000).toISOString().slice(0, 10)),
    })),
  });

  // --- A weekly report schedule and a welcome notification -------------------------------------------
  const owner = await prisma.membership.findUniqueOrThrow({ where: { id: 'STF-001' }, include: { user: true } });
  await prisma.reportSchedule.create({
    data: {
      organizationId: org.id,
      reportType: 'HEALTH',
      frequency: 'WEEKLY',
      day: 1,
      time: '07:00',
      format: 'PDF',
      recipients: [owner.user.email],
      nextRunAt: new Date(now + 3 * 86_400_000),
      createdById: owner.userId,
    },
  });
  await prisma.notification.create({
    data: {
      userId: owner.userId,
      organizationId: org.id,
      type: 'SYSTEM',
      title: { id: 'Selamat datang di Terrava', en: 'Welcome to Terrava' },
      body: {
        id: 'Data demo sudah siap. Jelajahi dashboard, alert, dan laporan.',
        en: 'Demo data is ready. Explore the dashboard, alerts and reports.',
      },
      link: '/dashboard',
      channels: ['in-app'],
    },
  });

  console.log(
    [
      `Done in ${((Date.now() - started) / 1000).toFixed(1)}s`,
      `  organization : ${org.name}`,
      `  farms/barns  : ${farms.length}/${barns.length}`,
      `  livestock    : ${livestock.length}`,
      `  devices      : ${deviceRows.length}`,
      `  telemetry    : ${telemetry.length} readings, environment: ${environment.length}`,
      `  alerts       : ${alerts.length}, insights: ${insights.length}, members: ${staff.length}`,
      '',
      `  Demo logins  : demo@terrava.id / manager@terrava.id / vet@terrava.id  (password ${DEMO_PASSWORD})`,
      `  Gateway key  : ${DEMO_GATEWAY_KEY}  (device DEV-013, farm-1)`,
    ].join('\n'),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
