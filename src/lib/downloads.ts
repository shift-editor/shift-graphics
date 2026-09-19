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
