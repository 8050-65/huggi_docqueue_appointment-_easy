# scripts/

Local development and operational helper scripts.

## Current

_(none yet — populate as Phase 1 progresses)_

## Planned

- `db-reset.sh` — drop + recreate local Postgres volume (for clean Phase 1 schema iteration)
- `onboard-clinic.ts` — Phase 1 helper to provision a new clinic with a Clinic Admin user
- Future operational runbooks may live here as `.sh` or `.ts` scripts

## Conventions

- Each script is self-documenting at the top (purpose, prereqs, usage)
- Scripts that touch the database must use the existing Prisma client at `apps/api/`
- Scripts that need env vars source from `apps/api/.env`
