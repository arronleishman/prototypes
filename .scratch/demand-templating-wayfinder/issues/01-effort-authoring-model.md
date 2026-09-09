Type: grilling
Status: open

## Question

What should users author for each resource requirement: absolute hours, a proportional percentage, duration plus allocation percentage, or a combination of these modes?

The decision must cover:

- What the Percentage and Hours toggle means.
  - Current understanding: Keep a mutually exclusive Percentage / Hours toggle. This is a strong direction, but the final interaction has not been resolved.
- Whether hours are total effort or effort per week.
  - Not answered yet. The discussions used total examples such as 30 hours for Prep and 70 hours for Review, but did not settle whether the stored value is total effort or a weekly amount.
- Whether phase proportions are authored first or derived from requirement hours.
  - Percentage mode should author the phase proportion first. Hours mode should treat hours as authoritative and derive the phase split; for example, 30 hours and 70 hours would derive 30% and 70%.
- How the UI explains nested percentages such as “70% of Prep’s 30%”.
  - The UI should show the relationship explicitly, for example “70% of Prep’s demand” and “Prep represents 30% of the template”, with a live calculation or summary rather than requiring users to do the maths.
- What happens when a user switches effort mode after entering values.
  - Not answered yet. The conversion, rounding, and whether the original value is preserved need a specific decision.
- How the model supports both tax-style known-hour work and consulting-style long-duration allocations.
  - Hours are especially useful where teams know a typical effort in advance, such as tax work. Percentages remain useful for longer consulting engagements where users think in terms of allocation over time. A duration-plus-FTE model is also plausible, but has not been selected.
- Which mode is the default.
  - Not answered yet.
- Whether phase weighting is hidden, shown as derived information, or remains editable in Hours mode.
  - Not answered yet. The strongest current direction is to show it as derived information when Hours mode is active.

