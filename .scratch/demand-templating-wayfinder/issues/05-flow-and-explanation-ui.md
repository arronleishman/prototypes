Type: prototype
Status: open

## Question

What should the final Details → Timeline → Review experience show so users understand the model without doing hidden maths?

The decision must cover:

- Which controls belong in Details versus Timeline.
  - Current understanding: Details should contain identity, business unit, and high-level template settings. Timeline should contain phases or Work Periods, requirements, timing, effort, sequencing, and the Gantt. The exact overlap-control location is not answered yet.
- How the resource requirement modal displays phase, grade, role, timing, effort, and allocation.
  - Strong direction: show phase or booking type, grade, optional role, start week, duration, and a Percentage / Hours effort control. The modal must state whether effort applies to the template, phase, or requirement.
- Whether live examples, derived summaries, or popovers explain the calculation.
  - Strong direction: provide an inline example, derived summary, or popover so users do not have to calculate nested percentages. The exact presentation is not answered yet.
- How the demand-shape visualisation supports rather than competes with editing.
  - The visualisation is valued and should remain, but it should be a derived summary. The resource requirement editor and Gantt are the primary authoring surface.
- How phase utilisation, resource splits, duration, and total template effort are summarised.
  - These should be visible as concise timeline or review summaries, with phase utilisation available in the phase context. Exact placement and metrics are not answered yet.
- What the Review step must show before publishing.
  - Review should confirm the structure, effort, timing, sequencing, and resulting demand before publishing. The final metrics and wording are not answered yet.
- Shared flow for both modes.
  - Strong direction: both phase and non-phase customers use Details → Timeline → Review. Phase customers work with named phases; non-phase customers work with generic Work Periods.
