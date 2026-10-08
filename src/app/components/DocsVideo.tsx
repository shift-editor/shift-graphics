import type { ReactNode } from "react";

type DocsVideoProps = {
  /** MP4 source; served from Shift-controlled storage, not a release URL. */
  src: string;
  webm?: string;
  poster: string;
  /** Says what the clip shows, for screen readers and before it loads. */
  label: string;
  /** WebVTT captions; required for narrated lessons. */
  captions?: string;
  /** Silent demos have no audio track to caption. */
  silent?: boolean;
  /** Transcript, or for a silent demo a description of what happens. */
  children?: ReactNode;
};

// Guide videos supplement the written steps, so they never autoplay and load
// nothing but the poster until a reader presses play.
export default function DocsVideo({
  src,
  webm,
  poster,
  label,
  captions,
  silent = false,
  children,
}: DocsVideoProps) {
  return (
    <figure className="not-prose my-8">
      <video
        aria-label={label}
        poster={poster}
        controls
        muted={silent}
        playsInline
        preload="none"
        className="block h-auto w-full rounded-lg border border-line bg-surface"
      >
        {webm && <source src={webm} type="video/webm" />}
        <source src={src} type="video/mp4" />
        {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
        Your browser can’t play this video. The written steps cover the same task.
      </video>
      {children && (
        <details className="mt-3 text-sm text-muted">
          <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {silent ? "What this video shows" : "Transcript"}
          </summary>
          <div className="mt-2 space-y-2">{children}</div>
        </details>
      )}
    </figure>
  );
}
