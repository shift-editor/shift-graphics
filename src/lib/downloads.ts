export const downloadTargets = [
  {
    platform: "macOS",
    icon: "apple",
    options: [
      {
        id: "macos-arm64",
        label: "Apple Silicon",
        assetPattern: /^Shift-.+-macOS-arm64\.dmg$/i,
        nightlyAssetName: "Shift-Nightly-macOS-arm64.dmg",
      },
      {
        id: "macos-x64",
        label: "Intel x64",
        assetPattern: /^Shift-.+-macOS-x64\.dmg$/i,
        nightlyAssetName: "Shift-Nightly-macOS-x64.dmg",
      },
    ],
  },
  {
    platform: "Windows",
    icon: "windows",
    options: [
      {
        id: "windows-x64",
        label: ".exe x64",
        assetPattern: /^Shift-.+-Windows-x64-Setup\.exe$/i,
        nightlyAssetName: "Shift-Nightly-Windows-x64-Setup.exe",
      },
    ],
  },
  {
    platform: "Linux",
    icon: "linux",
    options: [
      {
        id: "linux-appimage-x64",
        label: "AppImage x64",
        assetPattern: /^Shift-.+-Linux-x64\.AppImage$/i,
        nightlyAssetName: "Shift-Nightly-Linux-x64.AppImage",
      },
      {
        id: "linux-deb-x64",
        label: ".deb x64",
        assetPattern: /^Shift-.+-Linux-x64\.deb$/i,
        nightlyAssetName: "Shift-Nightly-Linux-x64.deb",
      },
      {
        id: "linux-rpm-x64",
        label: ".rpm x64",
        assetPattern: /^Shift-.+-Linux-x64\.rpm$/i,
        nightlyAssetName: "Shift-Nightly-Linux-x64.rpm",
      },
    ],
  },
] as const;

const nightlyDownloadBaseUrl = "https://github.com/shift-editor/shift/releases/download/nightly";

export type DownloadLink = {
  id: string;
  platform: string;
  icon: (typeof downloadTargets)[number]["icon"];
  label: string;
  href: string;
};

/**
 * Installer links for the homepage download menu.
 *
 * With a published release's assets, each option links to its matching asset
 * and options without one are omitted. With `null` (no published release yet),
 * every option links to the rolling Nightly build.
 */
export function downloadLinks(
  assets: readonly { name: string; url: string }[] | null,
): DownloadLink[] {
  if (assets === null) return nightlyDownloadLinks();
  return downloadTargets.flatMap(({ platform, icon, options }) =>
    options.flatMap(({ id, label, assetPattern }) => {
      const asset = assets.find(({ name }) => assetPattern.test(name));
      return asset ? [{ id, platform, icon, label, href: asset.url }] : [];
    }),
  );
}

/** Installer links for every option on the rolling Nightly build. */
export function nightlyDownloadLinks(): DownloadLink[] {
  return downloadTargets.flatMap(({ platform, icon, options }) =>
    options.map(({ id, label, nightlyAssetName }) => ({
      id,
      platform,
      icon,
      label,
      href: `${nightlyDownloadBaseUrl}/${nightlyAssetName}`,
    })),
  );
}

export type Platform = (typeof downloadTargets)[number]["platform"];

/**
 * The desktop platform a browser runs on, or `null` for phones, tablets, and
 * anything unrecognised. Pass `navigator.userAgentData.platform` when the
 * browser has it, and `navigator.maxTouchPoints`, since iPadOS Safari reports
 * itself as a Mac.
 */
export function detectPlatform({
  userAgent,
  uaPlatform,
  maxTouchPoints = 0,
}: {
  userAgent: string;
  uaPlatform?: string;
  maxTouchPoints?: number;
}): Platform | null {
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)) return null;
  const platform = uaPlatform || userAgent;
  if (/Windows|Win32|Win64/i.test(platform)) return "Windows";
  if (/Mac/i.test(platform)) return maxTouchPoints > 1 ? null : "macOS";
  // ChromeOS reports Linux too, but has no Shift build of its own.
  if (/CrOS|Chrome OS/i.test(platform)) return null;
  if (/Linux|X11/i.test(platform)) return "Linux";
  return null;
}

/** The link to lead with: the platform's first installer, else the first link. */
export function primaryDownload(
  links: readonly DownloadLink[],
  platform: Platform | null,
): DownloadLink | undefined {
  return links.find((link) => link.platform === platform) ?? links[0];
}
