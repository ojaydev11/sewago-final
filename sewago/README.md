# SewaGo E2E

## Run E2E locally (Windows)

Run from repo root (`sewago/`):

```powershell
pwsh -File .\scripts\win\start-e2e.ps1
```

This will:
- Ensure env files for backend and frontend
- Install dependencies if missing
- Start backend on 4100 and frontend on 3001 (fallback to 4101/3002 if busy)
- Seed sample data
- Run backend smoke tests and Playwright headless tests
- Store artifacts at `artifacts/e2e/`

## E2E Assumptions
- Local MongoDB at `mongodb://127.0.0.1:27017`; if absent, consider installing MongoDB. Future work: boot `mongodb-memory-server` automatically.
- Payments endpoints are stubs returning `{ ok: true, provider, payload }`.
- Socket.io namespace `/ws` with path `/ws/socket.io`.
- Env header protection for seed endpoints via `X-Seed-Key`.

## Scripts
See `package.json` at root for `e2e:prepare`, `e2e:start`, and `e2e`.


