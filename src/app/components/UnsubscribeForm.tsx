"use client";

import { useActionState } from "react";
import { unsubscribeContact } from "@/app/actions";
import type { WaitlistResult } from "@/lib/waitlist-types";

export default function UnsubscribeForm({ token }: { token: string }) {
  const [result, action, pending] = useActionState<WaitlistResult, FormData>(
    unsubscribeContact,
    { status: "idle", message: "" },
  );

  if (result.status === "success") {
    return (
      <p role="status" className="text-sm leading-relaxed">
        {result.message}
      </p>
    );
  }

  return (
    <form action={action} aria-busy={pending} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm leading-relaxed text-secondary">
        Stop receiving Shift development updates and release announcements?
      </p>
      {result.status === "error" && (
        <p role="alert" className="text-sm text-danger">
          {result.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Unsubscribing…" : "Confirm unsubscribe"}
      </button>
      <p role="status" className="sr-only">
        {pending ? "Updating your subscription…" : ""}
      </p>
    </form>
  );
}
