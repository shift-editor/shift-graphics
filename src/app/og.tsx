/* eslint-disable @next/next/no-img-element -- ImageResponse draws plain <img>; next/image cannot render here. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };
const ink = "#0a0a0a";
const muted = "#737373";
const paper = "#fafaf8";

const svgData = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

// Crops a pixel ghost's viewBox to its exact cell grid and turns off
// anti-aliasing, so drawn at a whole number of pixels per cell, neighbouring
// cells meet without hairline seams.
function pixelGhost(
  svg: string,
  grid: { cell: number; cols: number; rows: number; top: number },
) {
  const { cell, cols, rows, top } = grid;
  const root = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${cols * cell} ${rows * cell}" shape-rendering="crispEdges" fill="none">`;
  return { src: svgData(svg.replace(/<svg[^>]*>/, root)), cols, rows };
}

const [regular, bold, lockupSvg, nightlySvg, appIconPng] = await Promise.all([
  readFile(join(process.cwd(), "src/app/fonts/og/PublicSans-Regular.ttf")),
  readFile(join(process.cwd(), "src/app/fonts/og/PublicSans-Bold.ttf")),
  readFile(join(process.cwd(), "public/shift-lockup.svg"), "utf8"),
  readFile(join(process.cwd(), "public/nightly-ghost.svg"), "utf8"),
  readFile(join(process.cwd(), "public/shift-app-icon.png"), "base64"),
]);
const lockup = svgData(lockupSvg);
const appIcon = `data:image/png;base64,${appIconPng}`;
const nightlyGhost = pixelGhost(nightlySvg, { cell: 31.1623, cols: 13, rows: 10, top: 0 });

const fonts = [
  { name: "Public Sans", data: regular, weight: 400 as const },
  { name: "Public Sans", data: bold, weight: 700 as const },
];

const render = (element: React.ReactElement) => new ImageResponse(element, { ...size, fonts });

/** The site-wide card: the lockup above a large headline. */
export function homeImage() {
  return render(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        background: paper,
        color: ink,
        fontFamily: "Public Sans",
      }}
    >
      <img src={lockup} height={44} width={44 * (890 / 225)} alt="" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 980, fontSize: 88, fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 1.02 }}>
          A free and open-source font editor
        </div>
        <div style={{ fontSize: 32, color: muted, marginTop: 28 }}>
          Design variable fonts on macOS, Windows, and Linux.
        </div>
      </div>
    </div>,
  );
}

/** A page card: the app icon above a centred title. */
export function iconImage({ title, subtitle }: { title: string; subtitle: string }) {
  return render(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: paper,
        color: ink,
        fontFamily: "Public Sans",
      }}
    >
      <img src={appIcon} width={220} height={220} alt="" />
      <div style={{ marginTop: 8, fontSize: 60, fontWeight: 700, letterSpacing: "-0.05em" }}>
        {title}
      </div>
      <div style={{ marginTop: 14, fontSize: 26, color: muted }}>{subtitle}</div>
    </div>,
  );
}

/** A page card: wordmark and title on the left, the Nightly ghost on the right. */
export function ghostImage({ title, subtitle }: { title: string; subtitle: string }) {
  const { src, cols, rows } = nightlyGhost;
  // A whole number of pixels per cell keeps every cell edge on a pixel.
  const cell = 26;

  return render(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        background: paper,
        color: ink,
        fontFamily: "Public Sans",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          right: 160,
          bottom: 0,
          alignItems: "center",
        }}
      >
        <img src={src} width={cols * cell} height={rows * cell} alt="" />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 760,
          height: "100%",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em" }}>Shift.</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.04 }}>
            {title}
          </div>
          <div style={{ fontSize: 26, color: muted, marginTop: 18, lineHeight: 1.35 }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>,
  );
}
