import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../assets/logo.svg";
import UnsubscribeForm from "../components/UnsubscribeForm";
import { verifyUnsubscribeToken } from "@/lib/waitlist";

export const metadata: Metadata = {
  title: "Unsubscribe · Shift",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Unsubscribe({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && verifyUnsubscribeToken(token) !== null;

  // GET only verifies the signature locally. It never calls Resend or opts out.
  return (
    <main className="flex min-h-screen items-start justify-center bg-app px-5 py-16 font-ui">
      <section className="w-full max-w-lg rounded-lg bg-surface p-6 sm:p-10">
        <Logo className="mb-8 h-7 w-auto" role="img" aria-label="Shift" />
        <h1 className="mb-5 text-2xl font-semibold tracking-tight">Email preferences</h1>
        {valid ? (
          <UnsubscribeForm token={token} />
        ) : (
          <p role="alert" className="text-sm leading-relaxed text-secondary">
            This unsubscribe link is invalid or unavailable. Please use the link in your
            email, or contact updates@shift.graphics for help.
          </p>
        )}
        <Link href="/" className="mt-8 inline-block text-sm text-secondary hover:opacity-70">
          Back to Shift
        </Link>
      </section>
    </main>
  );
}
