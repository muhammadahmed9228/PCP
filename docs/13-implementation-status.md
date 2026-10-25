# Implementation Status

> Source: Gemini-provided status summary shared by the project owner. This is a reported inventory, not independently verified against the repository. “Completed” means reported implemented in that summary.

## Reported completed modules

### Authentication and role routing
- Separate login/logout controllers and token generators for UCI, AIC, and FieldTeam.
- JWT payload carries `_id` and role (`UCI`, `AIC`, `FieldTeam`).
- Frontend supports role-specific login/logout.
- Mobile team login at `/team/login`.
- FieldTeam dashboard routes to Tally, Fixed, or Transit based on team type.

### Operational context
- `GET /api/v1/context/bootstrap` resolves context for UCI, AIC, and FieldTeam.
- Frontend context state is dispatched by dashboard layouts.
- The summary reports removal of hardcoded `dummyAreaId` from listed pages.

### Campaign foundation and microplans
- Campaign/Area CRUD, AIC assignment, campaign activation validation.
- AIC registers Mobile, Fixed, and Transit teams.
- Geography supports Routes for Mobile teams and Points for Fixed/Transit teams.
- UCMP, AMP, and OMP draft/finalized workflows and target calculations; OMP links Mobile team, campaign day 1–3, and route.

### Tally sheet
- Backend model/service and frontend page/components reported implemented.
- Sections include snapshot, households, schools/other, missed children, medical cases, and logistics.
- Summary calculations include vaccination and missed/covered counts.
- Finalization validates linked unvaccinated-child and guest records against household entries.
- Service requires an Active campaign and finalized OMP for the relevant Mobile team/day.

### Fixed sheet
- Backend and frontend reported implemented.
- Uses Fixed teams and Points, with snapshot, vaccinated children, AFP/zero-dose fields, unvaccinated children, medical cases, logistics, and summary.
- Unique index reported: `{ campaign: 1, team: 1, campaignDay: 1 }`.

### Transit sheet
- Backend and frontend reported implemented with a numeric counter and progress grid.
- Uses Transit teams and Points.
- Known gap: `afpCasesNoticed` and `zeroDoseRIRecorded` missing from Transit model/UI.

### Form 2A
- Backend and frontend reported implemented.
- Aggregates finalized OMP, TallySheet, FixedSheet, and TransitSheet documents by area and day.
- Includes snapshot, team counts, Mobile/Fixed/Transit performance, aggregated totals, and collective inventory.
- Known gaps include deep-summation, inventory parity, attendance/submission visibility, and snapshot/marker/Vitamin A presentation.

### Form 2B
- Backend and frontend reported implemented.
- Aggregates finalized Form 2A documents by campaign, UCI, and day.
- Builds AIC-wise rows and UC-wide totals, including inventory summaries.
- Supports finalize and authorized reopen with reason/time audit fields.

## Reported remaining work
- Reopening cascade for Tally, Fixed, Transit (AIC only while Form 2A is Draft) and Form 2A (UCI only while Form 2B is Draft).
- Transit/Form 2A parity: add AFP and zero-dose fields, finish deep summation, add Vitamin A Red/Blue and Finger Marker columns.
- Add collapsible read-only snapshot headers to field sheets.
- Enforce child-count and logistics conservation bounds.
- Complete/archive campaigns and make archived campaigns read-only.
- Offline-first support: IndexedDB autosave, offline queue, background sync, reconnect flush, PWA/offline UI.
- Form 2A team submission attendance and Form 2B AIC finalization attendance.
- Finalization gates for incomplete team sheets or unfinalized Area Form 2A.
- Missed-child registry for Section 10 Not Available/Refusal entries not covered same day.
- Silent JWT refresh, strict ownership/IDOR protection, supervisor password resets, Helmet, login rate limits, mongo-sanitize, numeric `min: 0`.
- MongoDB transactions for activation/assignment/reopen and optimistic concurrency with `__v` / `updatedAt`.
- Excel export for Tally, Fixed, Transit, Form 2A, Form 2B, UCMP, AMP, OMP.
- A4 landscape print styles for UCMP/AMP/OMP/Form 2A/Form 2B.
- Live Command Center metrics and submission tracker.
- Numeric input UX (`inputMode="numeric"`, `min=0`, disable wheel changes) and row-level errors/auto-scroll.
- One-command `seed.js` for UCI, campaign, two Areas/AICs, six teams, routes/points, microplans, and sample sheets.

## Status caveat
This is based on the supplied summary and has not been verified against the current repository. Inspect code and tests before editing. Do not assume every reported-complete feature works correctly, and do not rebuild modules without checking them first.
