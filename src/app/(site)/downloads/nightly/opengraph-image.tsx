import { ghostImage } from "../../../og";

export const alt = "Shift Nightly — experimental builds of Shift";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ghostImage({
    title: "Shift Nightly",
    subtitle: "Experimental builds from the latest code.",
  });
}
