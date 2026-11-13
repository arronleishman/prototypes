-- Seed / refresh the Kanban board usability session after supabase-usability-tests.sql.
-- The participant mock is practitioner-kanban; kanban-demo-scenarios.html and
-- practitioner-kanban-scenarios.html define the task sequence (including gap probes).
-- Re-running updates intro + tasks for the titled active test instead of leaving a stale row.

with payload as (
  select
    'practitioner-kanban'::text as prototype_id,
    'Kanban board · 22 Sep demo usability session'::text as title,
    'Please work through these Kanban scenarios in order. Think aloud as you decide what to do. We are testing whether status, defer, hold, resume, done, and readiness behaviour is clear — and also probing incomplete or not-MVP behaviours such as shunting, mid-progress defer, week rollover, and return to pool — not your performance. The session is based on mocks/kanban-demo-scenarios.html and mocks/practitioner-kanban-scenarios.html.'::text as intro,
    'active'::text as status,
    jsonb_build_array(
      jsonb_build_object(
        'id', 's01-start-work',
        'title', 'S01 · Start work',
        'instruction', 'Find Smith Manufacturing Inc. · Preparation in To Do and move it to In Progress. Tell us what you expect to happen to its schedule.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Was it clear that starting work changes status but does not move the booking?'
      ),
      jsonb_build_object(
        'id', 's04-complete-without-start',
        'title', 'S04 · Complete without starting',
        'instruction', 'Try dragging a scheduled To Do card straight to Done, then try the same with a pooled To Do card. Explain what you expect in each case.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Was it clear why pooled work cannot skip To Do → Done while scheduled work can?'
      ),
      jsonb_build_object(
        'id', 's05-defer',
        'title', 'S05 · Defer scheduled work',
        'instruction', 'Find a scheduled Preparation card in To Do, such as Cascade Timber Works, and defer it to next week. Do not put it On Hold. Explain what should happen to later bookings and the review phase.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Was the difference between Defer and On Hold clear? Did you expect a warning about review risk?'
      ),
      jsonb_build_object(
        'id', 's06-mid-progress-defer',
        'title', 'S06 · Mid-progress “not this week”',
        'instruction', 'You are mid-progress on a card and realise you will not finish it this week. Try to defer it. If you cannot, say what you reach for instead (for example On Hold) and what you expected.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Did you look for a Defer action from In Progress, or was On Hold the obvious path?'
      ),
      jsonb_build_object(
        'id', 's07-hold',
        'title', 'S07 / S08 · Put work On Hold',
        'instruction', 'Move a piece of work to On Hold because of an external blocker. Enter a reason and unblock date, then review and confirm the impact.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Did the impact information help you decide what to do next? Who would normally fix the later schedule?'
      ),
      jsonb_build_object(
        'id', 'shunting-after-defer-hold',
        'title', 'Shunting after defer / hold',
        'instruction', 'After deferring or holding work that has later same-phase bookings, look at next week (and later weeks if visible). Tell us what happened to those later bookings and what you expected.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Did you expect later bookings in the same phase to shift automatically (shunting)?'
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
        'id', 's11-s20-reopen',
        'title', 'S11 / S20 · Reopen Done',
        'instruction', 'In the current week, reopen a Done card to In Progress, then try reopening another to To Do. Navigate to a previous week and try to reopen Done there.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Was the current-week-only reopen rule clear? What would you change about past-week lock?'
      ),
      jsonb_build_object(
        'id', 's12-s13-ready',
        'title', 'S12 / S13 · Readiness signal',
        'instruction', 'Find the Ready indicator on a Preparation card. Tell us what it means, whether it should affect starting work, and what you would expect after returned work is ready.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Did the Ready signal look like information or a hard rule? What would you change?'
      ),
      jsonb_build_object(
        'id', 's21-create-booking',
        'title', 'S21 · Create booking',
        'instruction', 'Create a booking from the board into this week, then create another into next week. Confirm where each card appears.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Was creating demand from the board easy to find, and was the week target clear?'
      ),
      jsonb_build_object(
        'id', 's22-return-to-pool',
        'title', 'S22 · Return to Pool',
        'instruction', 'Return an assigned pooled card to the pool using the Return to Pool drop zone (not delete). Explain what you think happens to assignment and capacity.',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Was it clear this is not deleting the work? What did you expect to happen to capacity?'
      ),
      jsonb_build_object(
        'id', 's17-overdue-next-week',
        'title', 'S17 · Overdue / next week',
        'instruction', 'Find an overdue or untouched To Do from a prior week. Navigate into the next week and say what you think should happen to that work (stay overdue, auto-roll, prompt, etc.).',
        'success', jsonb_build_object('type', 'manual', 'value', ''),
        'prompt', 'Did the overdue cue help? What should happen when a new week opens with untouched To Do?'
      )
    ) as tasks
),
updated as (
  update usability_tests u
  set
    intro = p.intro,
    status = p.status,
    tasks = p.tasks
  from payload p
  where u.prototype_id = p.prototype_id
    and u.title = p.title
  returning u.id
)
insert into usability_tests (prototype_id, title, intro, status, tasks)
select p.prototype_id, p.title, p.intro, p.status, p.tasks
from payload p
where not exists (select 1 from updated);
