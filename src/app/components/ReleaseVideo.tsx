"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

type ReleaseVideoProps = ComponentPropsWithoutRef<"video"> & {
  "data-mp4"?: string;
  "data-webm"?: string;
  "data-label"?: string;
};

// Plays silently while on screen, like a looping image. Native controls are
// left off because iOS flashes its full overlay every time playback starts;
// a small button lets anyone stop the motion instead.
export function ReleaseVideo({
  "data-mp4": mp4Src,
  "data-webm": webmSrc,
  "data-label": label,
  poster,
}: ReleaseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isInView = false;

    const syncPlayback = () => {
      if (!isInView || userPaused || motionPreference.matches) {
        video.pause();
      } else {
        void video.play().catch(() => undefined);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      syncPlayback();
    });

    observer.observe(video);
    motionPreference.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", syncPlayback);
    };
  }, [userPaused]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      void video.play().catch(() => undefined);
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  return (
    <div className="relative my-8 sm:my-10">
      <video
        ref={videoRef}
        aria-label={label}
        poster={poster}
        loop
        muted
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className="block h-auto w-full cursor-pointer rounded-sm"
      >
        {webmSrc && <source src={webmSrc} type="video/webm" />}
        {mp4Src && <source src={mp4Src} type="video/mp4" />}
        Your browser does not support embedded videos.
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause video" : "Play video"}
        className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {playing ? (
          <Pause aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
        )}
      </button>
    </div>
  );
}
