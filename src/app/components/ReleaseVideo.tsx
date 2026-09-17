"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

type ReleaseVideoProps = ComponentPropsWithoutRef<"video"> & {
  "data-mp4"?: string;
  "data-webm"?: string;
  "data-label"?: string;
};

export function ReleaseVideo({
  "data-mp4": mp4Src,
  "data-webm": webmSrc,
  "data-label": label,
  poster,
}: ReleaseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionPreference = () => {
      const video = videoRef.current;
      if (!video) return;

      if (motionPreference.matches) {
        video.pause();
      } else {
        void video.play().catch(() => undefined);
      }
    };

    applyMotionPreference();
    motionPreference.addEventListener("change", applyMotionPreference);
    return () => motionPreference.removeEventListener("change", applyMotionPreference);
  }, []);

  return (
    <video
      ref={videoRef}
      aria-label={label}
      poster={poster}
      controls
      loop
      muted
      playsInline
      preload="metadata"
      className="my-8 block h-auto w-full rounded-sm sm:my-10"
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      {mp4Src && <source src={mp4Src} type="video/mp4" />}
      Your browser does not support embedded videos.
    </video>
  );
}
