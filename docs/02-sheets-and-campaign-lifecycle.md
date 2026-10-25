# 02 Sheets And Campaign Lifecycle

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

5. Sheets / Forms

All sheets are large and contain many attributes.

The project owner will provide the exact fields/attributes. Do not
invent them.

Every sheet must support:

-   Draft saving.
-   Editing while the sheet is editable.
-   Finalization/submission according to its workflow.
-   Appropriate locking after finalization/submission.
-   Persistence in the database after submission/finalization/approval
    as applicable.
-   Offline support where applicable, especially for field-team sheets.

5.1 UCI Sheets

UCMP — Union Council Micro Plan

-   First sheet of a new campaign.
-   Created manually by the UCI.
-   Supports Draft.
-   Can be finalized by the UCI.
-   Once finalized, it is locked for that campaign.

Form 2B

-   Final UCI-level form.
-   Auto-populated day-wise from AIC Form 2A data.
-   Also partially populated from the relevant AMP data according to
    mappings supplied later.
-   Contains day-wise AIC data and calculated grand totals.
-   Can be reviewed and finalized by the UCI.

5.2 AIC Sheets

AMP — Area Micro Plan

-   Created manually by the AIC for the area assigned by the UCI.
-   Supports Draft.
-   Can be finalized and locked.

OMP — Operational Micro Plan

-   Only for Mobile Teams.
-   Created by the AIC.
-   Created for each Mobile Team for each day from Day 1 through Day 3.
-   Supports Draft.
-   Can be finalized and locked.

There is no OMP for Fixed or Transit Teams.

Form 2A

-   Auto-populated day-wise from relevant Field Team sheets.
-   Also partially populated from the relevant day’s Mobile Team OMP
    according to mappings supplied later.
-   Can be reviewed/submitted according to coverage and submission
    rules.

5.3 Field-Team Sheets

-   Mobile → Tally Sheet
-   Fixed → Fixed Sheet
-   Transit → Transit Sheet

Some fields such as AIC details, area, route/point, and team details
will be automatically populated. The exact fields and mappings will be
provided later.

------------------------------------------------------------------------

---

6. Campaign Lifecycle

A campaign has these primary phases:

1.  Planning
2.  Active
3.  Completed

The project also requires support for:

-   Paused
-   Cancelled

A campaign may be paused or cancelled by its UCI due to major
circumstances.

  The exact transition rules, resume rules, cancellation rules, and
  whether data can be edited while paused must be explicitly confirmed
  before implementation.

The campaign lifecycle must be implemented as a controlled state
machine. Do not allow arbitrary status changes from the frontend.

------------------------------------------------------------------------

---

21. Draft, Submission, Finalization and Locking Rules

Every sheet/form must have an explicit lifecycle.

Recommended generic lifecycle:

Draft → Submitted → Finalized/Approved → Locked

However, the exact lifecycle for each sheet must follow the supplied
business process.

Important rules:

-   Drafts may be edited by authorized users.
-   Submitted records must not be silently overwritten.
-   Finalized records must be locked.
-   Locked campaign records must be read-only.
-   Backend authorization must enforce every state restriction.
-   Frontend restrictions are only a UX layer.
-   Every state transition should be auditable.

------------------------------------------------------------------------

---

42. Versioning and Data History

Past campaigns are historical records.

For every new campaign:

-   Create new campaign-specific micro plans.
-   Create new campaign-specific assignments.
-   Create new campaign-specific sheets.
-   Do not mutate completed historical campaign data.
-   Preserve finalized/submitted records.

Where a sheet requires revisions before finalization, use appropriate
version/state handling rather than destructive overwrites.

------------------------------------------------------------------------
