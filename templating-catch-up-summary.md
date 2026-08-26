# Templating catch-up: summary, UI implications, and open questions

## Source

- Meeting: **Arron & Steven Catch-up**
- Date: **26 August 2026**
- Recording length: **1h 25m**
- Source file: `/Users/arron.leishman/Downloads/Arron & Steven Catch-up.docx`

The transcript does not consistently identify speakers. The templating discussion appears to begin when the conversation changes to “we wanted to have a focused conversation around templating functionality”; this is the section where Boney appears to join the meeting. Speaker ownership should be confirmed before treating an individual comment as a final decision.

## Executive summary

The group broadly supports demand templates as an important mechanism for creating work at scale, especially for High Volume, but the underlying model needs to work across:

- Phase and non-phase customers.
- High-volume work and larger consulting projects.
- Manual creation and automated/API-driven creation.
- Customers with dedicated resource managers and customers where engagement managers do the allocation.

The strongest design direction is the second, Gantt-oriented creation concept. It is closer to the booking and phase model people will eventually see on an engagement and avoids introducing too much new terminology. The first phase-then-resource-list concept was seen as understandable in principle but increasingly confusing once resource requirements could span multiple phases.

The major unresolved product decision is what a template stores:

- A proportional shape that scales from a total job size.
- A typical job expressed in absolute hours that can optionally be scaled.
- Or both, with a clear “flex this template” decision at application time.

The application flow should work backwards from a deadline, preview the generated demand before committing it, and support manual adjustment where appropriate. Automatic application through an API, workflow, or bulk upload is likely more important for High Volume than asking users to apply templates one job at a time.

## What was discussed when Boney joined

### Why templates matter

Templating is seen as critical to creating demand at scale. It should also be useful beyond High Volume and across different service lines.

A template should not be tied only to tax or only to a phase-based operating model. It needs to work when:

- Work has named phases.
- Work has no phases.
- Phases are useful for some work but optional for other work.
- A resource requirement is reused across multiple phases.

### First concept: phases first, then resource requirements

The first concept started by defining phases:

1. Add a phase from the available phase traits.
2. Give it a duration and proportional share.
3. Add buffers or non-working periods.
4. Add resource requirements against each phase.
5. Define how much of each resource requirement belongs to each phase.

The example was roughly:

- Prep: one week.
- Review: another portion of the total work.
- A three-week buffer.
- Sign-off or approval.

The benefit was that it made the overall structure visible before staffing was added. It also made it possible to express resource splits within a phase.

The problems were:

- Percentages of percentages became difficult to understand.
- A single resource working across multiple phases looked like duplicate line items.
- The design became different in Phase and non-Phase worlds.
- It was not obvious whether the rows represented reusable demand requirements or actual future bookings.
- The user would need to think about phases before the resource requirements they naturally wanted to add.

### Second concept: resource requirements and Gantt first

The second concept starts from a resource requirement and uses a Gantt-like view to build the shape:

1. Add a resource requirement.
2. Optionally associate it with a phase or booking type.
3. Define grade, role, effort, and timing.
4. Move and resize it directly on the timeline.
5. Add further requirements and build the overall shape visually.

This was seen as more approachable because it is closer to the booking view users eventually work with. It also works more naturally for non-phase work.

Steven’s stated bias was toward this second approach, while keeping phase context available rather than forcing a separate phase-first construction experience.

### Possible middle ground

A possible direction discussed was:

- Phases are optional rather than a top-level mode that completely changes the flow.
- A user can add a phase when one is useful.
- Requirements without a phase sit in a “No phase” or unassigned bucket.
- A template can contain phases and unphased work if that is a valid customer use case.

This needs an explicit decision because it affects the data model, validation, colour treatment, and the simplicity of the UI.

## Product principles to carry forward

### Keep the design close to the eventual booking view

People should be able to understand how a template becomes demand and bookings. Avoid introducing terms such as “work blocks” or “chunks” if the product already uses bookings, resource requirements, and phases.

### Separate template demand from actual bookings

A template should define a repeatable demand shape. Applying it should create a starting point for a job, not imply that named people have already been assigned.

The UI should make clear whether a row is:

- A reusable resource requirement.
- A generated booking.
- A suggested resource.
- An actual assigned resource.

### Use proportional scaling where it helps High Volume

For High Volume, the same shape may need to scale up or down based on the total size of a job. If the job has 100 hours rather than 50, the phases and requirements should retain their relative proportions.

### Do not make proportional scaling the only possible model without validating it

There may be customers who want to create a template from a typical job using absolute hours. This is especially relevant outside High Volume.

### Recommended hybrid model: hours for authoring, proportions for reuse

The recommended direction is to let users author a template using baseline hours while retaining the proportional shape internally.

Example baseline template:

- Total: 100 hours.
- Tax Prep: 40 hours.
- Review: 60 hours.
- Senior Manager in Tax Prep: 24 hours.
- Manager in Tax Prep: 16 hours.

When the template is applied to a 150-hour job, the user should be able to choose:

- **Scale to job size:** multiply the template by 1.5, preserving the relative shape.
- **Use baseline hours:** keep the template at 100 hours and show that 50 hours remain outside the template.

This gives users the familiar hours-based authoring experience without losing the ability to reuse the template for differently sized jobs.

The model should store separately:

- Baseline hours for the template or requirement.
- The proportional share used for scaling.
- Phase duration and timeline position.
- Resource effort within a phase.

For Phase world:

- Phase hours determine the phase’s share of the baseline template.
- Resource hours determine the split of work within that phase.

For Non-phase world:

- Requirement or booking-type hours determine the baseline shape directly.
- There is no phase weighting.

The UI should expose hours as the primary editing value where that is the customer’s mental model. Percentages can be shown as supporting metadata, such as `40h · 40%`, rather than forcing users to construct a template from percentages of percentages.

Scaling must be explicit at application time or clearly enabled on the template. It should never silently change the target job’s total hours.

### Make the result visible before committing it

Users should be able to see the dates, phases, requirements, and resulting demand before applying a template. Ideally, changes to the deadline, total hours, or phase dates update the preview without requiring the user to leave the flow.

### Support automation as a first-class use case

Manual “Apply template” is useful for discovery and exceptions, but High Volume may need:

- API application.
- Workflow-based application.
- Middleware rules.
- Bulk upload for existing jobs.

## Proposed Creation experience

### 1. Details / template setup

The Creation flow should capture only information needed to identify and govern a template.

Important UI change from the meeting:

- Remove the “Template structure”, “With phases”, or “Without phases” selector from Details.
- Do not make the user decide the whole template structure before they start building demand.
- Let the user optionally add phases from the Timeline when phases are useful.
- Details should remain focused on template identity and scope.

Potential fields:

- Template name.
- Human-readable unique name.
- Configuration profile or equivalent scope.
- Return type or service type.
- Business unit, location, or other classification where those fields genuinely drive availability.
- Optional custom attributes if they are needed for later matching.

Recommended changes:

- Treat the name as a user-facing identifier and enforce uniqueness, or clearly explain the scope of uniqueness.
- Show the configuration profile that controls which phases, booking types, grades, and users are available.
- Avoid implying that these fields automatically select a template at job creation unless that behavior is actually supported.
- Add short guidance explaining that the template is a reusable shape that can be scaled when applied.

Open point:

The conversation moved from “business unit” toward configuration profiles as the more meaningful scope. Confirm whether the UI should show business unit, configuration profile, both, or neither in the first cut. If a configuration requires phases, that should be a configuration rule or Timeline validation, not necessarily a user-facing structure toggle in Details.

### 2. Timeline / demand shape

The Timeline should be the main construction surface rather than a separate abstract structure editor.

Recommended layout:

- A Gantt-like demand shape at the top.
- Resource requirement rows beneath it.
- Optional phase markers aligned to the same week/date scale.
- One shared time axis for phases and resource requirements.
- A clear Add Resource Requirement action.
- Optional Add Phase action when phases are supported.

The phase markers should not use a different time scale from the resource Gantt. The phase shape and resource rows need to line up horizontally so the user can understand the relationship immediately.

### 3. Resource requirement fields

The Add Resource Requirement flow should support the concepts discussed in the meeting:

- Phase, when applicable.
- Booking type or equivalent for non-phase work.
- Grade.
- Project role, if role is part of the demand model.
- Count, if one requirement can request multiple resources.
- Effort.
- Duration.
- Start position or offset.
- Skills, only if skills are in scope for the first release.

The current modal uses:

- Phase or booking type.
- Grade.
- Effort unit.
- Duration in days, weeks, or months.
- Start week.

That is directionally aligned, but the effort model needs to be resolved before treating the controls as final.

### 4. Phases in the Gantt

If phases are retained as optional objects:

- Add Phase should be available from the same Timeline surface.
- Phase selection should use the existing phase library.
- The phase should be added as a coloured block aligned to the resource Gantt.
- A new resource requirement can be created from the selected phase context.
- A requirement should be able to appear in more than one phase without creating a misleading duplicate identity.
- Requirements without a phase should use a neutral “No phase” treatment.

If phases are mandatory in a particular configuration:

- Add Resource Requirement should require a phase selection.
- Starting from an empty template should still allow the user to create the phase first.
- The empty state should explain why a phase is needed rather than leaving the user with a disabled control without context.

### 5. Phase duration, weighting, and utilisation

The meeting distinguishes several concepts that must not be conflated:

- Phase duration: the time window occupied by the phase.
- Phase timeline share: the phase duration as a proportion of the template.
- Resource effort share: the split between resource requirements within a phase.
- Absolute hours: the amount of effort represented by a requirement or job.

Recommended display:

`Tax Prep · 2w · 22%`

Where 22% is derived from the phase duration divided by the total template duration.

On hover or focus, the phase popover should also show how much of the phase time is covered by resource requirement segments:

- Phase: Tax Prep.
- Duration: 2 weeks.
- Timeline share: 22%.
- Resource requirements: 2.
- Utilised: 2 of 2 weeks.
- A compact progress bar or equivalent indicator.

Overlapping resource requirements should count each occupied week once for utilisation. Utilisation is time coverage, not the sum of staffing effort.

### 6. Reusing a requirement across phases

The design needs to support a senior manager or other resource requirement working in more than one phase.

Preferred mental model:

- One logical resource requirement identity.
- Multiple timeline segments.
- Each segment can carry a phase or booking type.
- The Gantt shows each segment in the relevant colour.
- The row remains recognisably one resource requirement.

Avoid forcing users to create two apparently unrelated requirements simply because the same grade or role appears in two phases.

### 7. Scaling and flexing

The creation experience should explain whether it is:

- Building a proportional template.
- Building an absolute-hours example.
- Building an absolute-hours example that can later be flexed.

One possible interaction is:

- Build the template using a typical job.
- Store the shape and its hours.
- At application time, enter the target job hours.
- Scale the phases and requirements proportionally if flexing is enabled.

The preferred interaction is to author from a baseline-hours example and retain the proportional values for scaling. This means a user can understand the template as a typical 100-hour job while the system can apply the same shape to a 50-hour or 150-hour job.

If scaling is not selected, the Apply preview should show the difference between the job’s target hours and the template’s baseline hours rather than silently changing the plan.

The conversation also identified a future “roll forward actuals” use case. A previous year’s actual hours should be able to replace the template’s baseline hours while retaining the historical distribution across phases and bookings. For example, a template based on 10 hours could be applied to 20 hours of actuals without losing the original proportional shape.

If a “flex this template” option is introduced, define whether it belongs:

- On the template.
- On each template version.
- Only at application time.
- In the configuration profile.

### 8. Guidance and onboarding

The group expected this to require some explanation regardless of the final UI.

Potential low-impact support:

- An inline explanation near the first timeline.
- A first-use walkthrough.
- A short video or animated example.
- A sample template preview showing how 50 hours becomes 100 hours while retaining the same proportions.

The guidance should explain:

- Templates describe repeatable demand.
- They can be applied backwards from a deadline.
- The resulting dates can be adjusted before applying.
- Resource requirements may remain unassigned until a later resourcing step.

## Proposed Apply demand to job experience

### 1. Entry point

The user should be able to apply a template from the job creation or job editing flow.

The selector should show enough information to distinguish templates:

- Template name.
- Version.
- Configuration profile or scope.
- Service/return type.
- Phase/non-phase or optional phase status.
- Last updated date.

Avoid relying on a name alone if duplicate or similar names are possible.

### 2. Inputs

The application flow should capture:

- Template.
- Total job hours or size, if scaling is supported.
- Deadline or delivery date.
- Any required start date or date constraints.
- Optional phase milestone dates, if that becomes supported.

The total-hours value may come from an integration rather than manual entry. The UI should distinguish:

- A value supplied by an integration.
- A user-entered value.
- A value calculated from the selected template.

### 3. Backward scheduling

The base application rule discussed was:

1. The user provides a deadline.
2. The system reads the template’s shape.
3. The system scales it if required.
4. The system works backwards from the deadline.
5. The system previews the generated dates and demand.

The preview should make clear which dates are calculated and which are editable.

### 4. Preview before Apply

The user should see the generated plan before bookings or demand are created.

The preview should include:

- Phase bars, when phases are present.
- Resource requirement rows.
- Start and end dates.
- Durations.
- Gaps and buffers.
- Overlap or sequential-work behavior.
- Total hours or effort.
- Any unassigned requirements.

The preview should use the same visual language as Creation. A user should not have to learn a second representation of the same template.

The preferred longer-term experience is a live preview: while the user changes the template, hours, phase dates, or deadline, the generated demand should update alongside the inputs. This could be presented in a panel to the side of the inputs or directly beside the demand section. The user should be able to identify the effect of a change before confirming it.

### 5. Manual adjustments

The meeting suggested that users may need to adjust the automatically calculated result before applying it.

Potential adjustments:

- Change the overall deadline.
- Change a phase start or end.
- Change the gap between phases.
- Scale the entire template.
- Resize individual demand segments.
- Preserve the shape while changing inter-phase gaps.

If users change a phase date, define whether:

- Its requirements move with it.
- Its requirements remain fixed and become invalid.
- The system asks before moving them.

Do not silently create a plan that no longer matches the template rules.

### 6. Apply action and result

The final action should clearly state what will be created:

- Number of resource requirements.
- Number of generated bookings or demand rows.
- Date range.
- Number of unassigned items.
- Any warnings that will remain after applying.

After applying:

- The job should show the generated demand in the normal job experience.
- The user should be able to continue with allocation or assignment.
- The template should not be altered by edits made to the individual job.
- The applied template version should be traceable for audit and future updates.

The generated result should be described consistently as demand or bookings, depending on what the action actually creates. Creation should not imply that a reusable requirement is already an assigned booking, and Apply should make that transition explicit.

### 7. Failure and cancellation states

Define behavior for:

- Missing deadline.
- Missing total hours.
- Template with no valid segments.
- Requirements that cannot be scheduled before the deadline.
- Phase order conflicts.
- Requirements that exceed a phase window.
- Invalid or unavailable grades, roles, phases, or booking types.
- A template version being archived while the user is applying it.
- API or integration failure after partial creation.
- User cancelling after preview but before Apply.

The UI should avoid leaving a partially applied job without explaining what was created and what failed.

## Explicit UI change specification

The following is the concrete UI change list to use when updating the mocks. Items below describe the intended experience, not merely areas for discussion. Where the data model or product rule is still unresolved, the dependency is called out explicitly rather than hidden in the interaction.

### A. Navigation and entry points

1. Keep **Demand templates** inside the Configuration navigation group.
2. Show Demand templates as the active item when the catalogue is open.
3. Keep **Template builder** and **Apply template to job** as separate navigation destinations or clearly labelled related entries.
4. On the catalogue screen, place the **Create** action in the top-right page header with a plus icon.
5. When the creation flow is open, replace the catalogue action with the decorative arrow back icon in the top-left header.
6. The back icon must return to the main Demand templates catalogue, not move back one wizard step.
7. If the draft is untouched, return immediately without a confirmation dialog.
8. If the draft contains progress, show an exit confirmation stating that leaving will discard the progress, with **Keep editing** and **Exit and discard** actions.

### B. Creation — Details step

1. Remove the **Template structure**, **With phases**, and **Without phases** control from Details.
2. Do not ask the user to choose Phase world or Non-phase world before they have started modelling demand.
3. Keep Details limited to template identity and governing scope:
   - Name.
   - Configuration profile, if confirmed as the governing scope.
   - Business unit or equivalent classification only if it drives availability.
   - Return/service type where applicable.
4. Mark genuinely required fields with the existing required-field treatment.
5. Show concise guidance that the template describes reusable demand and can be applied to a job later.
6. Keep the existing field treatment consistent with Dayshape job creation, including the tree picker for hierarchical business-unit selection where that field remains.
7. The **Continue** action must validate the required Details fields and focus the first invalid field.
8. The Details step must not contain a duration field if duration is derived from the Timeline.

### C. Creation — Timeline step

1. Make Timeline the main construction surface for both phased and non-phased templates.
2. Keep one shared horizontal week/date axis for:
   - Optional phase blocks.
   - The demand-shape summary.
   - Resource requirement rows.
3. Put the read-only demand-shape representation above the resource requirement grid.
4. Do not add separate visual rows for buffers unless the team explicitly decides that buffers remain part of the first-cut model. Empty time should otherwise remain visibly empty.
5. When there are no phases, show the resource requirement Gantt without requiring a phase object.
6. When phases are supported, show an empty phase state with an **Add phase** action. The user must be able to add a phase before adding a resource requirement.
7. Add phases from the existing phase library and inherit the library colour.
8. Display phase blocks on the same time axis as the resource Gantt.
9. Allow phase blocks to be moved and resized if phase duration is authoritative.
10. Show phase labels without wrapping. In narrow segments, show only the duration, such as `2w`.
11. Show phase duration and derived timeline share in the phase label or popover, for example `Tax Prep · 2w · 22%`.
12. On phase hover or keyboard focus, show:
    - Phase name.
    - Duration.
    - Timeline share.
    - Number of linked requirements.
    - Utilised weeks out of phase weeks.
    - A compact utilisation indicator.
13. Calculate utilisation from the union of occupied weeks so overlapping requirements are not counted twice.
14. Clearly flag a requirement that starts before, ends after, or otherwise exceeds its phase window.
15. Decide and document whether moving or resizing a phase:
    - Moves linked requirements with it.
    - Leaves requirements fixed and marks them invalid.
    - Asks the user before moving them.
16. Keep the **Add resource requirement** action visually prominent but low intrusion. Use the established default button style where it is an in-grid action.
17. Keep the persistent add row/week affordance so a user can start a requirement at a specific week.
18. The resource requirement modal must include:
    - Phase, when applicable.
    - Booking type, when no phase is used.
    - Grade.
    - Project role where applicable.
    - Effort unit and value.
    - Duration.
    - Start week or agreed relative offset.
19. Duration must support days, weeks, and months, with a clear converted equivalent.
20. A new requirement must default to the first sensible start position, normally after the furthest existing work unless the user clicked a specific week.
21. Keep effort in the modal separate from phase timeline share. Do not use resource effort to silently resize a phase.
22. If percentages remain supported, balance them within the agreed scope and visibly explain what the percentage represents.
23. If Hours remains supported, show whether the value is baseline hours, phase hours, or requirement hours. Do not present an Hours control whose calculation basis is undefined.
24. Allow one logical requirement to have multiple timeline segments.
25. Allow segments belonging to different phases or booking types to inherit different colours while keeping one resource row.
26. Show a neutral treatment for unphased work rather than inventing a phase colour.
27. Allow segments to be dragged, resized, and edited without changing unrelated rows.
28. Keep the timeline responsive:
    - Fill available width when the timeline is short.
    - Preserve readable week columns when multiple months are visible.
    - Use horizontal scrolling when necessary.
    - Keep labels and segment text on one line.
    - Avoid layout shifts caused by the scrollbar.
29. Keep the overlap rule next to the timeline controls:
    - Checkbox: **Allow work to overlap**.
    - Question-mark help control.
    - Hover/focus explanation with a subtle start-to-start versus finish-to-start animation.
30. Show a sequence warning beside the checkbox when the current order conflicts with the selected rule.
31. If overlap is allowed, later work cannot start before earlier work starts.
32. If overlap is not allowed, later work cannot start before earlier work finishes; gaps/buffers are consumed while shunting.
33. Block progression to Review while the sequence warning represents an invalid required order.
34. Gate the Timeline step on valid Details data and at least one valid requirement segment, unless an empty phase-only template is explicitly allowed.

### D. Creation — Review step

1. Keep Review read-only for the demand shape and resource requirement structure.
2. Mirror the same colours, labels, time axis, and terminology used in Timeline.
3. Show the template summary, including:
   - Template name.
   - Governing scope.
   - Total derived duration.
   - Number of requirements.
   - Number of roles/grades where useful.
4. Show optional phases with duration, timeline share, and utilisation.
5. Show resource requirements grouped by phase, booking type, or unphased work.
6. Show each requirement’s effort in the selected unit, with the unit clearly labelled.
7. Show the selected overlap rule using explicit wording:
   - **Overlap allowed · start-to-start**
   - **No overlap · finish-to-start · gaps consumed when shunting**
8. Surface unresolved warnings rather than allowing the user to publish a visually plausible but invalid template.
9. Provide an **Edit timeline** action that returns to Timeline.
10. Keep the final action focused on publishing/saving the template, not on assigning people.

### E. Apply template to job

1. Keep **Apply demand template** in the empty Team state and make the action available from the agreed job-creation entry point.
2. Present enough template metadata in the selector to distinguish versions and scopes:
   - Name.
   - Version.
   - Configuration profile/scope.
   - Service or return type.
   - Phase availability.
   - Last updated date.
3. Capture the job inputs:
   - Selected template.
   - Total job hours or size, when applicable.
   - Deadline or delivery date.
   - Required start/date constraints.
   - Optional milestone overrides if supported.
4. Clearly identify whether hours came from an integration, were entered by the user, or were derived.
5. Add an explicit scaling choice if the template supports both baseline and proportional application:
   - Scale to the target job size.
   - Preserve the template baseline.
6. Show the baseline hours, target hours, and resulting scale factor when scaling is selected.
7. Work backwards from the deadline using the template’s duration, sequence rule, and any retained gaps.
8. Show a live preview while the user changes template, hours, deadline, scaling, or editable dates.
9. Use the same demand-shape and Gantt visual language as Creation.
10. Preview:
    - Optional phase bars.
    - Booking-type or unphased work.
    - Resource requirement rows.
    - Start/end dates.
    - Durations.
    - Gaps and buffers if retained.
    - Effort/hours.
    - Unassigned state.
    - Overlap/sequential behavior.
11. Distinguish calculated dates from user overrides.
12. Allow only the explicitly supported manual adjustments:
    - Overall deadline.
    - Phase dates.
    - Inter-phase gaps.
    - Whole-template scale.
    - Individual demand segment dates or duration.
13. Revalidate phase containment, sequencing, deadline fit, and valid dates after every override.
14. Before Apply, show the result summary:
    - Number of demand requirements.
    - Number of generated bookings, if bookings are created.
    - Date range.
    - Number of unassigned items.
    - Remaining warnings.
15. Make the Apply label state exactly what will be created: demand, bookings, or both.
16. After Apply, show the generated work in the normal job experience, initially unassigned unless the agreed operating model says otherwise.
17. Keep edits to the job-local result from mutating the published template.
18. Show the applied template ID and version for traceability.
19. Provide clear empty, invalid, unavailable-template, deadline-conflict, partial-failure, and cancellation states.

### F. Cross-mock consistency and technical UI requirements

1. Use one shared template schema between Creation and Apply, or document and implement an explicit normalisation boundary.
2. Do not keep the Apply mock on the legacy `phases[] → slots[]` model while Creation uses `resourceRequests[] → segments[]` without showing the conversion.
3. Use one naming system for:
   - Phase.
   - Booking type.
   - Resource requirement.
   - Demand.
   - Booking.
   - Baseline hours.
   - Effort share.
4. Use the same colour source for phases and booking types in both mocks.
5. Keep the same duration semantics in both mocks. Do not mix calendar weeks in Creation with working-day calculations in Apply without explaining the conversion.
6. Keep modal, button-group, field, tooltip, footer, and stepper styles aligned with the Dayshape UI kit.
7. Preserve keyboard and focus access for popovers, Gantt segments, add actions, and stepper navigation.
8. Do not allow the stepper to jump to a step whose required predecessor data is invalid.
9. Keep the current low-impact interaction principle: add information at the point where it is needed, avoid introducing a second structure editor, and do not add configuration screens for automation rules to the Creation flow.

## Automation and bulk application

### API

The API should be able to accept:

- A stable template ID.
- A template version or “latest published” instruction.
- Job identifier.
- Total hours or size.
- Deadline.
- Optional overrides.

Do not rely only on a human-readable name, although a unique human-readable name would make configuration easier.

### Workflow

A possible future workflow action is:

> When a job is created and matches these conditions, apply this demand template.

Potential matching fields:

- Return type.
- Service line.
- Configuration profile.
- Business unit.
- Location.
- Custom fields.
- Integration-provided tags.

The meeting suggested this logic may belong in middleware, a workflow layer, or an integration rather than in the template page itself. The first cut should not assume that users configure complex auto-selection rules in the Creation UI.

The integration direction discussed was to keep API and GIS as core product surfaces, with a middleware layer such as Boomi or Workato handling rules and orchestration where appropriate. The existing EDF-style approach was described as better suited to batch work than real-time API-driven application. This is an architecture direction to validate, not a decision to build into the Creation UI.

### Bulk upload

For large existing job populations, users may need to upload:

- Job identifier.
- Template name or ID.
- Deadline.
- Total hours.
- Optional overrides.

The upload flow should provide:

- Validation before processing.
- A row-level error report.
- Idempotency or duplicate protection.
- A result summary.
- A way to trace each applied template version.

## Outstanding questions for the call

### A. Template representation

1. Is the template fundamentally proportional, absolute-hours, or both?
2. If it is proportional, what is the base quantity used to illustrate and edit it?
3. Can a template be marked as flexible/scalable, or should every template scale?
4. If a template is not scalable, what happens when the target job has a different total?
5. Are hours stored on the template, derived from a sample job, or supplied only at application time?
6. How should rounding work when scaling produces fractional hours, days, or weeks?
7. Does scaling apply equally to phases, requirements, buffers, and gaps?
8. Can users override one requirement after scaling without changing the others?
9. Should hours be the primary authoring value, with percentages calculated and shown as supporting metadata?
10. When baseline hours and target job hours differ, should the default be to scale or to preserve the baseline?
11. Should historical actuals replace baseline hours while preserving the existing phase and requirement proportions?

### B. Phase model

1. Are phases optional within one unified template model, or is Phase world still a separate mode?
2. Can one template contain both phased and unphased requirements?
3. Is “No phase” a valid bucket or only an empty-state/validation state?
4. Does selecting a phase determine only classification and colour, or also constrain the requirement’s dates?
5. Are phase durations stored directly, or derived from their linked requirement segments?
6. Is phase weighting a timeline share, an effort share, or both as separate values?
7. Can users manually edit the phase percentage, or is it always derived from duration?
8. Are empty phases allowed in a saved/published template?
9. What should happen if a requirement extends outside its phase?
10. Can phases overlap?
11. Are buffers still part of the first-cut template model?
12. Are phase milestones required for application, or is the final deadline enough?

### C. Resource requirement model

1. Is a resource requirement a reusable demand row or a future booking definition?
2. Can one requirement have multiple segments across phases?
3. Can one segment change phase or booking type?
4. Does count mean multiple identical resources or one requirement with a quantity?
5. Are project roles required, optional, or derived from grade?
6. Are skills requirements in scope for Creation?
7. Should the same grade/role combination be merged automatically?
8. How should two requirements with the same grade but different phases appear?
9. Does effort mean percentage, hours, or allow both?
10. If both are allowed, can a phase mix percentage and hours?
11. What does the Hours option calculate against?
12. Do resource effort percentages total 100% within each phase, booking type, or entire template?

### D. Creation and editing

1. Should the Details step contain only template identity and scope, with no Template structure selector?
2. Should configuration profile replace business unit as the main scope field?
3. Can users add a phase before any resource requirement?
4. Should phases be optional by default, with configuration rules determining when they are required?
5. Should Add Resource Requirement be disabled until a phase exists in a phase-required configuration?
6. Should clicking a phase preselect it in the resource modal?
7. Should the phase and resource Gantts share exactly the same time axis?
8. Can users edit phase duration directly in the top shape?
9. What happens to requirements when a phase is moved or resized?
10. Should gaps/buffers be explicit template objects or simply empty time?
11. Is reordering performed by dragging phase blocks, editing dates, or both?
12. Should phase selection be retained when opening the Add Resource modal?
13. What is the minimum first-cut guidance needed for proportional scaling?

### E. Apply-to-job behavior

1. Where is Apply template exposed: job creation, job editor, demand panel, or all three?
2. Is total job hours manually entered, integration-provided, or both?
3. Is the deadline always required?
4. Does the system work backwards from one final deadline or support phase milestones?
5. Can the user change the calculated start date?
6. Can the user change phase starts/ends before applying?
7. If a phase moves, do its requirements move automatically?
8. Can the user resize individual requirements in the preview?
9. Is the preview live as inputs change, or generated after a Continue action?
10. Does Apply create resource requirements only, bookings, or both?
11. Are created bookings unassigned by default?
12. Can the user select people during the apply flow, or is allocation a later step?
13. What happens when the template cannot fit before the deadline?
14. Can the user apply a template more than once to the same job?
15. What happens when a newer template version exists after a job was created?
16. Should a job retain the template ID and version used?

### F. Automation and governance

1. Is automatic template selection configured in Dayshape, middleware, workflow, or the integration?
2. Which fields are available to matching rules?
3. Is API application more important than manual application for the first High Volume release?
4. Is bulk upload required for the first release?
5. How are permissions and configuration-profile visibility enforced?
6. Can users apply only published templates?
7. Can a template be archived without affecting existing jobs?
8. How are template versions named and selected by API/workflow?
9. What happens when a template is changed after it has been used?
10. What audit information is required?

### G. MVP scope

1. Which flow must be ready for the first release:
   - Manual Creation.
   - Manual Apply.
   - API Apply.
   - Workflow Apply.
   - Bulk upload.
2. Is the first release allowed to create unassigned demand only?
3. Is automatic resource suggestion out of scope?
4. Are manual people pickers out of scope?
5. Are skills, buffers, phase milestones, and configuration rules first-cut or follow-up items?
6. Which existing backend capabilities are production-ready?
7. Which prototype interactions are only illustrative and should not be promised?

## Recommended first-cut direction

Subject to the open questions above, the lowest-risk first cut would be:

1. Create a template with a unique name and configuration scope.
2. Build the demand shape in one shared Gantt-oriented Timeline.
3. Add resource requirements with grade, optional role, effort, duration, and timing.
4. Allow optional phase or booking-type association.
5. Keep resource requirements unassigned.
6. Author the template using baseline hours while storing proportional values for reuse.
7. Make scaling explicit when the target job differs from the baseline.
8. Keep Details focused on identity and scope; do not expose a Template structure toggle.
9. Add phases optionally from the Timeline rather than requiring a structure decision up front.
10. Apply the template backwards from a required deadline.
11. Show a read-only or lightly editable preview before Apply.
12. Create demand/resource requirements on the job.
13. Preserve the template ID and version on the generated job demand.
14. Leave automatic matching rules, solver-based allocation, suggestions, and bulk upload as explicitly scoped follow-up work unless engineering confirms they are already supported.

## Suggested call agenda

1. Confirm that the Template structure selector should be removed from Details.
2. Confirm whether phases are optional within one unified template model or required by configuration.
3. Decide whether baseline hours plus proportional scaling is the preferred dual-mode model.
4. Define the meaning of effort percentage versus hours.
5. Confirm the default behavior when target job hours differ from baseline hours.
6. Confirm whether phase duration constrains resource requirement dates.
7. Walk through one phased example from Creation to Apply.
8. Walk through one non-phase example from Creation to Apply.
9. Confirm what Apply creates: demand, bookings, or both.
10. Confirm manual versus automated application priorities.
11. Agree the first-cut scope and explicitly park follow-up features.
12. Identify production-ready backend capabilities and owners for unresolved technical questions.

## Definition of a good outcome from the call

The team should leave with:

- One agreed template data model.
- One agreed Creation interaction.
- One agreed Apply-to-job interaction.
- Clear rules for phases, effort, scaling, and deadlines.
- A decision on whether phase selection is mandatory, optional, or inferred.
- A first-cut scope that does not promise unreleased solver, suggestion, workflow, or bulk-upload functionality.

## Questions to ask on the call

Use these questions to drive the discussion toward decisions rather than collecting general feedback.

### Understand the customer’s current process

1. How do you create this type of demand today?
2. Do you start from a typical job, a known number of hours, a set of phases, or a list of resource requirements?
3. Do you normally know the total job hours when the job is created?
4. Do you normally know the deadline at the same time?
5. Which values come from an integration, and which values does a user choose?
6. Are phases used consistently, or are there jobs where phases are not meaningful?
7. Do you ever need a mixture of phased and unphased work on the same job?
8. Do you reuse the same grade or role across multiple phases?
9. Do you need one requirement to appear in several separate time segments?

### Validate the hours and scaling model

1. Would you rather create a template from a typical 100-hour job or directly from percentages?
2. When applying that template to a 150-hour job, should it scale automatically, ask first, or stay at 100 hours?
3. Should every template be scalable, or should the author choose whether it can flex?
4. If the template is not scaled, how should the UI show the difference between template hours and job hours?
5. Should users edit hours, percentages, or both?
6. If both are shown, which one is the source of truth?
7. What should happen when scaling creates fractional hours or days?
8. Should buffers and gaps scale as well as working time?
9. When actuals from a previous year are available, should they be used to create or adjust the template?

### Clarify phases and resource requirements

1. Should a user be able to create a phase before adding any resource requirements?
2. Is selecting a phase mandatory, optional, or inferred from the requirement?
3. Does choosing a phase only classify and colour the requirement, or does it constrain its dates?
4. What should happen if a requirement extends beyond its phase?
5. Should the system move requirements when a phase is moved, or ask for confirmation?
6. Is phase percentage a share of time, a share of hours, or a separate business concept?
7. Should phase percentage be derived from duration or manually editable?
8. What does “too much” resource demand mean: too many hours, work outside the phase, too many people, or a capacity issue?
9. Should overlapping requirements count once or multiple times when showing phase utilisation?
10. Are empty phases valid, and if not, at what point should they be rejected?

### Validate the Creation UI

1. Does the Gantt make it clear what the template will create on a job?
2. Is the shared resource requirement grid easier to understand than separate lists inside each phase?
3. Is it clear whether a row is a requirement, a booking, or an assigned person?
4. Is the phase or booking-type selector in the Add Resource modal understandable?
5. Are duration units of days, weeks, and months all needed?
6. Is Start week the right concept, or should the UI use a relative offset?
7. Are grades and roles enough, or are skills required at creation time?
8. Should the first requirement automatically start after existing work?
9. Is the timeline too dense when several months are shown?
10. What guidance would users need the first time they create a template?

### Validate the Apply-to-job UI

1. Where would users expect to apply a template?
2. Should the template be selected during job creation, from the job editor, or from the demand panel?
3. Should users see a live preview while changing total hours or the deadline?
4. Which calculated dates should users be allowed to edit?
5. If a phase date changes, should its requirements move automatically?
6. Should users be able to adjust individual requirements before applying?
7. Does Apply create demand requirements, bookings, or both?
8. Should generated bookings be unassigned by default?
9. Should resource allocation happen in a separate step?
10. What should happen if the template cannot fit before the deadline?
11. Can a template be applied more than once to a job?
12. How should the job record which template version was applied?

### Understand operating models and permissions

1. Who creates templates?
2. Who is allowed to apply them?
3. Who is responsible for allocating people after application?
4. Is the customer operating with a dedicated resource manager?
5. If not, should engagement managers be able to allocate people themselves?
6. Should the apply flow support suggestions, manual selection, or only unassigned demand?
7. Which configuration profile controls access to templates and phase traits?
8. Should customers be able to configure automatic template selection rules?
9. Would those rules live in Dayshape, workflow, middleware, or the integration?

### Confirm automation and scale

1. Is manual application enough for the first release?
2. Does High Volume require API application from the start?
3. Do customers need workflow-based application when a job is created?
4. Do customers need to apply templates to existing jobs by bulk upload?
5. What fields would a bulk upload contain?
6. How should duplicate applications be prevented?
7. What should happen if only some uploaded jobs are valid?
8. Which existing solver, advice, or suggested-worker capabilities are production-ready?
9. Which capabilities are prototypes only and must not be promised?
10. What is the smallest end-to-end flow that delivers value at launch?

### Close the call with explicit decisions

Before ending the call, ask the group to confirm:

1. The template’s primary authoring model.
2. Whether baseline hours and proportional scaling are both supported.
3. Whether phases are mandatory, optional, or inferred.
4. The meaning of phase weighting and resource effort weighting.
5. What happens when work exceeds a phase or deadline.
6. What the Apply action creates.
7. Who owns resource allocation after Apply.
8. The first-release scope.
9. The features that are explicitly deferred.
10. The owner and next step for every unresolved technical question.

## Transcript-to-mock comparison

This section records what is already represented in the two current prototypes and what remains absent or inconsistent. It is intended to prevent the meeting discussion from being mistaken for already agreed or implemented functionality.

### Creation mock: currently represented

File: `mocks/demand-profile-templates.html`

- Demand templates catalogue.
- Three-step Details, Timeline, and Review flow.
- Phase-world and non-phase-world selection.
- Business unit selection.
- Resource-request-first Timeline Gantt.
- Phase and booking-type colours.
- Resource requirement modal with grade, role, effort, duration, and start week.
- Duration entry in days, weeks, and months.
- Multiple segments for a resource requirement.
- Reordering, moving, and resizing timeline segments.
- Overlap/sequential-work setting with warning and help popover.
- Read-only demand shape in Timeline and Review.
- Review summary and resource requirement tables.
- Unsaved-progress exit confirmation.
- Configuration-style navigation with Demand templates as a submenu item.

### Creation mock: not yet represented from the transcript

- An empty Phase-world state where the user can add a phase before adding requirements.
- Add Phase using the available phase-trait library.
- Phase blocks aligned to the same time scale as the resource Gantt.
- Phase duration as an explicit object that can constrain linked requirements.
- Phase timeline share such as `2w · 22%`.
- Phase utilisation in the existing demand-shape hover popover.
- A progress indicator showing covered phase time without double-counting overlapping requirements.
- Clear overflow handling when a requirement starts before or ends after its phase.
- A user choice to scale a baseline-hours template or preserve its baseline hours.
- A separate, fully defined data model for baseline hours, proportional share, phase hours, and resource hours.
- Roll-forward from historical actual hours.
- Importing an existing job as the starting point for a template.
- A first-use explanation of how baseline hours scale when applied to a different-sized job.
- A final decision on configuration profile versus business unit as the governing scope.
- A final decision on whether phases are optional within one template or represented by the current Phase-world toggle.

The current mock still exposes Phase world / Non-phase world as a Details choice. Based on the transcript, this should be treated as a known divergence to remove in a later mock update, not as the recommended final interaction.

The current Effort control visually supports Percentage and Hours, but the product meaning of Hours is not yet fully defined. Creation currently still validates and balances the underlying percentage value, so this should not be treated as a completed hours model.

### Apply-to-job mock: currently represented

File: `mocks/job-editor-apply-template.html`

- Apply demand template action from the empty Team state.
- Template selector.
- Total hours input.
- Project end-date input.
- Backward scheduling from the deadline.
- Calculated phase and buffer dates.
- Preview bar and preview table.
- Editable start and end dates in the preview.
- Phase share, hours, worker count, and date information.
- Apply action that creates unassigned worker rows in the job Gantt.
- A visible route from an empty job to a first demand plan.

### Apply-to-job mock: not yet represented from the transcript

- A clear choice between scaling to the target job hours and preserving baseline template hours.
- Baseline template hours and the resulting scale factor.
- A visible explanation of which values are calculated and which are user overrides.
- Shared data with the Creation mock.
- Non-phase templates and booking-type-based demand.
- The newer resource-request/segment model.
- A single logical resource requirement with segments across multiple phases.
- A live preview presented alongside the relevant inputs rather than only inside a modal preview section.
- Explicit phase milestone editing while preserving the shape and changing only the gaps.
- Validation for phase containment, sequence conflicts, deadline overflow, and invalid dates after manual edits.
- Clear distinction between generated demand requirements and generated bookings.
- Explicit unassigned-demand state after Apply.
- Template ID and version traceability on the job.
- A clear result for partial or failed application.
- Historical actuals replacing baseline hours while preserving proportions.
- API or GIS application.
- Workflow-based automatic application.
- Bulk upload for applying templates to existing jobs.

The Apply mock is currently based on a separate legacy structure:

- `template.phases[]`
- Phase `weight`
- Phase `slots[]`
- Slot `sharePercent`
- Buffers as phase-like objects

The Creation mock is based on:

- `resourceRequests[]`
- Requirement identity and type fields
- Requirement `segments[]`
- Segment `startWeek` and `durationWeeks`

These models cannot be treated as interchangeable without a normalisation or migration decision. This is the most important technical inconsistency between the current mocks.

The Apply mock also automatically distributes the entered target hours using phase weights. That demonstrates the proportional-scaling idea, but it does not yet demonstrate the proposed choice to scale or preserve baseline hours.

### Transcript discussion not represented in either mock

The meeting also covered adjacent portfolio and allocation questions. These should remain visible as dependencies but should not be silently added to the templating scope:

- How an engagement manager gets from unassigned demand to an initial team when no people are loaded into the Gantt.
- Different operating models:
  - Centralised resource manager allocates work.
  - Engagement manager allocates work.
  - Engagement manager creates suggestions for a resource manager.
  - Engagement manager leaves all work unassigned for another team.
- Reusing or adapting suitable-worker and advice functionality.
- The limitation that advice may optimise the whole unassigned problem rather than each row independently.
- Whether manual people selection is appropriate or too subjective.
- Whether rejected advice results should be remembered on a rerun.
- Whether resource breakdown, filtering, zoom, or heat-map views are required in the first portfolio release.
- Whether team skills should be removed from the first portfolio cut and added later to individual resource requirements.
- The need to confirm which existing solver, advice, and suitable-worker capabilities are production-ready.

These issues affect what happens after Apply, but they do not necessarily belong in the Creation mock or the first Apply interaction.

### Comparison-driven decisions still required

Before the mocks can be considered aligned, the team should decide:

1. Whether both mocks will use the shared resource-request/segment model.
2. Whether the Apply mock should support both phased and non-phased templates.
3. Whether baseline hours are the primary authoring value.
4. Whether scaling is automatic, optional, or selected per application.
5. Whether phase duration is authoritative and whether it constrains requirement segments.
6. Whether phase share is derived from duration or manually editable.
7. Whether hours and percentages can coexist and how they convert.
8. Whether Apply creates demand requirements, bookings, or both.
9. Whether generated work starts unassigned.
10. Which allocation model is in scope after Apply.
11. Whether live preview is required for the first cut.
12. Which automation path is prioritised: manual, API/GIS, workflow, or bulk upload.

Until these decisions are made, the two mocks should be presented as directional UI explorations rather than a single end-to-end specification.
