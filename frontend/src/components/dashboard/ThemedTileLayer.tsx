import { useEffect, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@/hooks/useTheme";
import { getTileConfig, type BaseLayer } from "@/lib/mapTiles";

/**
 * Map tiles that follow the active light/dark theme and the chosen base layer.
 *
 * It also owns the map's attribution control (render the map with
 * `attributionControl={false}`): the provider credit is set explicitly rather
 * than through Leaflet's per-layer bookkeeping, which double-counts credits when
 * React remounts layers and leaves stale ones behind after a layer switch.
 */
export default function ThemedTileLayer({ layer = "map" }: { layer?: BaseLayer }) {
  const map = useMap();
  const { isDark } = useTheme();
  const config = getTileConfig(layer, isDark);
  const [control, setControl] = useState<L.Control.Attribution | null>(null);

  useEffect(() => {
    const attribution = L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map);
    setControl(attribution);
    return () => {
      attribution.remove();
    };
  }, [map]);

  useEffect(() => {
    if (!control) return;
    control.addAttribution(config.attribution);
    return () => {
      control.removeAttribution(config.attribution);
    };
  }, [control, config.attribution]);

  return (
    <TileLayer
      // Remount when the source changes so Leaflet swaps tiles cleanly.
      key={config.url + (config.className ?? "")}
      url={config.url}
      maxZoom={config.maxZoom}
      subdomains={config.subdomains ?? "abc"}
      className={config.className}
    />
  );
}
