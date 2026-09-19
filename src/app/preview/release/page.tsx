import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReleases } from "../../../lib/releases";

export const metadata: Metadata = {
  title: "Release announcement · Shift",
  robots: { index: false, follow: false },
};

export default async function ReleasePreview({
  searchParams,
}: {
  searchParams: Promise<{ release?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { release = "pr-230" } = await searchParams;
  const validRelease =
    typeof release === "string" &&
    /^(?:pr-[1-9]\d*|v\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)?)$/.test(
      release,
    );

  if (!validRelease) notFound();

  let html: string;
  try {
    const directory = path.resolve(process.cwd(), "../shift-comms/releases", release);
    const file = path.join(directory, "email.html");
    const [directoryStat, fileStat] = await Promise.all([lstat(directory), lstat(file)]);

    if (!directoryStat.isDirectory() || !fileStat.isFile() || fileStat.size > 1_000_000) {
      notFound();
    }

    html = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") notFound();
    throw error;
  }

  const version = (await getReleases({ draft: true })).find(
    (entry) => entry.directory === release,
  )?.version;
  const [logo, editor] = await Promise.all([
    readFile(path.join(process.cwd(), "src/emails/assets/shift-logo.png")),
    readFile(path.join(process.cwd(), "public/editor.png")),
  ]);
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "Untitled";
  const srcDoc =
    '<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' +
    html
      .replace("cid:shift-logo", `data:image/png;base64,${logo.toString("base64")}`)
      .replace("cid:shift-editor", `data:image/png;base64,${editor.toString("base64")}`)
      .replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", "#");

  return (
    <main className="min-h-screen bg-app px-3 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <h1 className="font-mono text-xs tracking-widest text-secondary uppercase">
            Release announcement
          </h1>
          <Link
            href={version ? `/releases/${version}` : "/releases"}
            className="font-ui text-xs text-secondary hover:opacity-70"
          >
            Release notes
          </Link>
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
          title="Shift release announcement"
          srcDoc={srcDoc}
          sandbox=""
          referrerPolicy="no-referrer"
          className="h-[1950px] w-full border-0 sm:h-[1500px]"
        />
      </div>
    </main>
  );
}
