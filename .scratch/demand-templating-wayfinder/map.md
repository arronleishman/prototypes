## Destination

Produce a decision-ready specification for demand-template authoring and application. It must define the domain model, effort semantics, phase/work-period behaviour, sequencing and overlap rules, and the UI for Details, Timeline, Review, and Apply-to-engagement before implementation is planned.

## Notes

- This is a planning map. Resolve decisions with the user before changing the mock or product behaviour.
- Primary sources:
  - 3 September 2026 meeting: `Steven & Arron - (In Person) Design Reviews, Discussions and Brainstorming Time.docx`
  - `templating-catch-up-summary.md`, based on the 26 August 2026 catch-up
  - The earlier **Demand templates mock** conversation from 7 August 2026
  - The current **Demand templates mock** conversation, including the Timeline, Gantt, phase weighting, overlap, Figma, and catalogue work
- Existing terminology to preserve unless a ticket resolves it: demand template, phase, work period, resource requirement, phase weighting, resource weighting, booking type, overlap, shunting, effort mode, and application-time scaling.
- Scope includes creation and apply-to-engagement UI behaviour. It does not include production API implementation, capacity-engine algorithm design, or unrelated Portfolio/Gantt screens.

## Decisions so far

<!-- Closed tickets are added here only when their decision is resolved. -->

## Not yet specified

- Whether absolute hours, proportional allocation, duration plus FTE allocation, or a deliberate combination should be the canonical authoring model.
- Whether phase weighting is authored independently, derived from hours, or shown only as a derived summary in some effort modes.
- Whether phases are structural containers, visual labels, scheduling constraints, or all three.
- How non-phase work periods and booking types map to the same underlying demand model.
- The exact boundary between template authoring, application-time scaling, and feasibility/capacity feedback.

## Out of scope

- Implementing the final UI while the decisions remain open.
- Replacing the existing Dayshape design system or creating a separate visual language.
- Solving production scheduling, capacity allocation, or API orchestration in this map.
