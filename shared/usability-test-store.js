/* Usability test definitions and participant runs (Supabase + local fallback). */
(function (global) {
  'use strict';

  var TESTS_KEY = 'prototypes.usability.tests.';
  var RUNS_KEY = 'prototypes.usability.runs.';
  var auth = function () { return global.PrototypesAuth; };
  var cfg = function () { return global.PROTOTYPES_CONFIG || {}; };

  function uid(prefix) {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return (prefix || 'u') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  function read(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || '');
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function hasSupabase() {
    var c = cfg();
    return !!(String(c.supabaseUrl || '').trim() && String(c.supabaseAnonKey || '').trim());
  }

  function hasAuthRemote() {
    var authenticated = !!(auth() && auth().hasSession && auth().hasSession());
    var designerCapability = !!(global.PrototypesAccess && global.PrototypesAccess.isDesigner && global.PrototypesAccess.isDesigner() && global.PrototypesAccess.capability && global.PrototypesAccess.capability());
    return !!(hasSupabase() && (authenticated || designerCapability));
  }

  function base(path) {
    return String(cfg().supabaseUrl || '').replace(/\/$/, '') + path;
  }

  function publicHeaders(json) {
    var c = cfg();
    var headers = {
      apikey: String(c.supabaseAnonKey || '').trim(),
      Authorization: 'Bearer ' + String(c.supabaseAnonKey || '').trim(),
    };
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function remote(path, options, isAuthenticated) {
    options = options || {};
    var headers = isAuthenticated && auth() ? auth().headers(!!options.json) : publicHeaders(!!options.json);
    return fetch(base(path), {
      method: options.method || 'GET',
      headers: headers,
      body: options.body,
      cache: 'no-store',
      keepalive: !!options.keepalive,
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (body) {
          throw new Error(body || 'Usability test request failed (' + response.status + ').');
        });
      }
      return response.text().then(function (text) {
        try { return text ? JSON.parse(text) : null; } catch (e) { return text; }
      });
    });
  }

  function normalizeTask(task, index) {
    task = task || {};
    var success = task.success || task.successRule || {};
    return {
      id: String(task.id || ('task-' + (index + 1))),
      title: String(task.title || ('Task ' + (index + 1))),
      instruction: String(task.instruction || task.prompt || ''),
      success: {
        type: String(success.type || 'manual'),
        value: String(success.value || ''),
      },
      prompt: String(task.prompt || ''),
    };
  }

  function normalizeTest(row) {
    row = row || {};
    var rawTasks = Array.isArray(row.tasks) ? row.tasks : [];
    return {
      id: row.id || uid('test'),
      prototypeId: row.prototypeId || row.prototype_id || '',
      versionId: row.versionId || row.version_id || '',
      title: row.title || 'Untitled usability test',
      intro: row.intro || '',
      status: row.status || 'draft',
      tasks: rawTasks.map(normalizeTask),
      createdAt: row.createdAt || row.created_at || new Date().toISOString(),
      updatedAt: row.updatedAt || row.updated_at || new Date().toISOString(),
      createdBy: row.createdBy || row.created_by || '',
    };
  }

  function normalizeRun(row) {
    row = row || {};
    return {
      id: row.id || uid('run'),
      testId: row.testId || row.test_id || '',
      prototypeId: row.prototypeId || row.prototype_id || '',
      versionId: row.versionId || row.version_id || '',
      sessionId: row.sessionId || row.session_id || '',
      status: row.status || 'started',
      taskResults: Array.isArray(row.taskResults) ? row.taskResults : (Array.isArray(row.task_results) ? row.task_results : []),
      metrics: row.metrics || {},
      startedAt: row.startedAt || row.started_at || new Date().toISOString(),
      endedAt: row.endedAt || row.ended_at || '',
      createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    };
  }

  function saveLocalTest(test) {
    var key = TESTS_KEY + test.prototypeId;
    var list = read(key, []).map(normalizeTest).filter(function (item) { return item.id !== test.id; });
    list.unshift(test);
    write(key, list);
  }

  function saveLocalRun(run) {
    var key = RUNS_KEY + run.prototypeId;
    var list = read(key, []).map(normalizeRun).filter(function (item) { return item.id !== run.id; });
    list.unshift(run);
    write(key, list.slice(0, 500));
  }

  function listTests(prototypeId) {
    var local = read(TESTS_KEY + prototypeId, []).map(normalizeTest);
    if (!hasAuthRemote()) return Promise.resolve(local);
    return remote('/rest/v1/usability_tests?prototype_id=eq.' + encodeURIComponent(prototypeId) + '&select=*&order=updated_at.desc', {}, true)
      .then(function (rows) {
        var items = (rows || []).map(normalizeTest);
        write(TESTS_KEY + prototypeId, items);
        return items;
      })
      .catch(function () { return local; });
  }

  function getActiveTest(prototypeId) {
    var local = read(TESTS_KEY + prototypeId, []).map(normalizeTest)
      .find(function (item) { return item.status === 'active'; });
    if (!hasSupabase()) return Promise.resolve(local || null);
    return remote('/rest/v1/usability_tests?prototype_id=eq.' + encodeURIComponent(prototypeId) + '&status=eq.active&select=*&limit=1', {}, false)
      .then(function (rows) {
        var item = rows && rows[0] ? normalizeTest(rows[0]) : null;
        if (item) saveLocalTest(item);
        return item || local || null;
      })
      .catch(function () { return local || null; });
  }

  function saveTest(prototypeId, entry) {
    if (!hasAuthRemote()) return Promise.reject(new Error('A signed Designer link is required to save usability tests.'));
    var now = new Date().toISOString();
    var item = normalizeTest(Object.assign({}, entry, {
      id: entry && entry.id ? entry.id : uid('test'),
      prototypeId: prototypeId,
      updatedAt: now,
      createdAt: entry && entry.createdAt ? entry.createdAt : now,
    }));
    if (!item.title.trim()) return Promise.reject(new Error('Add a test name.'));
    if (!item.tasks.length) return Promise.reject(new Error('Add at least one task.'));
    if (item.tasks.some(function (task) { return !task.instruction.trim(); })) {
      return Promise.reject(new Error('Every task needs an instruction.'));
    }
    var existing = entry && entry.id;
    var path = existing
      ? '/rest/v1/usability_tests?id=eq.' + encodeURIComponent(existing)
      : '/rest/v1/usability_tests';
    var body = {
      prototype_id: prototypeId,
      version_id: item.versionId || null,
      title: item.title,
      intro: item.intro,
      status: item.status,
      tasks: item.tasks,
      updated_at: item.updatedAt,
    };
    if (!existing) body.created_at = item.createdAt;
    return remote(path, {
      method: existing ? 'PATCH' : 'POST',
      json: true,
      body: JSON.stringify(body),
    }, true).then(function (rows) {
      var saved = normalizeTest(rows && rows[0] ? rows[0] : Object.assign({}, item, { id: existing || item.id }));
      saveLocalTest(saved);
      return saved;
    });
  }

  function startRun(test, sessionId) {
    var run = normalizeRun({
      id: uid('run'),
      testId: test.id,
      prototypeId: test.prototypeId,
      versionId: test.versionId,
      sessionId: sessionId || uid('session'),
      status: 'started',
      taskResults: [],
      metrics: {},
      startedAt: new Date().toISOString(),
    });
    saveLocalRun(run);
    return run;
  }

  function finishRun(run, status, taskResults, metrics) {
    var next = normalizeRun(Object.assign({}, run, {
      status: status || 'completed',
      taskResults: taskResults || run.taskResults || [],
      metrics: metrics || run.metrics || {},
      endedAt: new Date().toISOString(),
    }));
    saveLocalRun(next);
    if (!hasSupabase()) return Promise.resolve(next);
    return remote('/rest/v1/usability_test_runs', {
      method: 'POST',
      json: true,
      keepalive: true,
      body: JSON.stringify({
        id: next.id,
        test_id: next.testId,
        prototype_id: next.prototypeId,
        version_id: next.versionId || null,
        session_id: next.sessionId,
        status: next.status,
        task_results: next.taskResults,
        metrics: next.metrics,
        started_at: next.startedAt,
        ended_at: next.endedAt,
      }),
    }, false).then(function () { return next; }).catch(function () { return next; });
  }

  function listRuns(prototypeId, testId) {
    var local = read(RUNS_KEY + prototypeId, []).map(normalizeRun);
    if (!hasAuthRemote()) return Promise.resolve({ items: local, shared: false });
    var query = '/rest/v1/usability_test_runs?prototype_id=eq.' + encodeURIComponent(prototypeId) + '&order=started_at.desc&limit=1000&select=*';
    if (testId) query += '&test_id=eq.' + encodeURIComponent(testId);
    return remote(query, {}, true)
      .then(function (rows) {
        var items = (rows || []).map(normalizeRun);
        write(RUNS_KEY + prototypeId, items);
        return { items: items, shared: true };
      })
      .catch(function () { return { items: local, shared: false, error: true }; });
  }

  global.PrototypesUsabilityTests = {
    uid: uid,
    hasSupabase: hasSupabase,
    hasAuthRemote: hasAuthRemote,
    normalizeTest: normalizeTest,
    normalizeRun: normalizeRun,
    listTests: listTests,
    getActiveTest: getActiveTest,
    saveTest: saveTest,
    startRun: startRun,
    finishRun: finishRun,
    listRuns: listRuns,
  };
})(window);
