import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const supabaseUrl = String(process.env.SUPABASE_URL || readConfigUrl()).replace(/\/$/, '');
const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const sha = String(process.env.GITHUB_SHA || '').trim();
const before = String(process.env.GITHUB_BEFORE || '').trim();
const syncAll = String(process.env.VERSION_SYNC_ALL || '').toLowerCase() === 'true';

if (!supabaseUrl || !serviceKey || !sha) {
  console.log('Version sync skipped: configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GITHUB_SHA.');
  process.exit(0);
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const prototypes = manifest.flatMap((entry) => (
  Array.isArray(entry.children) && entry.children.length ? entry.children : [entry]
)).filter((item) => item && item.id && item.path);

const changedFiles = syncAll ? [] : changedFilesForPush();
const targets = syncAll
  ? prototypes
  : prototypes.filter((item) => changedFiles.includes(item.path));

if (!targets.length) {
  console.log('No repository mock files changed; no prototype versions to record.');
  process.exit(0);
}

const commitMessage = git('log', '-1', '--format=%s%n%n%b', sha).trim().slice(0, 1800);
const commitDate = git('show', '-s', '--format=%cI', sha).trim() || new Date().toISOString();
const shortSha = sha.slice(0, 7);
const changedSummary = syncAll
  ? 'Initial automatic version snapshot.'
  : changedFiles.join(', ');

for (const item of targets) {
  await upsertPrototype(item);
  const existing = await request(
    `/rest/v1/prototype_versions?prototype_id=eq.${encodeURIComponent(item.id)}&commit_sha=eq.${encodeURIComponent(sha)}&select=id`,
  );
  if (Array.isArray(existing) && existing.length) {
    console.log(`${item.id}: version ${shortSha} already recorded.`);
    continue;
  }

  await request('/rest/v1/prototype_versions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      prototype_id: item.id,
      label: `Push ${shortSha}`,
      summary: `${commitMessage}\n\nChanged: ${changedSummary}`,
      commit_sha: sha,
      created_at: commitDate,
    }),
  });
  console.log(`${item.id}: recorded Push ${shortSha}.`);
}

function readConfigUrl() {
  try {
    const source = readFileSync('config.js', 'utf8');
    const match = source.match(/supabaseUrl:\s*['"]([^'"]+)['"]/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function changedFilesForPush() {
  if (!before || /^0+$/.test(before)) {
    return git('diff-tree', '--no-commit-id', '--name-only', '-r', sha)
      .split('\n').map((file) => file.trim()).filter(Boolean);
  }
  return git('diff', '--name-only', before, sha)
    .split('\n').map((file) => file.trim()).filter(Boolean);
}

function headers(extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function request(path, options = {}) {
  const response = await fetch(supabaseUrl + path, {
    method: options.method || 'GET',
    headers: headers(options.headers),
    body: options.body,
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function upsertPrototype(item) {
  await request('/rest/v1/prototype_library', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: item.id,
      title: item.title || item.id,
      description: item.description || '',
      path: item.path,
      status: item.status || 'active',
      updated: item.updated || commitDate,
      source: 'repository',
    }),
  });
}
