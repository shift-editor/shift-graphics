import { platformIcons } from "../../components/platformIcons";
import { downloadTargets, type DownloadLink } from "../../../lib/downloads";

const pillLink =
  "inline-flex min-h-9 items-center rounded-full border border-line bg-surface-raised px-3.5 text-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** One row per platform with that platform's installer links; empty platforms are skipped. */
export default function DownloadPanel({
  links,
  name,
  variant = "release",
}: {
  links: readonly DownloadLink[];
  name: string;
  /** Nightly gets a dashed, unfilled card so it reads as experimental. */
  variant?: "release" | "nightly";
}) {
  const nightly = variant === "nightly";

  return (
    <ul
      className={`divide-y divide-line-subtle rounded-xl border border-line ${nightly ? "border-dashed" : "bg-surface"}`}
    >
      {downloadTargets.map(({ platform, icon }) => {
        const platformLinks = links.filter((link) => link.platform === platform);
        if (platformLinks.length === 0) return null;
        const Icon = platformIcons[icon];

        return (
          <li
            key={platform}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="inline-flex items-center gap-2.5 font-medium">
              <Icon aria-hidden="true" className="h-4 w-4" />
              {platform}
            </span>
            <span className="flex flex-wrap gap-2">
              {platformLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  aria-label={`Download ${name} for ${link.platform} ${link.label}`}
                  className={pillLink}
                >
                  {link.label}
                </a>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
