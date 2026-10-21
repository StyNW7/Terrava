# Terrava Frontend

AI-Powered Smart Livestock Ecosystem — public site, authentication, and farmer dashboard (React + Vite + TypeScript + Tailwind + Framer Motion).

For the project overview, features, and screenshots, see the [main README](../README.md) ([Bahasa Indonesia](../README-ind.md)).

## Run locally

```bash
npm install
npm run dev
```

## Demo accounts

The prototype ships with dummy credentials. Any of these accounts signs in straight to the farmer dashboard (or use **Masuk langsung** on the login page):

| Persona       | Email                | Password     |
| ------------- | -------------------- | ------------ |
| Farm Owner    | `demo@terrava.id`    | `Terrava123` |
| Farm Manager  | `manager@terrava.id` | `Terrava123` |
| Dokter Hewan  | `vet@terrava.id`     | `Terrava123` |

Sessions persist in `localStorage` (Ingat saya) or `sessionStorage`. Dashboard routes are protected and redirect to `/login`.

## Map API key (Farm Map)

The dashboard maps (**Peta Peternakan** and the livestock location tab) use [CARTO basemaps](https://carto.com/basemaps/apikey), which require an API key. Without one, CARTO stamps an "API KEY REQUIRED" watermark on every tile, so the app falls back to plain OpenStreetMap tiles until a key is configured.

1. Create a free key at <https://carto.com/basemaps/apikey>.
2. In the CARTO dashboard, restrict the key to your domains (for example `localhost` and your Vercel domain). Map keys are always visible in browser network requests, so the domain restriction is what keeps the key from being reused elsewhere.
3. Copy `.env.example` to `.env.local` and fill in the key:

   ```bash
   cp .env.example .env.local
   # VITE_CARTO_API_KEY=your-key
   ```

4. Restart `npm run dev`. On Vercel, add `VITE_CARTO_API_KEY` under **Project → Settings → Environment Variables** and redeploy.

`.env.local` is git-ignored, so the key never lands in the repository. The **Satelit** layer uses Esri World Imagery; `VITE_ARCGIS_API_KEY` is optional and only needed if you move to an ArcGIS Location Platform plan. Provider credits stay visible as a small attribution chip in the corner, because the OpenStreetMap, CARTO, and Esri licences require it.

## Demo data, actions, and exports

The dashboard runs on a dummy dataset (`src/data/mock*.ts`) loaded into a shared store (`src/context/DataStoreContext.tsx`) and saved in `localStorage` (`terrava-demo-data`). Every action changes that data and shows up everywhere: resolving or assigning alerts, adding, editing, moving, or archiving livestock, pairing ear tags, adding farms and barns, inviting or removing team members, and creating tasks from alerts or AI insights.

- **Reports & Analytics**: six reports (health, alerts, devices, farm operations, environment/THI, staff) are built from the current data and the page filters. Each can be previewed, downloaded as a real PDF (jsPDF, loaded on demand) or CSV, and scheduled; downloads are kept in the report history.
- **CSV export** on the Alerts, Livestock, Farms, and Devices pages exports the rows currently shown. The dashboard's **Export Summary** downloads a one-page PDF.
- **Settings** are saved in `localStorage` (`terrava-settings`) and take effect across the app: thresholds drive the Live Monitoring warnings, units change temperature and weight, the default farm drives the dashboard filter, plus compact mode and the default sidebar state. A password changed in Settings is stored per browser as a SHA-256 hash and used on the next sign-in.
- **Settings → Data & Privacy → Reset Demo Data** restores the original dataset.

## Theme

Light and dark mode are supported. Toggle with the sun/moon button in the navbar, dashboard header, or auth pages, or pick Light / Dark / System under **Settings → Appearance**. The choice is stored in `localStorage` (`terrava-theme`) and applied before first paint to avoid flashes.

## PWA (installable app)

Terrava is a Progressive Web App (via `vite-plugin-pwa` + Workbox):

- `manifest.webmanifest` with maskable icons, shortcuts (Dashboard, Alerts, Monitoring), and screenshots
- Service worker precaches the app shell; images, fonts, and map tiles are cached at runtime, so the app keeps working offline
- An install banner appears a few seconds after the first visit (dismissable for 7 days); **Pasang aplikasi** is also available in the dashboard user menu and the footer
- A prompt appears when a new version is deployed; the offline state is shown as a top banner

The service worker is only generated in production builds (`npm run build` then `npm run preview`). Install is offered by Chrome/Edge on desktop and Android; on iOS use Safari → Share → Add to Home Screen.

## Smart Ear Tag 3D (`/smart-ear-tag`)

The Smart Ear Tag page shows both enclosures from `iot/ear-tag-specifications/` (TV-ET1 Shield and TV-ET0 Classic):

- **3D Studio**: the real CAD assembly in three.js. Visitors can orbit it, explode it (or play the assembly animation), hide the front shell or electronics, use X-ray, show the envelope dimensions, switch colourways, click any component for its description, and save a PNG.
- **Field simulation**: a procedural 3D cow (Bali, Ongole/Brahman or Holstein) with the tag pinned in the middle third of the left ear, in a pasture with a virtual geofence and a LoRaWAN gateway. Scenarios (healthy, fever, heat stress, lameness, leaving the area) change the cow's behaviour and physiology. Each uplink is encoded to the real 22-byte vitals payload (`iot/protocol/PAYLOAD.md`), and alerts use the dashboard's default thresholds. Visitors can also send downlinks (locate, diagnostics, set-interval) and watch the battery and solar budget over a day/night cycle at 1×, 60× or 600× speed.
- **Renders & drawings**: WebP copies of the spec renders and A3 drawing sheets in `public/Images/ear-tag/`.

The 3D code lives in `src/components/eartag3d/` and loads lazily, only when a visitor scrolls near it, so other pages never download three.js. The web models in `public/models/ear-tag/` are meshopt-compressed copies of the CAD GLBs (≈ 0.3 MB each). Regenerate them with `scripts/optimize-ear-tag-models.mjs` (instructions are in the file header) whenever the CAD changes.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
