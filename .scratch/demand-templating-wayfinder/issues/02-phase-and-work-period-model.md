Type: grilling
Status: open

## Question

What is the canonical relationship between phases, non-phase work periods, booking types, and resource requirements?

The decision must define:

- Whether a phase is a time container, a demand category, a scheduling dependency, or a combination.
  - The latest discussion answered this as all three: a time container, a demand category, and a scheduling dependency.
- Whether resource requirements can span multiple phases without appearing as confusing duplicate rows.
  - Strong direction: create the resource requirement once, then tag individual timeline blocks with the phase. This allows one requirement to cover multiple phases without duplicate rows. Different roles may still require separate requirements.
- How non-phase customers use generic work periods.
  - Non-phase customers do not necessarily need booking types. The simplest model is a resource requirement with a duration and effort against a neutral time bucket, using the default booking colour.
- Whether work periods and phases share one underlying model.
  - The strongest direction is now resource-first rather than container-first: a resource requirement owns time blocks, and each block may be tagged with a phase or optional booking type. Whether Work Periods remain an explicit stored concept is not answered yet.
- Which fields are structural and which are derived from the Gantt.
  - Resource requirements, timeline blocks, duration, and effort are the primary authored values. Phase proportions and the phase summary should be derived from the resulting shape. The exact storage ownership of duration is not answered yet.
- Likely relationship: `template → resource requirements → timeline blocks → optional phase/booking-type tags`.
- How booking types fit when there are named phases.
  - Booking types appear to be optional tags, including in a phase world. Multiple booking types may be attached, with a primary booking type driving colour in the existing product. Whether that is the right template UI still needs customer validation.
