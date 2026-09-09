Type: grilling
Status: open

## Question

How should sequential work, overlap, and task shunting be represented and constrained in the authoring UI?

The decision must cover:

- Where “Allow work to overlap” belongs in the flow.
  - Not answered yet. It has been placed in Timeline so far, but Details and a less prominent template setting were also discussed.
- Whether later phases automatically start after earlier phases, or may overlap.
  - Strong direction: later phases start after earlier phases by default; overlap is an explicit opt-in.
- How moving or resizing earlier work shunts dependent work.
  - Current understanding: dependent work should move to preserve the sequencing rule. Whether shunting cascades through every later phase or only the next affected phase is not answered yet.
- How invalid placements are prevented, snapped, or explained.
  - Strong direction: prevent invalid states. New work should snap to a valid week; invalid drag or resize attempts should return to the original placement and show an explanation.
- Whether sequencing is a phase-only rule or also applies to non-phase booking types and work periods.
  - Not answered yet. The phase case is clear, but the same rule for non-phase Work Periods and booking types still needs a decision.
- What warning or preview the user sees before applying a template.
  - The current Timeline warning, help animation, and Gantt feedback are useful authoring patterns. Whether an equivalent warning is required in Apply-to-engagement is not answered yet.
- Whether overlap is allowed between requirements inside one phase.
  - Not answered yet. The discussions mainly covered overlap between sequential phases.
