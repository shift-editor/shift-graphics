import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Logo from "../assets/logo.svg";
import WaitlistForm from "../components/WaitlistForm";

export const metadata: Metadata = {
  title: "Join the waitlist · Shift",
  description:
    "Get Shift development updates, hear about future releases, and share what you’d like to make.",
};

export default function Waitlist() {
  const enabled =
    process.env.WAITLIST_ENABLED === "true" &&
    Boolean(
      process.env.RESEND_API_KEY &&
        process.env.TURNSTILE_SECRET_KEY &&
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    );

  return (
    <div className="min-h-screen bg-app px-6 py-8 sm:px-12">
      <div className="mx-auto max-w-xl">
        <nav
          aria-label="Waitlist navigation"
          className="grid grid-cols-[2rem_1fr_2rem] items-center"
        >
          <Link
            href="/"
            aria-label="Back to Shift"
            title="Back to Shift"
            className="inline-flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link href="/" aria-label="Shift home" className="justify-self-center">
            <Logo className="block h-7 w-auto" aria-hidden />
          </Link>
        </nav>

        <main className="py-8 sm:py-12">
          <h1 className="font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
            Help shape Shift.
          </h1>
          <p className="mt-3 mb-6 font-ui text-sm leading-relaxed text-secondary">
            Join the waitlist for development updates and future releases. Have an idea
            or something you’d like to make? I’d love to hear it.
          </p>
          <WaitlistForm
            enabled={enabled}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        </main>
      </div>
    </div>
  );
}
