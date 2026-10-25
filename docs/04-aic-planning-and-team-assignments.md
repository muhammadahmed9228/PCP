# 04 Aic Planning And Team Assignments

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

8. AIC Planning Workflow

Step 1 — AIC Login

The AIC receives credentials from the UCI and logs in.

The AIC can select:

-   The fresh campaign created by the UCI.
-   Past campaigns for historical viewing where authorized.

The dashboard must display relevant campaign context and automatically
populated information such as:

-   UCI details.
-   UC/place details.
-   UC number/name.
-   Assigned area.
-   Campaign details.

Exact dashboard auto-population fields will be provided later.

Step 2 — Create AMP

The AIC creates the AMP for the area assigned by the UCI.

The AIC can:

-   Save Draft.
-   Edit while editable.
-   Finalize.

After finalization, the AMP is locked.

Step 3 — Register/Select Field Teams

The AIC can:

-   Register new Mobile, Fixed, and Transit Teams.
-   Select already-registered teams from previous campaigns.

Selected teams become associated with the campaign under that AIC.

Step 4 — Divide Assigned Area

The AIC divides the assigned area into:

-   Routes for Mobile Teams.
-   Fixed Points for Fixed Teams.
-   Transit Points for Transit Teams.

Exact Route/Point creation attributes will be supplied later.

------------------------------------------------------------------------

---

9. Field-Team Assignment

9.1 Mobile Teams

Mobile Teams operate for Days 1–3.

The AIC assigns a route to each Mobile Team for each operating day.

Example:

-   Mobile Team 1 → Route 1 → Day 1
-   Mobile Team 1 → Route 2 → Day 2
-   Mobile Team 1 → Route 3 → Day 3

The actual number and assignment constraints must follow the supplied
business rules.

9.2 Fixed Teams

The AIC assigns Fixed Points day-wise.

A Fixed Team may operate for up to 7 days according to the current
requirement.

Example:

-   Fixed Team 1 → Fixed Point 1 → Day 1
-   Fixed Team 1 → Fixed Point 2 → Day 2
-   …
-   Fixed Team 1 → Fixed Point N → Day N

9.3 Transit Teams

Transit Teams follow the same assignment concept using Transit Points.

Example:

-   Transit Team 1 → Transit Point 1 → Day 1
-   Transit Team 1 → Transit Point 2 → Day 2
-   …
-   Transit Team 1 → Transit Point N → Day N

There is no OMP for Fixed or Transit Teams.

------------------------------------------------------------------------

---

10. OMP Workflow — Mobile Teams

After the AIC has assigned routes and receives the required
instruction/order from the UCI, the AIC creates the OMPs.

For every Mobile Team:

-   OMP Day 1
-   OMP Day 2
-   OMP Day 3

Each OMP must support:

-   Draft save.
-   Editing while editable.
-   Finalization.
-   Locking after finalization.

The same workflow applies to every Mobile Team under that AIC.

The system must prevent activation if required OMPs have not been
created and verified according to the final business rules.

------------------------------------------------------------------------

---

11. Planning Verification and Campaign Activation

Before the UCI can change the campaign from Planning → Active:

-   Required UCI planning work must be complete.
-   Required AIC AMP work must be complete.
-   Required Mobile Team OMP work must be created.
-   Required verification by the UCI must be complete.

The exact activation checklist should be implemented as explicit system
validations rather than relying on the UI alone.

Once all activation conditions are satisfied:

-   UCI can activate the campaign.
-   AICs are notified.
-   Field operation becomes available.

AICs must not be able to select operating days or generate Field Team
sheets before the campaign is Active.

------------------------------------------------------------------------
