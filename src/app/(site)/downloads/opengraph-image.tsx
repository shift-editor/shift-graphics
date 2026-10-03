import { iconImage } from "../../og";

export const alt = "Download Shift for macOS, Windows, and Linux";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return iconImage({
    title: "Download Shift",
    subtitle: "Free for macOS, Windows, and Linux.",
  });
}
