Type: grilling
Status: open

## Question

What should users author for each resource requirement: absolute hours, a proportional percentage, duration plus allocation percentage, or a combination of these modes?

The decision must cover:

- What the Percentage and Hours toggle means.
  - Current understanding: Use the existing effort input component, default it to Hours, and allow the user to switch the individual resource requirement to Percentage. Mixing modes between requirements should remain possible, although it may not be the normal path.
- Whether hours are total effort or effort per week.
  - Strong direction: hours represent total effort across the requirement’s duration. A three-month requirement could contain 40 total hours, while a six-month requirement could contain 120 total hours. The exact data contract is not answered yet.
- Whether phase proportions are authored first or derived from requirement hours.
  - The latest discussion moves away from authoring phase proportions first. Users should shape resource requirements and timeline blocks first; phase proportions should be derived from the resulting demand shape.
- How the UI explains nested percentages such as “70% of Prep’s 30%”.
  - This nested calculation should no longer be the primary authoring model. If phase proportions are shown, they should be presented as derived summary information rather than as the first input.
- What happens when a user switches effort mode after entering values.
  - Not answered yet. The conversion, rounding, and whether the original value is preserved need a specific decision.
- How the model supports both tax-style known-hour work and consulting-style long-duration allocations.
  - Hours suit high-volume or tax work where users know typical effort. Percentage suits longer consulting work where users think “six months at 30%”. Duration and effort must therefore remain separate. A duration-plus-FTE model remains a possible interpretation, but has not been selected as a separate mode.
- Which mode is the default.
  - Strong direction: default each new resource requirement to Hours.
- Whether phase weighting is hidden, shown as derived information, or remains editable in Hours mode.
  - Strong direction: phase weighting is derived from the shape and should not be a primary editable input. Exact display treatment remains open.
- What validation prevents nonsensical hour values.
  - A hard-coded sanity cap or warning was suggested, without fetching individual working-hour calendars. The threshold and whether it is a warning or a hard block are not answered yet.

