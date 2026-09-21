"use client";

import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
} from "./ui/Menu";
export default function MobileNavMenu() {
  return (
    <Menu modal={false}>
      <MenuTrigger
        aria-label="Navigation menu"
        className="group inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MenuIcon aria-hidden="true" className="h-5 w-5 group-data-[popup-open]:hidden" />
        <CloseIcon
          aria-hidden="true"
          className="hidden h-5 w-5 group-data-[popup-open]:block"
        />
      </MenuTrigger>

      <MenuPortal>
        <MenuPositioner side="bottom" align="end" sideOffset={8}>
          <MenuPopup className="w-48 min-w-48 font-ui">
            <MenuItem render={<Link href="/" />}>About</MenuItem>
            <MenuItem render={<Link href="/releases" />}>Changelog</MenuItem>
          </MenuPopup>
        </MenuPositioner>
      </MenuPortal>
    </Menu>
  );
}
