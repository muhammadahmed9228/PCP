# 06 Forms Aggregation And Completion

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

15. Form 2A Auto-Population

After Field Teams submit their daily sheets:

-   Relevant Form 2A attributes for that AIC/day are automatically
    populated.
-   The exact mappings will be provided by the project owner.

Example:

If Mobile, Fixed, and Transit Teams submit Day 1 sheets, the
corresponding relevant Form 2A Day 1 fields are populated.

The same process applies to remaining days.

The system must distinguish:

-   Data entered manually by an authorized user.
-   Data calculated by the system.
-   Data auto-populated from another sheet.
-   Finalized/locked data.

Auto-populated values must have a traceable source.

------------------------------------------------------------------------

---

16. Form 2A Submission Rules

Current business requirement:

Form 2A can be reviewed/submitted after the AIC’s assigned area is fully
covered and all required dedicated Field Team sheets have been submitted
for their assigned days/routes/points.

This means:

-   All required Mobile Team Tally Sheets must be submitted.
-   All required Fixed Team Sheets must be submitted.
-   All required Transit Team Sheets must be submitted.

The exact meaning of “fully covered” and any exception/partial-day rules
must be confirmed before coding edge cases.

Day-wise Form 2A submission

The source specifies that an AIC may submit Form 2A day-by-day rather
than submitting all days together.

Recommended implementation:

-   Support day-wise Form 2A submission if the final business rules
    confirm it.
-   Once a day’s Form 2A is submitted, that day’s relevant data becomes
    available for UCI Form 2B.
-   Other days remain independently editable until their own submission
    conditions are met.

------------------------------------------------------------------------

---

17. Form 2B Auto-Population

When an AIC submits Form 2A:

-   Relevant Form 2B fields are auto-populated.
-   Population occurs day-wise.
-   Population occurs AIC-wise.
-   This applies to all AICs under the UCI.

Example:

If AIC-1’s Form 2A Day 1 total is submitted, that total is populated
into Form 2B Day 1 against AIC-1.

The source specifies that different AICs may have different operational
durations, for example:

-   AIC-1 → 7 days
-   AIC-2 → 6 days
-   AIC-N → 4 days

Therefore, the system must support variable AIC/team operating durations
rather than assuming every AIC has the same number of days.

The exact Form 2A → Form 2B field mappings will be supplied later.

------------------------------------------------------------------------

---

18. Form 2B Grand Totals

For every relevant day:

1.  Form 2A data from all relevant AICs is collected.
2.  The relevant values are aggregated.
3.  Form 2B displays the grand total for each applicable attribute.

Example:

Day 1 Grand Total = AIC-1 Day 1 + AIC-2 Day 1 + … + AIC-N Day 1

The same logic applies to remaining days.

Grand totals should be calculated from authoritative submitted data
rather than values manually entered by users.

------------------------------------------------------------------------

---

19. Form 2B Review and Finalization

After the required Form 2A data is available:

1.  UCI reviews Form 2B.
2.  System displays calculated AIC/day totals and grand totals.
3.  UCI finalizes Form 2B.
4.  Form 2B becomes locked.

The exact validation/checklist required before Form 2B finalization must
be confirmed.

------------------------------------------------------------------------

---

20. Campaign Completion

Once Form 2B is finalized:

1.  UCI can update the campaign to Completed.
2.  The campaign becomes historical.
3.  Campaign data becomes read-only.
4.  No further edits or manipulations are allowed.

Completion must be enforced at the backend, not only by disabling
frontend controls.

Past campaigns remain available for authorized historical viewing.

------------------------------------------------------------------------
