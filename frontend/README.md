# Terrava Frontend

AI-Powered Smart Livestock Ecosystem — public site, authentication, and farmer dashboard (React + Vite + TypeScript + Tailwind + Framer Motion).

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

## Theme

Light and dark mode are supported. Toggle with the sun/moon button in the navbar, dashboard header, or auth pages, or pick Light / Dark / System under **Settings → Appearance**. The choice is stored in `localStorage` (`terrava-theme`) and applied before first paint to avoid flashes.

## PWA (installable app)

Terrava is a Progressive Web App (via `vite-plugin-pwa` + Workbox):

- `manifest.webmanifest` with maskable icons, shortcuts (Dashboard, Alerts, Monitoring), and screenshots
- Service worker precaches the app shell; images, fonts, and map tiles are cached at runtime, so the app keeps working offline
- An install banner appears a few seconds after the first visit (dismissable for 7 days); **Pasang aplikasi** is also available in the dashboard user menu and the footer
- A prompt appears when a new version is deployed; the offline state is shown as a top banner

The service worker is only generated in production builds (`npm run build` then `npm run preview`). Install is offered by Chrome/Edge on desktop and Android; on iOS use Safari → Share → Add to Home Screen.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
