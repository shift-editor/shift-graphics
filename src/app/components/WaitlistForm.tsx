"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { submitWaitlist } from "@/app/actions";
import type { TurnstileApi, WaitlistResult } from "@/lib/waitlist-types";

const controlClassName =
  "w-full rounded-lg border border-line bg-surface-raised px-4 py-3 text-sm placeholder:text-placeholder focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60";
const buttonClassName =
  "w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export default function WaitlistForm({
  enabled,
  siteKey,
}: {
  enabled: boolean;
  siteKey?: string;
}) {
  const [result, action, pending] = useActionState<WaitlistResult, FormData>(
    submitWaitlist,
    { status: "idle", message: "" },
  );
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const notice = useRef<HTMLDivElement>(null);
  const status = pending ? "submitting" : result.status;

  useEffect(() => {
    if (result.status === "idle") return;

    notice.current?.focus();
    if (result.status === "error" && widgetId.current !== null) {
      window.turnstile?.reset(widgetId.current);
    }
  }, [result]);

  useEffect(() => {
    if (
      enabled &&
      siteKey &&
      widget.current &&
      window.turnstile &&
      widgetId.current === null
    ) {
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: siteKey,
        action: "waitlist",
        "response-field-name": "turnstileToken",
      });
    }

    return () => {
      if (widgetId.current === null) return;

      window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [enabled, siteKey]);

  if (status === "success") {
    return (
      <div
        ref={notice}
        tabIndex={-1}
        role="status"
        className="rounded-lg border border-line bg-surface p-5 font-ui focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <h2 className="text-base font-semibold">Thanks for helping shape Shift.</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{result.message}</p>
      </div>
    );
  }

  return (
    <form action={action} aria-busy={pending} className="font-ui">
      <div
        ref={notice}
        tabIndex={-1}
        role={status === "error" ? "alert" : "status"}
        id="waitlist-notice"
        className={
          status === "error"
            ? "mb-4 rounded-lg border border-danger-line bg-danger-surface p-3 text-sm text-danger focus:outline-none focus:ring-2 focus:ring-danger"
            : "sr-only"
        }
      >
        {status === "submitting" ? "Submitting your signup…" : result.message}
      </div>

      <fieldset disabled={pending} className="min-w-0 space-y-5">
        <legend className="sr-only">Join the Shift waitlist</legend>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby="waitlist-notice"
            placeholder="you@example.com"
            className={controlClassName}
          />
        </div>

        <div>
          <label htmlFor="feedback" className="mb-2 block text-sm font-medium">
            What would you use Shift for? Any feedback?
            <span className="mt-1 block text-xs font-normal text-secondary">Optional</span>
          </label>
          <textarea
            id="feedback"
            name="feedback"
            rows={4}
            maxLength={2000}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            aria-describedby="feedback-hint waitlist-notice"
            placeholder="A typeface you want to make, a feature you’re missing, or something we should know…"
            className={`${controlClassName} resize-y`}
          />
          <p id="feedback-hint" className="mt-2 text-xs text-secondary">
            A sentence or two is plenty. Up to 2,000 characters.
          </p>
        </div>

        {enabled && siteKey && (
          <>
            <div ref={widget} />
            <Script
              id="waitlist-turnstile"
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="afterInteractive"
              onReady={() => {
                if (!widget.current || !window.turnstile || widgetId.current !== null) return;

                widgetId.current = window.turnstile.render(widget.current, {
                  sitekey: siteKey,
                  action: "waitlist",
                  "response-field-name": "turnstileToken",
                });
              }}
            />
            <p className="text-xs leading-relaxed text-secondary">
              Complete the security check before joining. If it doesn’t load, refresh the
              page or check your content blocker.
            </p>
          </>
        )}

        <button
          type="submit"
          disabled={pending || !enabled}
          className={buttonClassName}
        >
          {status === "submitting" ? "Joining…" : "Join the waitlist"}
        </button>
      </fieldset>

      {enabled && (
        <p className="mt-4 text-xs leading-relaxed text-secondary">
          Updates about Shift. Unsubscribe whenever you like.
        </p>
      )}
    </form>
  );
}
