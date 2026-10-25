# 09 Testing And Development Phases

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

40. Testing Requirements

Testing is mandatory and should be implemented incrementally.

Unit Tests

Test:

-   Business rules.
-   Validation.
-   Calculations.
-   Aggregations.
-   Authorization logic.
-   State-transition rules.
-   Idempotency logic.

Integration Tests

Test:

-   Authentication.
-   RBAC.
-   Campaign workflow.
-   Sheet submission.
-   Auto-population.
-   Form 2A aggregation.
-   Form 2B aggregation.
-   Finalization/locking.
-   Database interactions.

End-to-End Tests

Cover complete flows such as:

UCI creates campaign → assigns AIC → UCMP → AIC AMP → teams →
routes/points → OMP → UCI activates → AIC generates sheets → field team
submits → Form 2A → Form 2B → completion.

Offline Tests

Explicitly test:

-   Writing while offline.
-   Draft persistence.
-   Queue creation.
-   App/browser restart.
-   Connection restoration.
-   Automatic synchronization.
-   Failed synchronization.
-   Retry.
-   Duplicate requests.
-   Conflicting updates.
-   Partial synchronization.

Security Tests

Test:

-   Unauthorized role access.
-   Cross-UCI data access.
-   Cross-AIC data access.
-   Cross-team data access.
-   Direct API manipulation.
-   Invalid IDs.
-   Expired/invalid authentication.
-   Privilege escalation attempts.

Performance Tests

Test realistic large-scale scenarios, including:

-   Large numbers of users.
-   Large numbers of campaigns.
-   Large numbers of sheets.
-   Concurrent submissions.
-   Synchronization bursts after connectivity returns.
-   Large dashboard queries.

------------------------------------------------------------------------

---

41. Development Strategy

Development must happen in small, testable phases.

Recommended sequence:

Phase 1 — Requirements/Data Definitions

Ask required/ relevant/ Collect and confirm these when needed (don't ask everything at once):

-   All registration attributes.
-   Campaign attributes.
-   UCI attributes.
-   AIC attributes.
-   Field Team attributes.
-   Area attributes.
-   Route attributes.
-   Fixed Point attributes.
-   Transit Point attributes.
-   All sheet fields.
-   Auto-population mappings.
-   Calculated fields.

Do not implement unknown domain fields from assumptions.


Phase 2 — Architecture and Foundation

Build:

-   MERN project structure.
-   Environment configuration.
-   Database connection.
-   Base error handling.
-   Authentication foundation.
-   RBAC foundation.
-   Logging.
-   Validation.
-   API conventions.
-   Frontend routing/layout foundation.

Phase 3 — UCI and Campaign Management

Build:

-   UCI registration/login.
-   UCI dashboard.
-   Campaign creation.
-   AIC selection/registration.
-   Area creation/assignment.
-   UCMP.

Phase 4 — AIC Planning

Build:

-   AIC dashboard.
-   Campaign selection.
-   AMP.
-   Field Team registration/selection.
-   Route/Point creation.
-   Day-wise assignments.
-   OMP for Mobile Teams.

Phase 5 — Activation

Build:

-   Planning completeness checks.
-   UCI verification.
-   Campaign state machine.
-   Planning → Active transition.
-   Notifications.

Phase 6 — Field Operations

Build:

-   Day selection.
-   Sheet generation.
-   Mobile Tally Sheet.
-   Fixed Sheet.
-   Transit Sheet.
-   Field Team dashboards.
-   Drafts.
-   Offline-first/PWA workflow.

Phase 7 — Aggregation

Build:

-   Field Sheet → Form 2A auto-population.
-   Form 2A review/submission.
-   Form 2A → Form 2B auto-population.
-   Form 2B grand totals.

Phase 8 — Completion

Build:

-   Form 2B review/finalization.
-   Campaign completion.
-   Full campaign locking.
-   Historical read-only access.

Phase 9 — Hardening

Perform:

-   Security testing.
-   Offline testing.
-   Performance testing.
-   Large-data testing.
-   Concurrency testing.
-   Error/recovery testing.
-   UX refinement.
-   Accessibility review.
-   Production-readiness review.

You can SIMPLY DIVIDE THESE PHASES INTO Smaller PARTS.
Do not build the entire backend first.
Build one complete feature at a time, with backend + frontend + authorization + database + testing together (i will test myself). Once feature built and test passed, I will ask you to proceed.

------------------------------------------------------------------------

---

44. Requirement Traceability

Each implemented feature should be traceable to a requirement.

For major features, maintain:

-   Requirement.
-   Backend implementation.
-   Frontend implementation.
-   Database impact.
-   Tests.
-   Current status.

This prevents requirements from being lost as the project grows.

------------------------------------------------------------------------
