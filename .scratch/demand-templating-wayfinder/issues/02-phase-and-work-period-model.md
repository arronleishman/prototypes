Type: grilling
Status: open

## Question

What is the canonical relationship between phases, non-phase work periods, booking types, and resource requirements?

The decision must define:

- Whether a phase is a time container, a demand category, a scheduling dependency, or a combination.
  - Current understanding: It is likely a combination of these: a named time container, a demand category, and a scheduling boundary. The exact canonical definition is not answered yet.
- Whether resource requirements can span multiple phases without appearing as confusing duplicate rows.
  - Not answered yet. The discussions identified duplicate rows as confusing, so the model should avoid them or make linked segments explicit.
- How non-phase customers use generic work periods.
  - Non-phase customers should use generic Work Periods: time-based containers with a duration and resource requirements inside them.
- Whether work periods and phases share one underlying model.
  - Strong direction: yes. Phases are the labelled version used when a business unit has phases; Work Periods are the generic version.
- Which fields are structural and which are derived from the Gantt.
  - Likely structural fields are the ordered containers and resource requirements. Timeline segments and effective template duration should be derived from or kept in sync with the Gantt. The exact ownership of duration is not answered yet.
- Likely relationship: `template → ordered phases/work periods → resource requirements → timeline segments`.
- How booking types fit when there are named phases.
  - Not answered yet. Booking types are clear as the non-phase fallback, but their relationship to named phases still needs definition.
