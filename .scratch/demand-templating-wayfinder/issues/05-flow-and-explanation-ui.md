Type: prototype
Status: open

## Question

What should the final Details → Timeline → Review experience show so users understand the model without doing hidden maths?

The decision must cover:

- Which controls belong in Details versus Timeline.
  - The latest direction is to remove phase weighting as the first step. Start with resource requirements and shape the timeline; add or derive phase/booking-type tags on timeline blocks. Details can still contain identity and business-unit information. The final step boundaries are not answered yet.
- How the resource requirement modal displays phase, grade, role, timing, effort, and allocation.
  - Strong direction: show grade, optional role, duration, start timing, and the standard Percentage / Hours effort component, defaulting to Hours. Phase and booking type should be optional tags where the model allows them.
- Whether live examples, derived summaries, or popovers explain the calculation.
  - Since phase proportions are derived, the UI should show a summary such as “Prep represents 50% of the current demand” after the shape is created. The exact presentation is not answered yet.
- How the demand-shape visualisation supports rather than competes with editing.
  - The Gantt may be sufficient as the primary visual for MVP. A separate demand-shape visual is useful for hover detail and Review, but may not be required as a separate creation surface.
- How phase utilisation, resource splits, duration, and total template effort are summarised.
  - These should be visible as concise timeline or review summaries, with phase utilisation available in the phase context. Exact placement and metrics are not answered yet.
- What the Review step must show before publishing.
  - Review should confirm the structure, effort, timing, sequencing, and resulting demand before publishing. The final metrics and wording are not answered yet.
- Shared flow for both modes.
  - Strong direction: both phase and non-phase customers use Details → Timeline → Review. Phase customers work with named phases; non-phase customers work with generic Work Periods.
