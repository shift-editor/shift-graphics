"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLink = "transition-colors hover:text-accent";

type ActiveRoute = "about" | "releases" | null;

export default function PrimaryNavigation() {
  const pathname = usePathname();
  const activeRoute: ActiveRoute =
    pathname === "/"
      ? "about"
      : pathname === "/releases" || pathname.startsWith("/releases/")
        ? "releases"
        : null;

  return (
    <div className="hidden items-center justify-center gap-8 text-xs sm:col-start-2 sm:flex">
      <Link
        href="/"
        aria-current={activeRoute === "about" ? "page" : undefined}
        className={`${navLink} ${activeRoute === "about" ? "text-accent" : ""}`}
      >
        About
      </Link>
      <Link
        href="/releases"
        aria-current={activeRoute === "releases" ? "page" : undefined}
        className={`${navLink} ${activeRoute === "releases" ? "text-accent" : ""}`}
      >
        Changelog
      </Link>
    </div>
  );
}
