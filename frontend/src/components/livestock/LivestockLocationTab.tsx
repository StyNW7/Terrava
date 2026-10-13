import { MapContainer, Marker, Popup, Circle } from "react-leaflet";
import ThemedTileLayer from "@/components/dashboard/ThemedTileLayer";
import type { Livestock } from "@/types/dashboard";
import { livestockMarkerIcons } from "@/utils/leafletIcons";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function LivestockLocationTab({ animal }: { animal: Livestock }) {
  const { t, tRel } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="isolate overflow-hidden rounded-2xl border border-terrava-border shadow-card lg:col-span-2">
        <MapContainer center={[animal.location.lat, animal.location.lng]} zoom={15} scrollWheelZoom={false} attributionControl={false} style={{ height: 360, width: "100%" }}>
          <ThemedTileLayer />
          <Circle center={[animal.location.lat, animal.location.lng]} radius={150} pathOptions={{ color: "var(--chart-primary)", fillOpacity: 0.08, weight: 1.5, dashArray: "4 4" }} />
          <Marker position={[animal.location.lat, animal.location.lng]} icon={livestockMarkerIcons[animal.healthStatus] ?? livestockMarkerIcons.healthy}>
            <Popup>
              <p className="text-sm font-bold text-terrava-text">{animal.name}</p>
              <p className="text-xs text-terrava-muted">
                {t("livestock.column.healthScore")}: <span className="font-semibold text-terrava-text">{animal.healthScore}</span>
              </p>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
            <MapPin className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> {t("location.currentPosition")}
          </h3>
          <DetailInfoRow label={t("location.latitude")} value={animal.location.lat.toFixed(4)} />
          <DetailInfoRow label={t("location.longitude")} value={animal.location.lng.toFixed(4)} />
          <DetailInfoRow label={t("map.geofence")} value={t("location.barnRadius")} />
          <DetailInfoRow label={t("livestock.column.lastUpdate")} value={tRel(animal.lastUpdate)} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-terrava-text">{t("location.movementHistory")}</h3>
          <p className="text-sm text-terrava-muted">{t("location.movementSummary")}</p>
        </div>
      </div>
    </div>
  );
}
