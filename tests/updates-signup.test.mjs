import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { afterEach, beforeEach, mock, test } from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export {}", shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

globalThis.fetch = async () => {
  throw new Error("Network is disabled in tests");
};

const { sendUpdatesConfirmation, subscribeToUpdates, verifyTurnstile } = await import(
  "../src/lib/updates.ts"
);

const configuration = {
  UPDATES_SIGNUP_ENABLED: "true",
  UPDATES_SIGNUP_EMAILS_ENABLED: "true",
  RESEND_API_KEY: "test-only-not-a-real-resend-key",
  TURNSTILE_SECRET_KEY: "test-only-not-a-real-turnstile-key",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-only-public-key",
};
let challenge;
let contacts;
let fail;
let originalConfiguration;
let requests;
let sentEmails;
let usedTokens;

function form(email = "person@example.com") {
  const data = new FormData();
  data.set("email", email);
  data.set("turnstileToken", randomUUID());
  return data;
}

function addContact(email = "person@example.com", unsubscribed = false) {
  const contact = { id: randomUUID(), email, unsubscribed };
  contacts.set(email, contact);
  return contact;
}

beforeEach(() => {
  originalConfiguration = Object.fromEntries(
    Object.keys(configuration).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, configuration);
  challenge = { success: true, hostname: "shift.graphics", action: "updates-signup" };
  contacts = new Map();
  fail = () => undefined;
  requests = [];
  sentEmails = [];
  usedTokens = new Set();
  mock.method(console, "error", () => {});
  mock.method(globalThis, "fetch", async (input, options = {}) => {
    const url = new URL(String(input));
    const method = options.method ?? "GET";
    requests.push({ url, method, options });
    assert.ok(options.signal, "Every provider request must have a timeout");
    assert.equal(options.cache, "no-store");
    const failure = fail(url, method, options);
    if (failure) return failure;

    if (url.href === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      assert.equal(method, "POST");
      assert.equal(options.body.get("secret"), configuration.TURNSTILE_SECRET_KEY);
      const token = options.body.get("response");
      if (usedTokens.has(token)) return Response.json({ success: false });
      usedTokens.add(token);
      return Response.json(challenge);
    }

    assert.equal(url.origin, "https://api.resend.com", "Unexpected network destination");
    assert.equal(options.headers.Authorization, `Bearer ${configuration.RESEND_API_KEY}`);
    if (url.pathname === "/contacts" && method === "POST") {
      const body = JSON.parse(options.body);
      assert.deepEqual(Object.keys(body), ["email"]);
      if (contacts.has(body.email)) return Response.json({}, { status: 409 });
      const contact = addContact(body.email);
      return Response.json({ object: "contact", id: contact.id }, { status: 201 });
    }
    if (url.pathname === "/emails" && method === "POST") {
      const body = JSON.parse(options.body);
      sentEmails.push({ body, headers: options.headers });
      return Response.json({ id: randomUUID() });
    }
    if (url.pathname.startsWith("/contacts/")) {
      assert.equal(method, "GET", "Existing contacts must never be mutated by signup");
      const identifier = decodeURIComponent(url.pathname.slice("/contacts/".length));
      const contact =
        contacts.get(identifier) ??
        [...contacts.values()].find(({ id }) => id === identifier);
      return contact ? Response.json(contact) : Response.json({}, { status: 404 });
    }
    assert.fail(`Unexpected mock request: ${method} ${url.pathname}`);
  });
});

afterEach(() => {
  for (const [key, value] of Object.entries(originalConfiguration)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  mock.restoreAll();
});

for (const key of [
  "UPDATES_SIGNUP_ENABLED",
  "RESEND_API_KEY",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
]) {
  test(`missing ${key} fails closed without network`, async () => {
    delete process.env[key];
    assert.equal((await subscribeToUpdates(form())).status, "error");
    assert.equal(requests.length, 0);
  });
}

test("the signup switch requires literal true", async () => {
  process.env.UPDATES_SIGNUP_ENABLED = "false";
  assert.equal((await subscribeToUpdates(form())).status, "error");
  assert.equal(requests.length, 0);
});

test("new signup stores one normalized contact and sends one confirmation", async () => {
  const result = await subscribeToUpdates(form("  PERSON+shift@EXAMPLE.com  "));
  assert.equal(result.status, "success");
  assert.equal(contacts.size, 1);
  const contact = contacts.get("person+shift@example.com");
  assert.equal(contact.unsubscribed, false);
  assert.equal(requests.filter(({ url }) => url.pathname === "/contacts").length, 1);
  assert.equal(sentEmails.length, 1);
  assert.deepEqual(sentEmails[0].body.to, ["person+shift@example.com"]);
  assert.equal(sentEmails[0].body.subject, "You’re subscribed to Shift updates");
  assert.match(sentEmails[0].body.html, /You’re subscribed\./);
  assert.match(sentEmails[0].body.text, /occasional development notes/);
  assert.deepEqual(sentEmails[0].body.attachments.map(({ content_id }) => content_id), [
    "shift-logo",
  ]);
  assert.equal(
    sentEmails[0].headers["Idempotency-Key"],
    `shift-updates-confirmation/${contact.id}`,
  );
});

test("confirmation delivery is independently off by default", async () => {
  delete process.env.UPDATES_SIGNUP_EMAILS_ENABLED;
  assert.equal((await subscribeToUpdates(form())).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(sentEmails.length, 0);
});

test("confirmation delivery requires both literal rollout switches", async () => {
  const contact = addContact();
  process.env.UPDATES_SIGNUP_ENABLED = "false";
  await sendUpdatesConfirmation(contact.id);
  process.env.UPDATES_SIGNUP_ENABLED = "true";
  process.env.UPDATES_SIGNUP_EMAILS_ENABLED = "false";
  await sendUpdatesConfirmation(contact.id);
  assert.equal(requests.length, 0);
});

for (const email of [
  "",
  "bad-address",
  "a@localhost",
  "a\r\nBcc:other@example.com",
  ".a@example.com",
  "a..b@example.com",
  "a.@example.com",
  "a@-example.com",
  `${"a".repeat(65)}@example.com`,
  `a@${"b".repeat(64)}.com`,
]) {
  test(`invalid email is rejected before provider access: ${JSON.stringify(email)}`, async () => {
    assert.equal((await subscribeToUpdates(form(email))).status, "error");
    assert.equal(requests.length, 0);
  });
}

test("file inputs and duplicate email fields are rejected", async () => {
  const file = form();
  file.set("email", new Blob(["email"]), "email.txt");
  assert.equal((await subscribeToUpdates(file)).status, "error");

  const duplicate = form();
  duplicate.append("email", "another@example.com");
  assert.equal((await subscribeToUpdates(duplicate)).status, "error");
  assert.equal(requests.length, 0);
});

for (const values of [
  { success: false },
  { hostname: "attacker.example" },
  { action: "other-action" },
]) {
  test(`Turnstile rejects mismatched claims ${JSON.stringify(values)}`, async () => {
    Object.assign(challenge, values);
    assert.equal((await subscribeToUpdates(form())).status, "error");
    assert.equal(contacts.size, 0);
  });
}

test("Turnstile accepts the www hostname and consumes tokens only once", async () => {
  challenge.hostname = "www.shift.graphics";
  assert.equal(await verifyTurnstile("single-use-token"), true);
  assert.equal(await verifyTurnstile("single-use-token"), false);
});

test("missing or oversized challenge responses do not call providers", async () => {
  const data = form();
  data.delete("turnstileToken");
  assert.equal((await subscribeToUpdates(data)).status, "error");
  data.set("turnstileToken", "x".repeat(2049));
  assert.equal((await subscribeToUpdates(data)).status, "error");
  assert.equal(requests.length, 0);
});

for (const unsubscribed of [false, true]) {
  test(`existing contact with unsubscribed=${unsubscribed} is never mutated`, async () => {
    const contact = addContact("person@example.com", unsubscribed);
    assert.equal((await subscribeToUpdates(form("PERSON@example.com"))).status, "success");
    assert.equal(contact.unsubscribed, unsubscribed);
    assert.equal(requests.filter(({ url }) => url.pathname === "/contacts").length, 0);
    assert.equal(sentEmails.length, 0);
  });
}

test("a concurrent create conflict resolves without resubscribing", async () => {
  fail = (url, method) => {
    if (url.pathname === "/contacts" && method === "POST") {
      addContact("person@example.com", true);
      return Response.json({}, { status: 409 });
    }
  };
  assert.equal((await subscribeToUpdates(form())).status, "success");
  assert.equal(contacts.get("person@example.com").unsubscribed, true);
  assert.equal(sentEmails.length, 0);
});

test("confirmation rechecks opt-out status before sending", async () => {
  const contact = addContact("person@example.com", true);
  await sendUpdatesConfirmation(contact.id);
  assert.equal(sentEmails.length, 0);
});

test("confirmation failures do not invalidate a saved signup", async () => {
  fail = (url) =>
    url.pathname === "/emails" ? Response.json({}, { status: 503 }) : undefined;
  assert.equal((await subscribeToUpdates(form())).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(sentEmails.length, 0);
  assert.match(String(console.error.mock.calls[0].arguments[0]), /confirmation email/);
});

test("provider failures and rate limits never produce fake success", async () => {
  fail = (url) =>
    url.hostname === "api.resend.com" ? Response.json({}, { status: 503 }) : undefined;
  assert.equal((await subscribeToUpdates(form())).status, "error");
  assert.equal(contacts.size, 0);

  fail = () => Response.json({}, { status: 429 });
  assert.equal((await subscribeToUpdates(form())).status, "error");
  assert.equal(contacts.size, 0);
});

test("provider exceptions do not leak private details", async () => {
  fail = () => {
    throw new Error("timeout with private provider response");
  };
  assert.equal((await subscribeToUpdates(form())).status, "error");
  assert.ok(
    console.error.mock.calls.every(
      (call) => !String(call.arguments).includes("private provider response"),
    ),
  );
});

test("a fresh token can retry after failure without losing the email", async () => {
  fail = (url) =>
    url.hostname === "api.resend.com" ? Response.json({}, { status: 503 }) : undefined;
  const data = form();
  assert.equal((await subscribeToUpdates(data)).status, "error");
  assert.equal(data.get("email"), "person@example.com");

  fail = () => undefined;
  data.set("turnstileToken", randomUUID());
  assert.equal((await subscribeToUpdates(data)).status, "success");
  assert.equal(contacts.size, 1);
});
