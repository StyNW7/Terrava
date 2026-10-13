import type { DataState, ReportFilters } from "@/context/data-store-context";
import type { Barn, HealthStatus } from "@/types/dashboard";
import type { Language, Localized } from "@/i18n/types";

/**
 * Report builder shared by the on-screen preview, the PDF renderer and the CSV
 * export. Every figure is computed from the live demo data, so reports change
 * when alerts are resolved, animals are added, filters change, and so on.
 */

export const REPORT_TYPES = ["health", "alerts", "devices", "farm", "environment", "staff"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export interface ReportKpi {
  label: string;
  value: string;
  tone?: "default" | "good" | "warning" | "danger" | "neutral";
}

export interface ReportChart {
  title: string;
  unit?: string;
  max?: number;
  bars: { label: string; value: number; tone?: ReportKpi["tone"] }[];
}

export interface ReportTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ReportDocument {
  type: ReportType | "overview";
  title: string;
  scope: string;
  generatedAt: Date;
  kpis: ReportKpi[];
  chart?: ReportChart;
  findings: string[];
  tables: ReportTable[];
}

export interface Translator {
  lang: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tr: (value: Localized) => string;
  tt: (namespace: string, value: string) => string;
  tRel: (value: string) => string;
}

const average = (values: number[]) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);
const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Temperature-Humidity Index for cattle; above ~72 animals start to feel heat stress. */
export function temperatureHumidityIndex(temperature: number, humidity: number) {
  return Math.round((0.8 * temperature + (humidity / 100) * (temperature - 14.4) + 46.4) * 10) / 10;
}

function thiBand(thi: number): { key: string; tone: ReportKpi["tone"] } {
  if (thi < 72) return { key: "rpt.thi.normal", tone: "good" };
  if (thi < 80) return { key: "rpt.thi.mild", tone: "warning" };
  if (thi < 90) return { key: "rpt.thi.moderate", tone: "danger" };
  return { key: "rpt.thi.severe", tone: "danger" };
}

/** One-page snapshot of the dashboard overview for the selected farm. */
export function buildOverviewReport(
  slices: Pick<DataState, "livestock" | "alerts" | "devices"> & { tasks: DataState["tasks"]; scope: string },
  data: DataState,
  tx: Translator
): ReportDocument {
  const { t, tr, tRel } = tx;
  const { livestock, alerts, devices, tasks } = slices;
  const count = (status: HealthStatus) => livestock.filter((a) => a.healthStatus === status).length;
  const openAlerts = alerts.filter((a) => a.status !== "resolved");
  const openTasks = tasks.filter((task) => !task.done);
  const barnName = (id: string) => data.barns.find((barn) => barn.id === id)?.name ?? "-";
  const animalName = (id: string) => data.livestock.find((a) => a.id === id)?.name ?? "-";
  return {
    type: "overview",
    title: t("overview.pdfTitle"),
    scope: slices.scope,
    generatedAt: new Date(),
    kpis: [
      { label: t("metric.totalLivestock"), value: String(livestock.length) },
      { label: t("metric.healthyLivestock"), value: String(count("healthy")), tone: "good" },
      { label: t("metric.needsAttention"), value: String(count("attention")), tone: "warning" },
      { label: t("metric.criticalAlerts"), value: String(openAlerts.filter((a) => a.severity === "critical").length), tone: "danger" },
      { label: t("metric.activeDevices"), value: `${devices.filter((d) => d.status === "online").length}/${devices.length}` },
      { label: t("metric.avgHealthScore"), value: String(Math.round(average(livestock.map((a) => a.healthScore)))) },
    ],
    chart: {
      title: t("chart.healthDistribution"),
      bars: (["healthy", "attention", "critical", "inactive"] as HealthStatus[]).map((status) => ({
        label: t("status." + status),
        value: count(status),
        tone: status === "healthy" ? "good" : status === "attention" ? "warning" : status === "critical" ? "danger" : "neutral",
      })),
    },
    findings: [
      t("overview.pdfFinding.alerts", { count: openAlerts.length }),
      t("overview.pdfFinding.devices", { count: devices.filter((d) => d.status === "offline").length }),
      t("overview.pdfFinding.tasks", { count: openTasks.length }),
    ],
    tables: [
      {
        title: t("overview.criticalAlerts"),
        columns: ["ID", t("alerts.column.alert"), t("alerts.column.severity"), t("nav.item.livestock"), t("alerts.column.detectedAt"), t("alerts.column.assignedTo")],
        rows: openAlerts.map((a) => [a.id, tr(a.title), t("severity." + a.severity), animalName(a.livestockId), tRel(a.detectedAt), a.assignedTo ?? t("alerts.unassigned")]),
      },
      {
        title: t("overview.requiringAttention"),
        columns: [t("livestock.column.id"), t("rpt.col.name"), t("farms.barn"), t("livestock.column.healthScore"), t("livestock.column.status")],
        rows: livestock
          .filter((a) => a.healthStatus === "attention" || a.healthStatus === "critical")
          .sort((a, b) => a.healthScore - b.healthScore)
          .map((a) => [a.code, a.name, barnName(a.barnId), a.healthScore, t("status." + a.healthStatus)]),
      },
    ],
  };
}

export function buildReport(type: ReportType, data: DataState, filters: ReportFilters, tx: Translator): ReportDocument {
  const { t, tr, tt, tRel, lang } = tx;
  const num = (value: number, digits = 0) =>
    value.toLocaleString(lang === "id" ? "id-ID" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const farmName = (id: string) => data.farms.find((farm) => farm.id === id)?.name ?? "-";
  const barnName = (id: string) => data.barns.find((barn) => barn.id === id)?.name ?? "-";
  const animalName = (id: string) => data.livestock.find((animal) => animal.id === id)?.name ?? "-";

  const inFarm = (farmId: string) => filters.farmId === "all" || farmId === filters.farmId;

  const livestock = data.livestock.filter(
    (animal) =>
      !animal.archived &&
      inFarm(animal.farmId) &&
      (filters.livestockType === "all" || animal.type === filters.livestockType) &&
      (filters.health === "all" || animal.healthStatus === filters.health)
  );
  const livestockIds = new Set(livestock.map((animal) => animal.id));
  // Alerts follow the livestock filters so a "Dairy cattle" report only lists dairy alerts.
  const animalFiltersActive = filters.livestockType !== "all" || filters.health !== "all";
  const alerts = data.alerts.filter((alert) => inFarm(alert.farmId) && (!animalFiltersActive || livestockIds.has(alert.livestockId)));
  const devices = data.devices.filter((device) => inFarm(device.farmId));
  const farms = data.farms.filter((farm) => inFarm(farm.id));
  const barns = data.barns.filter((barn) => inFarm(barn.farmId));
  const staff = data.staff.filter((member) => inFarm(member.farmId));

  const scopeParts = [filters.farmId === "all" ? t("dashboard.allFarms") : farmName(filters.farmId)];
  if (filters.livestockType !== "all") scopeParts.push(tt("livestockType", filters.livestockType));
  if (filters.health !== "all") scopeParts.push(t("status." + filters.health));

  const base = {
    type,
    title: t(`reports.item.${type}.title`),
    scope: scopeParts.join(" · "),
    generatedAt: new Date(),
  };

  const statusTone: Record<HealthStatus, ReportKpi["tone"]> = { healthy: "good", attention: "warning", critical: "danger", inactive: "neutral" };

  switch (type) {
    case "health": {
      const counts = (["healthy", "attention", "critical", "inactive"] as HealthStatus[]).map((status) => ({
        status,
        count: livestock.filter((animal) => animal.healthStatus === status).length,
      }));
      const critical = livestock.filter((animal) => animal.healthStatus === "critical");
      const overdue = livestock.filter((animal) => animal.vaccinationStatus === "overdue");
      const fever = livestock.filter((animal) => animal.temperature >= 39.5);
      const findings = [
        critical.length
          ? t("rpt.health.finding.critical", { count: critical.length, names: critical.slice(0, 4).map((a) => a.name).join(", ") })
          : t("rpt.health.finding.noCritical"),
        fever.length ? t("rpt.health.finding.fever", { count: fever.length }) : t("rpt.health.finding.noFever"),
        overdue.length ? t("rpt.health.finding.vaccination", { count: overdue.length }) : t("rpt.health.finding.vaccinationOk"),
      ];
      return {
        ...base,
        kpis: [
          { label: t("metric.totalLivestock"), value: num(livestock.length) },
          { label: t("metric.avgHealthScore"), value: num(average(livestock.map((a) => a.healthScore)), 1) },
          { label: t("rpt.health.healthyShare"), value: `${percent(counts[0].count, livestock.length)}%`, tone: "good" },
          { label: t("status.attention"), value: num(counts[1].count), tone: "warning" },
          { label: t("status.critical"), value: num(counts[2].count), tone: "danger" },
          { label: t("rpt.health.vaccinationOverdue"), value: num(overdue.length), tone: overdue.length ? "warning" : "good" },
        ],
        chart: {
          title: t("chart.healthDistribution"),
          bars: counts.map(({ status, count }) => ({ label: t("status." + status), value: count, tone: statusTone[status] })),
        },
        findings,
        tables: [
          {
            title: t("rpt.health.table"),
            columns: [
              t("livestock.column.id"),
              t("rpt.col.name"),
              t("livestock.column.type"),
              t("livestock.column.farmBarn"),
              t("livestock.column.healthScore"),
              t("livestock.column.status"),
              `${t("vitals.temperature")} (°C)`,
              `${t("vitals.heartRate")} (bpm)`,
              t("rpt.col.vaccination"),
            ],
            rows: [...livestock]
              .sort((a, b) => a.healthScore - b.healthScore)
              .map((a) => [
                a.code,
                a.name,
                tt("livestockType", a.type),
                barnName(a.barnId),
                a.healthScore,
                t("status." + a.healthStatus),
                num(a.temperature, 1),
                a.heartRate,
                t("status." + a.vaccinationStatus),
              ]),
          },
        ],
      };
    }

    case "alerts": {
      const byStatus = (status: string) => alerts.filter((alert) => alert.status === status).length;
      const categories = ["health", "behavior", "location", "device", "environmental", "weather"];
      const severityRank = { critical: 0, high: 1, warning: 2, info: 3 } as const;
      const openCritical = alerts.filter((a) => a.status !== "resolved" && (a.severity === "critical" || a.severity === "high"));
      const unassigned = alerts.filter((a) => a.status !== "resolved" && !a.assignedTo);
      const topCategory = [...categories].sort(
        (a, b) => alerts.filter((x) => x.category === b).length - alerts.filter((x) => x.category === a).length
      )[0];
      return {
        ...base,
        kpis: [
          { label: t("reports.metric.totalAlerts"), value: num(alerts.length) },
          { label: t("status.active"), value: num(byStatus("active")), tone: byStatus("active") ? "warning" : "good" },
          { label: t("status.acknowledged"), value: num(byStatus("acknowledged")) },
          { label: t("status.resolved"), value: num(byStatus("resolved")), tone: "good" },
          { label: t("rpt.alerts.highCritical"), value: num(openCritical.length), tone: openCritical.length ? "danger" : "good" },
          { label: t("rpt.alerts.resolutionRate"), value: `${percent(byStatus("resolved"), alerts.length)}%` },
        ],
        chart: {
          title: t("impact.charts.alertCategory"),
          bars: categories.map((category) => ({ label: t("category." + category), value: alerts.filter((a) => a.category === category).length })),
        },
        findings: [
          openCritical.length ? t("rpt.alerts.finding.open", { count: openCritical.length }) : t("rpt.alerts.finding.noOpen"),
          unassigned.length ? t("rpt.alerts.finding.unassigned", { count: unassigned.length }) : t("rpt.alerts.finding.allAssigned"),
          alerts.length ? t("rpt.alerts.finding.topCategory", { category: t("category." + topCategory) }) : t("rpt.empty"),
        ],
        tables: [
          {
            title: t("rpt.alerts.table"),
            columns: [
              "ID",
              t("alerts.column.alert"),
              t("alerts.column.severity"),
              t("alerts.column.category"),
              t("nav.item.livestock"),
              t("filter.farm"),
              t("alerts.column.detectedAt"),
              t("alerts.column.assignedTo"),
              t("livestock.column.status"),
            ],
            rows: [...alerts]
              .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
              .map((a) => [
                a.id,
                tr(a.title),
                t("severity." + a.severity),
                t("category." + a.category),
                animalName(a.livestockId),
                farmName(a.farmId),
                tRel(a.detectedAt),
                a.assignedTo ?? t("alerts.unassigned"),
                t("status." + a.status),
              ]),
          },
        ],
      };
    }

    case "devices": {
      const statuses = ["online", "low-battery", "maintenance", "offline"] as const;
      const count = (status: string) => devices.filter((d) => d.status === status).length;
      const lowBattery = devices.filter((d) => d.battery < 25);
      const weakSignal = devices.filter((d) => d.signal < 40);
      return {
        ...base,
        kpis: [
          { label: t("rpt.devices.total"), value: num(devices.length) },
          { label: t("status.online"), value: num(count("online")), tone: "good" },
          { label: t("status.offline"), value: num(count("offline")), tone: count("offline") ? "danger" : "good" },
          { label: t("rpt.devices.lowBattery"), value: num(lowBattery.length), tone: lowBattery.length ? "warning" : "good" },
          { label: t("rpt.devices.avgUptime"), value: `${num(average(devices.map((d) => d.uptime)), 1)}%` },
          { label: t("rpt.devices.avgSignal"), value: `${num(average(devices.map((d) => d.signal)))}%` },
        ],
        chart: {
          title: t("rpt.devices.byStatus"),
          bars: statuses.map((status) => ({
            label: t("status." + status),
            value: count(status),
            tone: status === "online" ? "good" : status === "offline" ? "danger" : "warning",
          })),
        },
        findings: [
          count("offline") ? t("rpt.devices.finding.offline", { count: count("offline") }) : t("rpt.devices.finding.allOnline"),
          lowBattery.length
            ? t("rpt.devices.finding.battery", { count: lowBattery.length, names: lowBattery.slice(0, 4).map((d) => d.name).join(", ") })
            : t("rpt.devices.finding.batteryOk"),
          weakSignal.length ? t("rpt.devices.finding.signal", { count: weakSignal.length }) : t("rpt.devices.finding.signalOk"),
        ],
        tables: [
          {
            title: t("rpt.devices.table"),
            columns: [
              "ID",
              t("devices.column.device"),
              t("rpt.col.type"),
              t("livestock.column.status"),
              t("devices.battery"),
              t("rpt.col.signal"),
              t("rpt.col.uptime"),
              "Firmware",
              t("rpt.col.lastSync"),
            ],
            rows: devices.map((d) => [
              d.id,
              d.name,
              t("deviceType." + d.type),
              t("status." + d.status),
              `${d.battery}%`,
              `${d.signal}%`,
              `${num(d.uptime, 1)}%`,
              d.firmware,
              tRel(d.lastSync),
            ]),
          },
        ],
      };
    }

    case "farm": {
      const activeAnimals = data.livestock.filter((a) => !a.archived);
      const rows = farms.map((farm) => {
        const farmBarns = barns.filter((b) => b.farmId === farm.id);
        const capacity = farmBarns.reduce((sum, b) => sum + b.capacity, 0);
        const occupancy = farmBarns.reduce((sum, b) => sum + b.occupancy, 0);
        const animals = activeAnimals.filter((a) => a.farmId === farm.id);
        const openAlerts = data.alerts.filter((a) => a.farmId === farm.id && a.status !== "resolved").length;
        return { farm, farmBarns, capacity, occupancy, animals, openAlerts };
      });
      const capacity = rows.reduce((sum, r) => sum + r.capacity, 0);
      const occupancy = rows.reduce((sum, r) => sum + r.occupancy, 0);
      const crowded = barns.filter((b) => b.occupancy / b.capacity >= 0.9);
      const busiest = [...rows].sort((a, b) => b.openAlerts - a.openAlerts)[0];
      return {
        ...base,
        kpis: [
          { label: t("dashboard.farms"), value: num(farms.length) },
          { label: t("rpt.farm.barns"), value: num(barns.length) },
          { label: t("rpt.farm.capacity"), value: num(capacity) },
          { label: t("rpt.farm.occupancy"), value: `${percent(occupancy, capacity)}%`, tone: percent(occupancy, capacity) >= 90 ? "warning" : "good" },
          { label: t("metric.avgHealthScore"), value: num(average(barns.map((b) => b.healthScore)), 1) },
          { label: t("dashboard.activeAlerts"), value: num(rows.reduce((sum, r) => sum + r.openAlerts, 0)) },
        ],
        chart: {
          title: t("rpt.farm.occupancyChart"),
          unit: "%",
          max: 100,
          bars: rows.map((r) => ({ label: r.farm.name, value: percent(r.occupancy, r.capacity), tone: percent(r.occupancy, r.capacity) >= 90 ? "warning" : "good" })),
        },
        findings: [
          crowded.length ? t("rpt.farm.finding.crowded", { count: crowded.length, names: crowded.slice(0, 3).map((b) => b.name).join(", ") }) : t("rpt.farm.finding.capacityOk"),
          busiest && busiest.openAlerts ? t("rpt.farm.finding.alerts", { farm: busiest.farm.name, count: busiest.openAlerts }) : t("rpt.alerts.finding.noOpen"),
        ],
        tables: [
          {
            title: t("rpt.farm.table"),
            columns: [t("rpt.col.name"), t("rpt.col.location"), t("rpt.col.manager"), t("nav.item.livestock"), t("rpt.farm.barns"), t("rpt.farm.capacity"), t("rpt.farm.occupancy"), t("dashboard.activeAlerts")],
            rows: rows.map((r) => [r.farm.name, r.farm.location, r.farm.manager, r.animals.length, r.farmBarns.length, r.capacity, `${percent(r.occupancy, r.capacity)}%`, r.openAlerts]),
          },
          {
            title: t("rpt.farm.barnTable"),
            columns: [t("farms.barn"), t("filter.farm"), t("rpt.col.manager"), t("farms.occupancy"), t("livestock.column.healthScore"), t("dashboard.activeAlerts")],
            rows: barns.map((b) => [b.name, farmName(b.farmId), b.manager, `${b.occupancy}/${b.capacity}`, b.healthScore, b.alertCount]),
          },
        ],
      };
    }

    case "environment": {
      const withThi = barns.map((barn: Barn) => ({ barn, thi: temperatureHumidityIndex(barn.temperature, barn.humidity) }));
      const stressed = withThi.filter((x) => x.thi >= 72);
      const hottest = [...withThi].sort((a, b) => b.thi - a.thi)[0];
      return {
        ...base,
        kpis: [
          { label: t("rpt.env.avgTemp"), value: `${num(average(barns.map((b) => b.temperature)), 1)}°C` },
          { label: t("rpt.env.avgHumidity"), value: `${num(average(barns.map((b) => b.humidity)))}%` },
          { label: t("rpt.env.avgThi"), value: num(average(withThi.map((x) => x.thi)), 1) },
          { label: t("rpt.env.stressedBarns"), value: num(stressed.length), tone: stressed.length ? "warning" : "good" },
          { label: t("rpt.env.monitoredBarns"), value: num(barns.length) },
          { label: t("rpt.env.sensors"), value: num(devices.filter((d) => d.type === "environmental-sensor").length) },
        ],
        chart: {
          title: t("rpt.env.thiChart"),
          bars: withThi.map((x) => ({ label: x.barn.name, value: x.thi, tone: thiBand(x.thi).tone })),
        },
        findings: [
          stressed.length ? t("rpt.env.finding.stress", { count: stressed.length }) : t("rpt.env.finding.noStress"),
          hottest ? t("rpt.env.finding.hottest", { barn: hottest.barn.name, thi: num(hottest.thi, 1) }) : t("rpt.empty"),
          t("rpt.env.finding.thiNote"),
        ],
        tables: [
          {
            title: t("rpt.env.table"),
            columns: [t("farms.barn"), t("filter.farm"), `${t("vitals.temperature")} (°C)`, `${t("vitals.humidity")} (%)`, "THI", t("rpt.env.condition")],
            rows: withThi.map((x) => [x.barn.name, farmName(x.barn.farmId), num(x.barn.temperature, 1), x.barn.humidity, num(x.thi, 1), t(thiBand(x.thi).key)]),
          },
        ],
      };
    }

    case "staff": {
      const active = staff.filter((m) => m.status === "active");
      const topPerformer = [...active].sort((a, b) => b.resolutionRate - a.resolutionRate)[0];
      const busiest = [...active].sort((a, b) => b.tasksAssigned - a.tasksAssigned)[0];
      return {
        ...base,
        kpis: [
          { label: t("rpt.staff.members"), value: num(staff.length) },
          { label: t("status.active"), value: num(active.length), tone: "good" },
          { label: t("status.invited"), value: num(staff.filter((m) => m.status === "invited").length) },
          { label: t("rpt.staff.tasks"), value: num(staff.reduce((sum, m) => sum + m.tasksAssigned, 0)) },
          { label: t("rpt.staff.alertsHandled"), value: num(staff.reduce((sum, m) => sum + m.alertsAssigned, 0)) },
          { label: t("rpt.staff.avgResolution"), value: `${num(average(active.map((m) => m.resolutionRate)))}%` },
        ],
        chart: {
          title: t("rpt.staff.resolutionChart"),
          unit: "%",
          max: 100,
          bars: active.map((m) => ({ label: m.name, value: m.resolutionRate, tone: m.resolutionRate >= 85 ? "good" : "warning" })),
        },
        findings: [
          topPerformer ? t("rpt.staff.finding.top", { name: topPerformer.name, rate: topPerformer.resolutionRate }) : t("rpt.empty"),
          busiest ? t("rpt.staff.finding.busiest", { name: busiest.name, count: busiest.tasksAssigned }) : t("rpt.empty"),
        ],
        tables: [
          {
            title: t("rpt.staff.table"),
            columns: [t("rpt.col.name"), "Email", t("rpt.col.role"), t("filter.farm"), t("livestock.column.status"), t("rpt.staff.tasks"), t("rpt.staff.alertsHandled"), t("rpt.staff.avgResolution")],
            rows: staff.map((m) => [m.name, m.email, tt("role", m.role), farmName(m.farmId), t("status." + m.status), m.tasksAssigned, m.alertsAssigned, `${m.resolutionRate}%`]),
          },
        ],
      };
    }
  }
}
