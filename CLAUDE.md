# Huggi — Persistent Architect Brief

Brand: Huggi
Platform: Huggi Super App
First module: Huggi Hospital Queue
Repo: super-app (local) / huggi-super-app (GitHub)

## PROJECT CONTEXT — READ THIS FIRST

You are helping me build Huggi Super App, a B2B SaaS product for Indian clinics.
This is a long-term project. Every response must align with the decisions below.
Do not suggest alternatives to confirmed decisions unless I ask.

---

## SOURCE OF TRUTH

The following files are the authoritative source for this project.
If chat output or AI suggestions conflict with these files, the files win.

- `CLAUDE.md` — operating rules, confirmed stack, architecture decisions
- `docs/specs/SPEC-001-Huggi-Hospital-Queue-MVP.md` — product spec, requirements, MVP boundaries
- `docs/adr/*` — architecture decision records for confirmed choices

---

## WHAT WE ARE BUILDING

Module 1: Hospital Queue + Appointment Management
Target: Small clinics (1–3 doctors), Tier 2/3 Indian cities
Model: B2B SaaS — sell to one clinic first, manually onboard
Problem solved: Clinics still use paper tokens and WhatsApp groups
Our advantage: Purpose-built for India, cheap (under ₹3,000/mo), zero hardware

---

## CONFIRMED TECH STACK — DO NOT CHANGE

Monorepo: Turborepo + pnpm workspaces at C:\source\super-app

Backend:
- NestJS + TypeScript (modular monolith)
- Prisma ORM + PostgreSQL
- All tenant data has clinic_id column
- Hosted on Railway (~₹420/mo)

Web (admin + patient):
- Next.js 14 App Router + TypeScript
- Tailwind CSS + ShadCN UI components
- /admin/* routes = clinic staff (JWT required)
- /p/* routes = patient-facing (public or OTP-gated)
- Same Next.js app, same Vercel deployment
- Hosted on Vercel (free tier)

Patient Interface (MVP):
- Mobile-friendly Next.js page (NOT Flutter yet)
- Same Vercel deployment as admin
- Flutter app is Phase 2 only — after first paying customer

Auth:
- Firebase Auth OTP for patients (phone number)
- Email + password for clinic staff
- JWT issued by NestJS after Firebase verification

Notifications:
- Firebase FCM for push notifications
- MSG91 for SMS (DLT-registered templates, India)

Cache:
- Redis is optional at MVP
- Add Redis (Upstash) when rate limiting or session caching becomes necessary
- Do not include Redis in the MVP Docker Compose or Railway setup by default

Payments:
- Razorpay (NOT Stripe — handles UPI, INR, GST invoicing)
- Post-MVP only — not wired at MVP

---

## FREE TOOLS IN USE — RESPECT THESE CHOICES

| Tool        | Purpose                  | Free Limit              |
|-------------|--------------------------|-------------------------|
| Vercel      | Next.js hosting          | Free forever hobby      |
| Railway     | API + PostgreSQL         | ~$5/mo paid from day 1  |
| Firebase    | Auth OTP + FCM push      | 10k OTP/mo free         |
| Cloudflare  | DNS + SSL + DDoS         | Free forever            |
| PostHog     | Product analytics        | 1M events/mo free       |
| Sentry      | Error tracking           | 5k errors/mo free       |
| Resend      | Clinic onboarding email  | 3k emails/mo free       |
| GitHub      | Repo + CI Actions        | 500 min/mo free         |
| Razorpay    | Payments (post-MVP)      | 2% per txn only         |
| MSG91       | SMS alerts               | Pay per SMS ~₹0.18      |

---

## MY BACKGROUND

- Strong: NestJS, Prisma, PostgreSQL, REST APIs, TypeScript
- Basic: Next.js, React, Tailwind (learning)
- Minimal: Flutter, DevOps, cloud infra
- Solo developer — no team

Because of this:
- Keep frontend code simple and use ShadCN copy-paste components
- Prefer server components in Next.js where possible
- Avoid complex DevOps — Railway and Vercel handle infra
- When writing frontend code, explain what each part does
- Do not introduce new libraries without strong justification

---

## REPO STRUCTURE

```
C:\source\super-app\
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js 14 — admin panel + patient web (port 3000)
├── packages/
│   └── types/        # Shared TypeScript types
├── docs/
│   ├── specs/        # SPEC documents
│   └── adr/          # Architecture Decision Records
├── infra/
│   └── docker/       # docker-compose.yml (PostgreSQL only at MVP)
├── scripts/          # Seed, migration, local setup scripts
├── CLAUDE.md         # This file
├── turbo.json
└── pnpm-workspace.yaml
```

Note: No apps/mobile at MVP. Flutter added as apps/mobile in Phase 2.

---

## ARCHITECTURE RULES

1. Every DB table with tenant data MUST have clinic_id
2. NestJS modules = one module per feature (appointments, queue, auth, clinics)
3. Shared TypeScript types go in packages/types workspace package
4. No direct DB calls from Next.js — always go through NestJS API
5. Patient web pages are public routes (/p/*), staff pages require JWT (/admin/*)
6. State machine for queue: booked → checked_in → called → in_consultation → done
   Also handle: cancelled, no_show
7. All service methods take clinicId as a required parameter — non-negotiable
8. Double-booking prevention: SELECT ... FOR UPDATE on slot row in a PostgreSQL transaction
9. Prisma schema changes must always include a migration file and updated seed logic if required

---

## CURRENT PHASE

Phase 0 — Monorepo + Backend Foundation

Environment verified:
- Node.js installed
- pnpm installed
- Docker installed and working

Completed:
- [x] CLAUDE.md content finalized
- [x] SPEC-001 content finalized
- [x] Initialize Turborepo monorepo (Step 3)
- [x] Scaffold apps/api — NestJS base (Step 4)

In progress:
- [ ] Docker Compose: PostgreSQL (Step 5)
- [ ] Prisma setup + DB connection (Step 6)
- [ ] .env.example files (Step 7)
- [ ] Scaffold apps/web — Next.js (Step 8)
- [ ] GitHub repo + CI lint check (Step 9)

Phase 1: Database schema + Auth foundation
Phase 2: Flutter mobile app (post-first-customer validation)

---

## HOW TO RESPOND TO ME

- Give me one step at a time — I will confirm before moving to next
- When writing code, always show file path at top as a comment
- Prefer complete files over partial snippets
- If something has a risk or gotcha, tell me before I hit it
- When I ask about costs, always answer in Indian Rupees (₹)
- Keep explanations short — I am a developer, not a beginner
- Ask at most 2 questions per response

---

## KEY AUTH DECISIONS

Patients:
- Patients complete OTP using Firebase Auth client flow
- NestJS verifies the Firebase ID token
- NestJS then issues Huggi JWT (15 min) + refresh token (7 days, hashed in DB)

Staff / Admin:
- Email + password → JWT with clinicId in payload

Guards: JwtAuthGuard, RolesGuard, TenantGuard

---

## NOTIFICATIONS (MVP)

Direct send — no message queue. Cron job every 5 min for reminders.
Add BullMQ in v1.1 for retry logic.

---

## INDIA-SPECIFIC NOTES

- SMS provider: MSG91 (DLT template registration required — TRAI compliance, 1–2 week approval)
- Auth OTP: Firebase Auth (no DLT registration needed, free 10k SMS/month)
- Payments: Razorpay — post-MVP only
- Privacy: DPDP Act 2023 — minimal personal/health data, consent at registration, retention policy, auditability

---

## STARTUP MENTOR NOTES

- Always optimize for: narrow MVP → real user value → launchability → operational simplicity
- First paying customer motion: personal network → free pilot → convert to paid → second sale
- Freeze scope at Must Have until first paying customer confirms value
- B2B SaaS: clinic pays, patients use — avoids marketplace cold-start
- Pricing target: ₹2,000–₹5,000/month (below ₹5k = clinic admin can approve without procurement)

---

## FUTURE MOBILE STRATEGY — Phase 2 and beyond

### Why Flutter Was Chosen

Flutter is the approved mobile technology for Huggi's Phase 2+ expansion. Reasons:

**Single codebase for iOS and Android:** Flutter compiles to native iOS and Android from one Dart codebase. No separate teams needed — critical for a solo founder scaling post-MVP.

**Native performance and feel:** Flutter apps feel native on both platforms without compromise. This matters for clinic staff (Android prevalence in India) and patients (mix of iOS/Android).

**Firebase integration seamless:** Huggi already uses Firebase Auth. Flutter integrates natively with Firebase (auth, FCM push, analytics). No friction.

**Mature and production-tested:** Flutter is battle-tested in production apps. Implementation libraries will be selected during Phase 2.

### Why Mobile Is Deferred Until After First Clinic Validation

The MVP uses mobile-first Next.js web instead because:

- **Web reaches staff and patients immediately** — no app store review delays. Clinic staff can access admin on day one. Patients book via WhatsApp/SMS link.
- **Reduces deployment complexity** — one Next.js on Vercel, one NestJS API on Railway. No app store accounts, signing certificates, or release management.
- **Validates the business first** — before spending weeks on Flutter, prove that clinics will pay. If the first clinic rejects the product, you saved months of engineering.
- **Faster feedback loop** — web changes deploy in minutes. App updates require store review.

**Rule:** Do not build native apps for a problem you haven't validated with a paying customer.

### Expected Phase 2 Scope

Once the first clinic is paying and requests "an app on the Play Store":

**`apps/mobile/` — Flutter patient app**
- Patient registration and OTP login (same Firebase + Huggi JWT flow)
- Clinic info + doctor list
- Appointment booking and management
- Queue status with push notifications (FCM native support)
- Appointment history
- Mobile-first UI (Flutter Material Design 3)
- Offline support (queue cached locally, syncs when online)

**Not in Phase 2 MVP:**
- Staff/clinic admin features (staff use web for complex workflows)
- Telemedicine or video calls
- In-app payments (external link to Razorpay on web)
- AI features

**Distribution:**
- Android: Google Play Store
- iOS: Apple App Store (if clinic demand exists)

### Repository Location

```
huggi-super-app/
├── apps/
│   ├── api/      # NestJS backend (Phase 0 ✅)
│   ├── web/      # Next.js admin + patient web (Phase 0 ✅)
│   └── mobile/   # Flutter patient app (Phase 2 — reserved, not created yet)
├── packages/
│   ├── types/    # Shared TypeScript types (Phase 1)
│   └── contracts/  # Language-neutral API contracts (Phase 2)
```

The `apps/mobile/` directory will be created in Phase 2, outside the pnpm workspace (Flutter has its own `pubspec.yaml`).

### Sharing Across Frontends

**MVP (Next.js only):**
- `packages/types` contains `JwtPayload`, `Appointment`, `Queue`, `Clinic` TypeScript interfaces
- Next.js imports these for API request/response validation

**Future (Phase 2+ with Flutter):**
- Dart does not consume TypeScript types directly
- **Conceptual sharing:** Both apps call the same NestJS API and deserialize JSON into equivalent structures
- **Language-neutral contracts:** `packages/contracts/` will define API request/response shapes in a language-neutral format (JSON schema or OpenAPI spec), enabling both Next.js and Flutter to validate against the same contract
- **No code generation needed at MVP** — manual parity is fine until scale justifies tooling

---

*Last updated: 2026-04-19*
