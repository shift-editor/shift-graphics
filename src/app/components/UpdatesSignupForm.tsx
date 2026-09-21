"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { subscribeToUpdates } from "@/app/actions";
import type {
  TurnstileApi,
  UpdatesSignupPreviewState,
  UpdatesSignupResult,
} from "@/lib/updates-types";

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export default function UpdatesSignupForm({
  enabled,
  siteKey,
  previewState,
}: {
  enabled: boolean;
  siteKey?: string;
  previewState?: UpdatesSignupPreviewState;
}) {
  const [result, action, pending] = useActionState<UpdatesSignupResult, FormData>(
    subscribeToUpdates,
    { status: "idle", message: "" },
  );
  const [email, setEmail] = useState(previewState === "error" ? "you@example.com" : "");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const notice = useRef<HTMLDivElement>(null);
  const status = previewState ?? (pending ? "submitting" : result.status);
  const displayedResult: UpdatesSignupResult =
    previewState === "success"
      ? {
          status: "success",
          message: "Thanks—your signup has been received.",
        }
      : previewState === "error"
        ? { status: "error", message: "Enter a valid email address." }
        : result;

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
      !previewState &&
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
  }, [enabled, previewState, siteKey]);

  if (status === "success") {
    return (
      <div
        ref={notice}
        tabIndex={-1}
        role="status"
        className="rounded border border-black bg-surface p-4 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {displayedResult.message}
      </div>
    );
  }

  return (
    <form
      action={previewState ? undefined : action}
      aria-busy={status === "submitting"}
      onSubmit={previewState ? (event) => event.preventDefault() : undefined}
    >
      <fieldset disabled={status === "submitting"} className="min-w-0">
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
            aria-invalid={status === "error" ? true : undefined}
            placeholder="you@example.com"
            className={`min-w-0 flex-1 rounded border bg-surface-raised px-3 py-2.5 text-xs placeholder:text-placeholder focus:border-transparent focus:outline-none focus:ring-2 disabled:opacity-60 ${
              status === "error"
                ? "border-danger-line focus:ring-danger"
                : "border-line focus:ring-accent"
            }`}
          />
          <button
            type="submit"
            disabled={previewState ? status === "submitting" : pending || !enabled}
            className="inline-flex min-w-20 items-center justify-center rounded bg-accent px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed"
          >
            {status === "submitting" ? (
              <>
                <span aria-hidden="true" className="flex items-center gap-1">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-white [animation-delay:-300ms] [animation-duration:900ms] motion-reduce:animate-none" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-white [animation-delay:-150ms] [animation-duration:900ms] motion-reduce:animate-none" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-white [animation-duration:900ms] motion-reduce:animate-none" />
                </span>
                <span className="sr-only">Submitting…</span>
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>

        <div
          ref={notice}
          tabIndex={-1}
          role={status === "error" ? "alert" : "status"}
          id="updates-signup-notice"
          className={
            status === "error"
              ? "mt-2 text-xs text-danger focus:outline-none"
              : "sr-only"
          }
        >
          {status === "submitting"
            ? "Subscribing to Shift updates…"
            : displayedResult.message}
        </div>

        {enabled && siteKey && !previewState && (
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
