"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Matches the sidebar's `min-[900px]:sticky min-[900px]:top-8`.
const STICKY_QUERY = "(min-width: 900px)";
const STICKY_TOP = 32;

/** The release sidebar's ghost, which turns around while the sidebar is stuck. */
export function ReleaseGhost() {
  const ref = useRef<HTMLImageElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const aside = ref.current?.closest("aside");
    if (!aside) return;
    const media = window.matchMedia(STICKY_QUERY);
    const update = () => setStuck(media.matches && aside.getBoundingClientRect().top < STICKY_TOP);

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Image
      ref={ref}
      src="/backwards-cap.svg"
      alt=""
      width={32}
      height={32}
      unoptimized
      aria-hidden="true"
      className={`relative z-10 h-6 w-6 bg-app object-contain ${stuck ? "-scale-x-100" : ""}`}
    />
  );
}
