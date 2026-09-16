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

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
