import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { WaitlistContact, WaitlistResult } from "./waitlist-types";

// Never derive link destinations from request headers or submitted form fields.
const siteUrl = "https://shift.graphics";
const contactIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function verifyTurnstile(turnstileToken: string): Promise<boolean> {
  if (
    !process.env.TURNSTILE_SECRET_KEY ||
    !turnstileToken ||
    turnstileToken.length > 2048
  ) {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    },
  );
  if (!response.ok) return false;

  const result = await response.json();
  return (
    result.success === true &&
    result.action === "waitlist" &&
    ["shift.graphics", "www.shift.graphics"].includes(result.hostname)
  );
}

export async function saveWaitlistContact(
  email: string,
  feedback: string,
): Promise<WaitlistContact> {
  if (process.env.WAITLIST_ENABLED !== "true" || !process.env.RESEND_API_KEY) {
    throw new Error("Waitlist storage is disabled");
  }

  const headers = {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };
  const contactUrl = `https://api.resend.com/contacts/${encodeURIComponent(email)}`;
  const existing = await fetch(contactUrl, {
    headers,
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!existing.ok && existing.status !== 404) {
    throw new Error("Contact lookup failed");
  }

  if (existing.ok) {
    const contact = await existing.json();
    if (typeof contact.id !== "string" || !contactIdPattern.test(contact.id)) {
      throw new Error("Invalid contact response");
    }
    // Omitting feedback must not erase earlier feedback. Never set unsubscribed:false.
    if (feedback) {
      const updated = await fetch(contactUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ properties: { feedback } }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!updated.ok) throw new Error("Feedback could not be saved");
    }
    return { id: contact.id, created: false };
  }

  const response = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      ...(feedback ? { properties: { feedback } } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  // A concurrent signup may have created the same contact after the lookup.
  // Resolve the conflict through a fresh lookup, without resubscribing or sending.
  if (response.status === 409) {
    const concurrent = await fetch(contactUrl, {
      headers,
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!concurrent.ok) throw new Error("Contact conflict could not be resolved");
    const contact = await concurrent.json();
    if (typeof contact.id !== "string" || !contactIdPattern.test(contact.id)) {
      throw new Error("Invalid contact response");
    }
    if (feedback) {
      const updated = await fetch(contactUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ properties: { feedback } }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!updated.ok) throw new Error("Feedback could not be saved");
    }
    return { id: contact.id, created: false };
  }

  if (!response.ok) throw new Error("Contact could not be saved");
  const contact = await response.json();
  if (typeof contact.id !== "string" || !contactIdPattern.test(contact.id)) {
    throw new Error("Invalid contact response");
  }
  return { id: contact.id, created: true };
}

export function createUnsubscribeToken(id: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 32 || !contactIdPattern.test(id)) {
    throw new Error("Unsubscribe signing is not configured");
  }
  // No email address in the URL, and no expiry: old emails must remain usable.
  const signature = createHmac("sha256", secret)
    .update(`shift-unsubscribe:${id}`)
    .digest("base64url");
  return `${id}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  if (typeof token !== "string" || token.length > 128) return null;
  const [id, signature, extra] = token.split(".");
  if (
    extra !== undefined ||
    !id ||
    !contactIdPattern.test(id) ||
    !signature ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature) ||
    !process.env.UNSUBSCRIBE_SECRET ||
    process.env.UNSUBSCRIBE_SECRET.length < 32
  ) {
    return null;
  }
  const expected = createUnsubscribeToken(id).split(".")[1];
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null;
}

export async function sendThankYouEmail(id: string): Promise<void> {
  if (
    process.env.WAITLIST_ENABLED !== "true" ||
    process.env.WAITLIST_EMAILS_ENABLED !== "true"
  ) {
    return;
  }
  if (!process.env.RESEND_API_KEY) throw new Error("Email delivery is not configured");

  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${createUnsubscribeToken(id)}`;
  // Transactional sends do not inherently honor a Contact's Broadcast opt-out.
  const response = await fetch(`https://api.resend.com/contacts/${id}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Subscription could not be checked");
  const contact = await response.json();
  if (contact.unsubscribed === true) return;
  if (
    contact.id !== id ||
    contact.unsubscribed !== false ||
    typeof contact.email !== "string" ||
    !contact.email
  ) {
    throw new Error("Invalid subscription response");
  }

  const html = await readFile(path.join(process.cwd(), "src/emails/thank-you.html"), "utf8");
  if (!html.includes("{{unsubscribe_url}}")) {
    throw new Error("Email template is missing its unsubscribe link");
  }
  const logo = await readFile(path.join(process.cwd(), "src/emails/assets/shift-logo.png"));
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      // Resend retains idempotency keys for 24 hours. Existing contacts are
      // skipped separately, so a normal repeat signup does not send after that.
      "Idempotency-Key": `shift-welcome/${id}`,
    },
    body: JSON.stringify({
      from: "Shift <updates@shift.graphics>",
      reply_to: "updates@shift.graphics",
      to: [contact.email],
      subject: "Thanks for joining the Shift waitlist",
      html: html.replaceAll("{{unsubscribe_url}}", unsubscribeUrl),
      text: [
        "You’re on the list.",
        "Hey,",
        "Thanks for joining the Shift waitlist. I’m glad you’re here.",
        "Shift is still in development. I’ll email you with progress updates and let you know when there’s a release to try.",
        "What would you like to make with Shift? Just hit reply. I’d love to hear what you have in mind, or what you wish your current font editor did better.",
        "Thanks,\nKostya",
        "GitHub: https://github.com/shift-editor/shift\nDiscord: https://discord.gg/582FxBdNH7\nX: https://x.com/kostyafarber_",
        "You’re receiving this because you joined the Shift waitlist.",
        `Unsubscribe: ${unsubscribeUrl}`,
      ].join("\n\n"),
      headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
      attachments: [{
        filename: "shift-logo.png",
        content: logo.toString("base64"),
        content_type: "image/png",
        content_id: "shift-logo",
      }],
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!sent.ok) throw new Error("Welcome email was not accepted");
}

export async function submitWaitlist(formData: FormData): Promise<WaitlistResult> {
  if (
    process.env.WAITLIST_ENABLED !== "true" ||
    !process.env.RESEND_API_KEY ||
    !process.env.TURNSTILE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ) {
    return { status: "error", message: "Signups are temporarily unavailable. Please try again later." };
  }

  const email = formData.get("email");
  const feedback = formData.get("feedback");
  const turnstileToken = formData.get("turnstileToken");
  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(email.trim()) ||
    email.trim().split("@")[0].length > 64 ||
    email.trim().startsWith(".") ||
    email.trim().split("@")[0].endsWith(".") ||
    email.trim().split("@")[0].includes("..") ||
    formData.getAll("email").length !== 1
  ) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (
    (feedback !== null && typeof feedback !== "string") ||
    (typeof feedback === "string" && feedback.length > 2000) ||
    formData.getAll("feedback").length > 1
  ) {
    return { status: "error", message: "Keep feedback to 2,000 characters or fewer." };
  }
  if (
    typeof turnstileToken !== "string" ||
    !turnstileToken ||
    turnstileToken.length > 2048 ||
    formData.getAll("turnstileToken").length !== 1
  ) {
    return { status: "error", message: "Complete the security check, then try again." };
  }

  try {
    if (!(await verifyTurnstile(turnstileToken))) {
      return { status: "error", message: "The security check expired or failed. Please try again." };
    }
    const contact = await saveWaitlistContact(
      email.trim().toLowerCase(),
      typeof feedback === "string" ? feedback.trim() : "",
    );
    if (contact.created) {
      try {
        await sendThankYouEmail(contact.id);
      } catch {
        // Never log email addresses, feedback, tokens, or provider response bodies.
        // No automatic retry queue: the saved signup remains valid.
        console.error("Waitlist saved; welcome email could not be delivered.");
      }
    }
    return {
      status: "success",
      message: "Thanks for your interest in Shift. We’ve received your submission. Any existing email preferences are unchanged.",
    };
  } catch {
    console.error("Waitlist submission could not be completed.");
    return {
      status: "error",
      message: "We couldn’t complete your signup. Please try again; your feedback is still here.",
    };
  }
}

export async function unsubscribeContact(formData: FormData): Promise<WaitlistResult> {
  const token = formData.get("token");
  const id = typeof token === "string" && formData.getAll("token").length === 1
    ? verifyUnsubscribeToken(token)
    : null;
  if (!id) {
    return { status: "error", message: "This unsubscribe link is invalid. Please use the link in your email." };
  }
  // Opt-outs must keep working even if signup or welcome sending is switched off.
  if (!process.env.RESEND_API_KEY) {
    return { status: "error", message: "We couldn’t update your subscription. Please try again later or email updates@shift.graphics." };
  }
  try {
    const response = await fetch(`https://api.resend.com/contacts/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unsubscribed: true }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    // A deleted contact is also no longer on the mailing list.
    if (!response.ok && response.status !== 404) throw new Error("Unsubscribe failed");
    return { status: "success", message: "You’re unsubscribed from Shift updates." };
  } catch {
    console.error("Unsubscribe request could not be completed.");
    return { status: "error", message: "We couldn’t update your subscription. Please try again or email updates@shift.graphics." };
  }
}
