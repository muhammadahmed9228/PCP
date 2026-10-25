# 05 Field Operations And Offline Sync

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

12. Active Campaign Workflow

Once the UCI changes the campaign to Active:

AIC

For each operating day, the AIC:

1.  Selects the day.
2.  Generates the dedicated Field Team sheets for that day.
3.  Mobile Teams receive their assigned Tally Sheets and assigned
    routes.
4.  Fixed Teams receive their Fixed Sheets and assigned Fixed Points.
5.  Transit Teams receive their Transit Sheets and assigned Transit
    Points.

The same workflow is repeated for remaining operating days.

The system must prevent generation of a sheet when:

-   The campaign is not Active.
-   The team is not assigned to that campaign.
-   The team has no valid assignment for that day.
-   A duplicate sheet already exists.

------------------------------------------------------------------------

---

13. Field-Team Ground Workflow

After the AIC generates the relevant sheets, Field Teams log in using
credentials supplied by their AIC.

They select the active campaign and begin their assigned field work.

Mobile Team

The Mobile Team:

-   Goes to its assigned route for the selected day.
-   Visits assigned locations such as houses, mosques, schools, etc.
-   Collects required data.
-   Vaccinates children.
-   Completes the Tally Sheet.

Fixed Team

The Fixed Team:

-   Operates at the assigned Fixed Point.
-   Vaccinates children.
-   Collects required data.
-   Completes the Fixed Sheet.

Transit Team

The Transit Team:

-   Operates at the assigned Transit Point.
-   Vaccinates children.
-   Collects required data.
-   Completes the Transit Sheet.

At the end of its field operation, the team submits the relevant sheet
for that day.

------------------------------------------------------------------------

---

14. Offline-First / PWA Requirements

Offline operation is a core requirement, particularly for field workers.

The application should behave as an Offline-First PWA where appropriate.

Required capabilities:

-   Service worker/PWA support.
-   Local persistence of draft sheet data.
-   IndexedDB-based local queue where appropriate.
-   Redux Persist for suitable application state/draft persistence.
-   Offline submission queue.
-   Automatic synchronization when connectivity returns.
-   Retry handling.
-   Duplicate-submission prevention.
-   Idempotent server-side submission.
-   Network-state awareness.
-   Clear UI indication of:
    -   Offline.
    -   Saved locally.
    -   Pending sync.
    -   Syncing.
    -   Synced.
    -   Sync failed.
-   Safe recovery after browser/app restart.
-   No loss of a field worker’s entered data because of temporary
    connectivity loss.

Synchronization rules

The backend must not blindly accept repeated offline requests.

Use a reliable mechanism such as:

-   Client-generated submission/operation IDs.
-   Server-side idempotency checks.
-   Submission status tracking.
-   Retry-safe APIs.
-   Appropriate conflict handling.

Conflict behavior must be explicitly designed before implementation. Do
not silently overwrite server data.

------------------------------------------------------------------------
