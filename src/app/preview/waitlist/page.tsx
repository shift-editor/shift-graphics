import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Logo from "../../assets/logo.svg";

const controlClassName =
  "w-full rounded-lg border border-line bg-surface-raised px-4 py-3 font-ui text-sm placeholder:text-placeholder focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent";

export const metadata: Metadata = {
  title: "Waitlist and thank-you email · Shift",
  robots: { index: false, follow: false },
};

export default async function WaitlistPreview() {
  if (process.env.NODE_ENV !== "development") notFound();

  const [thankYouHtml, logo] = await Promise.all([
    readFile(path.join(process.cwd(), "src/emails/thank-you.html"), "utf8"),
    readFile(path.join(process.cwd(), "src/emails/assets/shift-logo.png")),
  ]);
  const srcDoc = thankYouHtml
    .replace("cid:shift-logo", `data:image/png;base64,${logo.toString("base64")}`)
    .replaceAll("{{unsubscribe_url}}", "#");

  return (
    <main className="min-h-screen bg-app px-5 py-8 text-primary sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center border-b border-line pb-6">
          <Logo className="h-7 w-auto" role="img" aria-label="Shift" />
        </header>

        <div className="grid items-start gap-12 py-10 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="form-preview-heading">
            <p className="mb-6 font-mono text-xs tracking-widest text-secondary uppercase">
              01 / Website form
            </p>
            <div className="mx-auto max-w-xl py-6 sm:py-10">
              <h1
                id="form-preview-heading"
                className="text-3xl font-semibold tracking-tight"
              >
                Help shape Shift.
              </h1>
              <p className="mt-3 font-ui text-sm leading-relaxed text-secondary">
                Join the waitlist for development updates and future releases of a free,
                open-source font editor.
              </p>

              {/* Deliberately not a form: Enter and clicks cannot submit data. */}
              <fieldset className="mt-8 min-w-0 space-y-5">
                <legend className="sr-only">Waitlist form</legend>
                <div>
                  <label htmlFor="email" className="mb-2 block font-ui text-sm font-medium">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={controlClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedback"
                    className="mb-2 block font-ui text-sm font-medium"
                  >
                    What would you use Shift for? Any feedback?
                    <span className="mt-1 block text-xs font-normal text-secondary">
                      Optional
                    </span>
                  </label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    rows={4}
                    maxLength={2000}
                    aria-describedby="feedback-hint"
                    placeholder="A typeface you want to make, a feature you’re missing, or something we should know…"
                    className={`${controlClassName} resize-y`}
                  />
                  <p id="feedback-hint" className="mt-2 font-ui text-xs text-secondary">
                    A sentence or two is plenty. Up to 2,000 characters.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-accent px-5 py-3 font-ui text-sm font-medium text-white sm:w-auto"
                >
                  Join the waitlist
                </button>
                <p className="font-ui text-xs leading-relaxed text-secondary">
                  Updates about Shift. Unsubscribe whenever you like.
                </p>
              </fieldset>
            </div>
          </section>

          <section aria-labelledby="email-preview-heading" className="min-w-0">
            <h2
              id="email-preview-heading"
              className="mb-6 font-mono text-xs tracking-widest text-secondary uppercase"
            >
              02 / Thank-you email
            </h2>
            <dl className="space-y-2 border-y border-line py-4 font-ui text-sm">
              <div>
                <dt className="inline text-secondary">Subject: </dt>
                <dd className="inline">Thanks for joining the Shift waitlist</dd>
              </div>
              <div>
                <dt className="inline text-secondary">From: </dt>
                <dd className="inline">Shift &lt;updates@shift.graphics&gt;</dd>
              </div>
              <div>
                <dt className="inline text-secondary">Reply-To: </dt>
                <dd className="inline">updates@shift.graphics</dd>
              </div>
            </dl>
            <iframe
              title="Shift thank-you email"
              srcDoc={srcDoc}
              sandbox=""
              referrerPolicy="no-referrer"
              className="mt-4 h-[1080px] w-full border-0 sm:h-[960px]"
            />
          </section>
        </div>
      </div>
    </main>
  );
}
