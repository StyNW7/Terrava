import L from "leaflet";
import type { HealthStatus } from "@/types/dashboard";

/** Round livestock marker; critical animals get a pulsing halo so they stand out. */
function createLivestockIcon(status: HealthStatus, selected = false) {
  const size = selected ? 26 : 20;
  return L.divIcon({
    className: "terrava-marker",
    html: `<span class="terrava-pin terrava-pin--${status}${selected ? " is-selected" : ""}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

const BARN_GLYPH =
  '<path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /><path d="M3 21h18" />';
const GATEWAY_GLYPH =
  '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />';

/** Rounded-square badge used for infrastructure (barns, gateways). */
function createFacilityIcon(variant: "barn" | "gateway") {
  const glyph = variant === "barn" ? BARN_GLYPH : GATEWAY_GLYPH;
  return L.divIcon({
    className: "terrava-marker",
    html: `<span class="terrava-facility terrava-facility--${variant}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const statuses: HealthStatus[] = ["healthy", "attention", "critical", "inactive"];

export const livestockMarkerIcons = Object.fromEntries(statuses.map((s) => [s, createLivestockIcon(s)])) as Record<HealthStatus, L.DivIcon>;
export const selectedLivestockMarkerIcons = Object.fromEntries(statuses.map((s) => [s, createLivestockIcon(s, true)])) as Record<HealthStatus, L.DivIcon>;

export const facilityIcon = createFacilityIcon("barn");
export const gatewayIcon = createFacilityIcon("gateway");
