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
  return downloadTargets.flatMap(({ platform, icon, options }) =>
    options.flatMap(({ id, label, assetPattern, nightlyAssetName }) => {
      if (assets === null) {
        return [{ id, platform, icon, label, href: `${nightlyDownloadBaseUrl}/${nightlyAssetName}` }];
      }
      const asset = assets.find(({ name }) => assetPattern.test(name));
      return asset ? [{ id, platform, icon, label, href: asset.url }] : [];
    }),
  );
}
