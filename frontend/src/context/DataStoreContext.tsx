import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DATA_STORE_KEY, DataStoreContext } from "@/context/data-store-context";
import type { DataState, DataStoreContextValue } from "@/context/data-store-context";
import { farms as seedFarms, barns as seedBarns } from "@/data/mockFarms";
import { livestock as seedLivestock } from "@/data/mockLivestock";
import { alerts as seedAlerts } from "@/data/mockAlerts";
import { devices as seedDevices } from "@/data/mockDevices";
import { staff as seedStaff } from "@/data/mockTeam";
import { aiInsights as seedInsights } from "@/data/mockInsights";
import type { FarmTask } from "@/context/data-store-context";

const isoDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

function seedTasks(): FarmTask[] {
  const createdAt = new Date().toISOString();
  return [
    { id: "TSK-001", titleKey: "overview.task.vaccination", kind: "vaccination", farmId: "farm-1", assignee: "Andi Wirawan", dueDate: isoDate(1), done: false, createdAt },
    { id: "TSK-002", titleKey: "overview.task.vetCheckup", kind: "vet", farmId: "farm-2", assignee: "Andi Wirawan", dueDate: isoDate(2), done: false, createdAt },
    { id: "TSK-003", titleKey: "overview.task.weighing", kind: "weighing", farmId: "farm-3", assignee: "Budi Santoso", dueDate: isoDate(3), done: false, createdAt },
    { id: "TSK-004", titleKey: "overview.task.barnInspection", kind: "inspection", farmId: "farm-4", assignee: "Reza Aditama", dueDate: isoDate(5), done: false, createdAt },
  ];
}

/** Bump when the seed data shape changes so stale browser copies are discarded. */
const DATA_VERSION = 3;

function createSeed(): DataState {
  // Deep copies so edits never mutate the module-level seed arrays.
  return structuredClone({
    version: DATA_VERSION,
    farms: seedFarms,
    barns: seedBarns,
    livestock: seedLivestock,
    alerts: seedAlerts,
    devices: seedDevices,
    staff: seedStaff,
    insights: seedInsights,
    tasks: seedTasks(),
    reportHistory: [],
    reportSchedules: [],
  });
}

function readState(): DataState {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = window.localStorage.getItem(DATA_STORE_KEY);
    if (!raw) return createSeed();
    const parsed = JSON.parse(raw) as DataState;
    return parsed?.version === DATA_VERSION ? { ...createSeed(), ...parsed } : createSeed();
  } catch {
    return createSeed();
  }
}

const patchWhere = <T extends { id: string }>(items: T[], ids: string[], patch: Partial<T>) => {
  const set = new Set(ids);
  return items.map((item) => (set.has(item.id) ? { ...item, ...patch } : item));
};

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(readState);

  useEffect(() => {
    try {
      window.localStorage.setItem(DATA_STORE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable: the in-memory state keeps working for this session.
    }
  }, [state]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === DATA_STORE_KEY) setState(readState());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const update = useCallback((recipe: (current: DataState) => Partial<DataState>) => {
    setState((current) => ({ ...current, ...recipe(current) }));
  }, []);

  const actions = useMemo(
    () => ({
      updateAlerts: (ids: string[], patch: Partial<DataState["alerts"][number]>) =>
        update((s) => ({ alerts: patchWhere(s.alerts, ids, patch) })),
      addAlertNote: (id: string, text: string, author: string) =>
        update((s) => ({
          alerts: s.alerts.map((alert) =>
            alert.id === id
              ? {
                  ...alert,
                  notes: [...(alert.notes ?? []), { id: `NOTE-${Date.now()}`, text, author, createdAt: new Date().toISOString() }],
                }
              : alert
          ),
        })),
      addLivestock: (animal: DataState["livestock"][number]) =>
        update((s) => ({
          livestock: [animal, ...s.livestock],
          barns: s.barns.map((barn) => (barn.id === animal.barnId ? { ...barn, occupancy: barn.occupancy + 1 } : barn)),
        })),
      updateLivestock: (ids: string[], patch: Partial<DataState["livestock"][number]>) =>
        update((s) => ({ livestock: patchWhere(s.livestock, ids, patch) })),
      assignDevice: (livestockId: string, deviceId: string | null) =>
        update((s) => {
          const animal = s.livestock.find((a) => a.id === livestockId);
          const device = deviceId ? s.devices.find((d) => d.id === deviceId) : undefined;
          return {
            livestock: s.livestock.map((a) => {
              if (a.id === livestockId) {
                return device
                  ? { ...a, deviceId: device.id, deviceStatus: device.status, batteryLevel: device.battery }
                  : { ...a, deviceId: null, deviceStatus: "unassigned" as const, batteryLevel: 0 };
              }
              // A device can only be worn by one animal.
              if (deviceId && a.deviceId === deviceId) return { ...a, deviceId: null, deviceStatus: "unassigned" as const, batteryLevel: 0 };
              return a;
            }),
            devices: s.devices.map((d) => {
              if (d.id === deviceId) return { ...d, assignedLivestockId: livestockId };
              if (animal?.deviceId && d.id === animal.deviceId) return { ...d, assignedLivestockId: null };
              return d;
            }),
          };
        }),
      updateDevices: (ids: string[], patch: Partial<DataState["devices"][number]>) =>
        update((s) => ({ devices: patchWhere(s.devices, ids, patch) })),
      mutateDevice: (id: string, recipe: (device: DataState["devices"][number]) => Partial<DataState["devices"][number]>) =>
        update((s) => {
          const devices = s.devices.map((device) => (device.id === id ? { ...device, ...recipe(device) } : device));
          const changed = devices.find((device) => device.id === id);
          // Keep the wearer's device badge in sync with the device status.
          const livestock = changed?.assignedLivestockId
            ? s.livestock.map((animal) =>
                animal.id === changed.assignedLivestockId ? { ...animal, deviceStatus: changed.status, batteryLevel: changed.battery } : animal
              )
            : s.livestock;
          return { devices, livestock };
        }),
      addFarm: (farm: DataState["farms"][number], barns: DataState["barns"]) =>
        update((s) => ({ farms: [...s.farms, farm], barns: [...s.barns, ...barns] })),
      updateFarm: (id: string, patch: Partial<DataState["farms"][number]>) =>
        update((s) => ({ farms: patchWhere(s.farms, [id], patch) })),
      addBarn: (barn: DataState["barns"][number]) =>
        update((s) => ({
          barns: [...s.barns, barn],
          farms: s.farms.map((farm) => (farm.id === barn.farmId ? { ...farm, barnCount: farm.barnCount + 1, capacity: farm.capacity + barn.capacity } : farm)),
        })),
      addStaff: (member: DataState["staff"][number]) => update((s) => ({ staff: [...s.staff, member] })),
      updateStaff: (id: string, patch: Partial<DataState["staff"][number]>) => update((s) => ({ staff: patchWhere(s.staff, [id], patch) })),
      removeStaff: (id: string) => update((s) => ({ staff: s.staff.filter((member) => member.id !== id) })),
      updateInsight: (id: string, patch: Partial<DataState["insights"][number]>) =>
        update((s) => ({ insights: patchWhere(s.insights, [id], patch) })),
      addTask: (task: DataState["tasks"][number]) => update((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id: string, patch: Partial<DataState["tasks"][number]>) => update((s) => ({ tasks: patchWhere(s.tasks, [id], patch) })),
      addReportHistory: (entry: DataState["reportHistory"][number]) =>
        update((s) => ({ reportHistory: [entry, ...s.reportHistory].slice(0, 20) })),
      setReportSchedule: (schedule: DataState["reportSchedules"][number]) =>
        update((s) => ({ reportSchedules: [...s.reportSchedules.filter((x) => x.reportType !== schedule.reportType), schedule] })),
      removeReportSchedule: (reportType: string) =>
        update((s) => ({ reportSchedules: s.reportSchedules.filter((x) => x.reportType !== reportType) })),
      resetDemoData: () => setState(createSeed()),
    }),
    [update]
  );

  const value = useMemo<DataStoreContextValue>(() => {
    const activeLivestock = state.livestock.filter((animal) => !animal.archived);
    return {
      ...state,
      ...actions,
      activeLivestock,
      getFarmById: (id) => state.farms.find((farm) => farm.id === id),
      getBarnById: (id) => state.barns.find((barn) => barn.id === id),
      getBarnsByFarm: (farmId) => state.barns.filter((barn) => barn.farmId === farmId),
      getLivestockById: (id) => state.livestock.find((animal) => animal.id === id),
      getLivestockByFarm: (farmId) => activeLivestock.filter((animal) => animal.farmId === farmId),
      getDeviceById: (id) => state.devices.find((device) => device.id === id),
      getAlertById: (id) => state.alerts.find((alert) => alert.id === id),
    };
  }, [state, actions]);

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}
