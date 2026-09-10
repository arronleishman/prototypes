/* Anonymous multi-task usability-test widget for public mocks. */
(function (global) {
  'use strict';

  if (global.__protoUsabilityLoaded || window.self !== window.top) return;
  global.__protoUsabilityLoaded = true;

  var store = global.PrototypesUsabilityTests;
  if (!store) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function prototypeId() {
    var root = document.documentElement;
    var id = root.getAttribute('data-prototype-id') || '';
    if (!id) {
      var match = (location.pathname || '').match(/\/mocks\/([^/]+?)(?:\.html)?\/?$/i);
      if (match) id = decodeURIComponent(match[1]);
    }
    return id.trim();
  }

  var id = prototypeId();
  if (!id) return;

  var telemetry = global.PrototypesTelemetry;
  var telemetryContext = global.__protoTelemetryContext || {};
  var sessionId = telemetryContext.sessionId || store.uid('session');
  var test = null;
  var run = null;
  var currentIndex = 0;
  var taskStartedAt = null;
  var ended = false;
  var pendingAdvance = null;
  var root = null;
  var card = null;
  var issueForm = null;

  function addStylesheet() {
    var script = document.currentScript;
    var src = script && script.src ? script.src.replace(/\.js(?:[?#].*)?$/i, '.css') : '../shared/usability-test.css';
    if (document.querySelector('link[data-proto-usability-style]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.setAttribute('data-proto-usability-style', 'true');
    document.head.appendChild(link);
  }

  function track(eventType, meta) {
    if (!telemetry || !telemetry.track) return;
    telemetry.track({
      prototypeId: id,
      sessionId: sessionId,
      eventType: eventType,
      pageUrl: location.href,
      pagePath: location.pathname + location.search,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      scrollY: window.scrollY,
      scrollMax: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      meta: Object.assign({ testId: test && test.id, runId: run && run.id }, meta || {}),
    });
  }

  function currentTask() {
    return test && test.tasks ? test.tasks[currentIndex] : null;
  }

  function setOpen(open) {
    if (!root) return;
    root.hidden = false;
    if (card) card.hidden = !open;
    var launch = root.querySelector('.ProtoUsability-launch');
    if (launch) launch.hidden = open;
  }

  function renderIntro() {
    card.innerHTML =
      '<div class="ProtoUsability-head"><h2>' + escapeHtml(test.title) + '</h2>' +
        '<button type="button" class="ProtoUsability-close" data-usability-close aria-label="Close usability test">&times;</button></div>' +
      '<div class="ProtoUsability-body">' +
        '<p>' + escapeHtml(test.intro || 'Complete the tasks below. Your interactions help us understand what is clear and what needs improving.') + '</p>' +
        '<div class="ProtoUsability-actions"><button type="button" class="ProtoUsability-button" data-usability-start>Start test</button></div>' +
      '</div>';
  }

  function renderTask() {
    var task = currentTask();
    if (!task) return;
    card.innerHTML =
      '<div class="ProtoUsability-head"><h2>' + escapeHtml(test.title) + '</h2>' +
        '<button type="button" class="ProtoUsability-close" data-usability-close aria-label="Close usability test">&times;</button></div>' +
      '<div class="ProtoUsability-body">' +
        '<div class="ProtoUsability-progress">Task ' + (currentIndex + 1) + ' of ' + test.tasks.length + '</div>' +
        '<p class="ProtoUsability-task">' + escapeHtml(task.instruction) + '</p>' +
        '<div class="ProtoUsability-actions">' +
          '<button type="button" class="ProtoUsability-button" data-usability-done>Mark task complete</button>' +
          '<button type="button" class="ProtoUsability-button is-secondary" data-usability-skip>Skip</button>' +
        '</div>' +
        '<button type="button" class="ProtoUsability-issue" data-usability-issue>Report a problem</button>' +
        '<div class="ProtoUsability-issue-form" hidden>' +
          '<textarea maxlength="500" placeholder="What felt difficult or unclear?"></textarea>' +
          '<button type="button" class="ProtoUsability-button is-secondary" data-usability-submit-issue>Send report</button>' +
        '</div>' +
        '<p class="ProtoUsability-status" data-usability-status aria-live="polite"></p>' +
      '</div>';
  }

  function renderComplete() {
    card.innerHTML =
      '<div class="ProtoUsability-head"><h2>Test complete</h2>' +
        '<button type="button" class="ProtoUsability-close" data-usability-close aria-label="Close usability test">&times;</button></div>' +
      '<div class="ProtoUsability-body"><p>Thank you. Your task results have been recorded.</p>' +
        '<div class="ProtoUsability-actions"><button type="button" class="ProtoUsability-button is-secondary" data-usability-close>Close</button></div>' +
      '</div>';
  }

  function renderFollowUp(task) {
    card.innerHTML =
      '<div class="ProtoUsability-head"><h2>Task feedback</h2>' +
        '<button type="button" class="ProtoUsability-close" data-usability-close aria-label="Close usability test">&times;</button></div>' +
      '<div class="ProtoUsability-body">' +
        '<p class="ProtoUsability-task">' + escapeHtml(task.prompt) + '</p>' +
        '<div class="ProtoUsability-issue-form">' +
          '<textarea maxlength="500" data-usability-follow-up placeholder="Add an optional note"></textarea>' +
          '<button type="button" class="ProtoUsability-button" data-usability-continue>Continue</button>' +
        '</div>' +
      '</div>';
  }

  function continueAfterTask() {
    var field = card.querySelector('[data-usability-follow-up]');
    track('task_prompt_response', {
      taskId: pendingAdvance && pendingAdvance.task.id,
      taskIndex: currentIndex,
      text: field ? field.value.trim() : '',
    });
    pendingAdvance = null;
    currentIndex += 1;
    if (currentIndex >= test.tasks.length) {
      ended = true;
      track('test_complete', { completedTasks: run.taskResults.filter(function (item) { return item.status === 'completed'; }).length });
      store.finishRun(run, 'completed', run.taskResults, {
        completedTasks: run.taskResults.filter(function (item) { return item.status === 'completed'; }).length,
        skippedTasks: run.taskResults.filter(function (item) { return item.status === 'skipped'; }).length,
      });
      renderComplete();
      return;
    }
    taskStartedAt = new Date().toISOString();
    track('task_start', { taskId: currentTask().id, taskIndex: currentIndex });
    renderTask();
  }

  function markTask(status, method) {
    var task = currentTask();
    if (!task || !run) return;
    var completedAt = new Date().toISOString();
    var result = {
      taskId: task.id,
      status: status,
      method: method || 'manual',
      startedAt: taskStartedAt,
      endedAt: completedAt,
      durationMs: Math.max(0, new Date(completedAt) - new Date(taskStartedAt)),
    };
    run.taskResults = (run.taskResults || []).concat(result);
    track(status === 'completed' ? 'task_complete' : 'task_skip', {
      taskId: task.id,
      taskIndex: currentIndex,
      result: status,
      method: method || 'manual',
      durationMs: result.durationMs,
    });
    currentIndex += 1;
    if (task.prompt && status === 'completed') {
      currentIndex -= 1;
      pendingAdvance = { task: task, result: result };
      renderFollowUp(task);
      return;
    }
    if (currentIndex >= test.tasks.length) {
      ended = true;
      track('test_complete', { completedTasks: run.taskResults.filter(function (item) { return item.status === 'completed'; }).length });
      store.finishRun(run, 'completed', run.taskResults, {
        completedTasks: run.taskResults.filter(function (item) { return item.status === 'completed'; }).length,
        skippedTasks: run.taskResults.filter(function (item) { return item.status === 'skipped'; }).length,
      });
      renderComplete();
      return;
    }
    taskStartedAt = new Date().toISOString();
    track('task_start', { taskId: currentTask().id, taskIndex: currentIndex });
    renderTask();
  }

  function startTest() {
    run = store.startRun(test, sessionId);
    currentIndex = 0;
    ended = false;
    taskStartedAt = new Date().toISOString();
    track('test_start', { taskCount: test.tasks.length });
    track('task_start', { taskId: currentTask().id, taskIndex: currentIndex });
    renderTask();
  }

  function maybeAutoComplete() {
    var task = currentTask();
    if (!task || !task.success || task.success.type === 'manual') return;
    if (task.success.type === 'path' && task.success.value && (location.pathname + location.search).indexOf(task.success.value) !== -1) {
      markTask('completed', 'automatic-path');
    }
  }

  function handleClick(event) {
    var task = currentTask();
    if (!task || !task.success || task.success.type !== 'selector-click' || !task.success.value) return;
    if (root && root.contains(event.target)) return;
    try {
      if (event.target.closest(task.success.value)) markTask('completed', 'automatic-selector');
    } catch (e) {
      // Invalid selectors are rejected by the builder; ignore legacy invalid rules safely.
    }
  }

  function abandon() {
    if (!run || ended) return;
    ended = true;
    track('test_abandon', { taskId: currentTask() && currentTask().id, taskIndex: currentIndex });
    store.finishRun(run, 'abandoned', run.taskResults, { abandonedAtTask: currentIndex });
  }

  function submitIssue() {
    var textarea = issueForm && issueForm.querySelector('textarea');
    var text = textarea ? textarea.value.trim() : '';
    if (!text) return;
    track('usability_issue', { taskId: currentTask() && currentTask().id, taskIndex: currentIndex, text: text });
    textarea.value = '';
    issueForm.hidden = true;
    var status = card.querySelector('[data-usability-status]');
    if (status) status.textContent = 'Thanks — your report was recorded.';
  }

  function mount(activeTest) {
    test = activeTest;
    addStylesheet();
    root = document.createElement('aside');
    root.className = 'ProtoUsability';
    root.setAttribute('aria-label', 'Usability test');
    root.innerHTML = '<button type="button" class="ProtoUsability-launch" data-usability-open><i class="fa-solid fa-list-check" aria-hidden="true"></i> Usability test</button>' +
      '<div class="ProtoUsability-card" data-usability-card></div>';
    document.body.appendChild(root);
    card = root.querySelector('[data-usability-card]');
    card.hidden = false;
    root.hidden = false;
    renderIntro();
    setOpen(false);
    root.addEventListener('click', function (event) {
      if (event.target.closest('[data-usability-open]')) {
        setOpen(true);
        track('test_widget_open', {});
      } else if (event.target.closest('[data-usability-close]')) {
        setOpen(false);
      } else if (event.target.closest('[data-usability-start]')) {
        startTest();
      } else if (event.target.closest('[data-usability-done]')) {
        markTask('completed', 'manual');
      } else if (event.target.closest('[data-usability-skip]')) {
        markTask('skipped', 'manual');
      } else if (event.target.closest('[data-usability-continue]')) {
        continueAfterTask();
      } else if (event.target.closest('[data-usability-issue]')) {
        issueForm = root.querySelector('.ProtoUsability-issue-form');
        if (issueForm) issueForm.hidden = !issueForm.hidden;
      } else if (event.target.closest('[data-usability-submit-issue]')) {
        submitIssue();
      }
    });
    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', maybeAutoComplete);
    maybeAutoComplete();
  }

  document.addEventListener('DOMContentLoaded', function () {
    store.getActiveTest(id).then(function (activeTest) {
      if (activeTest && activeTest.tasks && activeTest.tasks.length) mount(activeTest);
    }).catch(function () {});
  });
  window.addEventListener('pagehide', abandon);
})(window);
