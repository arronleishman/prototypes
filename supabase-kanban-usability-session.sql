-- Seed the Kanban board usability session after supabase-usability-tests.sql.
-- The participant mock is practitioner-kanban; kanban-demo-scenarios.html is the
-- source storyboard used to define the task sequence.

insert into usability_tests (prototype_id, title, intro, status, tasks)
select
  'practitioner-kanban',
  'Kanban board · 22 Sep demo usability session',
  'Please work through these Kanban scenarios in order. Think aloud as you decide what to do. We are testing whether status, defer, hold, resume, done, and readiness behaviour is clear — not your performance. The session is based on mocks/kanban-demo-scenarios.html.',
  'active',
  jsonb_build_array(
    jsonb_build_object(
      'id', 's01-start-work',
      'title', 'S01 · Start work',
      'instruction', 'Find Smith Manufacturing Inc. · Preparation in To Do and move it to In Progress. Tell us what you expect to happen to its schedule.',
      'success', jsonb_build_object('type', 'manual', 'value', ''),
      'prompt', 'Was it clear that starting work changes status but does not move the booking?'
    ),
    jsonb_build_object(
      'id', 's05-defer',
      'title', 'S05 · Defer scheduled work',
      'instruction', 'Find a scheduled Preparation card in To Do, such as Cascade Timber Works, and defer it to next week. Do not put it On Hold. Explain what should happen to later bookings and the review phase.',
      'success', jsonb_build_object('type', 'manual', 'value', ''),
      'prompt', 'Was the difference between Defer and On Hold clear? Did you expect a warning about review risk?'
    ),
    jsonb_build_object(
      'id', 's07-hold',
      'title', 'S07 / S08 · Put work On Hold',
      'instruction', 'Move a piece of work to On Hold because of an external blocker. Enter a reason and unblock date, then review and confirm the impact.',
      'success', jsonb_build_object('type', 'manual', 'value', ''),
      'prompt', 'Did the impact information help you decide what to do next? Who would normally fix the later schedule?'
    ),
    jsonb_build_object(
      'id', 's10b-resume',
      'title', 'S10b · Resume early',
      'instruction', 'Resume the held work early. Look at how completed effort and the remaining work are represented, then explain whether the two pieces make sense.',
      'success', jsonb_build_object('type', 'manual', 'value', ''),
      'prompt', 'Was the split between completed work and remaining work understandable?'
    ),
    jsonb_build_object(
      'id', 's03-done',
      'title', 'S03 · Complete work',
      'instruction', 'Move a card to Done and choose between completing this week and fully completing the phase. Explain what you think happens to future bookings in each case.',
      'success', jsonb_build_object('type', 'manual', 'value', ''),
      'prompt', 'Which completion option matched your expectation, and what wording would make the difference clearer?'
    ),
    jsonb_build_object(
      'id', 's12-s13-ready',
      'title', 'S12 / S13 · Readiness signal',
      'instruction', 'Find the Ready indicator on a Preparation card. Tell us what it means, whether it should affect starting work, and what you would expect after returned work is ready.',
      'success', jsonb_build_object('type', 'manual', 'value', ''),
      'prompt', 'Did the Ready signal look like information or a hard rule? What would you change?'
    )
  )
where not exists (
  select 1
  from usability_tests
  where prototype_id = 'practitioner-kanban'
    and title = 'Kanban board · 22 Sep demo usability session'
);
