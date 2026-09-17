import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getGitHubStarCount } from "../src/lib/github.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("reads Shift's GitHub star count with hourly revalidation", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.github.com/repos/shift-editor/shift");
    assert.equal(options.next.revalidate, 3600);
    assert.equal(options.headers.Accept, "application/vnd.github+json");
    return Response.json({ stargazers_count: 1234 });
  };

  assert.equal(await getGitHubStarCount(), 1234);
});

test("GitHub API failures and invalid counts fail without fabricating a number", async () => {
  globalThis.fetch = async () => Response.json({ stargazers_count: -1 });
  assert.equal(await getGitHubStarCount(), null);

  globalThis.fetch = async () => {
    throw new Error("Unavailable");
  };
  assert.equal(await getGitHubStarCount(), null);
});
