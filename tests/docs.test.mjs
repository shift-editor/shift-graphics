import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import GithubSlugger from 'github-slugger';

const root = path.resolve('content/docs');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root);
const pages = new Map(
  files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = path.relative(root, file).replace(/\.mdx$/, '').replace(/(^|\/)index$/, '');
      return [slug ? `/docs/${slug}` : '/docs', readFileSync(file, 'utf8')];
    }),
);

function frontmatter(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return Object.fromEntries(
    block.split('\n').map((line) => line.split(/:\s*(.*)/s)).filter(([, value]) => value),
  );
}

function headingIds(source) {
  const slugger = new GithubSlugger();
  return new Set(
    source
      .replace(/```[\s\S]*?```/g, '')
      .split('\n')
      .flatMap((line) => line.match(/^#{2,6}\s+(.+)$/)?.slice(1) ?? [])
      .map((text) => slugger.slug(text.replace(/`/g, ''))),
  );
}

test('every guide has a title and description', () => {
  for (const [url, source] of pages) {
    const { title, description } = frontmatter(source);
    assert.ok(title, `${url} needs a title`);
    assert.ok(description, `${url} needs a description`);
  }
});

test('links between guides point at real pages and headings', () => {
  for (const [url, source] of pages) {
    for (const [, target] of source.matchAll(/(?:\]\(|href=")(\/docs[^)"\s]*)/g)) {
      const [pathname, hash] = target.split('#');
      assert.ok(pages.has(pathname), `${url} links to missing ${pathname}`);
      if (hash) {
        assert.ok(headingIds(pages.get(pathname)).has(hash), `${url} links to missing #${hash} on ${pathname}`);
      }
    }
  }
});

test('every guide appears in a folder meta.json', () => {
  const listed = new Set();
  for (const file of files.filter((file) => file.endsWith('meta.json'))) {
    const dir = path.relative(root, path.dirname(file));
    for (const page of JSON.parse(readFileSync(file, 'utf8')).pages ?? []) {
      listed.add(path.join(dir, page));
    }
  }
  for (const file of files.filter((file) => file.endsWith('.mdx'))) {
    const page = path.relative(root, file).replace(/\.mdx$/, '');
    const folder = path.dirname(page);
    assert.ok(listed.has(page) || listed.has(folder), `${page} isn't listed in a meta.json`);
  }
});
