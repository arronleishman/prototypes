/* First-party click tracking for heatmaps on mock pages */
(function () {
  'use strict';
  if (window.__protoTelemetryLoaded) return;
  window.__protoTelemetryLoaded = true;

  var store = window.PrototypesTelemetry;
  if (!store) return;

  // Don't track when embedded in the Insights heatmap preview iframe
  if (window.self !== window.top) return;

  // Don't track on hub / insights pages
  if (/\/(index|feedback)\.html$/i.test(location.pathname) || /\/prototypes\/?$/i.test(location.pathname)) {
    if (!/\/mocks\//i.test(location.pathname)) return;
  }

  var prototypeId =
    (document.documentElement.getAttribute('data-prototype-id') ||
      (document.body && document.body.getAttribute('data-prototype-id')) ||
      '').trim();

  if (!prototypeId) {
    var match = (location.pathname || '').match(/\/mocks\/([^/]+?)(?:\.html)?\/?$/i);
    if (match) prototypeId = decodeURIComponent(match[1]);
  }
  if (!prototypeId) return;

  var SESSION_KEY = 'prototypes.telemetry.session.' + prototypeId;
  var sessionId = '';
  try {
    sessionId = sessionStorage.getItem(SESSION_KEY) || '';
    if (!sessionId) {
      sessionId = store.uid();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
  } catch (e) {
    sessionId = store.uid();
  }
  window.__protoTelemetryContext = { prototypeId: prototypeId, sessionId: sessionId };

  function docHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
  }

  function scrollMax() {
    return Math.max(0, docHeight() - window.innerHeight);
  }

  function activePageKey() {
    var activeWizardStep = document.querySelector('.screen.is-active [id^="wizard-step-"]:not(.hidden)');
    if (activeWizardStep && activeWizardStep.id) return activeWizardStep.id;
    var active = document.querySelector('.screen.is-active, section.view.is-active, .view.is-active');
    return active && active.id ? active.id : '';
  }

  function trackClick(e) {
    if (e.target.closest && (
      e.target.closest('.ProtoFeedback-launch') ||
      e.target.closest('.ProtoFeedback-panel') ||
      e.target.closest('.ProtoFeedback-pickTip') ||
      e.target.closest('.ProtoUsability')
    )) return;

    var pageX = e.pageX;
    var pageY = e.pageY;
    var w = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, window.innerWidth);
    var h = Math.max(docHeight(), window.innerHeight);
    if (w < 1 || h < 1) return;

    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    var text = '';
    try {
      text = ((e.target && (e.target.innerText || e.target.getAttribute('aria-label') || e.target.getAttribute('title'))) || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80);
    } catch (err) {}

    var event = store.track({
      prototypeId: prototypeId,
      sessionId: sessionId,
      eventType: 'click',
      x: pageX / w,
      y: pageY / h,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      scrollY: window.scrollY,
      pageUrl: location.href,
      pagePath: location.pathname + location.search,
      meta: { tag: tag, text: text, docW: w, docH: h, pageKey: activePageKey() },
    });
    clickHistory.push({ time: Date.now(), x: event.x, y: event.y });
    clickHistory = clickHistory.filter(function (entry) { return Date.now() - entry.time < 900; });
    if (clickHistory.length >= 3) {
      var first = clickHistory[0];
      var closeClicks = clickHistory.filter(function (entry) {
        return Math.abs(entry.x - first.x) < 0.035 && Math.abs(entry.y - first.y) < 0.035;
      });
      if (closeClicks.length >= 3 && Date.now() - lastRageAt > 1200) {
        lastRageAt = Date.now();
        store.track({
          prototypeId: prototypeId,
          sessionId: sessionId,
          eventType: 'rage_click',
          x: event.x,
          y: event.y,
          viewportW: window.innerWidth,
          viewportH: window.innerHeight,
          scrollY: window.scrollY,
          scrollMax: scrollMax(),
          pageUrl: location.href,
          pagePath: location.pathname + location.search,
          meta: { source: 'repeated-clicks', count: closeClicks.length, pageKey: activePageKey() },
        });
      }
    }
  }

  function trackPageview() {
    store.track({
      prototypeId: prototypeId,
      sessionId: sessionId,
      eventType: 'pageview',
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      scrollY: window.scrollY,
      scrollMax: scrollMax(),
      pageUrl: location.href,
      pagePath: location.pathname + location.search,
      meta: { docW: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), docH: docHeight(), pageKey: activePageKey() },
    });
  }

  var clickHistory = [];
  var lastRageAt = 0;
  var scrollMarks = {};
  function trackScroll() {
    var max = scrollMax();
    var depth = max ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 100;
    [25, 50, 75, 100].forEach(function (mark) {
      if (depth >= mark && !scrollMarks[mark]) {
        scrollMarks[mark] = true;
        store.track({
          prototypeId: prototypeId,
          sessionId: sessionId,
          eventType: 'scroll_depth',
          viewportW: window.innerWidth,
          viewportH: window.innerHeight,
          scrollY: window.scrollY,
          scrollMax: max,
          pageUrl: location.href,
          pagePath: location.pathname + location.search,
          meta: { depth: mark, pageKey: activePageKey() },
        });
      }
    });
  }

  document.addEventListener('click', trackClick, true);
  window.addEventListener('scroll', trackScroll, { passive: true });
  trackPageview();
})();
