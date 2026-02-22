# HelpIN Production Readiness Notes

This project now includes baseline production hardening for both client and server.

## 1) Environment setup

### Server (`server/.env`)

Copy from `server/.env.example` and set:

- `DATABASE_URL`
- `JWT_SECRET` (at least 32 characters)
- `API_KEY` (at least 32 characters)
- `CLIENT_URL` or `CORS_ORIGINS`
- Optional rate limits: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`

### Client (`client/.env.local`)

Copy from `client/.env.example` and set:

- `VITE_API_URL` (required in production)
- `VITE_API_KEY`

## 2) Security and reliability included

### Server

- `helmet` security headers
- CORS allowlist from env (`CLIENT_URL`/`CORS_ORIGINS`)
- Global request rate limiting (`express-rate-limit`)
- Response compression (`compression`)
- Request logging (`morgan`)
- 1MB JSON payload limit
- Shared Prisma singleton (avoids per-route client creation)
- Graceful shutdown with Prisma disconnect
- Production-safe error responses (no internal details)

### Client

- Global React error boundary fallback screen
- API timeout handling (12s)
- Explicit production guard for missing `VITE_API_URL`
- Stable React Query default (`refetchOnWindowFocus: false`)

## 3) Deploy checklist

1. Install dependencies:
   - `cd server && npm install`
   - `cd client && npm install`
2. Apply Prisma migrations and generate client:
   - `cd server && npm run prisma:generate`
   - `cd server && npm run prisma:migrate`
3. Build client:
   - `cd client && npm run build`
4. Start server in production mode with `NODE_ENV=production`.
5. Confirm `/api/health` returns `200`.

## 4) Recommended next production steps

- Add structured logs shipping (Datadog/ELK/OpenTelemetry)
- Add automated tests for critical auth and session flows
- Add CI pipeline for lint/build/test/migration checks
- Add secret management (Vercel/Render/Fly/Cloud provider secrets)
