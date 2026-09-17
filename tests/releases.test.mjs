import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ts from 'typescript';

const reactUrl = import.meta.resolve('react');
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('/lib/downloads') || specifier.endsWith('/lib/releases') || specifier.endsWith('/lib/utils') || specifier.endsWith('/release-notes') || specifier.endsWith('/remark-release-video')) return nextResolve(`${specifier}.ts`, context);
    if (specifier.endsWith('/components/SiteHeader') || specifier.endsWith('/components/Heading') || specifier.endsWith('/components/MarkdownContent') || specifier.endsWith('/ReleaseVideo') || specifier.endsWith('/ui/Separator') || specifier.endsWith('/ReleaseEntry')) return nextResolve(`${specifier}.tsx`, context);
    let source;
    if (specifier === 'server-only') source = 'export {}';
    if (specifier === 'next/navigation') source = 'export function notFound() { throw new Error("NEXT_NOT_FOUND"); }';
    if (specifier === 'next/link') source = `import { createElement } from '${reactUrl}'; export default function Link({ children, ...props }) { return createElement('a', props, children); }`;
    if (specifier === 'next/image') source = `import { createElement } from '${reactUrl}'; export default function Image({ src, alt, width, height, className }) { return createElement('img', { src, alt, width, height, className }); }`;
    if (specifier.endsWith('.svg')) source = `import { createElement } from '${reactUrl}'; export default function Logo() { return createElement('svg'); }`;
    return source === undefined ? nextResolve(specifier, context) : { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.tsx') && (url.includes('/src/app/(site)/releases/') || url.includes('/src/app/components/'))) {
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});
globalThis.fetch = async () => { throw new Error('Network is forbidden in release tests'); };
const { downloadTargets } = await import('../src/lib/downloads.ts');
const { getReleases } = await import('../src/lib/releases.ts');
const { default: ReleasesPage } = await import('../src/app/(site)/releases/page.tsx');
const { default: ReleasePage, generateStaticParams, generateMetadata, dynamicParams } = await import('../src/app/(site)/releases/[version]/page.tsx');
let root;
let temporary;
let workingDirectory;
let directory;
let release;
let environment;
let vercelEnvironment;
const changelog = '### Features\n\n- Draw ellipses\n';

beforeEach(async () => {
  environment = process.env.NODE_ENV;
  vercelEnvironment = process.env.VERCEL_ENV;
  process.env.NODE_ENV = 'production';
  delete process.env.VERCEL_ENV;
  workingDirectory = process.cwd();
  temporary = await mkdtemp(path.join(os.tmpdir(), 'shift-public-releases-'));
  root = path.join(temporary, 'website/content/releases');
  directory = path.join(root, 'v0.1.1-alpha.1');
  await mkdir(directory, { recursive: true });
  process.chdir(path.join(temporary, 'website'));
  release = { version: '0.1.1-alpha.1', tag: 'v0.1.1-alpha.1', date: '2026-09-06T12:00:00.000Z', prerelease: true, source: { type: 'release', number: 42, url: 'https://github.com/shift-editor/shift/releases/tag/v0.1.1-alpha.1', sha: 'a'.repeat(40) }, assets: [], changelogSha256: createHash('sha256').update(changelog).digest('hex') };
  await writeFile(path.join(directory, 'release.json'), JSON.stringify(release));
  await writeFile(path.join(directory, 'notes.md'), '# A reviewed release\n\nSome highlights.');
  await writeFile(path.join(directory, 'changelog.md'), changelog);
});
afterEach(async () => {
  if (environment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = environment;
  if (vercelEnvironment === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = vercelEnvironment;
  process.chdir(workingDirectory);
  await rm(temporary, { recursive: true, force: true });
});

test('renders published prereleases from local snapshots without network', async () => {
  const [entry] = await getReleases();
  assert.equal(entry.version, '0.1.1-alpha.1');
  assert.equal(entry.prerelease, true);
  assert.equal(entry.draft, false);
  assert.equal(entry.title, 'A reviewed release');
  assert.match(entry.body, /Some highlights/);
  assert.equal(entry.changelog, changelog);
});

test('parses the release title and body through Markdown syntax', async () => {
  await writeFile(path.join(directory, 'notes.md'), '# The *first* `Shift` alpha\n\nBody copy.');
  const [entry] = await getReleases();
  assert.equal(entry.title, 'The first Shift alpha');
  assert.equal(entry.body, 'Body copy.');
});

test('composes Markdown heading levels from the surrounding document', async () => {
  await writeFile(path.join(directory, 'notes.md'), '# Release title\n\n## Details\n\n### More detail');
  const feed = renderToStaticMarkup(await ReleasesPage());
  const page = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ version: release.version }) }));
  assert.match(feed, /<h2[^>]+id="0\.1\.1-alpha\.1-title"/);
  assert.match(feed, /<h3 class="markdown-heading">Details<\/h3>/);
  assert.match(feed, /<h4 class="markdown-subheading">More detail<\/h4>/);
  assert.match(page, /<h1[^>]+id="0\.1\.1-alpha\.1-title"/);
  assert.match(page, /<h2 class="markdown-heading">Details<\/h2>/);
  assert.match(page, /<h3 class="markdown-subheading">More detail<\/h3>/);
});

test('index uses local editorial imagery and does not expose private review comments', async () => {
  await writeFile(path.join(directory, 'notes.md'), '# A reviewed release\n\nA short **introduction**.\n\n![The editor](/releases/0.1.1-alpha.1/hero.png)\n\n## Details\n\nFull editorial detail.\n\n<!-- PRIVATE REVIEW MARKER -->');
  const markup = renderToStaticMarkup(await ReleasesPage());
  assert.match(markup, /src="\/releases\/0\.1\.1-alpha\.1\/hero\.png"/);
  assert.match(markup, /alt="The editor"/);
  assert.match(markup, /A short <strong>introduction<\/strong>/);
  assert.match(markup, /Full editorial detail/);
  assert.doesNotMatch(markup, /PRIVATE REVIEW MARKER/);
});

test('index omits external editorial images', async () => {
  await writeFile(path.join(directory, 'notes.md'), '# A reviewed release\n\nAn introduction.\n\n![Tracking](https://evil.example/pixel.png)');
  const markup = renderToStaticMarkup(await ReleasesPage());
  assert.doesNotMatch(markup, /<img|evil\.example/);
});

test('release videos render local WebM and MP4 sources with a poster and controls', async () => {
  await writeFile(path.join(directory, 'notes.md'), '# A reviewed release\n\n::video{mp4="/releases/0.1.1-alpha.1/curves.mp4" webm="/releases/0.1.1-alpha.1/curves.webm" poster="/releases/0.1.1-alpha.1/curves.jpg" label="Drawing curves in Shift"}');
  const markup = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ version: release.version }) }));
  assert.match(markup, /<video[^>]+aria-label="Drawing curves in Shift"/);
  assert.match(markup, /poster="\/releases\/0\.1\.1-alpha\.1\/curves\.jpg"/);
  assert.match(markup, /controls=""/);
  assert.match(markup, /<source src="\/releases\/0\.1\.1-alpha\.1\/curves\.webm" type="video\/webm"/);
  assert.match(markup, /<source src="\/releases\/0\.1\.1-alpha\.1\/curves\.mp4" type="video\/mp4"/);
});

test('release videos reject remote media and missing accessibility labels', async () => {
  await writeFile(path.join(directory, 'notes.md'), '# A reviewed release\n\n::video{mp4="https://evil.example/track.mp4" poster="/releases/0.1.1-alpha.1/curves.jpg"}');
  await assert.rejects(
    async () => renderToStaticMarkup(
      await ReleasePage({ params: Promise.resolve({ version: release.version }) }),
    ),
    /local MP4 file|concise label/,
  );
});

test('version URLs are generated from exact approved versions', async () => {
  const params = Promise.resolve({ version: release.version });
  assert.equal((await generateMetadata({ params })).alternates.canonical, 'https://shift.graphics/releases/0.1.1-alpha.1');
  assert.deepEqual(await generateStaticParams(), [{ version: '0.1.1-alpha.1' }]);
  assert.equal(dynamicParams, false);
});

test('download target catalog maps every human-facing Nightly installer', () => {
  assert.deepEqual(
    downloadTargets.flatMap(({ options }) => options.map(({ nightlyAssetName }) => nightlyAssetName)),
    [
      'Shift-Nightly-macOS-arm64.dmg',
      'Shift-Nightly-macOS-x64.dmg',
      'Shift-Nightly-Windows-x64-Setup.exe',
      'Shift-Nightly-Linux-x64.AppImage',
      'Shift-Nightly-Linux-x64.deb',
      'Shift-Nightly-Linux-x64.rpm',
    ],
  );
});

test('recognized release assets become installer links without exposing updater files', async () => {
  release.assets = [
    'Shift-0.1.1-alpha.1-macOS-arm64.dmg',
    'Shift-0.1.1-alpha.1-macOS-x64.dmg',
    'Shift-0.1.1-alpha.1-Windows-x64-Setup.exe',
    'Shift-0.1.1-alpha.1-Linux-x64.AppImage',
    'Shift-0.1.1-alpha.1-Linux-x64.deb',
    'Shift-0.1.1-alpha.1-Linux-x64.rpm',
    'Shift-0.1.1-alpha.1-macOS-arm64.zip',
    'latest-mac.yml',
    'SHA256SUMS',
  ].map(name => ({ name, url: `https://github.com/shift-editor/shift/releases/download/${release.tag}/${name}` }));
  await writeFile(path.join(directory, 'release.json'), JSON.stringify(release));
  const markup = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ version: release.version }) }));
  for (const asset of release.assets.slice(0, 6)) assert.ok(markup.includes(`href="${asset.url}"`));
  for (const asset of release.assets.slice(6)) assert.ok(!markup.includes(`href="${asset.url}"`));
});

test('partial asset lists do not invent unavailable platforms or architectures', async () => {
  const name = 'Shift-0.1.1-alpha.1-macOS-arm64.dmg';
  release.assets = [{ name, url: `https://github.com/shift-editor/shift/releases/download/${release.tag}/${name}` }];
  await writeFile(path.join(directory, 'release.json'), JSON.stringify(release));
  const markup = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ version: release.version }) }));
  assert.match(markup, />Apple Silicon</);
  assert.doesNotMatch(markup, />Intel x64<|>Windows<|>Linux</);
});

test('unrecognized assets remain accessible without guessing their platform', async () => {
  release.assets = [{ name: 'different-future-package.tar.gz', url: `https://github.com/shift-editor/shift/releases/download/${release.tag}/different-future-package.tar.gz` }];
  await writeFile(path.join(directory, 'release.json'), JSON.stringify(release));
  const markup = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ version: release.version }) }));
  assert.match(markup, />All files</);
  assert.doesNotMatch(markup, />macOS<|>Windows<|>Linux \(x64\)<|No downloads/);
});

test('an assetless published release omits the download card', async () => {
  const markup = renderToStaticMarkup(await ReleasePage({ params: Promise.resolve({ version: release.version }) }));
  assert.doesNotMatch(markup, /Downloads|>All files<|Try Shift Nightly|releases\/download\//);
});

for (const version of ['0.1.1', 'v0.1.1-alpha.1', 'nightly', 'pr-230', '../../secret']) {
  test(`unknown or noncanonical version ${version} is not a release page`, async () => {
    await assert.rejects(ReleasePage({ params: Promise.resolve({ version }) }), /NEXT_NOT_FOUND/);
  });
}

test('drafts share version URLs in development and preview but never replace production content', async () => {
  const draftDirectory = path.join(temporary, 'website/content/drafts/v0.1.1-alpha.1');
  await mkdir(draftDirectory, { recursive: true });
  const draft = { ...release, date: null, source: { type: 'pr', number: 230, url: 'https://github.com/shift-editor/shift/pull/230', sha: 'a'.repeat(40) } };
  await writeFile(path.join(draftDirectory, 'release.json'), JSON.stringify(draft));
  await writeFile(path.join(draftDirectory, 'notes.md'), '# Public editorial draft');
  await writeFile(path.join(draftDirectory, 'changelog.md'), changelog);
  const params = Promise.resolve({ version: release.version });

  process.env.NODE_ENV = 'development';
  assert.deepEqual(await generateStaticParams(), [{ version: release.version }]);
  assert.match(renderToStaticMarkup(await ReleasePage({ params })), /Public editorial draft/);
  assert.equal((await generateMetadata({ params })).robots.index, false);

  process.env.NODE_ENV = 'production';
  process.env.VERCEL_ENV = 'preview';
  assert.match(renderToStaticMarkup(await ReleasePage({ params })), /Public editorial draft/);
  assert.equal((await generateMetadata({ params })).robots.index, false);

  delete process.env.VERCEL_ENV;
  const published = renderToStaticMarkup(await ReleasePage({ params }));
  assert.match(published, /Some highlights/);
  assert.doesNotMatch(published, /Public editorial draft/);
  await rm(root, { recursive: true });
  assert.deepEqual(await generateStaticParams(), []);
  await assert.rejects(ReleasePage({ params }), /NEXT_NOT_FOUND/);
});

test('missing public content is a valid empty list', async () => {
  await rm(root, { recursive: true });
  assert.deepEqual(await getReleases(), []);
});

test('production refuses draft mode before filesystem access', async () => {
  await assert.rejects(getReleases({ draft: true }), /only in development and preview/);
});

test('PR snapshots are accepted only in the draft directory', async () => {
  release.source = { type: 'pr', number: 230, url: 'https://github.com/shift-editor/shift/pull/230', sha: 'a'.repeat(40) };
  release.date = null;
  await writeFile(path.join(directory, 'release.json'), JSON.stringify(release));
  await assert.rejects(getReleases(), /Unpublished PR/);
  const draftDirectory = path.join(temporary, 'website/content/drafts/v0.1.1-alpha.1');
  await mkdir(draftDirectory, { recursive: true });
  for (const name of ['release.json', 'notes.md', 'changelog.md']) await writeFile(path.join(draftDirectory, name), await readFile(path.join(directory, name)));
  process.env.NODE_ENV = 'development';
  assert.equal((await getReleases({ draft: true }))[0].draft, true);
});

test('public snapshots reject accidentally copied email files', async () => {
  await writeFile(path.join(directory, 'email.html'), 'Private campaign');
  await assert.rejects(getReleases(), /unexpected files/);
});

test('public snapshots reject nested private directories', async () => {
  await mkdir(path.join(directory, 'private'));
  await assert.rejects(getReleases(), /unexpected files/);
});

test('generated changelog and metadata must agree', async () => {
  await writeFile(path.join(directory, 'changelog.md'), 'Changed without reimport');
  await assert.rejects(getReleases(), /import was interrupted/);
});

for (const kind of ['date', 'URL', 'asset', 'version', 'extra metadata']) {
  test(`rejects invalid ${kind}`, async () => {
    switch (kind) {
      case 'date': release.date = null; break;
      case 'URL': release.source.url = 'javascript:alert(1)'; break;
      case 'asset': release.assets = [{ name: 'Download', url: 'https://evil.example/app' }]; break;
      case 'version': release.tag = '../../secret'; break;
      case 'extra metadata': release.email = 'Private campaign'; break;
    }
    await writeFile(path.join(directory, 'release.json'), JSON.stringify(release));
    await assert.rejects(getReleases());
  });
}

test('rejects symlinked files and directories', async () => {
  await rm(path.join(directory, 'notes.md'));
  await writeFile(path.join(root, 'private-copy'), 'Never read this');
  await symlink(path.join(root, 'private-copy'), path.join(directory, 'notes.md'));
  await assert.rejects(getReleases(), /Invalid release file/);
  await rm(directory, { recursive: true });
  await symlink(path.join(root, 'private-copy'), directory);
  await assert.rejects(getReleases(), /Invalid release directory/);
});

test('version directories must agree with their metadata', async () => {
  const mismatched = path.join(root, 'v0.1.1-alpha.2');
  await mkdir(mismatched);
  for (const name of ['release.json', 'notes.md', 'changelog.md']) await writeFile(path.join(mismatched, name), await readFile(path.join(directory, name)));
  await assert.rejects(getReleases(), /Invalid release version/);
});

test('PR-number release directories are rejected', async () => {
  await mkdir(path.join(root, 'pr-230'));
  await assert.rejects(getReleases(), /Invalid release directory/);
});

test('changelog Markdown does not execute MDX, raw HTML, tracking images, or unsafe URLs', () => {
  const markup = renderToStaticMarkup(createElement(Markdown, { remarkPlugins: [remarkGfm], skipHtml: true, disallowedElements: ['img'] },
    '# Changes\n\n{process.exit(99)}\n\n<script>alert(1)</script>\n\n[Bad](javascript:alert)\n\n![tracker](https://evil.example/pixel)\n\n- [x] Fixed'));
  assert.match(markup, /process.exit\(99\)/);
  assert.doesNotMatch(markup, /<script|javascript:|<img|evil\.example/);
  assert.match(markup, /type="checkbox"/);
});
