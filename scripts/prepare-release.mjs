import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repository = 'shift-editor/shift';
const versionPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)?$/;

/** Read-only GitHub import. Generated files are separate from never-overwritten editorial notes. */
export async function prepareRelease({ pr, tag, output = fileURLToPath(new URL('../content/drafts/', import.meta.url)), fetch: request = globalThis.fetch }) {
  if (!pr && !tag) throw new Error('Supply --pr or --tag. Supply both to refresh the same PR draft after release.');
  if (pr && !/^[1-9]\d*$/.test(String(pr))) throw new Error('Invalid PR number');
  if (tag && !versionPattern.test(tag.replace(/^v/, ''))) throw new Error('Use a versioned release tag, not Nightly or a branch.');

  // Treat remote text as data, never as code or shell arguments. No GitHub token is read.
  const fetchJson = async (endpoint) => {
    const response = await request(`https://api.github.com/repos/${repository}/${endpoint}`, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(20_000),
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (!response.ok) throw new Error(`GitHub ${response.status} for ${endpoint}. Nothing was imported.`);
    if (Number(response.headers.get('content-length')) > 2_000_000) throw new Error('GitHub response is too large');
    const text = await response.text();
    if (Buffer.byteLength(text) > 2_000_000) throw new Error('GitHub response is too large');
    return JSON.parse(text);
  };

  let version;
  let source;
  let changelog;
  let date = null;
  let prerelease = false;
  let assets = [];

  if (pr) {
    const pull = await fetchJson(`pulls/${pr}`);
    if (pull.number !== Number(pr) || pull.base?.repo?.full_name !== repository || pull.head?.repo?.full_name !== repository || pull.base.ref !== 'main') {
      throw new Error('Expected a same-repository Release Please PR targeting main');
    }
    if (!tag && pull.state !== 'open') throw new Error('The preparation PR must still be open');
    const match = /^chore: release Shift (\S+)$/.exec(pull.title ?? '');
    if (!match || !versionPattern.test(match[1]) || !pull.labels?.some(label => label.name === 'autorelease: pending' || label.name === 'autorelease: tagged')) {
      throw new Error('Not a recognized Shift Release Please PR');
    }
    version = match[1];
    if (!/^[a-f0-9]{40}$/.test(pull.head.sha)) throw new Error('Expected an immutable PR head SHA');
    source = { type: 'pr', number: Number(pr), url: `https://github.com/${repository}/pull/${pr}`, sha: pull.head.sha };
    // Read files at the pinned head, not a moving branch or a free-form PR body.
    const manifest = await fetchJson(`contents/.release-please-manifest.json?ref=${source.sha}`);
    const file = await fetchJson(`contents/CHANGELOG.md?ref=${source.sha}`);
    for (const entry of [manifest, file]) {
      if (entry.encoding !== 'base64' || typeof entry.content !== 'string' || entry.type !== 'file') throw new Error('Expected GitHub file content');
    }
    if (JSON.parse(Buffer.from(manifest.content, 'base64').toString('utf8'))['.'] !== version) throw new Error('Release PR version and manifest disagree');
    const contents = Buffer.from(file.content, 'base64').toString('utf8');
    const sections = [...contents.matchAll(/^## (?:\[([^\]]+)\]|(\S+)).*$/gm)];
    const index = sections.findIndex(section => (section[1] ?? section[2]).replace(/^v/, '') === version);
    if (index < 0) throw new Error('No changelog section for the proposed version');
    changelog = contents.slice(sections[index].index + sections[index][0].length, sections[index + 1]?.index ?? contents.length).trim();
    if (!changelog) throw new Error('Release changelog is empty');
    prerelease = version.includes('-');
  }

  if (tag) {
    const release = await fetchJson(`releases/tags/${encodeURIComponent(tag)}`);
    if (release.tag_name !== tag || release.draft !== false || !Number.isSafeInteger(release.id) || !release.published_at || !Number.isFinite(Date.parse(release.published_at))) {
      throw new Error('Expected a published GitHub release, not an unpublished draft');
    }
    if (version && version !== tag.replace(/^v/, '')) throw new Error('Release tag and preparation PR versions disagree');
    version = tag.replace(/^v/, '');
    if (typeof release.body !== 'string' || !release.body.trim()) throw new Error('Release changelog is empty');
    changelog = release.body.trim();
    const commit = await fetchJson(`commits/${encodeURIComponent(tag)}`);
    if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error('Cannot resolve the release tag to a commit');
    source = { type: 'release', number: release.id, url: `https://github.com/${repository}/releases/tag/${encodeURIComponent(tag)}`, sha: commit.sha };
    date = new Date(release.published_at).toISOString();
    if (typeof release.prerelease !== 'boolean' || !Array.isArray(release.assets)) throw new Error('Invalid release metadata');
    prerelease = release.prerelease;
    assets = release.assets.map(asset => {
      const url = new URL(asset.browser_download_url);
      if (typeof asset.name !== 'string' || !asset.name || asset.name.length > 250 || url.origin !== 'https://github.com' || url.username || url.password || !url.pathname.startsWith(`/${repository}/releases/download/${encodeURIComponent(tag)}/`)) {
        throw new Error('Invalid GitHub download asset');
      }
      return { name: asset.name, url: url.href };
    });
    assets.sort((a, b) => a.name.localeCompare(b.name));
  }

  changelog += '\n';
  const release = { version, tag: tag ?? `v${version}`, date, prerelease, source, assets, changelogSha256: createHash('sha256').update(changelog).digest('hex') };
  const root = path.resolve(output);
  await mkdir(root, { recursive: true, mode: 0o755 });
  await realpath(root);
  const directory = path.join(root, `v${version}`);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if ((await lstat(directory)).isSymbolicLink()) throw new Error('Draft directories cannot be symlinks');
  for (const name of ['release.json', 'changelog.md', 'notes.md']) {
    try {
      if (!(await lstat(path.join(directory, name))).isFile()) throw new Error(`Expected a regular file: ${name}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  try {
    const previous = JSON.parse(await readFile(path.join(directory, 'release.json'), 'utf8'));
    if (previous.source.type === 'release' && source.type === 'pr') throw new Error('Cannot replace a published-release snapshot with a PR snapshot');
    if (previous.source.type === 'release' && previous.tag !== release.tag) throw new Error('Cannot change an existing released version');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }

  let changed = false;
  // Metadata is installed last. Its digest makes an interrupted pair fail closed in the reader.
  for (const [name, text] of [['changelog.md', changelog], ['release.json', `${JSON.stringify(release, null, 2)}\n`]]) {
    const destination = path.join(directory, name);
    try { if (await readFile(destination, 'utf8') === text) continue; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, text, { flag: 'wx', mode: 0o600 });
      await rename(temporary, destination);
      changed = true;
    } finally { await rm(temporary, { force: true }); }
  }
  for (const [name, text] of [
    ['notes.md', '# Release highlights\n\n<!-- Public editorial draft. Replace this with reviewed highlights, images, and limitations. -->\n'],
  ]) {
    try { await writeFile(path.join(directory, name), text, { flag: 'wx', mode: 0o600 }); changed = true; }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  return { directory, changed, release };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: { pr: { type: 'string' }, tag: { type: 'string' } }, strict: true });
    const result = await prepareRelease(values);
    console.log(`${result.changed ? 'Prepared' : 'Unchanged'}: ${result.directory}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
