import { TileLayer } from "react-leaflet";
import { useTheme } from "@/hooks/useTheme";

const LIGHT_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DARK_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Map tiles that follow the active light/dark theme. */
export default function ThemedTileLayer() {
  const { isDark } = useTheme();
  return <TileLayer key={isDark ? "dark" : "light"} attribution={ATTRIBUTION} url={isDark ? DARK_URL : LIGHT_URL} />;
}
