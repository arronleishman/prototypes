/* Small Supabase Auth client for the internal prototype library. */
(function (global) {
  'use strict';

  var SESSION_KEY = 'prototypes.supabase.session';

  function config() {
    return global.PROTOTYPES_CONFIG || {};
  }

  function base() {
    return String(config().supabaseUrl || '').replace(/\/$/, '');
  }

  function apiKey() {
    return String(config().supabaseAnonKey || '').trim();
  }

  function readSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeSession(session) {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function absorbCallback() {
    var hash = String(location.hash || '').replace(/^#/, '');
    if (!hash || hash.indexOf('access_token=') === -1) return readSession();
    var params = new URLSearchParams(hash);
    var accessToken = params.get('access_token');
    if (!accessToken) return readSession();
    var session = {
      access_token: accessToken,
      refresh_token: params.get('refresh_token') || '',
      expires_in: Number(params.get('expires_in') || 3600),
      expires_at: Math.floor(Date.now() / 1000) + Number(params.get('expires_in') || 3600),
      token_type: params.get('token_type') || 'bearer',
      user: null,
    };
    writeSession(session);
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {}
    return session;
  }

  function currentSession() {
    var session = absorbCallback();
    if (!session || !session.access_token) return null;
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000) + 30) {
      writeSession(null);
      return null;
    }
    return session;
  }

  function headers(withJson) {
    var session = currentSession();
    var result = { apikey: apiKey() };
    if (session && session.access_token) result.Authorization = 'Bearer ' + session.access_token;
    if (!session && global.PrototypesAccess && global.PrototypesAccess.capability()) {
      result.Authorization = 'Bearer ' + global.PrototypesAccess.capability();
    }
    if (withJson) result['Content-Type'] = 'application/json';
    return result;
  }

  function hasSupabase() {
    return !!(base() && apiKey());
  }

  function hasSession() {
    return !!currentSession();
  }

  function user() {
    var session = currentSession();
    return session && session.user ? Promise.resolve(session.user) : Promise.resolve(null);
  }

  function refreshUser() {
    var session = currentSession();
    if (!session) return Promise.resolve(null);
    return fetch(base() + '/auth/v1/user', {
      headers: headers(false),
      cache: 'no-store',
    }).then(function (res) {
      if (!res.ok) {
        if (res.status === 401) writeSession(null);
        return null;
      }
      return res.json();
    }).then(function (nextUser) {
      var latest = currentSession();
      if (latest && nextUser) {
        latest.user = nextUser;
        writeSession(latest);
      }
      return nextUser;
    }).catch(function () {
      return null;
    });
  }

  function sendMagicLink(email) {
    var value = String(email || '').trim();
    if (!value) return Promise.reject(new Error('Enter your email address.'));
    if (!hasSupabase()) return Promise.reject(new Error('Supabase is not configured.'));
    return fetch(base() + '/auth/v1/otp', {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({
        email: value,
        create_user: false,
        options: {
          email_redirect_to: location.href.split('#')[0],
        },
      }),
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (message) {
          throw new Error(message || 'Could not send the sign-in link.');
        });
      }
      return true;
    });
  }

  function signOut() {
    var session = currentSession();
    writeSession(null);
    if (!session || !hasSupabase()) return Promise.resolve();
    return fetch(base() + '/auth/v1/logout', {
      method: 'POST',
      headers: headers(false),
    }).catch(function () {});
  }

  global.PrototypesAuth = {
    hasSupabase: hasSupabase,
    hasSession: hasSession,
    currentSession: currentSession,
    user: user,
    refreshUser: refreshUser,
    sendMagicLink: sendMagicLink,
    signOut: signOut,
    headers: headers,
  };
})(window);
