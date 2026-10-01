"use client";

import { useEffect, useState, type ReactNode } from "react";

// Drawn like Capt. Locke: a pixel stage at 2 screen px per pixel, advanced in
// whole frames so nothing ever lands between pixels. Plays once.
//   "#" ink   "." paper   " " transparent
const GHOST = [
  " ########    ",
  "#........#   ",
  "#........#   ",
  "#........#   ",
  "#........# ##",
  "#........##.#",
  "#...........#",
  "#..........# ",
  " #.###.####  ",
  " #.# #.#     ",
  "  ##  ##     ",
];

// Drawn left to right: down the short stroke, then up the long one.
const TICK = [
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 4],
  [6, 3],
  [7, 2],
] as const;

const SPARKLE = [
  [[11, 2]],
  [
    [11, 1],
    [10, 2],
    [11, 2],
    [12, 2],
    [11, 3],
  ],
  [
    [10, 1],
    [12, 1],
    [10, 3],
    [12, 3],
  ],
] as const;

const STAGE_W = 13;
const STAGE_H = 13;
const SCALE = 2;
const FPS = 12;

const INK = "currentColor";
const PAPER = "var(--color-app)";
const ACCENT = "var(--color-accent)";

// Rise in, draw the tick, then hop while the tip sparkles.
const RISE = [4, 3];
const TICK_START = 2;
const HOP_START = TICK_START + TICK.length + 1;
const LAST_FRAME = HOP_START + SPARKLE.length;

function ghostY(frame: number) {
  if (frame < RISE.length) return RISE[frame];
  if (frame === HOP_START || frame === HOP_START + 1) return 1;
  return 2;
}

/** The signup success ghost, who rises in, ticks himself, and hops. */
export function SuccessGhost({ className }: { className?: string }) {
  const frame = useOneShotFrames(LAST_FRAME);
  const y = ghostY(frame);
  const tick = TICK.slice(0, Math.max(0, frame - TICK_START + 1));
  const sparkle = SPARKLE[frame - HOP_START] ?? [];

  return (
    <svg
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      width={STAGE_W * SCALE}
      height={STAGE_H * SCALE}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <Pixels sprite={GHOST} x={0} y={y} />
      <g fill={ACCENT}>
        {tick.map(([x, ty]) => (
          <rect key={x} x={x} y={y + ty} width={1} height={1} />
        ))}
        {sparkle.map(([x, sy]) => (
          <rect key={`${x},${sy}`} x={x} y={sy} width={1} height={1} />
        ))}
      </g>
    </svg>
  );
}

// Draws a sprite as one rect per horizontal run of same-coloured pixels.
function Pixels({ sprite, x, y }: { sprite: readonly string[]; x: number; y: number }) {
  const fills: Record<string, string> = { "#": INK, ".": PAPER };
  const rects: ReactNode[] = [];
  sprite.forEach((row, ry) => {
    let start = 0;
    for (let rx = 1; rx <= row.length; rx++) {
      if (row[rx] === row[start]) continue;
      const fill = fills[row[start]];
      if (fill) {
        rects.push(
          <rect key={`${ry},${start}`} x={x + start} y={y + ry} width={rx - start} height={1} fill={fill} />,
        );
      }
      start = rx;
    }
  });
  return <>{rects}</>;
}

// Counts whole frames from mount up to `last`, then stops. Reduced-motion
// visitors see the last frame straight away.
function useOneShotFrames(last: number) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(last);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const next = Math.min(last, Math.floor(((now - start) / 1000) * FPS));
      setFrame(next);
      if (next < last) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [last]);

  return frame;
}
