import "server-only";
import type { UpdatesSignupResult } from "./updates-types";

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
    result.action === "updates-signup" &&
    ["shift.graphics", "www.shift.graphics"].includes(result.hostname)
  );
}

export async function subscribeToUpdates(
  formData: FormData,
): Promise<UpdatesSignupResult> {
  if (
    process.env.UPDATES_SIGNUP_ENABLED !== "true" ||
    !process.env.RESEND_API_KEY ||
    !process.env.TURNSTILE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ) {
    return {
      status: "error",
      message: "Updates signup is temporarily unavailable. Please try again later.",
    };
  }

  const email = formData.get("email");
  const turnstileToken = formData.get("turnstileToken");
  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
      email.trim(),
    ) ||
    email.trim().split("@")[0].length > 64 ||
    email.trim().startsWith(".") ||
    email.trim().split("@")[0].endsWith(".") ||
    email.trim().split("@")[0].includes("..") ||
    formData.getAll("email").length !== 1
  ) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (
    typeof turnstileToken !== "string" ||
    !turnstileToken ||
    turnstileToken.length > 2048 ||
    formData.getAll("turnstileToken").length !== 1
  ) {
    return {
      status: "error",
      message: "Complete the security check, then try again.",
    };
  }

  try {
    if (!(await verifyTurnstile(turnstileToken))) {
      return {
        status: "error",
        message: "The security check expired or failed. Please try again.",
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const headers = {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };
    const contactUrl = `https://api.resend.com/contacts/${encodeURIComponent(normalizedEmail)}`;
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
    } else {
      const created = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: normalizedEmail }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });

      if (created.status === 409) {
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
      } else {
        if (!created.ok) throw new Error("Contact could not be saved");
        const contact = await created.json();
        if (typeof contact.id !== "string" || !contactIdPattern.test(contact.id)) {
          throw new Error("Invalid contact response");
        }
      }
    }

    return {
      status: "success",
      message: "Thanks. Your request was received, and existing email preferences were left unchanged.",
    };
  } catch {
    console.error("Updates signup could not be completed.");
    return {
      status: "error",
      message: "We couldn’t subscribe you right now. Please try again.",
    };
  }
}
