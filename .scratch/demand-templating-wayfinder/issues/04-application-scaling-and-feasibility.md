Type: grilling
Status: open

## Question

What should happen when a template is applied to an engagement, especially when the resulting demand does not fit the available capacity?

The decision must cover:

- Whether templates represent a proportional shape, a typical absolute-hours job, or both.
  - Strong direction: support both concepts. Percentages suit longer consulting work; absolute hours suit service lines with known typical effort.
- When scaling is offered and who controls it.
  - Not answered yet. The discussions support scaling at application time, but do not settle the control, default, or UI location.
- How deadline-driven scheduling works.
  - Current understanding: applying a template should work backwards from the engagement deadline where scheduling is required.
- Whether generated demand is previewed before committing.
  - Strong direction: yes. Users should see the generated demand before committing it.
- How infeasible hours or unavailable people are communicated.
  - Template creation should not be blocked by real-world capacity. The Apply flow should identify infeasibility, but the exact warning, resolution, and interaction are not answered yet.
- What belongs in template creation versus Apply-to-engagement.
  - Creation defines the reusable demand intent and shape. Apply-to-engagement handles deadline placement, scaling, availability, and feasibility.
- How manual edits, API application, and bulk application fit the same model.
  - Strong direction: all application paths should use the same underlying semantics. The precise API, bulk, and post-application editing behaviour is not answered yet.
- Whether every template stores both a shape and an hours baseline.
  - Not answered yet.
