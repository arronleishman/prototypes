/* Internal access gate for hub + feedback threads (not for shared mock links) */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'prototypes.internalAccess';
  var ROLE_KEY = 'prototypes.accessRole';
  var CAPABILITY_KEY = 'prototypes.accessCapability';
  var UI_VERSION = '2026-09-10-token-gate';

  function validRole(role) {
    return role === 'designer' || role === 'developer';
  }

  function configuredKey() {
    var cfg = global.PROTOTYPES_CONFIG || {};
    return String(cfg.internalAccessKey || '').trim();
  }

  function hasAccess() {
    var key = configuredKey();
    if (!key) return false; // missing config must fail closed
    try {
      return sessionStorage.getItem(STORAGE_KEY) === key;
    } catch (e) {
      return false;
    }
  }

  function grantAccess(key, role) {
    var expected = configuredKey();
    if (!expected || key !== expected) return false;
    try {
      sessionStorage.setItem(STORAGE_KEY, expected);
      sessionStorage.setItem(ROLE_KEY, validRole(role) ? role : 'designer');
      sessionStorage.removeItem(CAPABILITY_KEY);
    } catch (e) {}
    return true;
  }

  function clearAccess() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem(CAPABILITY_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function currentRole() {
    try {
      var role = sessionStorage.getItem(ROLE_KEY);
      return validRole(role) ? role : '';
    } catch (e) {
      return '';
    }
  }

  function capability() {
    try {
      return sessionStorage.getItem(CAPABILITY_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function grantRole(role, capability) {
    if (!validRole(role)) return false;
    try {
      sessionStorage.setItem(ROLE_KEY, role);
      if (capability) sessionStorage.setItem(CAPABILITY_KEY, capability);
      else sessionStorage.removeItem(CAPABILITY_KEY);
    } catch (e) {}
    return true;
  }

  function isDesigner() {
    return hasAccess() && (currentRole() === 'designer' || !currentRole());
  }

  function isDeveloper() {
    return hasAccess() && currentRole() === 'developer';
  }

  function keyFromUrl() {
    try {
      return (new URLSearchParams(location.search).get('key') || '').trim();
    } catch (e) {
      return '';
    }
  }

  function roleFromUrl() {
    try {
      var role = (new URLSearchParams(location.search).get('role') || '').trim().toLowerCase();
      return validRole(role) ? role : '';
    } catch (e) {
      return '';
    }
  }

  function capabilityFromUrl() {
    try {
      return (new URLSearchParams(location.search).get('capability') || '').trim();
    } catch (e) {
      return '';
    }
  }

  function siteRootUrl() {
    // /prototypes/mocks/x.html → /prototypes/
    // /prototypes/feedback.html → /prototypes/
    // /prototypes/ or /prototypes/index.html → /prototypes/
    var path = location.pathname
      .replace(/\/mocks\/[^/]+$/i, '/')
      .replace(/\/feedback\.html$/i, '/')
      .replace(/\/changelog\.html$/i, '/')
      .replace(/\/details\.html$/i, '/')
      .replace(/\/index\.html$/i, '/');
    if (!/\/$/.test(path)) path += '/';
    return location.origin + path;
  }

  function hubUrlWithKey() {
    var url = new URL(siteRootUrl());
    url.searchParams.set('v', UI_VERSION);
    if (currentRole()) url.searchParams.set('role', currentRole());
    return url.href;
  }

  function feedbackUrlWithKey(prototypeId) {
    var url = new URL('feedback.html', siteRootUrl());
    if (prototypeId) url.searchParams.set('id', prototypeId);
    url.searchParams.set('v', UI_VERSION);
    if (currentRole()) url.searchParams.set('role', currentRole());
    return url.href;
  }

  function detailsUrlWithKey(prototypeId, tab) {
    var url = new URL('details.html', siteRootUrl());
    if (prototypeId) url.searchParams.set('id', prototypeId);
    if (tab) url.searchParams.set('tab', tab);
    url.searchParams.set('v', UI_VERSION);
    if (currentRole()) url.searchParams.set('role', currentRole());
    return url.href;
  }

  function absorbKeyFromUrl() {
    return hasAccess();
  }

  function renderGate(options) {
    options = options || {};
    var site = (global.PROTOTYPES_CONFIG && global.PROTOTYPES_CONFIG.siteName) || 'Prototypes';
    document.title = 'Private · ' + site;
    document.body.innerHTML =
      '<main style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:DM Sans,system-ui,sans-serif;background:#f7f6f2;color:#1a1d26">' +
        '<form id="protoAccessForm" style="width:min(400px,100%);background:#fff;border:1px solid #e4e6ee;border-radius:12px;padding:24px;box-shadow:0 10px 28px rgba(26,29,38,.08)">' +
          '<h1 style="margin:0 0 8px;font-size:1.35rem">Internal access only</h1>' +
          '<p style="margin:0 0 16px;color:#5c6378;line-height:1.45;font-size:.95rem">' +
            (options.message || 'This internal page is protected by an access token. Enter the token to continue; the role in the link only selects the level of access.') +
          '</p>' +
          '<label style="display:grid;gap:6px;font-size:12px;font-weight:700;color:#4c5172">Internal access token' +
            '<input id="protoAccessKey" type="password" autocomplete="current-password" placeholder="Enter internal access token" ' +
              'style="height:40px;padding:0 12px;border:1px solid #babfd1;border-radius:8px;font:400 14px/1 system-ui" />' +
          '</label>' +
          '<p id="protoAccessErr" style="min-height:1.2em;margin:10px 0 0;color:#a3003c;font-size:13px"></p>' +
          '<button type="submit" style="margin-top:8px;height:40px;width:100%;border:0;border-radius:8px;background:#9a3412;color:#fff;font:600 14px/1 system-ui;cursor:pointer">Unlock</button>' +
        '</form>' +
      '</main>';

    document.getElementById('protoAccessForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (document.getElementById('protoAccessKey').value || '').trim();
      if (grantAccess(value, roleFromUrl())) {
        var url = new URL(location.href);
        url.searchParams.delete('key');
        url.searchParams.set('role', currentRole());
        location.replace(url.href);
        return;
      }
      document.getElementById('protoAccessErr').textContent = 'That key doesn’t match.';
    });
  }

  /** Call on hub + feedback pages. Returns false if page should stop booting. */
  function requireInternalAccess(options) {
    if (configuredKey() && hasAccess()) {
      var requestedRole = roleFromUrl();
      if (requestedRole) grantRole(requestedRole);
      return true;
    }
    renderGate(options);
    return false;
  }

  function roleUrl(role, path, prototypeId, tab) {
    var url = new URL(path || 'index.html', siteRootUrl());
    if (prototypeId) url.searchParams.set('id', prototypeId);
    if (tab) url.searchParams.set('tab', tab);
    url.searchParams.set('role', role);
    url.searchParams.set('v', UI_VERSION);
    return url.href;
  }

  function createRoleLink(role, path, prototypeId, tab) {
    return Promise.resolve(roleUrl(role, path, prototypeId, tab));
  }

  global.PrototypesAccess = {
    hasAccess: hasAccess,
    grantAccess: grantAccess,
    clearAccess: clearAccess,
    requireInternalAccess: requireInternalAccess,
    hubUrlWithKey: hubUrlWithKey,
    feedbackUrlWithKey: feedbackUrlWithKey,
    detailsUrlWithKey: detailsUrlWithKey,
    currentRole: currentRole,
    capability: capability,
    grantRole: grantRole,
    isDesigner: isDesigner,
    isDeveloper: isDeveloper,
    roleUrl: roleUrl,
    createRoleLink: createRoleLink,
    configuredKey: configuredKey,
  };
})(window);
