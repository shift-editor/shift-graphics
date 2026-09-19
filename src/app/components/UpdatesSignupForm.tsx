"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { subscribeToUpdates } from "@/app/actions";
import type { TurnstileApi, UpdatesSignupResult } from "@/lib/updates-types";

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export default function UpdatesSignupForm({
  enabled,
  siteKey,
}: {
  enabled: boolean;
  siteKey?: string;
}) {
  const [result, action, pending] = useActionState<UpdatesSignupResult, FormData>(
    subscribeToUpdates,
    { status: "idle", message: "" },
  );
  const [email, setEmail] = useState("");
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
        action: "updates-signup",
        appearance: "interaction-only",
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
        className="rounded border border-line bg-surface p-4 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {result.message}
      </div>
    );
  }

  return (
    <form action={action} aria-busy={pending}>
      <div
        ref={notice}
        tabIndex={-1}
        role={status === "error" ? "alert" : "status"}
        id="updates-signup-notice"
        className={
          status === "error"
            ? "mb-3 rounded border border-danger-line bg-danger-surface p-3 text-xs leading-relaxed text-danger focus:outline-none focus:ring-2 focus:ring-danger"
            : "sr-only"
        }
      >
        {status === "submitting" ? "Subscribing to Shift updates…" : result.message}
      </div>

      <fieldset disabled={pending} className="min-w-0">
        <legend className="sr-only">Subscribe to Shift updates</legend>
        <label htmlFor="updates-email" className="mb-1 block text-xs">
          Email Address
        </label>
        <div className="flex gap-2">
          <input
            id="updates-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby="updates-signup-notice"
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded border border-line bg-surface-raised px-3 py-2.5 text-xs placeholder:text-placeholder focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending || !enabled}
            className="rounded bg-accent px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Submitting…" : "Submit"}
          </button>
        </div>

        {enabled && siteKey && (
          <>
            <div ref={widget} className="mt-3" />
            <Script
              id="updates-turnstile"
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="afterInteractive"
              onReady={() => {
                if (!widget.current || !window.turnstile || widgetId.current !== null) return;

                widgetId.current = window.turnstile.render(widget.current, {
                  sitekey: siteKey,
                  action: "updates-signup",
                  appearance: "interaction-only",
                  "response-field-name": "turnstileToken",
                });
              }}
            />
          </>
        )}
      </fieldset>
    </form>
  );
}
