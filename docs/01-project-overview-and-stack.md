# 01 Project Overview And Stack

> Reorganized from `MASTER_DOCS_Polio_Refined.txt`. This is requirements/specification content, not implementation-status evidence.

Polio Campaign Monitoring System

Master Project Requirements & Development Instructions

  Purpose: This document is the authoritative working specification for
  building the Government of Pakistan Polio Campaign Monitoring System
  using the MERN stack.

  Important rule: Business fields, sheet attributes, registration
  attributes, auto-population mappings, and other domain-specific
  details must not be invented or assumed. They will be supplied
  incrementally by the project owner. When implementation requires
  missing domain information, ask for it before implementing that part.

------------------------------------------------------------------------

---

1. Project Objective

The project is a Polio Campaign Monitoring System intended to digitalize
the complete workflow of a polio campaign.

The system will be developed using the MERN stack and must support
campaign planning, field-team operations, sheet completion, automatic
data aggregation, offline field work, role-based access, campaign
history, and final campaign locking.

The system must be:

-   Robust and scalable.
-   High-performance and maintainable.
-   Simple rather than unnecessarily complicated.
-   Easy to use for field users.
-   Fully responsive across devices.
-   Designed to handle potentially hundreds of thousands of users.
-   Efficient in API usage and database queries.
-   Observable and diagnosable in production.

------------------------------------------------------------------------

---

2. Required Technology Stack

Use the following technologies/packages unless a later project decision
explicitly changes them:

-   MERN: MongoDB, Express.js, React.js, Node.js
-   Redux Toolkit (RTK)
-   RTK Async Thunk
-   Redux Persist
-   React Router DOM
-   Tailwind CSS
-   React Toastify
-   Axios
-   MongoDB database indexes for faster queries
-   ImageKit for storing selected map images and UCI, AIC, Field teams Profile Pic.
-   PWA / Offline-First capabilities
-   IndexedDB and/or Redux Persist for local offline data/queues

Do not introduce unnecessary libraries merely for convenience. Prefer
the existing stack and simple, maintainable solutions.

------------------------------------------------------------------------

---

3. Core System Concepts

The main hierarchy is:

UCI → AIC → Field Teams

A campaign belongs to a UCI. A UCI manages multiple AICs. Each AIC
manages field teams and their assigned area/routes/points.

The system must enforce data boundaries so users can only access the
campaigns, areas, teams, sheets, and records they are authorized to
access.

------------------------------------------------------------------------

---

4. Roles and Responsibilities

4.1 UCI — Union Council In-Charge

The UCI:

-   Registers himself/herself.
-   Logs into the system.
-   Creates and manages campaigns.
-   Manages AICs assigned to a campaign.
-   Can register new AICs or select already-registered AICs from
    previous campaigns.
-   Divides the Union Council into areas and assigns areas to AICs.
-   Creates the UCMP.
-   Reviews/verifies required AIC planning work.
-   Controls campaign phase changes.
-   Reviews Form 2B.
-   Finalizes Form 2B.
-   Completes the campaign after Form 2B finalization.
-   Can view past campaign data/history.

An AIC count can be of 10+ or less per UCI.

4.2 AIC — Area In-Charge

The AIC:

-   Works within the area assigned by the UCI.
-   Creates the AMP.
-   Registers new field teams or selects existing teams from previous
    campaigns.
-   Manages field-team assignments.
-   Divides the assigned area into routes and points.
-   Assigns routes to Mobile Teams for Days 1–3.
-   Assigns Fixed and Transit points for the days they operate, up to
    the currently specified maximum of 7 days.
-   Creates OMPs for Mobile Teams for Days 1–3.
-   Operates field-team days only after campaign activation.
-   Generates the dedicated field-team sheets for each operating day.
-   Reviews/submits Form 2A according to the campaign rules.
-   Receives notifications from the UCI regarding campaign progression.

Team capacity requirements:

-   Mobile Teams: maximum 6 per AIC
-   Fixed Teams: maximum 3+ per AIC
-   Transit Teams: maximum 3+ per AIC

The exact interpretation of 3+ must be confirmed before enforcing a hard
database/application limit.

4.3 Field Teams

There are three field-team types.

Mobile Team

-   Vaccinates children and collects data on assigned routes.
-   Works for 3 days according to the AIC’s operational plan.
-   Uses the Tally Sheet.
-   Routes are assigned day-wise.
-   Main field-work focus.

Fixed Team

-   Vaccinates children and collects data at an assigned fixed point.
-   Uses the Fixed Sheet.
-   May operate for up to 7 days, according to the AIC’s plan.
-   The point may be a ground, shopping mall, landmark, or another
    designated fixed location.

Transit Team

-   Vaccinates children and collects data at an assigned transit point.
-   Uses the Transit Sheet.
-   May operate for up to 7 days, according to the AIC’s plan.
-   The point may be a small medical center, clinic, or another
    designated transit location.

4.4 Team

-   Each field team has One team Leader (just like that) and one team member (both have no difference)

------------------------------------------------------------------------
