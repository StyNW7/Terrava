/**
 * Basemap configuration for every Leaflet map in the dashboard.
 *
 * Keys are read from Vite env vars (`.env.local`, never committed) so they stay
 * out of the repository. Browser-side tile keys are always visible in network
 * requests, so restrict each key to your domains in the provider dashboard.
 */

export type BaseLayer = "map" | "satellite";

export interface TileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
  /** Extra class on the tile pane, used to dim the keyless fallback in dark mode. */
  className?: string;
}

const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY?.trim() || "";
const ARCGIS_KEY = import.meta.env.VITE_ARCGIS_API_KEY?.trim() || "";

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';
const CARTO_ATTRIBUTION = `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>`;
const ESRI_ATTRIBUTION = 'Imagery &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>, Maxar, Earthstar Geographics';

export const hasCartoKey = CARTO_KEY.length > 0;

if (import.meta.env.DEV && !hasCartoKey) {
  console.info(
    "[Terrava map] VITE_CARTO_API_KEY is not set, falling back to OpenStreetMap tiles. " +
      "Add it to frontend/.env.local to use the CARTO basemap."
  );
}

export function getTileConfig(layer: BaseLayer, isDark: boolean): TileConfig {
  if (layer === "satellite") {
    const token = ARCGIS_KEY ? `?token=${encodeURIComponent(ARCGIS_KEY)}` : "";
    return {
      url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}${token}`,
      attribution: ESRI_ATTRIBUTION,
      maxZoom: 19,
    };
  }

  if (hasCartoKey) {
    const style = isDark ? "dark_all" : "rastertiles/voyager";
    return {
      url: `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      attribution: CARTO_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 20,
    };
  }

  // Keyless fallback: standard OSM tiles never carry a watermark. In dark mode
  // they are inverted with a CSS filter so the map still matches the theme.
  return {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
    className: isDark ? "terrava-tiles-dark" : undefined,
  };
}
