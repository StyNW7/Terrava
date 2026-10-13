/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** CARTO basemaps key (https://carto.com/basemaps/apikey). Removes the "API key required" watermark. */
  readonly VITE_CARTO_API_KEY?: string;
  /** Optional ArcGIS Location Platform key for the satellite layer. */
  readonly VITE_ARCGIS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
