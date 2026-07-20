import L from "leaflet";

function createIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
    <circle cx="13" cy="13" r="5.5" fill="white"/>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

export const livestockMarkerIcons = {
  healthy: createIcon("#277A4D"),
  attention: createIcon("#D89B32"),
  critical: createIcon("#C95B5B"),
  inactive: createIcon("#88948C"),
  offline: createIcon("#88948C"),
};

export const facilityIcon = createIcon("#163D2A");
export const gatewayIcon = createIcon("#4A7FA7");
