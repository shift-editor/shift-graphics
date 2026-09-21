import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { prepareRelease } from '../scripts/prepare-release.mjs';

globalThis.fetch = async () => { throw new Error('Live network is forbidden in tests'); };
let root;
let requests;
let pull;
let release;
let changelog;
let manifest;
let fail;
const sha = 'a'.repeat(40);
const encode = content => ({ type: 'file', encoding: 'base64', content: Buffer.from(content).toString('base64') });
const fetch = async (url, options) => {
  requests.push(url);
  assert.equal(options.method, 'GET');
  assert.equal(options.redirect, 'error');
  assert.ok(options.signal);
  assert.equal(options.headers.Authorization, undefined);
  const endpoint = url.replace('https://api.github.com/repos/shift-editor/shift/', '');
  if (fail === endpoint) return new Response('Unavailable', { status: 503 });
  if (endpoint === 'pulls/230') return Response.json(pull);
  if (endpoint === `contents/.release-please-manifest.json?ref=${sha}`) return Response.json(encode(JSON.stringify(manifest)));
  if (endpoint === `contents/CHANGELOG.md?ref=${sha}`) return Response.json(encode(changelog));
  if (endpoint === 'releases/tags/v0.1.1') return Response.json(release);
  if (endpoint === 'commits/v0.1.1') return Response.json({ sha: 'b'.repeat(40) });
  throw new Error(`Unexpected URL: ${url}`);
};

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'shift-release-import-'));
  requests = [];
  fail = null;
  pull = { number: 230, title: 'chore: release Shift 0.1.1', state: 'open', draft: true, labels: [{ name: 'autorelease: pending' }], base: { ref: 'main', repo: { full_name: 'shift-editor/shift' } }, head: { sha, repo: { full_name: 'shift-editor/shift' } } };
  manifest = { '.': '0.1.1' };
  changelog = '# Changelog\n\n## [0.1.1](https://example.com/compare) (2026-09-06)\n\n### Features\n\n* Draw ellipses\n\n## 0.1.0\n\n* Older entry\n';
  release = { id: 42, tag_name: 'v0.1.1', draft: false, prerelease: true, published_at: '2026-09-06T12:00:00Z', body: '### Features\n\n* Published change', assets: [{ name: 'Shift.dmg', browser_download_url: 'https://github.com/shift-editor/shift/releases/download/v0.1.1/Shift.dmg' }] };
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

test('imports only the matching changelog section at an immutable PR head', async () => {
  const result = await prepareRelease({ pr: '230', output: root, fetch });
  assert.equal(result.changed, true);
  assert.equal(result.release.date, null);
  assert.deepEqual(result.release.assets, []);
  assert.equal(result.release.source.sha, sha);
  const body = await readFile(path.join(result.directory, 'changelog.md'), 'utf8');
  assert.equal(body, '### Features\n\n* Draw ellipses\n');
  assert.equal(result.release.changelogSha256, createHash('sha256').update(body).digest('hex'));
  assert.equal(requests.length, 3);
});

test('unchanged refresh is a no-op and preserves editorial notes byte for byte', async () => {
  const first = await prepareRelease({ pr: 230, output: root, fetch });
  await writeFile(path.join(first.directory, 'notes.md'), 'Hand-written notes\n');
  const next = await prepareRelease({ pr: 230, output: root, fetch });
  assert.equal(next.changed, false);
  assert.equal(await readFile(path.join(first.directory, 'notes.md'), 'utf8'), 'Hand-written notes\n');
});

test('new generated changes do not overwrite editorial notes', async () => {
  const first = await prepareRelease({ pr: 230, output: root, fetch });
  await writeFile(path.join(first.directory, 'notes.md'), 'Keep my notes');
  changelog = changelog.replace('Draw ellipses', 'Draw ellipses and circles');
  assert.equal((await prepareRelease({ pr: 230, output: root, fetch })).changed, true);
  assert.match(await readFile(path.join(first.directory, 'changelog.md'), 'utf8'), /and circles/);
  assert.equal(await readFile(path.join(first.directory, 'notes.md'), 'utf8'), 'Keep my notes');
});

test('published prereleases are importable and retain their flag and assets', async () => {
  const result = await prepareRelease({ tag: 'v0.1.1', output: root, fetch });
  assert.equal(result.release.prerelease, true);
  assert.equal(result.release.date, '2026-09-06T12:00:00.000Z');
  assert.equal(result.release.source.type, 'release');
  assert.equal(result.release.assets[0].name, 'Shift.dmg');
});

test('refreshing with PR and tag preserves the original draft directory and copy', async () => {
  const draft = await prepareRelease({ pr: 230, output: root, fetch });
  await writeFile(path.join(draft.directory, 'notes.md'), 'Reviewed notes');
  const result = await prepareRelease({ pr: 230, tag: 'v0.1.1', output: root, fetch });
  assert.equal(result.directory, draft.directory);
  assert.equal(result.release.source.type, 'release');
  assert.equal(await readFile(path.join(result.directory, 'notes.md'), 'utf8'), 'Reviewed notes');
  await assert.rejects(prepareRelease({ pr: 230, output: root, fetch }), /Cannot replace/);
});

test('tag-only refresh updates the same version draft without duplicating it', async () => {
  const draft = await prepareRelease({ pr: 230, output: root, fetch });
  await writeFile(path.join(draft.directory, 'notes.md'), 'Reviewed notes');
  const result = await prepareRelease({ tag: 'v0.1.1', output: root, fetch });
  assert.equal(result.directory, draft.directory);
  assert.equal(result.release.source.type, 'release');
  assert.equal(await readFile(path.join(result.directory, 'notes.md'), 'utf8'), 'Reviewed notes');
  assert.deepEqual(await readdir(root), ['v0.1.1']);
});

test('failed GitHub requests leave existing generated and editorial files untouched', async () => {
  const first = await prepareRelease({ pr: 230, output: root, fetch });
  const before = await Promise.all(['release.json', 'changelog.md', 'notes.md'].map(name => readFile(path.join(first.directory, name), 'utf8')));
  fail = `contents/CHANGELOG.md?ref=${sha}`;
  await assert.rejects(prepareRelease({ pr: 230, output: root, fetch }), /GitHub 503/);
  const after = await Promise.all(['release.json', 'changelog.md', 'notes.md'].map(name => readFile(path.join(first.directory, name), 'utf8')));
  assert.deepEqual(after, before);
});

for (const kind of ['foreign PR', 'wrong version', 'missing section', 'wrong label', 'moving ref']) {
  test(`rejects ${kind} before writing a draft`, async () => {
    switch (kind) {
      case 'foreign PR': pull.head.repo.full_name = 'someone/fork'; break;
      case 'wrong version': manifest['.'] = '2.0.0'; break;
      case 'missing section': changelog = '# Changelog'; break;
      case 'wrong label': pull.labels = []; break;
      case 'moving ref': pull.head.sha = 'main'; break;
    }
    await assert.rejects(prepareRelease({ pr: 230, output: root, fetch }));
    assert.deepEqual(await readdir(root), []);
  });
}

for (const tag of ['nightly', '../../secret', 'v1.0.0/../../secret', 'main', '$(echo hi)']) {
  test(`rejects invalid tag ${tag} before network access`, async () => {
    await assert.rejects(prepareRelease({ tag, output: root, fetch }));
    assert.equal(requests.length, 0);
  });
}

test('unpublished GitHub drafts cannot supply public metadata', async () => {
  release.draft = true;
  await assert.rejects(prepareRelease({ tag: 'v0.1.1', output: root, fetch }), /published GitHub release/);
  assert.deepEqual(await readdir(root), []);
});

test('malicious download URLs are rejected', async () => {
  release.assets[0].browser_download_url = 'https://evil.example/Shift.dmg';
  await assert.rejects(prepareRelease({ tag: 'v0.1.1', output: root, fetch }), /Invalid GitHub download/);
  assert.deepEqual(await readdir(root), []);
});

test('raw GitHub expressions remain text, never executable MDX', async () => {
  changelog = changelog.replace('Draw ellipses', '{process.exit(99)} <script>alert(1)</script>');
  const result = await prepareRelease({ pr: 230, output: root, fetch });
  assert.match(await readFile(path.join(result.directory, 'changelog.md'), 'utf8'), /process.exit\(99\)/);
});

test('refuses symlinked editorial files rather than following them', async () => {
  const result = await prepareRelease({ pr: 230, output: root, fetch });
  await rm(path.join(result.directory, 'notes.md'));
  await writeFile(path.join(root, 'secret'), 'Do not read or alter');
  await symlink(path.join(root, 'secret'), path.join(result.directory, 'notes.md'));
  await assert.rejects(prepareRelease({ pr: 230, output: root, fetch }), /regular file/);
  assert.equal(await readFile(path.join(root, 'secret'), 'utf8'), 'Do not read or alter');
});
