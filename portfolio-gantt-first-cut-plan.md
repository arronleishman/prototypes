# Engagement Portfolio — Gantt First-Cut Plan

## Context

The first Portfolio Gantt cut should demonstrate the in-flight portfolio experience: an Engagement Manager can see their engagements, understand the current workload, and identify where work or capacity needs attention.

The main unresolved product question is how a portfolio gets from a set of unassigned resource requests to an initial team. This needs to work across different customer resourcing models, so the first release should avoid assuming that every customer has the same permissions or operating model.

## First-cut UI changes

### Gantt controls

- Remove the **Team Skills** button from the Portfolio Gantt for the first cut.
  - Skills can still be added when creating an individual resource requirement.
- Keep the availability view.
- Keep zoom in/out controls.
- Consider supporting a toggle between the slim availability view and the full heat-map view.
- Show resource breakdown only if the underlying aggregation functionality is available for the release.

### Settings menu

Use the settings menu from the **Gantt aggregation mock** as the source pattern. The functionality overlaps, so Portfolio should reuse the same structure, terminology, interaction model, and visual treatment rather than introducing a second settings menu.

The Portfolio settings menu should support, subject to release scope:

- Gantt start date
- Visible time / planning horizon
- Moving backwards and forwards through the planning horizon
- Availability display settings
- Suitability scoring settings
- Slim versus full availability / heat-map display
- Resource breakdown, if supported by the first-cut aggregation implementation

Any Portfolio-specific settings should be added as sections to the shared pattern, not as a separate menu design.

Reference:

- `mocks/gantt-resource-breakdown.html`
- Settings menu implementation around the `Menu` / `Flyout` components

### Selection side panel

The Portfolio Gantt should include the existing Dayshape-style selection side panel used by the Gantt aggregation mock. Do not create a second detail-panel pattern for Portfolio.

Reference:

- `mocks/gantt-resource-breakdown.html`
- `.Panel`, `.Panel-head`, `.Panel-body`, and the existing booking-selection logic

#### Selection behaviour

- Clicking a booking/item selects it and opens the side panel.
- The selected item should receive a clear selected state in the Gantt.
- The side panel should show the selected booking’s context, including engagement, resource, dates, phase, effort, and relevant actions.
- Clicking another item replaces the current selection and updates the panel.
- Ctrl/Cmd-click adds or removes items from a multi-selection.
- Multi-selection should use the existing “dash mode” panel treatment rather than trying to display misleading single-item values.
- Clicking the only selected item again clears the selection and closes or resets the panel.
- Clicking an empty area should clear the selection where consistent with the existing Gantt behaviour.
- Double-click should retain its separate create/edit action and must not be confused with single-click selection.

#### Panel structure

Reuse the existing panel structure:

- Fixed right-hand panel with a clear close button
- Header containing the item title, engagement code/context, and primary actions
- Scrollable body
- Collapsible sections for schedule, phases, and other item details
- Existing Dayshape input groups, buttons, spacing, borders, and surface tokens

The panel should be available for both:

1. Assigned bookings, where the resource and booking details are known.
2. Unassigned requests, where the panel should make the missing resource explicit and expose the appropriate next action once the assignment model is decided.

Before implementation, verify the corresponding production Dayshape component/API so the mock follows the real panel’s content and permission model. The aggregation mock is the current visual and interaction reference.

## Initial team / unassigned work problem

The most important flow to resolve is:

> An Engagement Manager opens a portfolio containing unassigned work. How do they find and allocate suitable people when no team is currently loaded?

This needs to be considered across these models:

1. A central Resource Manager allocates the work.
2. An Engagement Manager has permission to allocate the work directly.
3. An Engagement Manager creates suggestions for a Resource Manager to approve.
4. The customer uses Solver / Advise to produce an initial allocation.
5. The portfolio remains read-only and is only used to communicate requirements.

Potential UI actions include:

- **Find suitable workers**
- **Allocate resources**
- **Create suggestions**
- **Run Solver / Advise**

The final action and wording depend on the customer’s resourcing model and the permissions available to the current user.

## Suggested first-cut direction

- Support the in-flight view and unassigned resource requirements first.
- Make the unassigned state explicit and easy to understand.
- Add a clear entry point for the eventual assignment flow, but do not imply that a final allocation model has been decided.
- Reuse existing Gantt aggregation and availability patterns.
- Treat suggestions and the unreleased Suitable Workers flow as follow-up candidates unless product and engineering confirm they are viable for the release.

## Decisions still required

- Should the first cut include Portfolio filters?
  - Filters may help with larger portfolios, but they may add little value for small teams.
  - Validate with customers before committing to a broad filter set.
- Is resource breakdown available for the release?
- Is the first assignment action allocation, suggestion creation, Solver / Advise, or a combination controlled by permissions?
- Should Portfolio support full heat-map mode in addition to the slim view?
- Which settings are genuinely user-configurable versus derived from environment or configuration-profile settings?

## Follow-up discovery

Run an internal session with representatives from Scheduling and Professional Services to validate:

- The resourcing models Portfolio must support.
- The permissions an Engagement Manager should have.
- Whether the initial team should be created manually, suggested, or solved automatically.
- Whether the first-cut experience should optimise for centralised or decentralised resourcing.

Customer sessions should also test:

- Whether filters are needed at Portfolio scale.
- Whether users understand unassigned requests and what action they expect to take.
- Whether Solver / Advise provides an acceptable starting point.
- Whether customers need to choose alternative workers or accept the system recommendation.

## Scope split

### First-cut / current design scope

- Tidy the Portfolio Gantt.
- Remove Team Skills.
- Reuse the Gantt aggregation settings menu.
- Add the Gantt aggregation side panel and booking selection behaviour.
- Show the in-flight portfolio experience.
- Represent unassigned work clearly.
- Keep the design flexible while the assignment model is validated.

### Separate follow-up work

- Suitable Workers / manual allocation flow.
- Suggestion creation and Resource Manager approval.
- Solver / Advise integration.
- Portfolio filtering.
- Full resource breakdown if not available for the first cut.
- Alternative-worker selection and rejection handling.
