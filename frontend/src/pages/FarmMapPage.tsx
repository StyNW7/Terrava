import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Circle } from "react-leaflet";
import ThemedTileLayer from "@/components/dashboard/ThemedTileLayer";
import { Link } from "react-router-dom";
import { RotateCw, MapPinned, Radio, WifiOff, TriangleAlert } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { FilterSelect } from "@/components/dashboard/FilterBar";
import SearchInput from "@/components/dashboard/SearchInput";
import { livestockMarkerIcons, facilityIcon, gatewayIcon } from "@/utils/leafletIcons";
import { livestock } from "@/data/mockLivestock";
import { farms, barns, getBarnById } from "@/data/mockFarms";
import { alerts } from "@/data/mockAlerts";
import { devices } from "@/data/mockDevices";
import { useLanguage } from "@/hooks/useLanguage";

export default function FarmMapPage() {
  const { lang, t } = useLanguage();
  const [farmFilter, setFarmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showGeofence, setShowGeofence] = useState(true);
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    document.title = "Farm Map and Tracking | Terrava";
  }, []);

  const filteredLivestock = useMemo(() => {
    return livestock.filter((animal) => {
      const matchesFarm = farmFilter === "all" || animal.farmId === farmFilter;
      const matchesStatus = statusFilter === "all" || animal.healthStatus === statusFilter;
      const matchesSearch = search.trim().length === 0 || animal.name.toLowerCase().includes(search.toLowerCase()) || animal.code.toLowerCase().includes(search.toLowerCase());
      return matchesFarm && matchesStatus && matchesSearch;
    });
  }, [farmFilter, statusFilter, search]);

  const centerLat = filteredLivestock.length > 0 ? filteredLivestock.reduce((sum, a) => sum + a.location.lat, 0) / filteredLivestock.length : -6.9;
  const centerLng = filteredLivestock.length > 0 ? filteredLivestock.reduce((sum, a) => sum + a.location.lng, 0) / filteredLivestock.length : 107.6;

  const offlineDevices = devices.filter((device) => device.status === "offline");
  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  const relevantBarns = farmFilter === "all" ? barns : barns.filter((barn) => barn.farmId === farmFilter);

  return (
    <div>
      <PageHeader
        title={t("map.title")}
        subtitle={t("map.subtitle")}
        actions={
          <button
            type="button"
            onClick={() => setLastUpdate(new Date())}
            className="inline-flex items-center gap-2 rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            {t("common.refresh")}
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-terrava-border bg-white p-3">
        <FilterSelect label={t("filter.farm")} value={farmFilter} onChange={setFarmFilter} options={farms.map((f) => ({ value: f.id, label: f.name }))} />
        <FilterSelect
          label={t("livestock.column.status")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "healthy", label: t("status.healthy") },
            { value: "attention", label: t("status.attention") },
            { value: "critical", label: t("status.critical") },
            { value: "inactive", label: t("status.offline") },
          ]}
        />
        <button
          type="button"
          onClick={() => setShowGeofence((prev) => !prev)}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${showGeofence ? "bg-terrava-light text-terrava-primary" : "border border-terrava-border text-terrava-text"}`}
        >
          {t("map.geofence")} {showGeofence ? t("map.on") : t("map.off")}
        </button>
        <span className="ml-auto text-xs text-terrava-muted">
          {t("map.lastUpdate", { time: lastUpdate.toLocaleTimeString(lang === "id" ? "id-ID" : "en-GB") })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-terrava-border xl:col-span-3">
          <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom style={{ height: 520, width: "100%" }}>
            <ThemedTileLayer />

            {relevantBarns.map((barn, index) => {
              const lat = centerLat - 0.02 + index * 0.01;
              const lng = centerLng - 0.02 + (index % 2) * 0.015;
              return (
                <Marker key={barn.id} position={[lat, lng]} icon={facilityIcon}>
                  <Popup>
                    <p className="font-semibold">{barn.name}</p>
                    <p>{t("farms.occupancy")}: {barn.occupancy}/{barn.capacity}</p>
                  </Popup>
                </Marker>
              );
            })}

            {farms
              .filter((farm) => farmFilter === "all" || farm.id === farmFilter)
              .map((farm, index) => (
                <Marker key={`gateway-${farm.id}`} position={[centerLat + 0.015 * (index + 1), centerLng + 0.02]} icon={gatewayIcon}>
                  <Popup>
                    <p className="font-semibold">LoRa Gateway</p>
                    <p>{farm.name}</p>
                  </Popup>
                </Marker>
              ))}

            {filteredLivestock.map((animal) => (
              <div key={animal.id}>
                {showGeofence && <Circle center={[animal.location.lat, animal.location.lng]} radius={120} pathOptions={{ color: "var(--chart-primary)", fillOpacity: 0.05, weight: 1 }} />}
                <Marker position={[animal.location.lat, animal.location.lng]} icon={livestockMarkerIcons[animal.healthStatus] ?? livestockMarkerIcons.healthy}>
                  <Popup>
                    <p className="font-semibold">{animal.name}</p>
                    <p>{t("livestock.column.healthScore")}: {animal.healthScore}</p>
                    <p>{t("vitals.temperature")}: {animal.temperature}°C</p>
                    <p>{t("devices.battery")}: {animal.deviceId ? `${animal.batteryLevel}%` : "-"}</p>
                    <Link to={`/dashboard/livestock/${animal.id}`} className="text-terrava-primary underline">
                      {t("common.viewDetail")}
                    </Link>
                  </Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>

          <div className="flex flex-wrap items-center gap-4 border-t border-terrava-border bg-white px-4 py-3 text-xs text-terrava-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terrava-primary" /> {t("status.healthy")}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terrava-warning" /> {t("status.attention")}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terrava-error" /> {t("status.critical")}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terrava-neutral" /> {t("status.offline")}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terrava-dark" /> {t("map.barnFacility")}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terrava-info" /> {t("deviceType.gateway")}</span>
          </div>
        </div>

        <div className="space-y-5">
          <SearchInput value={search} onChange={setSearch} placeholder={t("map.searchPlaceholder")} />

          <div className="rounded-2xl border border-terrava-border bg-white p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-terrava-text">
              <TriangleAlert className="h-4 w-4 text-terrava-error" aria-hidden="true" /> {t("dashboard.activeAlerts")} ({activeAlerts.length})
            </h3>
            <p className="text-xs text-terrava-muted">{t("map.alertsHint")}</p>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-terrava-text">
              <WifiOff className="h-4 w-4 text-terrava-muted" aria-hidden="true" /> {t("map.offlineDevices")} ({offlineDevices.length})
            </h3>
            <ul className="space-y-1 text-xs text-terrava-muted">
              {offlineDevices.slice(0, 4).map((device) => (
                <li key={device.id}>{device.name}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-terrava-border bg-white p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-terrava-text">
              <MapPinned className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("map.livestockList")} ({filteredLivestock.length})
            </h3>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {filteredLivestock.map((animal) => (
                <li key={animal.id}>
                  <Link to={`/dashboard/livestock/${animal.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-terrava-bg">
                    <span className="text-terrava-text">{animal.name}</span>
                    <span className="flex items-center gap-1 text-terrava-muted">
                      <Radio className="h-3 w-3" aria-hidden="true" /> {getBarnById(animal.barnId)?.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
