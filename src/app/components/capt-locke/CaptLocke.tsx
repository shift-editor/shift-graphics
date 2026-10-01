"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FLAG,
  HEART,
  HULL,
  HULL_W,
  MAST_X,
  SPYGLASS_LONG,
  SPYGLASS_SHORT,
  ghostFrame,
  type Eyes,
  type Sprite,
} from "./sprites";

// Everything moves on a pixel stage 26 tall and as wide as its container
// (64 on desktop), drawn at 4 screen px per pixel. Time advances in whole
// frames so nothing ever lands between pixels.
const STAGE_W = 64;
const STAGE_H = 26;
const SCALE = 4;
const FPS = 12;

const INK = "currentColor";
const PAPER = "var(--color-app)";
const ACCENT = "var(--color-accent)";

const LOOP = 14;
// What reduced-motion visitors see: hove to under the wordmark, smitten.
const STILL = 6;

export default function CaptLocke({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const t = useFrameClock(ref, LOOP, STILL);
  const stageW = useStageWidth(ref);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${stageW} ${STAGE_H}`}
      width="100%"
      height={STAGE_H * SCALE}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Capt. Locke, a pirate ghost, sailing along a baseline"
      className={className}
    >
      <SailScene t={t} stageW={stageW} />
    </svg>
  );
}

// ─── Sailing ───────────────────────────────────────────────────────────────

const WATERLINE = 22;
const HULL_Y = WATERLINE - HULL.length + 1;
const GHOST_IN_HULL = { x: 3, y: -10 };
const MAST_TOP = -17;
const CROSSBAR_Y = -13;
// Capt. Locke patrols the stage and never leaves it. The flag streams four
// pixels past the stern, which sets how close each edge he can turn.
const PORT_X = 6;

type SailFrame = {
  x: number;
  flip: boolean;
  moving: boolean;
  spyglass: "short" | "long" | null;
  heart: 0 | 1 | 2;
};

function sailFrame(t: number, stageW: number): SailFrame {
  const starboardX = Math.floor(stageW) - HULL_W - 4;
  const idle = { flip: false, moving: false, spyglass: null, heart: 0 } as const;

  if (t < 4.125) {
    return { ...idle, x: lerp(starboardX, PORT_X, progress(t, 0, 4.125)), moving: true };
  }
  if (t < 7.5) {
    // Heave to under the wordmark and have a look.
    const spyglass = between(t, 4.6, 6.4) ? "long" : between(t, 4.4, 6.6) ? "short" : null;
    const heart = between(t, 5.6, 5.75) ? 1 : between(t, 5.75, 6.4) ? 2 : 0;
    return { ...idle, x: PORT_X, spyglass, heart };
  }
  if (t < 8) return { ...idle, x: PORT_X, flip: true };
  if (t < 12.125) {
    return { ...idle, x: lerp(PORT_X, starboardX, progress(t, 8, 12.125)), flip: true, moving: true };
  }
  return { ...idle, x: starboardX, flip: t < 13.5 };
}

function SailScene({ t, stageW }: { t: number; stageW: number }) {
  const f = sailFrame(t, stageW);
  const swell = Math.floor(t * 1.4) % 2;
  const flap = Math.floor(t * (f.moving ? 5 : 2.5)) % 2;
  const drift = Math.floor(t * 3);

  // A two-row pixel wave, one crest every 8px, drifting left.
  const waves: ReactNode[] = [];
  for (let i = -1; i <= stageW / 8; i++) {
    const x = i * 8 - (drift % 8);
    waves.push(
      <rect key={`c${i}`} x={x + 3} y={WATERLINE - 1} width={2} height={1} />,
      <rect key={`t${i}`} x={x + 5} y={WATERLINE} width={6} height={1} />,
    );
  }

  const y = HULL_Y + swell;
  // Boat is drawn bow-left; flip it to sail right.
  const transform = f.flip
    ? `translate(${f.x + HULL_W} ${y}) scale(-1 1)`
    : `translate(${f.x} ${y})`;
  const wake = f.moving && (
    <rect x={HULL_W + 1 + flap} y={HULL.length - 2 - swell} width={1} height={1} fill={INK} />
  );

  const boat = (
    <g transform={transform}>
      {wake}
      <Ghost x={GHOST_IN_HULL.x} y={GHOST_IN_HULL.y} eyes={f.spyglass === "long" ? "wink" : "open"} />
      {f.spyglass && (
        <g fill={INK}>
          {(f.spyglass === "long" ? SPYGLASS_LONG : SPYGLASS_SHORT).map(([sx, sy, w, h]) => (
            <rect key={`${sx},${sy}`} x={GHOST_IN_HULL.x + sx} y={GHOST_IN_HULL.y + sy} width={w} height={h} />
          ))}
        </g>
      )}
      {f.heart > 0 && (
        <Pixels
          sprite={HEART[f.heart - 1]}
          x={GHOST_IN_HULL.x + (f.heart === 1 ? 5 : 4)}
          y={GHOST_IN_HULL.y - (f.heart === 1 ? 3 : 5)}
        />
      )}
      <Pixels sprite={HULL} x={0} y={0} />
      {/* The mast is a t: stem, crossbar, and a flag streaming aft. */}
      <rect x={MAST_X} y={MAST_TOP} width={1} height={-MAST_TOP} fill={INK} />
      <rect x={MAST_X - 2} y={CROSSBAR_Y} width={5} height={1} fill={INK} />
      <Pixels sprite={FLAG[flap]} x={MAST_X + 1} y={MAST_TOP} />
    </g>
  );

  return (
    <>
      <g fill={INK}>{waves}</g>
      {boat}
    </>
  );
}

// ─── Drawing ───────────────────────────────────────────────────────────────

function Ghost({ x, y, eyes = "open" }: { x: number; y: number; eyes?: Eyes }) {
  return <Pixels sprite={ghostFrame(eyes)} x={x} y={y} />;
}

// Draws a sprite as one rect per horizontal run of same-coloured pixels.
function Pixels({
  sprite,
  x,
  y,
}: {
  sprite: Sprite;
  x: number;
  y: number;
}) {
  const fills: Record<string, string> = { "#": INK, ".": PAPER, h: ACCENT };
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

// Stage width in pixels: the container's width at exactly SCALE screen px per
// pixel, so the sea always runs edge to edge.
function useStageWidth(ref: React.RefObject<Element | null>) {
  const [width, setWidth] = useState(STAGE_W);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(STAGE_W, entry.contentRect.width / SCALE));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

// ─── Timing ────────────────────────────────────────────────────────────────

// Loop time in seconds, quantised to whole frames. Only runs while the stage
// is on screen, and holds a still for reduced-motion visitors.
function useFrameClock(ref: React.RefObject<Element | null>, loop: number, still: number) {
  const [frame, setFrame] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let raf = 0;
    let visible = false;
    let elapsed = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      if (last !== null) elapsed += Math.min(now - last, 100) / 1000;
      last = now;
      setFrame(Math.floor(elapsed * FPS));
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === visible) return;
      visible = entry.isIntersecting;
      if (visible) {
        last = null;
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, reduced]);

  if (reduced) return still;
  return ((frame / FPS) % loop + loop) % loop;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function progress(t: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (t - a) / (b - a)));
}

function between(t: number, a: number, b: number) {
  return t >= a && t < b;
}

function lerp(a: number, b: number, p: number) {
  return Math.round(a + (b - a) * p);
}
