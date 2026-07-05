# SPEC-001-Huggi-Hospital-Queue-MVP

**Version:** 1.1
**Status:** Approved — Implementation Ready
**Last updated:** 2026-04-19
**Author:** Vikram H (vikram.h@leadrat.com)

---

## Implementation Note

This document is the source of truth for Huggi Hospital Queue MVP architecture and sequencing
unless an ADR explicitly overrides a specific decision.

---

## Background

### User Pain

Patients visiting clinics in India routinely face:

- Long, unpredictable physical queues with no visibility into wait times
- Wasted trips when their doctor is unavailable or running significantly late
- No advance booking option at most small and mid-sized clinics
- No digital confirmation, reminders, or queue status updates
- Complete dependence on reception staff for any information

### Clinic Pain

Healthcare providers face a parallel set of problems:

- Overcrowded reception areas causing patient dissatisfaction and staff stress
- No-show patients with no advance warning and no accountability mechanism
- Manual paper-based logs with no audit trail
- No visibility into peak load, doctor utilisation, or average wait times
- Inability to manage walk-in patients and pre-booked appointments in the same system
- No way to send proactive updates to patients (slot delays, cancellations)

### Why This Is the Right First Module

Hospital Queue and Appointments is the strongest starting point for this Super App because:

- **Operational complexity is low** — no physical fleet, no real-time GPS, no logistics dependencies
- **Founder can ship the MVP alone** in 4–8 weeks using a standard web stack
- **One paying B2B customer validates the entire model** before any consumer growth investment
- **The problem is consistent across India** — Tier 2 and Tier 3 city clinics share it and have the fewest existing solutions
- **No dominant digital solution exists** for small to mid-sized independent clinics at under ₹3,000/month
- **The module teaches every core platform pattern**: auth, tenant isolation, notifications, RBAC, audit logging — all reusable for future modules

### Why B2B SaaS in India Is the Right Starting Point

The B2B model avoids the classic consumer marketplace chicken-and-egg problem:

- One clinic is manually onboarded by the founder — no self-service, no marketplace
- The clinic pays a monthly SaaS fee (target: ₹2,000–₹5,000/month at launch)
- The clinic's own patients become end-users through the clinic's direction — no cold-start
- The founder gains a paying customer, real operational feedback, and a reference case immediately
- The second sale becomes a referral, not cold outreach

### Fit Within the Super App Vision

This is **Module 1** of a larger Super App platform. The shared foundations built here — authentication, user profiles, tenant isolation, notification pipeline, admin panel architecture, role guards, audit logging — are reused by every subsequent module (Ride, Food, Logistics, etc.). Getting Module 1 right is architecture investment, not just product delivery.

---

## Requirements

### Must Have

**Patient-facing:**
- Patient registration and login via phone number + OTP (Firebase Auth)
- View clinic details and available services within the onboarded clinic
- Browse doctors or service types listed by the clinic
- Book an appointment: select doctor → date → available time slot → confirm
- View upcoming and past bookings
- Cancel an existing booking (within configurable window)
- Queue status display with periodic status refresh (polling, not WebSocket)
- SMS notification: booking confirmed, reminder before appointment, queue position called

**Staff-facing (admin panel — web):**
- Clinic staff login via email + password
- View and manage today's appointments (list with status filters)
- Staff actions: mark patient as checked-in, in consultation, completed, no-show
- Walk-in queue management: issue token number, update queue state
- Basic role system: Patient / Clinic Staff / Clinic Admin / Super Admin

**Platform:**
- Consent-aware design: patients acknowledge data use at registration
- Audit log for all staff-initiated status changes
- Role-based data access: staff see only their clinic's data
- All tenant data rows carry `clinic_id` — enforced at service layer

### Should Have

- Doctor availability schedule management by clinic admin
- Multi-doctor support within one clinic
- Patient appointment history view
- Basic clinic admin analytics: daily bookings, no-show rate, busiest hour
- Push notification via Firebase FCM (in addition to SMS)
- Appointment rescheduling (not just cancellation)

### Could Have

- Post-appointment feedback: simple 1–5 rating from patient
- Configurable notification timing (e.g., remind 1 hr before vs. 30 min before)
- Exportable daily report (PDF or CSV) for clinic admin
- Multi-branch support for a clinic chain
- Hindi language support (i18n hooks in code from day one, content in Phase 2)

### Won't Have for Now

- In-app payments (post-MVP — v1.1 using Razorpay: UPI, cards, INR invoicing)
- Self-service clinic onboarding
- Prescription or medical record management
- Telemedicine or video consultation
- Insurance billing or claims
- Multi-clinic browsing or discovery (this is not a marketplace)
- Native Flutter mobile app (Phase 2 — after first paying customer)
- AI-based wait time estimation (post-MVP)
- WebSocket-based real-time infrastructure (polling is sufficient for MVP load)

---

## MVP Boundaries

### In Scope

- One manually onboarded clinic (first B2B customer — provisioned by founder)
- Mobile-friendly patient web interface (Next.js — same Vercel deployment as admin panel)
- Clinic staff admin panel (Next.js — /admin/* routes, same deployment)
- NestJS + PostgreSQL backend (Railway)
- Full booking flow end-to-end
- Queue status with polling-based refresh (30-second intervals)
- SMS via MSG91 (DLT-registered templates) + push via Firebase FCM
- RBAC across all user types
- Audit logging for all clinic staff actions
- Privacy-first defaults: minimal personal and health-related data, consent at registration, retention policy defined

### Out of Scope

- Self-service clinic signup or onboarding
- In-app payments of any kind
- Multiple clinics visible to patients
- Clinic search or discovery by patients
- Native mobile app (Android APK or iOS TestFlight) — web-first at MVP
- WebSocket-based real-time updates
- Public app store release

### Single Clinic Assumption

MVP is deployed for **exactly one manually onboarded clinic**. The founder provisions the clinic account directly (database seed or super-admin panel). There is no self-service registration for clinics at this stage.

### Tenant-Aware Architecture

All data tables with patient or appointment data carry `clinic_id`. API queries are scoped to the authenticated tenant. Middleware enforces isolation. MVP operates with one active tenant; adding a second requires **zero schema changes**. This constraint is non-negotiable from day one.

### Queue Relationship

- Booked appointments move into the live queue at patient check-in
- Walk-ins create queue entries directly without a prior appointment

---

## Auth Design

### Patient OTP Flow

- OTP is handled by Firebase Auth on the client
- NestJS verifies the Firebase ID token
- NestJS then issues Huggi JWT (15 min) + refresh token (7 days, hashed in DB)

### Staff / Admin Flow

- Email + password submitted to NestJS directly
- NestJS issues JWT with `clinicId` in payload

### Guards

`JwtAuthGuard` — validates Huggi JWT on all protected routes
`RolesGuard` — enforces role-based access (Patient / Staff / Clinic Admin / Super Admin)
`TenantGuard` — validates `clinicId` claim matches the resource being accessed

---

## India-Specific Assumptions

| Area | Direction | Notes |
|---|---|---|
| Auth OTP | Firebase Auth | Free 10k SMS/month; no DLT registration required for Firebase auth OTPs |
| Transactional SMS | MSG91 | DLT-registered templates required (TRAI compliance); allow 1–2 weeks for approval |
| Language | English for MVP | i18n hooks included in code from day one; Hindi in Phase 2 |
| Hosting | Railway (API + PostgreSQL) + Vercel (web) | Railway ~₹420/mo at MVP load |
| Patient interface | Mobile-first Next.js web app | No app install required; patients access via browser link shared by clinic |
| Mobile distribution | Web link (WhatsApp / SMS shareable) | Native Android APK via Firebase App Distribution only if Flutter added in Phase 2 |
| iOS | Not in scope at MVP | TestFlight considered only if Flutter app is added in Phase 2 |
| Payments | Razorpay — post-MVP only | Handles UPI, cards, INR invoicing, GST; designed as a plugin, not wired at MVP |
| Privacy / Compliance | DPDP Act 2023 awareness | Store minimal personal and health-related data; role-based access; consent at registration; defined retention limits; full audit trail; privacy-first defaults |
| Maps / Location | Not required at MVP | No GPS or routing features in this module |

---

## Launch Model Notes

**Who pays:** The clinic — monthly SaaS subscription
**Who uses the product:** Clinic staff use the admin panel; patients use the mobile-friendly web interface

**Why this avoids marketplace problems:**
There is no need to attract two sides simultaneously. The clinic directs its own patients to use the app. Growth is the clinic's responsibility at MVP — the founder does not need to build a consumer acquisition funnel.

**First-customer motion:**
1. Identify one clinic in the founder's personal or professional network
2. Offer a 1–3 month free pilot in exchange for weekly feedback sessions
3. Convert to paid after demonstrating measurable value: reduced no-shows, better patient experience, less staff overhead
4. Use as a reference customer and case study for the second sale
5. Only after second customer: design self-service onboarding

**Pricing signal (MVP):** ₹2,000–₹5,000/month. Below ₹5,000 so the clinic admin can approve without a procurement process.

---

## Risks and Constraints

| Risk | Mitigation |
|---|---|
| Clinic staff resist adopting a new tool | Founder does hands-on onboarding; train 1–2 staff personally; keep the interface simple |
| Process variation across clinics | Keep queue state machine configurable; avoid hardcoded flow assumptions |
| SMS/OTP delivery failures | Use DLT-registered MSG91 templates; monitor delivery rates from day one |
| DLT registration delay (TRAI) | Register MSG91 templates early; factor 1–2 week approval into launch timeline |
| Single → multi-tenant migration pain | Enforce `clinic_id` on all tenant tables from day one — highest-leverage schema decision |
| DPDP Act compliance gap | Minimal data collection; consent at registration; defined data retention policy; no health data stored beyond operational necessity |
| Feature creep before first customer | Freeze scope at Must Have; post-MVP items (Razorpay, Flutter, AI) wait until first paying customer confirms value |
| Patient app adoption | Web link (no app install) removes the biggest adoption barrier for patients |

---

## Next Steps

1. ✅ CLAUDE.md written to disk
2. ✅ SPEC-001 written to disk
3. ✅ Phase 0 — monorepo, NestJS, Postgres, Prisma, Next.js, CI
4. ⬜ Phase 1 Step 10 — Clinic schema foundation
5. ⬜ Phase 1 Step 11+ — User schema, Auth foundation, Queue, Appointment modules

---

## Implementation Plan (Phase Overview)

### Phase 0 — Monorepo Foundation ✅
- Turborepo + pnpm monorepo scaffold
- `apps/api` NestJS base
- `apps/web` Next.js 14 base (App Router)
- `packages/types` workspace package
- Docker Compose: PostgreSQL (port 5433 — Windows PG 18 owns 5432)
- `.env.example` files
- GitHub Actions CI (install → prisma generate → lint → build)

### Phase 1 — Database + Auth
- Prisma core schema (Clinic, User, Role, UserRole, RefreshToken, AuditLog)
- `AuthModule` — Firebase OTP verification + JWT issuance
- JWT guard + `RolesGuard` + `TenantGuard`
- Super admin + clinic seed script
- Auth integration test

### Phase 2 — Clinic Core
- `ClinicsModule` API
- `UsersModule` — patient + staff profiles
- `DoctorsModule` (with schedules + slots folded in)
- Staff email+password login end-to-end

### Phase 3 — Booking + Queue
- `AppointmentsModule`
- `QueueModule` (with queue state machine in `modules/queue/domain/`)
- `AuditModule` (direct `AuditService.log()` calls)
- `NotificationsModule` (MSG91 + FCM)

### Phase 4 — Admin Panel
- Staff login page
- Dashboard
- Appointments list + action buttons
- Queue management screen
- Doctor + schedule management

### Phase 5 — Patient Web Pages
- Clinic info + doctor list
- OTP login flow
- Slot selection + booking confirm
- My bookings
- Queue status (30s poll)
- Mobile-first styling

### Phase 6 — First Customer Launch
- End-to-end testing
- Error handling hardening
- Notification delivery monitoring
- Manually onboard first clinic
- Weekly feedback → v1.1 backlog

---

*Last updated: 2026-04-19*
