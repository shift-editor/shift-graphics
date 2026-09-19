import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Updates confirmation preview · Shift",
  robots: { index: false, follow: false },
};

export default async function UpdatesConfirmationPreview() {
  if (process.env.NODE_ENV !== "development") notFound();

  const [html, logo] = await Promise.all([
    readFile(path.join(process.cwd(), "src/emails/updates-confirmation.html"), "utf8"),
    readFile(path.join(process.cwd(), "src/emails/assets/shift-logo.png")),
  ]);
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "Untitled";
  const srcDoc =
    '<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' +
    html.replace("cid:shift-logo", `data:image/png;base64,${logo.toString("base64")}`);

  return (
    <main className="min-h-screen bg-app px-3 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-line pb-5">
          <h1 className="font-mono text-xs tracking-widest text-secondary uppercase">
            Updates confirmation
          </h1>
        </header>
        <dl className="space-y-2 py-5 font-ui text-sm">
          <div>
            <dt className="inline text-secondary">Subject: </dt>
            <dd className="inline">{title}</dd>
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
          title="Shift updates confirmation"
          srcDoc={srcDoc}
          sandbox=""
          referrerPolicy="no-referrer"
          className="h-[1050px] w-full border-0"
        />
      </div>
    </main>
  );
}
