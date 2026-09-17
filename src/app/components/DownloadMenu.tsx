"use client";

import { ChevronDown } from "lucide-react";
import AppleIcon from "../assets/platforms/apple.svg";
import LinuxIcon from "../assets/platforms/linux.svg";
import WindowsIcon from "../assets/platforms/windows.svg";
import { downloadTargets } from "../../lib/downloads";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
} from "./ui/Menu";

const nightlyDownloadBaseUrl =
  "https://github.com/shift-editor/shift/releases/download/nightly";

const platformIcons = {
  apple: AppleIcon,
  windows: WindowsIcon,
  linux: LinuxIcon,
};

const primaryDownload = downloadTargets[0].options[0];

export default function DownloadMenu() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 font-ui">
      <div className="inline-flex overflow-hidden rounded-full bg-accent text-white shadow-sm">
        <a
          href={`${nightlyDownloadBaseUrl}/${primaryDownload.nightlyAssetName}`}
          aria-label="Download Shift for macOS Apple Silicon"
          className="inline-flex min-h-10 items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
        >
          <AppleIcon aria-hidden="true" className="h-4 w-4" />
          <span>
            macOS <span className="text-white/70">Apple Silicon</span>
          </span>
        </a>

        <Menu modal={false}>
          <MenuTrigger
            aria-label="Choose another download"
            className="inline-flex min-h-10 w-10 items-center justify-center border-l border-black/15 transition-colors hover:bg-black/10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white data-[popup-open]:bg-black/10 data-[popup-open]:[&_svg]:rotate-180"
          >
            <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform" />
          </MenuTrigger>
          <MenuPortal>
            <MenuPositioner side="bottom" align="end" sideOffset={8}>
              <MenuPopup className="w-[min(18rem,calc(100vw-2rem))] min-w-0 py-2 font-ui">
                {downloadTargets.flatMap(({ platform, icon, options }) => {
                  const Icon = platformIcons[icon];

                  return options.map((option, index) => (
                    <MenuItem
                      key={option.id}
                      render={
                        <a
                          href={`${nightlyDownloadBaseUrl}/${option.nightlyAssetName}`}
                        />
                      }
                      className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5 px-3 py-2 text-sm"
                    >
                      <span className="flex h-4 w-4 items-center justify-center">
                        {index === 0 && <Icon aria-hidden="true" className="h-4 w-4" />}
                      </span>
                      <span>
                        {platform} <span className="text-muted">{option.label}</span>
                      </span>
                    </MenuItem>
                  ));
                })}
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </Menu>
      </div>
    </div>
  );
}
