import { ghostImage } from "../../og";

export const alt = "Shift release notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ghostImage({
    title: "Release notes",
    subtitle: "New features, improvements, and fixes in Shift.",
    ghost: "release",
  });
}
