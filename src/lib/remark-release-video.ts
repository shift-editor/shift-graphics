import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const allowedAttributes = new Set(["mp4", "webm", "poster", "label"]);
const localReleaseFile =
  /^\/releases\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9/_-]+\.(?:mp4|webm|png|jpe?g|webp)$/;

type Directive = ContainerDirective | LeafDirective | TextDirective;

function isLocalReleaseFile(value: string, extensions: string[]) {
  if (!localReleaseFile.test(value)) return false;

  const url = new URL(value, "https://shift.graphics");
  const extension = url.pathname.slice(url.pathname.lastIndexOf(".") + 1).toLowerCase();
  return (
    url.origin === "https://shift.graphics" &&
    url.pathname === value &&
    extensions.includes(extension)
  );
}

export const remarkReleaseVideo: Plugin<[], Root> = () => (tree) => {
  visit(tree, (node) => {
    if (
      node.type !== "containerDirective" &&
      node.type !== "leafDirective" &&
      node.type !== "textDirective"
    ) {
      return;
    }

    const directive = node as Directive;
    if (directive.name !== "video") return;
    if (directive.type !== "leafDirective") {
      throw new Error("Release videos must use the ::video leaf directive");
    }

    const attributes = directive.attributes ?? {};
    if (Object.keys(attributes).some((name) => !allowedAttributes.has(name))) {
      throw new Error("Release video contains an unsupported attribute");
    }

    const mp4 = attributes.mp4;
    const webm = attributes.webm;
    const poster = attributes.poster;
    const label = attributes.label;

    if (typeof mp4 !== "string" || !isLocalReleaseFile(mp4, ["mp4"])) {
      throw new Error("Release video requires a local MP4 file");
    }
    if (
      webm !== undefined &&
      (typeof webm !== "string" || !isLocalReleaseFile(webm, ["webm"]))
    ) {
      throw new Error("Release video WebM must be a local file");
    }
    if (
      typeof poster !== "string" ||
      !isLocalReleaseFile(poster, ["png", "jpg", "jpeg", "webp"])
    ) {
      throw new Error("Release video requires a local poster image");
    }
    if (typeof label !== "string" || !label.trim() || label.length > 240) {
      throw new Error("Release video requires a concise label");
    }

    const videoDirectory = mp4.slice(0, mp4.lastIndexOf("/"));
    if (
      !poster.startsWith(`${videoDirectory}/`) ||
      (webm && !webm.startsWith(`${videoDirectory}/`))
    ) {
      throw new Error("Release video sources and poster must share a directory");
    }

    directive.children = [];
    directive.data = {
      ...directive.data,
      hName: "video",
      hProperties: {
        "data-mp4": mp4,
        ...(webm ? { "data-webm": webm } : {}),
        "data-label": label.trim(),
        poster,
      },
    };
  });
};
