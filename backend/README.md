# API Sentinel — backend (Express + MongoDB)

## Setup

```bash
cd backend
npm install
cp .env.example .env      # set MONGODB_URI + JWT_SECRET
npm run seed              # optional demo data
npm run dev               # http://localhost:4000/api
```

MongoDB: local (`mongodb://127.0.0.1:27017/api-sentinel`) or a free Atlas cluster
(`mongodb+srv://user:pass@cluster.mongodb.net/api-sentinel`).

## Endpoints

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | – | `{ name, email, password, org }` → `{ token, user }` |
| POST | `/api/auth/login` | – | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | JWT | current user |
| GET | `/api/monitors` | JWT | list |
| POST | `/api/monitors` | JWT | `{ name, url, method?, region?, intervalSeconds?, expectedStatusCode? }` |
| GET/PUT/DELETE | `/api/monitors/:id` | JWT | detail / update / delete |
| POST | `/api/monitors/:id/pause` | JWT | toggles pause, `204` |
| GET | `/api/incidents` | JWT | `?status=open\|resolved` |
| GET | `/api/incidents/:id` | JWT | detail with timeline |
| POST | `/api/incidents/:id/resolve` | JWT | manual resolve |
| GET | `/api/overview` | JWT | dashboard summary |

JSON shapes mirror `src/lib/api/types.ts` in the frontend exactly.

## Scheduled checker

`src/checker.js` runs on `CHECK_CRON` (default every minute) and pings each
un-paused monitor whose `intervalSeconds` has elapsed. It records latency,
uptime counters, and status (`up` / `degraded` > 1200ms / `down`). After
`FAILURE_THRESHOLD` (default 3) consecutive failures it opens an Incident with a
timeline entry, appends entries while still failing, and auto-resolves the
incident on the first successful check.

## Connecting the frontend

In the frontend root `.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCK_API=false
```

The service layer (`src/lib/api/*.service.ts`) then bypasses mock fixtures and
calls the live API — no UI changes needed.
