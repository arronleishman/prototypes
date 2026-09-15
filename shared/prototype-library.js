/* Shared prototype metadata, version, and developer-artifact client. */
(function (global) {
  'use strict';

  var LOCAL_PROTOTYPES = 'prototypes.library.prototypes';
  var LOCAL_VERSIONS = 'prototypes.library.versions.';
  var LOCAL_ARTIFACTS = 'prototypes.library.artifacts.';
  var BUCKET = 'prototype-artifacts';
  var auth = function () { return global.PrototypesAuth; };
  var cfg = function () { return global.PROTOTYPES_CONFIG || {}; };

  function uid(prefix) {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return (prefix || 'p') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
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

  function normalizePrototype(row) {
    row = row || {};
    return {
      id: String(row.id || '').trim(),
      title: row.title || row.name || row.id || 'Untitled prototype',
      description: row.description || '',
      path: row.path || '',
      status: row.status || 'draft',
      updated: row.updated || row.updated_at || '',
      source: row.source || 'repository',
      createdAt: row.createdAt || row.created_at || '',
      updatedAt: row.updatedAt || row.updated_at || '',
    };
  }

  function normalizeVersion(row) {
    row = row || {};
    return {
      id: row.id || uid('v'),
      prototypeId: row.prototypeId || row.prototype_id || '',
      label: row.label || row.version || 'Version',
      summary: row.summary || row.notes || '',
      createdAt: row.createdAt || row.created_at || new Date().toISOString(),
      createdBy: row.createdBy || row.created_by || '',
    };
  }

  function normalizeArtifact(row) {
    row = row || {};
    return {
      id: row.id || uid('a'),
      prototypeId: row.prototypeId || row.prototype_id || '',
      versionId: row.versionId || row.version_id || '',
      kind: row.kind || 'other',
      name: row.name || 'Untitled file',
      description: row.description || '',
      storagePath: row.storagePath || row.storage_path || '',
      mimeType: row.mimeType || row.mime_type || 'application/octet-stream',
      size: Number(row.size || 0),
      createdAt: row.createdAt || row.created_at || new Date().toISOString(),
      createdBy: row.createdBy || row.created_by || '',
    };
  }

  function supabaseBase(path) {
    return String(cfg().supabaseUrl || '').replace(/\/$/, '') + path;
  }

  function canUseRemote() {
    var authenticated = !!(auth() && auth().hasSupabase && auth().hasSupabase() && auth().hasSession && auth().hasSession());
    var designerCapability = !!(global.PrototypesAccess && global.PrototypesAccess.isDesigner && global.PrototypesAccess.isDesigner() && global.PrototypesAccess.capability && global.PrototypesAccess.capability());
    return authenticated || designerCapability;
  }

  function remoteRequest(path, options) {
    options = options || {};
    var headers = auth().headers(!!options.json);
    if (options.headers) Object.keys(options.headers).forEach(function (key) { headers[key] = options.headers[key]; });
    return fetch(supabaseBase(path), {
      method: options.method || 'GET',
      headers: headers,
      body: options.body,
      cache: options.cache || 'no-store',
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (body) {
          throw new Error(body || 'Request failed (' + res.status + ')');
        });
      }
      if (res.status === 204) return null;
      return res.text().then(function (text) {
        try { return text ? JSON.parse(text) : null; } catch (e) { return text; }
      });
    });
  }

  function staticManifest() {
    return fetch(new URL('manifest.json', location.href).href, { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (entries) {
        var flat = [];
        (entries || []).forEach(function (entry) {
          if (Array.isArray(entry.children) && entry.children.length) flat = flat.concat(entry.children);
          else flat.push(entry);
        });
        return flat.map(normalizePrototype).filter(function (item) { return item.id; });
      });
  }

  function mergePrototypes(staticItems, remoteItems) {
    var map = {};
    (staticItems || []).concat(remoteItems || []).forEach(function (row) {
      var item = normalizePrototype(row);
      if (!item.id) return;
      map[item.id] = Object.assign({}, map[item.id] || {}, item);
    });
    return Object.keys(map).map(function (key) { return map[key]; });
  }

  function listPrototypes() {
    return staticManifest().catch(function () { return []; }).then(function (staticItems) {
      if (!canUseRemote()) return staticItems;
      return remoteRequest('/rest/v1/prototype_library?select=*&order=updated_at.desc')
        .then(function (rows) { return mergePrototypes(staticItems, rows || []); })
        .catch(function () { return staticItems; });
    });
  }

  function getPrototype(id) {
    return listPrototypes().then(function (items) {
      return items.find(function (item) { return item.id === id; }) || null;
    });
  }

  function localList(key, normalizer) {
    return read(key, []).map(normalizer);
  }

  function listVersions(prototypeId) {
    var local = localList(LOCAL_VERSIONS + prototypeId, normalizeVersion);
    if (!canUseRemote()) return Promise.resolve(local);
    return remoteRequest('/rest/v1/prototype_versions?prototype_id=eq.' + encodeURIComponent(prototypeId) + '&select=*&order=created_at.desc')
      .then(function (rows) {
        var items = (rows || []).map(normalizeVersion);
        write(LOCAL_VERSIONS + prototypeId, items);
        return items;
      })
      .catch(function () { return local; });
  }

  function listArtifacts(prototypeId) {
    var local = localList(LOCAL_ARTIFACTS + prototypeId, normalizeArtifact);
    if (!canUseRemote()) return Promise.resolve(local);
    return remoteRequest('/rest/v1/prototype_artifacts?prototype_id=eq.' + encodeURIComponent(prototypeId) + '&select=*&order=created_at.desc')
      .then(function (rows) {
        var items = (rows || []).map(normalizeArtifact);
        write(LOCAL_ARTIFACTS + prototypeId, items);
        return items;
      })
      .catch(function () { return local; });
  }

  function createPrototype(entry) {
    var now = new Date().toISOString();
    var item = normalizePrototype(Object.assign({}, entry, {
      createdAt: now,
      updatedAt: now,
      updated: (entry && entry.updated) || now.slice(0, 10),
      source: 'managed',
    }));
    if (!item.id || !item.title) return Promise.reject(new Error('Add an id and title.'));
    if (!canUseRemote()) return Promise.reject(new Error('A signed Designer link is required to save managed prototypes.'));
    return remoteRequest('/rest/v1/prototype_library', {
      method: 'POST',
      json: true,
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        description: item.description,
        path: item.path,
        status: item.status,
        updated: item.updated,
        source: item.source,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }),
    }).then(function () {
      return item;
    });
  }

  function updatePrototype(id, patch) {
    if (!canUseRemote()) return Promise.reject(new Error('A signed Designer link is required to update a prototype.'));
    var body = Object.assign({}, patch, { updated_at: new Date().toISOString() });
    return remoteRequest('/rest/v1/prototype_library?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      json: true,
      body: JSON.stringify(body),
    }).then(function (rows) { return rows && rows[0] ? normalizePrototype(rows[0]) : null; });
  }

  function addVersion(prototypeId, entry) {
    var item = normalizeVersion(Object.assign({}, entry, {
      id: uid('v'),
      prototypeId: prototypeId,
      createdAt: new Date().toISOString(),
    }));
    if (!canUseRemote()) return Promise.reject(new Error('A signed Designer link is required to add a version.'));
    return remoteRequest('/rest/v1/prototype_versions', {
      method: 'POST',
      json: true,
      body: JSON.stringify({
        id: item.id,
        prototype_id: item.prototypeId,
        label: item.label,
        summary: item.summary,
        created_at: item.createdAt,
      }),
    }).then(function () {
      var list = localList(LOCAL_VERSIONS + prototypeId, normalizeVersion);
      list.unshift(item);
      write(LOCAL_VERSIONS + prototypeId, list);
      return item;
    });
  }

  function safeName(name) {
    return String(name || 'file')
      .replace(/[^a-z0-9._-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100) || 'file';
  }

  function uploadArtifact(prototypeId, file, kind, description, versionId) {
    if (!file || !file.name) return Promise.reject(new Error('Choose a file first.'));
    var maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) return Promise.reject(new Error('Files must be 25 MB or smaller.'));
    var extension = String(file.name).split('.').pop().toLowerCase();
    var allowed = {
      mock: ['html', 'htm'],
      instruction: ['md', 'mdx', 'txt', 'pdf', 'doc', 'docx'],
      instructions: ['md', 'mdx', 'txt', 'pdf', 'doc', 'docx'],
      component: ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'vue', 'svelte', 'html'],
      components: ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'vue', 'svelte', 'html'],
      code: ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'json', 'html', 'md'],
      storybook: ['zip', 'json', 'js', 'ts', 'md', 'html'],
    };
    if (allowed[kind] && allowed[kind].indexOf(extension) === -1) {
      return Promise.reject(new Error('That file type is not valid for ' + kindLabel(kind) + '.'));
    }
    if (!canUseRemote()) return Promise.reject(new Error('A signed Designer link is required to upload developer files.'));
    var path = prototypeId + '/' + Date.now() + '-' + safeName(file.name);
    var uploadHeaders = auth().headers(false);
    uploadHeaders['Content-Type'] = file.type || 'application/octet-stream';
    uploadHeaders['x-upsert'] = 'false';
    return fetch(supabaseBase('/storage/v1/object/' + BUCKET + '/' + path), {
      method: 'POST',
      headers: uploadHeaders,
      body: file,
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (body) { throw new Error(body || 'Upload failed.'); });
      var item = normalizeArtifact({
        id: uid('a'),
        prototype_id: prototypeId,
        version_id: versionId || '',
        kind: kind || 'other',
        name: file.name,
        description: description || '',
        storage_path: path,
        mime_type: file.type || 'application/octet-stream',
        size: file.size || 0,
        created_at: new Date().toISOString(),
      });
      return remoteRequest('/rest/v1/prototype_artifacts', {
        method: 'POST',
        json: true,
        body: JSON.stringify({
          id: item.id,
          prototype_id: item.prototypeId,
          version_id: item.versionId || null,
          kind: item.kind,
          name: item.name,
          description: item.description,
          storage_path: item.storagePath,
          mime_type: item.mimeType,
          size: item.size,
          created_at: item.createdAt,
        }),
      }).then(function () {
        var list = localList(LOCAL_ARTIFACTS + prototypeId, normalizeArtifact);
        list.unshift(item);
        write(LOCAL_ARTIFACTS + prototypeId, list);
        return item;
      });
    });
  }

  function kindLabel(kind) {
    return {
      mock: 'HTML mocks',
      instruction: 'instructions',
      instructions: 'instructions',
      component: 'components',
      components: 'components',
      code: 'code',
      storybook: 'Storybook',
    }[kind] || 'this resource';
  }

  function signedUrl(item) {
    if (!item || !item.storagePath || !canUseRemote()) return Promise.reject(new Error('This file is not available.'));
    return remoteRequest('/storage/v1/object/sign/' + BUCKET + '/' + item.storagePath, {
      method: 'POST',
      json: true,
      body: JSON.stringify({ expiresIn: 3600 }),
    }).then(function (result) {
      var path = result && (result.signedURL || result.signedUrl || result.url);
      if (!path) throw new Error('Could not create a download link.');
      return /^https?:\/\//i.test(path) ? path : supabaseBase(path.charAt(0) === '/' ? path : '/storage/v1' + path);
    });
  }

  function downloadArtifact(item) {
    return signedUrl(item).then(function (url) { return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('Download failed.');
      return res.blob();
    }); });
  }

  function removeArtifact(item) {
    if (!item || !canUseRemote()) return Promise.reject(new Error('A signed Designer link is required to remove files.'));
    return remoteRequest('/storage/v1/object/' + BUCKET + '/remove', {
      method: 'POST',
      json: true,
      body: JSON.stringify({ prefixes: [item.storagePath] }),
    }).catch(function () {}).then(function () {
      return remoteRequest('/rest/v1/prototype_artifacts?id=eq.' + encodeURIComponent(item.id), {
        method: 'DELETE',
      });
    });
  }

  global.PrototypesLibrary = {
    listPrototypes: listPrototypes,
    getPrototype: getPrototype,
    listVersions: listVersions,
    listArtifacts: listArtifacts,
    createPrototype: createPrototype,
    updatePrototype: updatePrototype,
    addVersion: addVersion,
    uploadArtifact: uploadArtifact,
    signedUrl: signedUrl,
    downloadArtifact: downloadArtifact,
    removeArtifact: removeArtifact,
    normalizeArtifact: normalizeArtifact,
  };
})(window);
