import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/app/components/SiteFooter";
import type { UpdatesSignupPreviewState } from "@/lib/updates-types";

export const metadata: Metadata = {
  title: "Footer states preview · Shift",
  robots: { index: false, follow: false },
};

const previewStates: UpdatesSignupPreviewState[] = [
  "idle",
  "submitting",
  "success",
  "error",
];

export default async function FooterPreview({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { state: requestedState } = await searchParams;
  const state: UpdatesSignupPreviewState = previewStates.includes(
    requestedState as UpdatesSignupPreviewState,
  )
    ? (requestedState as UpdatesSignupPreviewState)
    : "idle";

  return (
    <main className="flex min-h-screen flex-col bg-app">
      <header className="px-6 pt-8 font-ui sm:px-8">
        <h1 className="text-sm font-semibold">Footer signup states</h1>
        <p className="mt-2 text-xs text-secondary">
          Development-only preview. Forms and external requests are disabled.
        </p>
        <nav aria-label="Preview state" className="mt-5 flex flex-wrap gap-2 text-xs">
          {previewStates.map((previewState) => (
            <Link
              key={previewState}
              href={`/preview/footer?state=${previewState}`}
              aria-current={state === previewState ? "page" : undefined}
              className={`rounded border px-3 py-2 capitalize transition-colors ${
                state === previewState
                  ? "border-accent bg-accent text-white"
                  : "border-line hover:border-accent"
              }`}
            >
              {previewState}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mt-auto">
        <SiteFooter previewState={state} />
      </div>
    </main>
  );
}
