# Demand template Phase-world timeline plan

## Goal

Update the demand-profile template mock so Phase world can be built from the Demand shape timeline without adding resource requirements first.

Non-phase templates should continue to use the existing resource-request-first flow and should not show phase-only controls.

## Agreed experience

### Details

- Keep the existing Phase world / Non-phase world choice.
- Details should not contain phase setup fields.

### Timeline — Phase world

All phase setup and demand shaping happens in the Demand shape timeline.

1. Show an empty phase timeline when starting from scratch.
2. Provide `+ Add phase`.
3. Add phase opens the existing phase library picker.
4. A selected phase is added as a coloured timeline block with an initial duration.
5. The phase can be resized and reordered directly on the timeline.
6. A phase may temporarily exist without resource requirements.
7. Add Resource Requirement remains in the shared resource requirements area below the demand shape.
8. Clicking a phase selects it and preselects that phase in the Add Resource Requirement modal.
9. Resource requirements remain in one shared Gantt/grid; they are associated with a phase but are not visually nested inside the phase block.
10. A resource requirement cannot be created without a phase in Phase world.

### Timeline — Non-phase world

- Do not show phase creation or phase weighting.
- Add Resource Requirement remains available immediately.
- Requirements are assigned to booking types.
- The existing resource-request-first Gantt flow remains unchanged.

## Phase weighting

Phase weighting represents the phase's share of the template timeline, not the split between resources.

Example:

- Template duration: 9 weeks
- Tax Prep duration: 2 weeks
- Tax Prep timeline share: 22%

Display phase metadata as:

`Tax Prep · 2w · 22%`

Recommended source of truth:

- Phase duration is authoritative.
- Phase percentage is derived from phase duration divided by total template duration.
- Do not allow the two values to silently disagree.

Resource effort weighting remains separate:

- Tax Prep: 2 weeks, 22% of the template timeline
- Senior Manager: 70% of effort within Tax Prep
- Manager: 30% of effort within Tax Prep

Adding a resource requirement must not automatically change the phase duration or phase timeline percentage.

## Hover popover: phase utilisation indicator

When the user hovers or focuses a phase block in the Demand shape timeline, extend the existing popover to show how much of the phase has been utilised by resource requirements.

Example content:

- Phase: Tax Prep
- Duration: 2 weeks
- Timeline share: 22%
- Resource requirements: 2
- Utilised: 2 of 2 weeks

Add a compact visual indicator, such as a horizontal progress bar:

`[██████████] 100% utilised`

The indicator should compare the phase's time window with the occupied time from its linked resource requirement segments.

Suggested states:

- `0% utilised` — no requirements or no segments placed
- `50% utilised` — requirements occupy half of the phase window
- `100% utilised` — the phase window is fully covered
- `Over capacity` — linked work extends beyond the phase window

The visual must remain understandable when requirements overlap. Overlapping requirements should not make utilisation exceed 100%; utilisation measures covered timeline, not the sum of resource effort.

## Utilisation calculation

For each phase:

1. Determine the phase window in weeks.
2. Collect all resource requirement segments linked to that phase.
3. Clip each segment to the phase window for the utilisation calculation.
4. Merge overlapping occupied week ranges.
5. Calculate:

`utilised weeks ÷ phase duration weeks × 100`

6. Separately detect any un-clipped portion outside the phase window as overflow.

Do not use effort percentages to calculate the visual utilisation. Effort percentage describes resource share; it does not describe time coverage.

## Validation and edge cases

- Empty phase:
  - Allow it while editing.
  - Show `0% utilised`.
  - Block Review/publish with a clear “phase has no resource requirements” warning.
- Requirement with no segment:
  - Show `0% utilised`.
  - Block Review/publish.
- Requirement starts before the phase:
  - Show overflow warning.
  - Offer to move it inside the phase or extend the phase.
- Requirement ends after the phase:
  - Show overflow warning.
  - Do not silently shorten the requirement.
- Requirement is longer than the phase:
  - Keep the actual segment visible.
  - Show `Over capacity`.
  - Block Review/publish until resolved.
- Multiple segments:
  - Merge occupied ranges for utilisation.
  - Gaps are allowed if non-contiguous work is supported.
- Overlapping requirements:
  - Count shared weeks once for utilisation.
  - Keep effort weighting independent.
- Phase duration changes:
  - Recalculate the phase percentage and utilisation.
  - Warn if existing requirements no longer fit.
- Phase deletion:
  - Warn if requirements are linked.
  - Require deletion or reassignment before completing the action.
- Sequential phases:
  - Respect the existing overlap setting.
  - Show sequence warnings in the timeline and block Review when invalid.
- Rounding:
  - Calculate using week-level values.
  - Display whole percentages using consistent rounding.
- Non-phase world:
  - Hide phase utilisation, phase timeline share, and phase-specific validation.

## Review step

Keep the Review step read-only and show:

- Demand shape with phase blocks.
- Phase duration and derived timeline share.
- Utilisation indicator or utilisation percentage for each phase.
- Resource requirements grouped by phase.
- Any unresolved overflow, empty-phase, or sequencing warning.

Review and publish should be blocked while a phase has invalid or out-of-window work.

## Effort unit decision

The Percentage / Hours control needs an explicit data rule before implementation:

- Percentage is the resource effort share within a phase.
- Hours is an absolute effort value.
- They must not be treated as the same value.
- If both are supported, store them separately and define how totals are calculated when requirements use different units.

The phase utilisation indicator should remain time-based and must not depend on this decision.

## Implementation order

1. Add phase-empty state and phase creation interaction inside Demand shape.
2. Add phase selection context to the shared Add Resource Requirement flow.
3. Add phase duration and derived timeline-share display.
4. Add phase/resource containment and sequence validation.
5. Extend the existing hover/focus popover with utilisation data and progress indicator.
6. Mirror the read-only information in Review.
7. Test Phase world, Non-phase world, empty states, overlaps, overflow, deletion, resizing, and Review gating.

## Non-goals

- Do not introduce separate phase pages or a new wizard step.
- Do not put separate resource lists inside each phase block.
- Do not let resource effort weighting silently resize phases.
- Do not change the existing Non-phase resource-request-first model.
- Do not implement this plan as part of creating the plan file.
