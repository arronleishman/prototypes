Type: grilling
Status: open

## Question

How should sequential work, overlap, and task shunting be represented and constrained in the authoring UI?

The decision must cover:

- Where “Allow work to overlap” belongs in the flow.
  - Strong direction: let users shape the demand first, then make the overlap/sequencing choice at the end of the creation experience. Keeping the checkbox at the top may force an unnecessarily linear creation order.
- Whether later phases automatically start after earlier phases, or may overlap.
  - Later phases should respect dependencies. If overlap is allowed, the next item still should not start before the previous item has started. If overlap is not allowed, later work is naturally bumped or shifted.
- How moving or resizing earlier work shunts dependent work.
  - The latest discussion suggests shunting should not be a separately configurable template feature for MVP. “Do not allow overlap” communicates that later work will be bumped. Exact cascade behaviour is not answered yet.
- How invalid placements are prevented, snapped, or explained.
  - The current mock direction remains sensible: prevent invalid states, snap new work to a valid week, and return invalid drag/resize attempts to their original position with an explanation. This still needs validation with users.
- Whether sequencing is a phase-only rule or also applies to non-phase booking types and work periods.
  - Current understanding: dependencies are needed for phase-based work. A non-phase world may not need phase dependencies and can be shaped directly from resource requirements. The exact non-phase rule is not answered yet.
- What warning or preview the user sees before applying a template.
  - The current Timeline warning, help animation, and Gantt feedback are useful authoring patterns. Whether an equivalent warning is required in Apply-to-engagement is not answered yet.
- Whether overlap is allowed between requirements inside one phase.
  - Not answered yet. The discussions mainly covered overlap between sequential phases.
- How phase order is established when users create phases out of order.
  - Not answered yet. The transcript raised workflow-driven ordering and manual dependency links, but neither was selected.
