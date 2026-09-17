import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { afterEach, beforeEach, mock, test } from "node:test";

// Next enforces this marker during bundling; pure server tests run in Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export {}", shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

// No test can fall back to real network access, even between per-test mocks.
globalThis.fetch = async () => { throw new Error("Network is disabled in tests"); };
const {
  submitWaitlist,
  saveWaitlistContact,
  sendThankYouEmail,
  verifyTurnstile,
  createUnsubscribeToken,
  verifyUnsubscribeToken,
  unsubscribeContact,
} = await import("../src/lib/waitlist.ts");

const configuration = {
  WAITLIST_ENABLED: "true",
  WAITLIST_EMAILS_ENABLED: "true",
  RESEND_API_KEY: "test-only-not-a-real-resend-key",
  TURNSTILE_SECRET_KEY: "test-only-not-a-real-turnstile-key",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-only-public-key",
  UNSUBSCRIBE_SECRET: "test-only-signing-secret-at-least-32-characters",
};
let contacts;
let sentEmails;
let requests;
let usedTokens;
let challenge;
let fail;
let originalConfiguration;

function form(email = "person@example.com", feedback = "I want to make a typeface.") {
  const data = new FormData();
  data.set("email", email);
  data.set("feedback", feedback);
  data.set("turnstileToken", randomUUID());
  return data;
}

function addContact(email = "person@example.com", unsubscribed = false, feedback = "Earlier feedback") {
  const contact = { id: randomUUID(), email, unsubscribed, properties: { feedback } };
  contacts.set(email, contact);
  return contact;
}

beforeEach(() => {
  originalConfiguration = Object.fromEntries(Object.keys(configuration).map(key => [key, process.env[key]]));
  Object.assign(process.env, configuration);
  contacts = new Map();
  sentEmails = new Map();
  requests = [];
  usedTokens = new Set();
  challenge = { success: true, hostname: "shift.graphics", action: "waitlist" };
  fail = () => undefined;
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
      assert.ok(!("unsubscribed" in body), "Creating contacts must not explicitly resubscribe them");
      if (contacts.has(body.email)) return Response.json({}, { status: 409 });
      const contact = addContact(body.email, false, body.properties?.feedback);
      contact.properties = body.properties ?? {};
      return Response.json({ object: "contact", id: contact.id }, { status: 201 });
    }
    if (url.pathname.startsWith("/contacts/")) {
      const key = decodeURIComponent(url.pathname.slice("/contacts/".length));
      const contact = contacts.get(key) ?? [...contacts.values()].find(contact => contact.id === key);
      if (!contact) return Response.json({}, { status: 404 });
      if (method === "GET") return Response.json(contact);
      assert.equal(method, "PATCH");
      const body = JSON.parse(options.body);
      assert.notEqual(body.unsubscribed, false, "Updates must never reset opt-outs");
      if (body.properties) Object.assign(contact.properties, body.properties);
      if (body.unsubscribed === true) contact.unsubscribed = true;
      return Response.json({ object: "contact", id: contact.id });
    }
    if (url.pathname === "/emails" && method === "POST") {
      const key = options.headers["Idempotency-Key"];
      assert.ok(key);
      const body = JSON.parse(options.body);
      if (sentEmails.has(key)) assert.deepEqual(sentEmails.get(key), body);
      sentEmails.set(key, body);
      return Response.json({ id: randomUUID() });
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

for (const key of ["WAITLIST_ENABLED", "RESEND_API_KEY", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"]) {
  test(`missing ${key} fails closed without network`, async () => {
    delete process.env[key];
    assert.equal((await submitWaitlist(form())).status, "error");
    assert.equal(requests.length, 0);
  });
}

test("switches require literal true, not merely a nonempty string", async () => {
  process.env.WAITLIST_ENABLED = "false";
  assert.equal((await submitWaitlist(form())).status, "error");
  assert.equal(requests.length, 0);
  await assert.rejects(saveWaitlistContact("person@example.com", ""));
});

test("new signup stores normalized email and complete feedback, then sends a branded welcome", async () => {
  const result = await submitWaitlist(form("  PERSON+shift@EXAMPLE.com  ", "  Letters <3 & glyphs!  "));
  assert.equal(result.status, "success");
  const contact = contacts.get("person+shift@example.com");
  assert.equal(contact.properties.feedback, "Letters <3 & glyphs!");
  assert.equal(contact.unsubscribed, false);
  assert.equal(sentEmails.size, 1);
  const [email] = sentEmails.values();
  assert.equal(email.from, "Shift <updates@shift.graphics>");
  assert.equal(email.reply_to, "updates@shift.graphics");
  assert.deepEqual(email.to, [contact.email]);
  assert.ok(email.html.includes('src="cid:shift-logo"'));
  assert.ok(!email.html.includes("{{unsubscribe_url}}"));
  assert.ok(!email.html.includes(contact.properties.feedback));
  assert.ok(email.text.includes("Shift is still in development."));
  assert.ok(!("scheduled_at" in email));
  assert.equal(email.attachments[0].content_id, "shift-logo");
  assert.equal(email.attachments[0].content_type, "image/png");
  assert.deepEqual(Buffer.from(email.attachments[0].content, "base64"), await readFile("src/emails/assets/shift-logo.png"));
  const unsubscribeUrl = new URL(email.headers["List-Unsubscribe"].slice(1, -1));
  assert.equal(unsubscribeUrl.origin, "https://shift.graphics");
  assert.equal(unsubscribeUrl.pathname, "/unsubscribe");
  assert.equal(verifyUnsubscribeToken(unsubscribeUrl.searchParams.get("token")), contact.id);
  assert.ok(!unsubscribeUrl.href.includes(contact.email));
  assert.ok(email.text.includes(unsubscribeUrl.href));
});

test("email delivery is independently off by default", async () => {
  delete process.env.WAITLIST_EMAILS_ENABLED;
  assert.equal((await submitWaitlist(form())).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(sentEmails.size, 0);
  assert.equal(requests.filter(request => request.url.pathname === "/emails").length, 0);
});

test("email helper obeys both kill switches even when called directly", async () => {
  const contact = addContact();
  process.env.WAITLIST_ENABLED = "false";
  await sendThankYouEmail(contact.id);
  process.env.WAITLIST_ENABLED = "true";
  process.env.WAITLIST_EMAILS_ENABLED = "false";
  await sendThankYouEmail(contact.id);
  assert.equal(requests.length, 0);
});

for (const email of ["", "bad-address", "a@localhost", "a\r\nBcc:other@example.com", ".a@example.com", "a..b@example.com", "a.@example.com", "a@-example.com", "a".repeat(65) + "@example.com", "a@" + "b".repeat(64) + ".com"]) {
  test(`invalid email is rejected before provider access: ${JSON.stringify(email)}`, async () => {
    assert.equal((await submitWaitlist(form(email))).status, "error");
    assert.equal(requests.length, 0);
  });
}

test("file inputs and duplicate fields are rejected", async () => {
  const file = form();
  file.set("email", new Blob(["email"]), "email.txt");
  assert.equal((await submitWaitlist(file)).status, "error");
  const duplicate = form();
  duplicate.append("email", "another@example.com");
  assert.equal((await submitWaitlist(duplicate)).status, "error");
  const feedbackFile = form();
  feedbackFile.set("feedback", new Blob(["feedback"]), "feedback.txt");
  assert.equal((await submitWaitlist(feedbackFile)).status, "error");
  assert.equal(requests.length, 0);
});

test("feedback limit is enforced without truncating user input", async () => {
  const oversized = form("person@example.com", "x".repeat(2001));
  assert.equal((await submitWaitlist(oversized)).status, "error");
  assert.equal(requests.length, 0);
  assert.equal(oversized.get("feedback").length, 2001);
  process.env.WAITLIST_EMAILS_ENABLED = "false";
  assert.equal((await submitWaitlist(form("person@example.com", "x".repeat(2000)))).status, "success");
  assert.equal(contacts.get("person@example.com").properties.feedback.length, 2000);
});

test("feedback may be omitted", async () => {
  const data = form();
  data.delete("feedback");
  assert.equal((await submitWaitlist(data)).status, "success");
  assert.deepEqual(contacts.get("person@example.com").properties, {});
});

for (const values of [
  { success: false },
  { hostname: "attacker.example" },
  { action: "other-action" },
]) {
  test(`Turnstile rejects mismatched claims ${JSON.stringify(values)}`, async () => {
    Object.assign(challenge, values);
    assert.equal((await submitWaitlist(form())).status, "error");
    assert.equal(contacts.size, 0);
    assert.equal(sentEmails.size, 0);
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
  assert.equal((await submitWaitlist(data)).status, "error");
  data.set("turnstileToken", "x".repeat(2049));
  assert.equal((await submitWaitlist(data)).status, "error");
  assert.equal(requests.length, 0);
});

test("provider failures preserve input and a fresh-token retry can succeed", async () => {
  fail = url => url.hostname === "api.resend.com" ? Response.json({}, { status: 503 }) : undefined;
  const data = form();
  assert.equal((await submitWaitlist(data)).status, "error");
  assert.equal(data.get("email"), "person@example.com");
  assert.equal(data.get("feedback"), "I want to make a typeface.");
  assert.equal(contacts.size, 0);
  fail = () => undefined;
  data.set("turnstileToken", randomUUID());
  assert.equal((await submitWaitlist(data)).status, "success");
  assert.equal(contacts.size, 1);
});

test("timeouts and rate limits do not produce fake signup success", async () => {
  fail = () => { throw new Error("timeout with private provider response"); };
  assert.equal((await submitWaitlist(form())).status, "error");
  fail = () => Response.json({}, { status: 429 });
  assert.equal((await submitWaitlist(form())).status, "error");
  assert.equal(contacts.size, 0);
  assert.ok(console.error.mock.calls.every(call => !String(call.arguments).includes("private")));
});

test("duplicates keep one contact, update nonempty feedback, and never welcome twice", async () => {
  assert.equal((await submitWaitlist(form())).status, "success");
  assert.equal((await submitWaitlist(form("PERSON@example.com", "Updated idea"))).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(contacts.get("person@example.com").properties.feedback, "Updated idea");
  assert.equal(sentEmails.size, 1);
  assert.equal(requests.filter(request => request.url.pathname === "/emails").length, 1);
});

test("blank repeat feedback does not erase previous feedback", async () => {
  const contact = addContact();
  assert.equal((await submitWaitlist(form(contact.email, "  "))).status, "success");
  assert.equal(contact.properties.feedback, "Earlier feedback");
  assert.equal(sentEmails.size, 0);
});

test("existing opt-outs stay opted out even when feedback changes", async () => {
  const contact = addContact("person@example.com", true);
  assert.equal((await submitWaitlist(form(contact.email, "New feedback"))).status, "success");
  assert.equal(contact.unsubscribed, true);
  assert.equal(contact.properties.feedback, "New feedback");
  assert.equal(sentEmails.size, 0);
});

test("concurrent create conflict resolves without resubscription or welcome", async () => {
  fail = (url, method) => {
    if (url.pathname === "/contacts" && method === "POST") {
      addContact("person@example.com", true);
      return Response.json({}, { status: 409 });
    }
  };
  assert.equal((await submitWaitlist(form())).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(contacts.get("person@example.com").unsubscribed, true);
  assert.equal(contacts.get("person@example.com").properties.feedback, "I want to make a typeface.");
  assert.equal(sentEmails.size, 0);
});

test("failed feedback storage must not claim success", async () => {
  const contact = addContact();
  fail = (_url, method) => method === "PATCH" ? Response.json({}, { status: 422 }) : undefined;
  assert.equal((await submitWaitlist(form())).status, "error");
  assert.equal(contact.properties.feedback, "Earlier feedback");
});

test("welcome failure does not invalidate the saved signup or auto-resend on retry", async () => {
  fail = url => url.pathname === "/emails" ? Response.json({}, { status: 503 }) : undefined;
  assert.equal((await submitWaitlist(form())).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(sentEmails.size, 0);
  fail = () => undefined;
  assert.equal((await submitWaitlist(form())).status, "success");
  assert.equal(sentEmails.size, 0);
  assert.equal(requests.filter(request => request.url.pathname === "/emails").length, 1);
});

test("welcome is blocked without a strong unsubscribe signing secret", async () => {
  process.env.UNSUBSCRIBE_SECRET = "too-short";
  assert.equal((await submitWaitlist(form())).status, "success");
  assert.equal(contacts.size, 1);
  assert.equal(sentEmails.size, 0);
  assert.equal(requests.filter(request => request.url.pathname === "/emails").length, 0);
});

test("welcome checks opt-out immediately before sending", async () => {
  const contact = addContact("person@example.com", true);
  await sendThankYouEmail(contact.id);
  assert.equal(sentEmails.size, 0);
});

test("welcome fails closed on unknown subscription status", async () => {
  const contact = addContact();
  delete contact.unsubscribed;
  await assert.rejects(sendThankYouEmail(contact.id));
  assert.equal(sentEmails.size, 0);
});

test("welcome uses a stable idempotency key and unchanged payload", async () => {
  const contact = addContact();
  await sendThankYouEmail(contact.id);
  await sendThankYouEmail(contact.id);
  assert.equal(sentEmails.size, 1);
  assert.ok(sentEmails.has(`shift-welcome/${contact.id}`));
});

test("unsubscribe signatures are stable, private, and reject tampering", () => {
  const id = randomUUID();
  const token = createUnsubscribeToken(id);
  assert.equal(token, createUnsubscribeToken(id));
  assert.equal(verifyUnsubscribeToken(token), id);
  const [contactId, signature] = token.split(".");
  const altered = `${contactId}.${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}`;
  assert.equal(verifyUnsubscribeToken(altered), null);
  assert.equal(verifyUnsubscribeToken(`${randomUUID()}.${signature}`), null);
  for (const invalid of ["", "x", token + ".extra", token + " ", "x".repeat(1000)]) {
    assert.equal(verifyUnsubscribeToken(invalid), null);
  }
  assert.throws(() => createUnsubscribeToken("not-a-contact-id"));
  assert.equal(requests.length, 0, "Token checks must never mutate subscriptions");
});

test("missing or changed secrets invalidate unsubscribe tokens safely", () => {
  const token = createUnsubscribeToken(randomUUID());
  process.env.UNSUBSCRIBE_SECRET = "different-secret-at-least-32-characters";
  assert.equal(verifyUnsubscribeToken(token), null);
  delete process.env.UNSUBSCRIBE_SECRET;
  assert.equal(verifyUnsubscribeToken(token), null);
});

test("confirmed unsubscribe is idempotent and works with signup and sending disabled", async () => {
  const contact = addContact();
  const data = new FormData();
  data.set("token", createUnsubscribeToken(contact.id));
  process.env.WAITLIST_ENABLED = "false";
  process.env.WAITLIST_EMAILS_ENABLED = "false";
  assert.equal((await unsubscribeContact(data)).status, "success");
  assert.equal(contact.unsubscribed, true);
  assert.equal((await unsubscribeContact(data)).status, "success");
  assert.equal(sentEmails.size, 0);
});

test("invalid unsubscribe request never reaches Resend", async () => {
  const data = new FormData();
  data.set("token", "forged");
  assert.equal((await unsubscribeContact(data)).status, "error");
  assert.equal(requests.length, 0);
});

test("unsubscribe does not falsely report success on provider failure", async () => {
  const contact = addContact();
  const data = new FormData();
  data.set("token", createUnsubscribeToken(contact.id));
  fail = () => Response.json({}, { status: 503 });
  assert.equal((await unsubscribeContact(data)).status, "error");
  assert.equal(contact.unsubscribed, false);
});

test("deleted contact can safely be treated as unsubscribed", async () => {
  const data = new FormData();
  data.set("token", createUnsubscribeToken(randomUUID()));
  assert.equal((await unsubscribeContact(data)).status, "success");
  assert.equal(contacts.size, 0);
});
