# Remaining Work Plan

This backlog is derived from the owner-provided remaining-work summary. It does not claim the tasks have been implemented.

## P0 — Data safety and field resilience

### Offline-first field sheets
- Autosave each keystroke to IndexedDB with a stable key based on `teamId_campaignDay`; include sheet type if necessary to avoid Tally/Fixed/Transit collisions.
- Restore drafts after refresh, tab closure, or battery loss.
- Add “Download Shift Package” to cache operational context, routes/points, and Day 1..n draft data.
- Queue save/finalize mutations while offline.
- Show Pending Sync state and flush queued mutations after reconnect.
- Add `manifest.json`, service worker, and offline fallback UI.
- Make queued finalization idempotent; detect stale server data rather than silently overwriting it.

### Authorization and ownership
- Enforce write ownership on the server: FieldTeam only its own `teamId`; AIC only assigned Area; UCI only assigned UC.
- Add silent JWT refresh for long-running forms.
- Add supervisor password reset for teams and AICs.
- Add Helmet, login rate limiting, mongo-sanitize, and `min: 0` numeric validation.

### Finalization gates and invariants
- Form 2A cannot finalize if required team sheets are Draft or not started.
- Form 2B cannot finalize if any Area's Form 2A is not finalized.
- Enforce `vacc0to1 + vacc1to5 <= childrenUnder5`.
- Enforce `guestVacc <= guestUnder5`.
- Enforce school `vaccinated <= childrenUnder5`.
- Enforce `Received = Used + Returned` for vaccines, Vitamin A, and markers.

## P1 — Reopening and aggregation correctness

### Reopening cascade
- Add `/reopen` for Tally, Fixed, and Transit, authorized for AIC only while corresponding Form 2A is Draft.
- Add `/reopen` for Form 2A, authorized for UCI only while corresponding Form 2B is Draft.
- Record `reopenedBy`, reason, and timestamp (use established repository naming, e.g. `reopenedAt`).
- Recompute dependent aggregates after reopening/editing.
- Use MongoDB transactions for multi-document state changes where supported.

### Transit/Form 2A parity
- Add `afpCasesNoticed` and `zeroDoseRIRecorded` to Transit model, validation, API, and UI.
- Complete nested summation for vaccines, markers, Vitamin A, AFP, and zero-dose in `aggregatedFixedTotals` and `aggregatedTransitTotals`.
- Add Vitamin A Red/Blue and Finger Marker columns to Form 2A.
- Test totals with mixed Mobile, Fixed, and Transit sample data.

### Snapshot headers
- Add a read-only collapsible snapshot card to Tally, Fixed, and Transit showing Campaign, SIA, UCI, AIC, Area, Route/Point, and Team.
- Source snapshot values from server/context; do not let FieldTeam edit metadata.

### Missed-child registry and attendance
- Target Section 10 children where reason is `Not Available` or `Refusal` and `coveredSameDay !== true` for Day 2, Day 3, and Mop-Up.
- Form 2A shows teams submitted/missing by team type.
- Form 2B shows AICs finalized/missing.
- Define how “not started” is represented before implementing completeness gates.

## P2 — Lifecycle and reporting

### Complete and archive
- Add UCI action to complete/archive only after required daily Form 2B records are finalized.
- Confirm whether the required days are exactly Days 1–3 or configurable before encoding the rule.
- Completed campaigns are read-only.
- Scope normal operational queries to the active campaign while preserving authorized historical access.

### Export, print, and dashboard
- Excel export for Tally, Fixed, Transit, Form 2A, Form 2B, UCMP, AMP, and OMP.
- A4 landscape print CSS for UCMP, AMP, OMP, Form 2A, and Form 2B.
- Live Command Center: target vs vaccinated %, missed vs covered %, vaccine utilization, and submission tracker (e.g. finalized teams / total teams).
- Define refresh behavior and stale/offline data presentation.

## P3 — Mobile UX and developer tooling

### Numeric input UX
- Add `inputMode="numeric"`, `min=0`, and prevent wheel changes where appropriate.
- Add row-level error highlighting and auto-scroll to first invalid row for `useFieldArray`.

### One-command seed
- Add `seed.js` creating one UCI, one campaign, two Areas/AICs, six teams, routes/points, UCMP/AMP/OMP, and sample sheets.
- Make reruns safe or fail clearly on conflicting seeded records.
- Document environment variables and command usage.

## Cross-cutting acceptance criteria
- Add/update tests for every behavior.
- Enforce authorization and validation at API level.
- Preserve audit trails for finalize/reopen/archive.
- Prevent duplicate offline queue submissions.
- Use optimistic concurrency (`__v` / `updatedAt`) to avoid overwriting newer edits.
- Use MongoDB transactions where deployment supports them; document replica-set requirements if relevant.
- Verify repository before implementation; the status summary is a guide, not a substitute for code inspection.
