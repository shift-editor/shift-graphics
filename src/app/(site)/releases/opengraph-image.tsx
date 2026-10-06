import { releasesImage } from "../../og";

export const alt = "Shift release notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return releasesImage();
}
