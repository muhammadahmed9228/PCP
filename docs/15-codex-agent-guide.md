# Codex Agent Guide

## Read first
1. `README.md`
2. `01-project-overview-and-stack.md`
3. `13-implementation-status.md`
4. `14-remaining-work-plan.md`
5. Relevant feature docs, especially field operations, forms/aggregation, and security/data integrity.

## Mandatory workflow
1. Inspect the repository: framework, modules, routes, models, services, frontend pages, tests, and package scripts.
2. Compare actual code with `13-implementation-status.md`; record discrepancies instead of blindly trusting the summary.
3. Implement one small backlog item at a time. Identify likely files and acceptance criteria before broad refactors.
4. For security and integrity work, implement server-side authorization/validation; UI restrictions alone are insufficient.
5. Add/update tests, run relevant tests and lint/build scripts, and report exact commands/results.
6. Do not claim completion unless behavior has been exercised or tested.
7. Do not rewrite reported-complete modules without inspecting them first.
8. Preserve API compatibility and naming conventions unless a deliberate migration is required.
9. For schema changes, consider existing records, defaults, indexes, validation, and migration/backfill.
10. For offline sync, handle duplicate retries, conflicts, auth expiry, partial failures, and visible pending/error states.

## Safety and correctness
- Do not invent domain fields or business rules not supported by project docs or owner instructions.
- Preserve ownership boundaries: FieldTeam → own team; AIC → assigned Area; UCI → assigned UC.
- Do not bypass campaign status checks or finalization rules to make tests pass.
- Use transactions for related multi-collection updates when supported by MongoDB deployment.
- Use optimistic concurrency to avoid overwriting newer server edits.
- Never commit secrets, real CNICs, passwords, or production data in fixtures/logs.
- Ask before making irreversible assumptions, such as whether archiving requires exactly Days 1–3 or a configurable number of days.

## Definition of done
- Backend and frontend behavior meet requirements.
- Authorization and validation are enforced server-side.
- Relevant tests pass.
- Build/lint checks pass where available.
- Migration/configuration requirements are documented.
- Final report lists changed files, behavior, tests run, and remaining risks.
