# 08 Architecture And Engineering

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

24. Database Design Requirements

Use MongoDB with a schema design that supports:

-   Campaign hierarchy.
-   UCI/AIC/Field Team relationships.
-   Areas.
-   Routes.
-   Fixed Points.
-   Transit Points.
-   Sheets/forms.
-   Sheet versions/status.
-   Daily assignments.
-   Auto-population relationships.
-   Submission records.
-   Audit records.
-   Notifications.
-   Offline synchronization/idempotency records where required.

Use indexes based on actual query patterns.

Likely high-value indexes should be evaluated around:

-   User/role identifiers.
-   Campaign identifiers.
-   UCI/AIC relationships.
-   Field Team relationships.
-   Campaign + day.
-   Campaign + status.
-   Team + campaign + day.
-   Sheet ownership/status.
-   Assignment lookups.

Do not blindly index every field. Indexes must be justified by real
queries and monitored for write/storage cost.

Use appropriate MongoDB transactions where multiple related records must
change atomically.

------------------------------------------------------------------------

---

29. API Design

Backend APIs should be:

-   RESTful and feature-oriented.
-   Consistent in request/response structure.
-   Validated.
-   Authorized.
-   Idempotent where required.
-   Pagination-aware for large datasets.
-   Efficient in payload size.
-   Versionable where appropriate.
-   Documented.

Avoid returning huge datasets when the UI only needs a small subset.

Use server-side pagination/filtering/sorting for large lists.

Avoid N+1 query patterns.

------------------------------------------------------------------------

---

30. Frontend Architecture

Use a feature-based architecture.

Suggested structure:

-   Features
    -   Auth
    -   Campaigns
    -   UCI
    -   AIC
    -   Field Teams
    -   Areas
    -   Routes
    -   Points
    -   Sheets
    -   Form 2A
    -   Form 2B
    -   Offline/Sync
-   Shared components
-   Shared hooks
-   Shared utilities
-   Shared services
-   Layouts
-   Routing
-   Store

Do not create:

-   One giant React component.
-   One giant Redux slice for the entire application.
-   Duplicated form logic.
-   Duplicated API logic.
-   Deeply coupled feature modules.

Large forms should be broken into logical reusable sections/components
while preserving a single coherent sheet workflow.

------------------------------------------------------------------------

---

31. Backend Architecture

Use feature-based backend organization.

Each feature may contain appropriate:

-   Models
-   Routes
-   Controllers
-   Services
-   Validators
-   Middleware
-   Utilities where required

Keep business logic primarily in services/domain logic rather than
bloating controllers.

Use centralized:

-   Error handling.
-   Validation handling.
-   Authentication middleware.
-   Authorization middleware.
-   Logging.
-   Configuration.

Do not put all backend logic into a single controller or route file.

------------------------------------------------------------------------

---

32. Reusable Dashboard Architecture

Use a reusable dashboard/layout system for:

-   UCI
-   AIC
-   Field Teams

The shared dashboard structure should support:

-   Navigation.
-   Header.
-   Notifications.
-   User/session information.
-   Responsive layout.
-   Role-specific menu items.
-   Role-specific dashboard content.

Role-specific behavior should be configuration/feature driven where
practical instead of duplicating entire dashboard implementations.

------------------------------------------------------------------------

---

33. Large Sheet/Form Architecture

Since the sheets contain many attributes:

-   Divide forms into logical sections.
-   Support progressive sections/steps where appropriate.
-   Preserve entered data between sections.
-   Autosave drafts where appropriate.
-   Validate fields at section level and final submission.
-   Clearly distinguish required vs optional fields once the field
    definitions are supplied.
-   Avoid rendering unnecessary heavy components.
-   Prevent accidental loss of unsaved data.
-   Make forms usable on mobile devices.
-   Support keyboard-friendly workflows where useful.

Do not invent field groupings until the actual sheet attributes are
provided.

------------------------------------------------------------------------

---

34. State Management

Use Redux Toolkit for global application state where appropriate.

Use:

-   RTK Async Thunk for asynchronous operations where required.
-   Redux Persist for suitable persistent client state.
-   IndexedDB for larger/offline datasets and queues where appropriate.

Do not put every local form field into global Redux state unnecessarily.

Keep ephemeral UI state local when possible.

Separate:

-   Server state.
-   Authentication state.
-   Persistent draft state.
-   Offline queue state.
-   UI state.

------------------------------------------------------------------------

---

35. API / Performance Strategy

The system must balance API usage and performance.

Requirements:

-   Avoid unnecessary requests.
-   Avoid repeated fetching of unchanged data.
-   Use pagination.
-   Use selective fields/projections where appropriate.
-   Batch operations where safe.
-   Debounce suitable search/filter requests.
-   Cache stable/reference data where appropriate.
-   Avoid large response payloads.
-   Use database indexes based on actual access patterns.
-   Monitor slow queries.
-   Monitor API latency and error rates.

Future enhancement:

-   Dashboard analytics caching.
-   Additional caching strategies.
-   Rate limiting to comfortably support very large concurrent usage.

------------------------------------------------------------------------

---

36. Image / Profile Pic/ Map image Storage

Use ImageKit for selected Profile pic/ map images (map image will be uploaded for UC, Area, Route along with sheet's attributes while the profile pic will be uploaded while registration)
Do not store large image binaries directly inside MongoDB unless a later
architecture decision explicitly requires it.

Store appropriate image metadata/reference information in the database.


------------------------------------------------------------------------

---

37. Responsive UI / UX

The UI must be:

-   Simple.
-   Clear.
-   Responsive.
-   Mobile-friendly.
-   Usable on tablets and desktops.
-   Appropriate for field workers who may have limited connectivity.
-   Consistent across roles.

Use Tailwind CSS.

Use React Toastify for appropriate user feedback, but do not rely on
toast messages as the only indication of important state.

For important operations, show persistent status where appropriate.

------------------------------------------------------------------------

---

38. Error Handling

Implement consistent error handling.

The system should:

-   Show user-friendly messages.
-   Avoid exposing stack traces or internal errors to users.
-   Log useful technical details server-side.
-   Distinguish validation, authorization, conflict, network, and server
    errors.
-   Provide retry options where appropriate.
-   Preserve offline data during transient failures.
-   Never silently discard user-entered data.

------------------------------------------------------------------------

---

39. Observability and Monitoring

The production system should support appropriate:

-   Structured application logs.
-   Error tracking.
-   API latency monitoring.
-   Database performance monitoring.
-   Background/synchronization monitoring.
-   Failed offline-sync monitoring.
-   Authentication/security monitoring.
-   Health checks.

Do not log sensitive personal/authentication information unnecessarily.

The exact monitoring stack can be selected during deployment
architecture.

------------------------------------------------------------------------
