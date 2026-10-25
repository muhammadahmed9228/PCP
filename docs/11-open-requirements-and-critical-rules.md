# 11 Open Requirements And Critical Rules

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

43. Critical Engineering Rules

These rules apply throughout development:

1.  Never invent missing business fields. Ask for them.
2.  Never invent auto-population mappings. Ask for them.
3.  Never invent validation rules where the business rule is unknown.
    Ask for them.
4.  Never bypass backend authorization because the frontend already
    hides a button.
5.  Never trust client-calculated totals. Recalculate/verify
    authoritative totals on the server where appropriate.
6.  Never allow duplicate offline submissions to double-count data.
7.  Never silently overwrite conflicting data.
8.  Never allow finalized/locked records to be modified through direct
    APIs.
9.  Never allow campaign-state restrictions to exist only in React.
10. Never hard-code secrets, credentials, tokens, or deployment-specific
    configuration.
11. Never create unnecessary duplicate components/services/business
    logic.
12. Never build a huge monolithic file when the feature can be cleanly
    divided.
13. Never optimize prematurely; measure real bottlenecks.
14. Never remove a requirement from this document without explicitly
    confirming the change.
15. When a requirement is ambiguous, identify the ambiguity and ask
    before implementing it.

------------------------------------------------------------------------

---

49. Information You have Still Required From the Project Owner (me)

Before implementing the relevant modules, obtain the exact definitions
for:

1.  UCI registration fields.
2.  AIC registration fields.
3.  Field Team registration fields.
4.  Campaign fields.
5.  Area fields.
6.  Route fields.
7.  Fixed Point fields.
8.  Transit Point fields.
9.  UCMP fields.
10. AMP fields.
11. OMP fields.
12. Tally Sheet fields.
13. Fixed Sheet fields.
14. Transit Sheet fields.
15. Form 2A fields.
16. Form 2B fields.
17. Every auto-populated field.
18. Source of every auto-populated field.
19. Every calculated field/formula.
20. Exact limits for AICs and team types (Answer: Single UCI can have max 10+ his AICs and one AIC can have max 6+ mobile and 3+ fixed and transit teams)
21. Exact day/assignment rules.
22. Form 2A submission conditions and exceptions.
23. Form 2B finalization conditions.
24. Pause behavior (Answer: Due to government order)
25. Cancellation behavior (Answer: Due to government order)
26. Resume behavior after pause. (Answer: Upon government order)
27. Any approval workflow beyond the currently described finalization (Answer: AMP of AICs and OMP of each mobile team, each day of all the AICs will be approved by their UCI)
28. Data retention requirements.

I will provide all the attributes/ definitions during building/ working on that feature/part as these sheet's attributes are so many. Ask when required.
