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
const releaseMediaOrigin = "https://releases.shift.graphics";
const releaseMediaPathPrefix = "/media/";

type Directive = ContainerDirective | LeafDirective | TextDirective;

function isAllowedReleaseMediaUrl(value: string, extensions: string[]) {
  let url: URL;

  if (localReleaseFile.test(value)) {
    url = new URL(value, "https://shift.graphics");
    if (url.pathname !== value) return false;
  } else {
    try {
      url = new URL(value);
    } catch {
      return false;
    }

    if (
      url.origin !== releaseMediaOrigin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.href !== value ||
      !url.pathname.startsWith(releaseMediaPathPrefix) ||
      !/^\/media\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9/_-]+\.(?:mp4|webm|png|jpe?g|webp)$/.test(
        url.pathname,
      )
    ) {
      return false;
    }
  }

  const extension = url.pathname.slice(url.pathname.lastIndexOf(".") + 1).toLowerCase();
  return extensions.includes(extension);
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

    if (typeof mp4 !== "string" || !isAllowedReleaseMediaUrl(mp4, ["mp4"])) {
      throw new Error("Release video requires an approved MP4 URL");
    }
    if (
      webm !== undefined &&
      (typeof webm !== "string" || !isAllowedReleaseMediaUrl(webm, ["webm"]))
    ) {
      throw new Error("Release video WebM must use an approved URL");
    }
    if (
      typeof poster !== "string" ||
      !isAllowedReleaseMediaUrl(poster, ["png", "jpg", "jpeg", "webp"])
    ) {
      throw new Error("Release video requires an approved poster URL");
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
