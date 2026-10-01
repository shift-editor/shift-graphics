"use client";

import { ChevronDown } from "lucide-react";
import AppleIcon from "../assets/platforms/apple.svg";
import LinuxIcon from "../assets/platforms/linux.svg";
import WindowsIcon from "../assets/platforms/windows.svg";
import type { DownloadLink } from "../../lib/downloads";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
} from "./ui/Menu";

const platformIcons = {
  apple: AppleIcon,
  windows: WindowsIcon,
  linux: LinuxIcon,
};

export default function DownloadMenu({ links }: { links: readonly DownloadLink[] }) {
  const [primary] = links;
  if (!primary) return null;
  const PrimaryIcon = platformIcons[primary.icon];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 font-ui">
      <div className="inline-flex overflow-hidden rounded-full bg-accent text-white shadow-sm">
        <a
          href={primary.href}
          aria-label={`Download Shift for ${primary.platform} ${primary.label}`}
          className="inline-flex min-h-10 items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
        >
          <PrimaryIcon aria-hidden="true" className="h-4 w-4" />
          <span>
            {primary.platform} <span className="text-white/70">{primary.label}</span>
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
                {links.map((link, index) => {
                  const Icon = platformIcons[link.icon];
                  const firstOfPlatform = links[index - 1]?.platform !== link.platform;

                  return (
                    <MenuItem
                      key={link.id}
                      render={<a href={link.href} />}
                      className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5 px-3 py-2 text-sm"
                    >
                      <span className="flex h-4 w-4 items-center justify-center">
                        {firstOfPlatform && <Icon aria-hidden="true" className="h-4 w-4" />}
                      </span>
                      <span>
                        {link.platform} <span className="text-muted">{link.label}</span>
                      </span>
                    </MenuItem>
                  );
                })}
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </Menu>
      </div>
    </div>
  );
}
