import "server-only";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseReleaseNotes } from "./release-notes";

const releaseFiles = ["release.json", "notes.md", "changelog.md"];
const releaseDirectoryPattern =
  /^v\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)?$/;
const versionPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)?$/;

export type Release = {
  directory: string;
  version: string;
  tag: string;
  date: string | null;
  prerelease: boolean;
  source: { type: "pr" | "release"; number: number; url: string; sha: string };
  assets: { name: string; url: string }[];
  changelogSha256: string;
  title: string;
  body: string;
  changelog: string;
  draft: boolean;
};

export function getDisplayDate(release: Release): {
  label: string;
  dateTime: string | undefined;
} {
  const value = release.date ? new Date(release.date) : new Date();
  const label = value.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: release.date ? "UTC" : undefined,
  });

  return {
    label,
    dateTime: release.date ?? undefined,
  };
}

/** Reads local snapshots only. Drafts are available in development and preview builds. */
export async function getReleases({ draft = false } = {}): Promise<Release[]> {
  const draftsVisible =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  if (draft && !draftsVisible) {
    throw new Error("Release drafts are available only in development and preview builds");
  }

  const root = path.join(process.cwd(), draft ? "content/drafts" : "content/releases");

  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const releases: Release[] = [];

  for (const entry of entries) {
    if (entry.isFile()) continue;
    if (!entry.isDirectory() || !releaseDirectoryPattern.test(entry.name)) {
      throw new Error(`Invalid release directory: ${entry.name}`);
    }

    const directory = path.join(root, entry.name);
    const files = await readdir(directory);
    const hasUnexpectedFiles = files.some((name) => !releaseFiles.includes(name));

    if (hasUnexpectedFiles) {
      throw new Error(
        `Release contains unexpected files: ${entry.name}. Never store email drafts with website content.`,
      );
    }

    const contents: string[] = [];
    for (const name of releaseFiles) {
      const file = path.join(directory, name);
      const stat = await lstat(file);

      if (!stat.isFile() || stat.size > 1_000_000) {
        throw new Error(`Invalid release file: ${name}`);
      }

      contents.push(await readFile(file, "utf8"));
    }

    const [metadata, notesMarkdown, changelog] = contents;
    const release = JSON.parse(metadata);
    const allowedMetadata = [
      "version",
      "tag",
      "date",
      "prerelease",
      "source",
      "assets",
      "changelogSha256",
    ];

    if (
      !release ||
      typeof release !== "object" ||
      Object.keys(release).some((key) => !allowedMetadata.includes(key))
    ) {
      throw new Error(`Unexpected release metadata: ${entry.name}`);
    }

    const validVersion =
      typeof release.version === "string" &&
      versionPattern.test(release.version) &&
      typeof release.tag === "string" &&
      release.tag.replace(/^v/, "") === release.version &&
      typeof release.prerelease === "boolean";

    if (!validVersion || entry.name !== `v${release.version}`) {
      throw new Error(`Invalid release version: ${entry.name}`);
    }

    const validSource =
      ["pr", "release"].includes(release.source?.type) &&
      Number.isSafeInteger(release.source.number) &&
      release.source.number >= 1 &&
      /^[a-f0-9]{40}$/.test(release.source.sha);

    if (!validSource) {
      throw new Error(`Invalid release provenance: ${entry.name}`);
    }

    const sourceUrl =
      release.source.type === "pr"
        ? `https://github.com/shift-editor/shift/pull/${release.source.number}`
        : `https://github.com/shift-editor/shift/releases/tag/${encodeURIComponent(release.tag)}`;

    if (release.source.url !== sourceUrl) {
      throw new Error(`Invalid source URL: ${entry.name}`);
    }

    if (release.source.type === "pr") {
      if (!draft || release.date !== null) {
        throw new Error("Unpublished PR content cannot be a public release");
      }
    } else {
      const validDate =
        typeof release.date === "string" &&
        /^\d{4}-\d{2}-\d{2}T/.test(release.date) &&
        Number.isFinite(Date.parse(release.date));

      if (!validDate) {
        throw new Error(`Missing published release date: ${entry.name}`);
      }
    }

    const validAssets =
      Array.isArray(release.assets) &&
      release.assets.every((asset: { name?: unknown; url?: unknown }) => {
        if (typeof asset.name !== "string" || !asset.name || typeof asset.url !== "string") {
          return false;
        }

        try {
          const url = new URL(asset.url);
          return (
            url.origin === "https://github.com" &&
            !url.username &&
            !url.password &&
            url.pathname.startsWith(
              `/shift-editor/shift/releases/download/${encodeURIComponent(release.tag)}/`,
            )
          );
        } catch {
          return false;
        }
      });

    if (!validAssets) {
      throw new Error(`Invalid download assets: ${entry.name}`);
    }
    if (release.source.type === "pr" && release.assets.length !== 0) {
      throw new Error("Unpublished PRs cannot supply downloads");
    }

    const changelogHash = createHash("sha256").update(changelog).digest("hex");
    if (release.changelogSha256 !== changelogHash) {
      throw new Error(
        `Generated changelog changed or import was interrupted: ${entry.name}. Re-import before continuing.`,
      );
    }
    if (!notesMarkdown.trim() || !changelog.trim()) {
      throw new Error(`Empty release content: ${entry.name}`);
    }
    if (releases.some(({ version }) => version === release.version)) {
      throw new Error(`Duplicate release: ${release.version}`);
    }

    const { title, body } = parseReleaseNotes(notesMarkdown);
    releases.push({ ...release, directory: entry.name, title, body, changelog, draft });
  }

  return releases.sort(
    (a, b) =>
      (b.date ?? "9999").localeCompare(a.date ?? "9999") ||
      b.version.localeCompare(a.version, undefined, { numeric: true }),
  );
}
