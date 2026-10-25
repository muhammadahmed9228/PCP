# 07 Security Authorization And Data Integrity

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

22. Data Ownership and Authorization

Implement strict RBAC and hierarchical data access.

At minimum:

UCI - Can access own campaigns and authorized historical campaigns. -
Can manage authorized AICs and UC-level data.

AIC - Can access only campaigns/areas assigned to that AIC. - Can manage
only authorized Field Teams under that AIC.

Field Team - Can access only its assigned campaign, team records,
assigned day, route/point, and generated sheet(s).

Never trust IDs supplied by the frontend as proof of authorization.

Every sensitive backend operation must verify:

-   Authenticated user.
-   Role.
-   Campaign ownership/association.
-   Parent-child relationship.
-   Assigned area/team.
-   Sheet ownership.
-   Current campaign state.
-   Current sheet state.

------------------------------------------------------------------------

---

23. Authentication and Security Requirements

Add the following as mandatory engineering requirements:

-   Secure password handling using a strong password-hashing mechanism.
-   Secure authentication/session/token strategy.
-   Role-based authorization on the backend.
-   Input validation on every write endpoint.
-   Request payload size limits.
-   Rate limiting where appropriate.
-   Protection against common API/web attacks.
-   Secure HTTP headers.
-   CORS configured intentionally.
-   Secrets stored in environment/secret management, never hard-coded.
-   No credentials or tokens committed to Git.
-   Sensitive data excluded from logs.
-   Authentication failures should not leak unnecessary information.
-   Proper logout/token invalidation strategy.
-   Production HTTPS requirement.
-   Dependency/security auditing.

Do not add authentication behavior that conflicts with the government’s
final deployment requirements; security implementation details can be
finalized during architecture setup.

------------------------------------------------------------------------

---

25. Data Integrity Rules

The backend is the source of truth.

Implement server-side validation for:

-   Required fields.
-   Valid relationships.
-   Campaign state.
-   Sheet state.
-   Role permissions.
-   Duplicate assignments.
-   Duplicate submissions.
-   Invalid day/team combinations.
-   Invalid route/point assignments.
-   Finalization rules.
-   Aggregation rules.

Never rely only on React validation.

Important calculated/auto-populated fields should not be accepted as
trusted client-provided values when they can be derived securely on the
server.

------------------------------------------------------------------------

---

26. Idempotency and Duplicate Prevention

This is especially important because of offline synchronization.

A request may reach the server more than once because of:

-   Network retries.
-   Browser retries.
-   App restarts.
-   User pressing Submit multiple times.
-   Offline queue replay.

The server must safely recognize and handle duplicate operations.

Use an idempotency/submission identifier or an equivalent reliable
mechanism.

Duplicate submissions must not:

-   Create duplicate sheets.
-   Double-count Form 2A.
-   Double-count Form 2B.
-   Corrupt totals.
-   Create duplicate assignments.

------------------------------------------------------------------------

---

27. Auditability

Because this is a government campaign monitoring system, important
changes should be auditable.

Track appropriate events such as:

-   Login/security events.
-   Campaign creation.
-   Campaign status changes.
-   AIC assignment/removal.
-   Area assignment.
-   Team assignment.
-   Route/point assignment.
-   Sheet creation.
-   Sheet submission.
-   Sheet finalization.
-   Form 2A submission.
-   Form 2B finalization.
-   Campaign completion.
-   Administrative/security actions.

Audit records should contain appropriate identifiers, timestamps, actor
information, action, and relevant before/after metadata without storing
sensitive information unnecessarily.

Audit logs should be append-oriented and protected from ordinary user
modification.

------------------------------------------------------------------------
