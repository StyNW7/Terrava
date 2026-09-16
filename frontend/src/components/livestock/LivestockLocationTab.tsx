import { MapContainer, Marker, Popup, Circle } from "react-leaflet";
import ThemedTileLayer from "@/components/dashboard/ThemedTileLayer";
import type { Livestock } from "@/types/dashboard";
import { livestockMarkerIcons } from "@/utils/leafletIcons";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import { MapPin } from "lucide-react";

export default function LivestockLocationTab({ animal }: { animal: Livestock }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-terrava-border lg:col-span-2">
        <MapContainer center={[animal.location.lat, animal.location.lng]} zoom={15} scrollWheelZoom={false} style={{ height: 360, width: "100%" }}>
          <ThemedTileLayer />
          <Circle center={[animal.location.lat, animal.location.lng]} radius={150} pathOptions={{ color: "var(--chart-primary)", fillOpacity: 0.08 }} />
          <Marker position={[animal.location.lat, animal.location.lng]} icon={livestockMarkerIcons[animal.healthStatus] ?? livestockMarkerIcons.healthy}>
            <Popup>
              <p className="font-semibold">{animal.name}</p>
              <p>Health score: {animal.healthScore}</p>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terrava-text">
            <MapPin className="h-4 w-4 text-terrava-primary" aria-hidden="true" /> Current Position
          </h3>
          <DetailInfoRow label="Latitude" value={animal.location.lat.toFixed(4)} />
          <DetailInfoRow label="Longitude" value={animal.location.lng.toFixed(4)} />
          <DetailInfoRow label="Geofence" value="Barn radius 150m" />
          <DetailInfoRow label="Last Update" value={animal.lastUpdate} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-terrava-text">Movement History</h3>
          <p className="text-sm text-terrava-muted">Data pergerakan 24 jam terakhir dalam radius kandang normal, tanpa pelanggaran geofence.</p>
        </div>
      </div>
    </div>
  );
}
