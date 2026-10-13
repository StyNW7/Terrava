import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { Link } from "react-router-dom";
import { ArrowRight, Hexagon, Layers, Map as MapIcon, Maximize2, RotateCw, Satellite, SearchX, TriangleAlert, WifiOff } from "lucide-react";
import ThemedTileLayer from "@/components/dashboard/ThemedTileLayer";
import PageHeader from "@/components/dashboard/PageHeader";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import SearchInput from "@/components/dashboard/SearchInput";
import StatusBadge from "@/components/dashboard/StatusBadge";
import HealthScoreBadge from "@/components/dashboard/HealthScoreBadge";
import { livestockMarkerIcons, selectedLivestockMarkerIcons, facilityIcon, gatewayIcon } from "@/utils/leafletIcons";
import type { BaseLayer } from "@/lib/mapTiles";
import { livestock } from "@/data/mockLivestock";
import { farms, barns, getBarnById } from "@/data/mockFarms";
import { alerts } from "@/data/mockAlerts";
import { devices } from "@/data/mockDevices";
import type { HealthStatus, Livestock } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER: [number, number] = [-6.9, 107.6];

const statusFilters: { value: "all" | HealthStatus; dot: string; labelKey: string }[] = [
  { value: "all", dot: "bg-terrava-text/70", labelKey: "common.all" },
  { value: "healthy", dot: "bg-terrava-success", labelKey: "status.healthy" },
  { value: "attention", dot: "bg-terrava-warning", labelKey: "status.attention" },
  { value: "critical", dot: "bg-terrava-error", labelKey: "status.critical" },
  { value: "inactive", dot: "bg-terrava-neutral", labelKey: "status.offline" },
];

function averageCenter(items: Livestock[]): [number, number] {
  if (items.length === 0) return DEFAULT_CENTER;
  const lat = items.reduce((sum, a) => sum + a.location.lat, 0) / items.length;
  const lng = items.reduce((sum, a) => sum + a.location.lng, 0) / items.length;
  return [lat, lng];
}

export default function FarmMapPage() {
  const { lang, t } = useLanguage();
  const [farmFilter, setFarmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | HealthStatus>("all");
  const [showGeofence, setShowGeofence] = useState(true);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("map");
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const markerRefs = useRef(new Map<string, LeafletMarker>());

  useEffect(() => {
    document.title = "Farm Map and Tracking | Terrava";
  }, []);

  const farmLivestock = useMemo(
    () => livestock.filter((animal) => farmFilter === "all" || animal.farmId === farmFilter),
    [farmFilter]
  );

  const filteredLivestock = useMemo(() => {
    const query = search.trim().toLowerCase();
    return farmLivestock.filter((animal) => {
      const matchesStatus = statusFilter === "all" || animal.healthStatus === statusFilter;
      const matchesSearch = query.length === 0 || animal.name.toLowerCase().includes(query) || animal.code.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [farmLivestock, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: farmLivestock.length };
    farmLivestock.forEach((animal) => {
      counts[animal.healthStatus] = (counts[animal.healthStatus] ?? 0) + 1;
    });
    return counts;
  }, [farmLivestock]);

  // Infrastructure is anchored to the farm selection only, so it doesn't jump around while filtering by status.
  // Each barn sits at the centre of its own animals; gateways ring the herd.
  const [anchorLat, anchorLng] = averageCenter(farmLivestock);
  const relevantBarns = (farmFilter === "all" ? barns : barns.filter((barn) => barn.farmId === farmFilter))
    .map((barn) => ({ barn, animals: livestock.filter((animal) => animal.barnId === barn.id) }))
    .filter(({ animals }) => animals.length > 0)
    .map(({ barn, animals }) => ({ barn, position: averageCenter(animals) }));
  const relevantFarms = farms
    .filter((farm) => farmFilter === "all" || farm.id === farmFilter)
    .map((farm, index, list) => {
      const angle = (index / list.length) * Math.PI * 2 + Math.PI / 4;
      return { farm, position: [anchorLat + Math.sin(angle) * 0.16, anchorLng + Math.cos(angle) * 0.16] as [number, number] };
    });

  const offlineDevices = devices.filter((device) => device.status === "offline");
  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  const fitToLivestock = (items: Livestock[]) => {
    if (!map || items.length === 0) return;
    const bounds = L.latLngBounds(items.map((animal) => [animal.location.lat, animal.location.lng] as [number, number]));
    map.flyToBounds(bounds, { padding: [56, 56], maxZoom: 15, duration: 0.8 });
  };

  // Re-frame the map whenever the visible set changes.
  useEffect(() => {
    fitToLivestock(filteredLivestock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, filteredLivestock]);

  const focusAnimal = (animal: Livestock) => {
    setSelectedId(animal.id);
    if (!map) return;
    map.flyTo([animal.location.lat, animal.location.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
    map.once("moveend", () => markerRefs.current.get(animal.id)?.openPopup());
  };

  const overlayButton =
    "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terrava-primary/40";

  return (
    <div>
      <PageHeader
        title={t("map.title")}
        subtitle={t("map.subtitle")}
        actions={
          <>
            <span className="hidden items-center gap-2 text-xs text-terrava-muted sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terrava-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-terrava-success" />
              </span>
              {t("map.lastUpdate", { time: lastUpdate.toLocaleTimeString(lang === "id" ? "id-ID" : "en-GB") })}
            </span>
            <button
              type="button"
              onClick={() => setLastUpdate(new Date())}
              className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text transition-colors hover:border-terrava-primary/40 hover:bg-terrava-light/60"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              {t("common.refresh")}
            </button>
          </>
        }
      />

      {/* Filters: status chips double as a live summary of the herd. */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-terrava-border bg-white p-3 shadow-card lg:flex-row lg:items-center">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 no-scrollbar" role="radiogroup" aria-label={t("livestock.column.status")}>
          {statusFilters.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                  active
                    ? "border-terrava-primary/30 bg-terrava-light text-terrava-primary shadow-sm"
                    : "border-transparent text-terrava-muted hover:bg-terrava-bg hover:text-terrava-text"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", filter.dot)} aria-hidden="true" />
                {t(filter.labelKey)}
                <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] tabular-nums", active ? "bg-white/80 dark:bg-terrava-surface" : "bg-terrava-bg")}>
                  {statusCounts[filter.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="lg:ml-auto [&_select]:w-full lg:[&_select]:w-auto">
          <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Map */}
        <div className="relative isolate h-[440px] overflow-hidden rounded-2xl border border-terrava-border bg-terrava-bg shadow-card sm:h-[560px] xl:h-[calc(100vh-280px)] xl:min-h-[560px]">
          <MapContainer
            ref={setMap}
            center={averageCenter(filteredLivestock)}
            zoom={11}
            scrollWheelZoom
            zoomControl={false}
            attributionControl={false}
            className="h-full w-full"
          >
            <ThemedTileLayer layer={baseLayer} />
            <ZoomControl position="bottomright" />

            {relevantBarns.map(({ barn, position }) => (
              <Marker key={barn.id} position={position} icon={facilityIcon}>
                <Popup>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{t("map.barnFacility")}</p>
                  <p className="mt-0.5 text-sm font-bold text-terrava-text">{barn.name}</p>
                  <p className="mt-1 text-xs text-terrava-muted">
                    {t("farms.occupancy")}: <span className="font-semibold text-terrava-text">{barn.occupancy}/{barn.capacity}</span>
                  </p>
                </Popup>
              </Marker>
            ))}

            {relevantFarms.map(({ farm, position }) => (
              <Marker key={`gateway-${farm.id}`} position={position} icon={gatewayIcon}>
                <Popup>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">LoRa Gateway</p>
                  <p className="mt-0.5 text-sm font-bold text-terrava-text">{farm.name}</p>
                </Popup>
              </Marker>
            ))}

            {showGeofence &&
              filteredLivestock.map((animal) => (
                <Circle
                  key={`fence-${animal.id}`}
                  center={[animal.location.lat, animal.location.lng]}
                  radius={120}
                  pathOptions={{ color: "var(--chart-primary)", fillOpacity: 0.06, weight: 1, dashArray: "4 4" }}
                />
              ))}

            {filteredLivestock.map((animal) => {
              const icons = selectedId === animal.id ? selectedLivestockMarkerIcons : livestockMarkerIcons;
              return (
                <Marker
                  key={animal.id}
                  position={[animal.location.lat, animal.location.lng]}
                  icon={icons[animal.healthStatus] ?? icons.healthy}
                  zIndexOffset={animal.healthStatus === "critical" ? 500 : selectedId === animal.id ? 1000 : 0}
                  eventHandlers={{ click: () => setSelectedId(animal.id) }}
                  ref={(marker) => {
                    if (marker) markerRefs.current.set(animal.id, marker);
                    else markerRefs.current.delete(animal.id);
                  }}
                >
                  <Popup minWidth={220}>
                    <div className="flex items-start justify-between gap-3 pr-4">
                      <div>
                        <p className="text-sm font-bold text-terrava-text">{animal.name}</p>
                        <p className="text-[11px] text-terrava-muted">
                          {animal.code} · {getBarnById(animal.barnId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <StatusBadge status={animal.healthStatus} />
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: t("map.score"), value: String(animal.healthScore) },
                        { label: t("vitals.temperature"), value: `${animal.temperature}°C` },
                        { label: t("devices.battery"), value: animal.deviceId ? `${animal.batteryLevel}%` : "–" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg bg-terrava-bg px-1.5 py-2">
                          <dt className="text-[10px] text-terrava-muted">{item.label}</dt>
                          <dd className="text-sm font-bold text-terrava-text">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <Link
                      to={`/dashboard/livestock/${animal.id}`}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-terrava-primary px-3 py-2 text-xs font-semibold !text-white transition-colors hover:bg-terrava-hover"
                    >
                      {t("common.viewDetail")} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map toolbar */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex flex-wrap items-start justify-between gap-2">
            <div className="pointer-events-auto flex rounded-2xl border border-terrava-border bg-white/90 p-1 shadow-lift backdrop-blur-md" role="radiogroup" aria-label={t("map.baseLayer")}>
              {(
                [
                  { value: "map", icon: MapIcon, label: t("map.layer.map") },
                  { value: "satellite", icon: Satellite, label: t("map.layer.satellite") },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={baseLayer === option.value}
                  onClick={() => setBaseLayer(option.value)}
                  className={cn(
                    overlayButton,
                    baseLayer === option.value ? "bg-terrava-primary text-white shadow-sm" : "text-terrava-muted hover:text-terrava-text"
                  )}
                >
                  <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>

            <div className="pointer-events-auto flex gap-1 rounded-2xl border border-terrava-border bg-white/90 p-1 shadow-lift backdrop-blur-md">
              <button
                type="button"
                aria-pressed={showGeofence}
                onClick={() => setShowGeofence((prev) => !prev)}
                className={cn(overlayButton, showGeofence ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted hover:text-terrava-text")}
              >
                <Hexagon className="h-3.5 w-3.5" aria-hidden="true" />
                {t("map.geofence")}
              </button>
              <button
                type="button"
                onClick={() => fitToLivestock(filteredLivestock)}
                className={cn(overlayButton, "text-terrava-muted hover:text-terrava-text")}
                title={t("map.fitAll")}
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{t("map.fitAll")}</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[500] max-w-[calc(100%-7rem)] rounded-2xl border border-terrava-border bg-white/90 px-3.5 py-2.5 shadow-lift backdrop-blur-md">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-terrava-muted">
              <Layers className="h-3 w-3" aria-hidden="true" /> {t("map.legend")}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-terrava-text sm:grid-cols-3">
              {statusFilters.slice(1).map((filter) => (
                <li key={filter.value} className="flex items-center gap-1.5">
                  <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-terrava-surface", filter.dot)} /> {t(filter.labelKey)}
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-terrava-dark dark:bg-[#2f6b4a]" /> {t("map.barn")}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-terrava-info" /> {t("deviceType.gateway")}
              </li>
            </ul>
          </div>

          {filteredLivestock.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-[450] grid place-items-center">
              <div className="rounded-2xl border border-terrava-border bg-white/95 px-5 py-4 text-center shadow-lift">
                <SearchX className="mx-auto h-5 w-5 text-terrava-muted" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-terrava-text">{t("map.noResults")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="flex flex-col gap-4 xl:h-[calc(100vh-280px)] xl:min-h-[560px]">
          <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-2xl border border-terrava-border bg-white shadow-card">
            <div className="border-b border-terrava-border-muted p-3">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-terrava-text">{t("map.livestockList")}</h2>
                <span className="text-xs text-terrava-muted">{t("map.showing", { count: filteredLivestock.length, total: livestock.length })}</span>
              </div>
              <SearchInput value={search} onChange={setSearch} placeholder={t("map.searchPlaceholder")} />
            </div>
            <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {filteredLivestock.map((animal) => {
                const selected = selectedId === animal.id;
                return (
                  <li key={animal.id}>
                    <button
                      type="button"
                      onClick={() => focusAnimal(animal)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                        selected ? "bg-terrava-light" : "hover:bg-terrava-bg"
                      )}
                    >
                      <span
                        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", statusFilters.find((f) => f.value === animal.healthStatus)?.dot)}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-terrava-text">{animal.name}</span>
                        <span className="block truncate text-[11px] text-terrava-muted">
                          {animal.code} · {getBarnById(animal.barnId)?.name}
                        </span>
                      </span>
                      <HealthScoreBadge score={animal.healthScore} />
                    </button>
                  </li>
                );
              })}
              {filteredLivestock.length === 0 && <li className="px-3 py-8 text-center text-sm text-terrava-muted">{t("map.noResults")}</li>}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Link
              to="/dashboard/alerts"
              className="group flex items-center gap-3 rounded-2xl border border-terrava-border bg-white p-3.5 shadow-card transition-colors hover:border-terrava-error/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-terrava-error/10 text-terrava-error">
                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-terrava-text">
                  {activeAlerts.length} {t("dashboard.activeAlerts")}
                </span>
                <span className="block truncate text-xs text-terrava-muted">{t("map.openAlerts")}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-terrava-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>

            <Link
              to="/dashboard/devices"
              className="group flex items-center gap-3 rounded-2xl border border-terrava-border bg-white p-3.5 shadow-card transition-colors hover:border-terrava-primary/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-terrava-neutral/15 text-terrava-muted">
                <WifiOff className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-terrava-text">
                  {offlineDevices.length} {t("map.offlineDevices")}
                </span>
                <span className="block truncate text-xs text-terrava-muted">
                  {offlineDevices.length > 0 ? offlineDevices.slice(0, 2).map((d) => d.name).join(", ") : t("map.allOnline")}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-terrava-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
