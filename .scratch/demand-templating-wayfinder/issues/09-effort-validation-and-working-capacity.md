Type: grilling
Status: open

## Question

How should the authoring UI validate unusually large hour values without depending on live working-hour calendars?

The latest discussion suggested a simple hard-coded sanity cap or warning, while avoiding background calculations based on individual grades, work patterns, or availability.

Decide:

- Should the threshold be a warning or a hard block?
- Is the threshold per week, per duration, or per resource requirement?
- Should overtime-heavy service lines be able to override it?
- What wording explains that the value may be unusual without claiming it is impossible?
- Which checks belong in authoring and which belong in Apply-to-engagement feasibility?
