import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import type { Heading as MarkdownHeading, Root } from "mdast";
import { type Pluggable, type Plugin } from "unified";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { remarkReleaseVideo } from "../../lib/remark-release-video";
import type { HeadingLevel } from "./Heading";
import { ReleaseVideo } from "./ReleaseVideo";

const localImage =
  /^\/(?!\/)(?!\.{1,2}(?:\/|$))(?!.*\/\.{1,2}(?:\/|$))[a-zA-Z0-9/_.-]+\.(?:png|jpe?g|webp)$/;

const rebaseHeadings: Plugin<[HeadingLevel], Root> = (headingLevel) => (tree) => {
  const headings = tree.children.filter(
    (node): node is MarkdownHeading => node.type === "heading",
  );
  if (headings.length === 0) return;

  const shallowestLevel = Math.min(...headings.map(({ depth }) => depth));

  for (const heading of headings) {
    const relativeLevel = heading.depth - shallowestLevel;
    heading.depth = Math.min(headingLevel + relativeLevel, 6) as MarkdownHeading["depth"];
    heading.data = {
      ...heading.data,
      hProperties: {
        ...heading.data?.hProperties,
        className: [relativeLevel === 0 ? "markdown-heading" : "markdown-subheading"],
      },
    };
  }
};

function MarkdownImage({ src, alt }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string" || !localImage.test(src)) return null;

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={1800}
      height={1000}
      unoptimized
      className="my-8 h-auto w-full rounded-sm sm:my-10"
    />
  );
}

type MarkdownContentProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: string;
  headingLevel: HeadingLevel;
  allowImages?: boolean;
};

export function MarkdownContent({
  children,
  headingLevel,
  allowImages = false,
  ...props
}: MarkdownContentProps) {
  const remarkPlugins: Pluggable[] = [remarkGfm, [rebaseHeadings, headingLevel]];
  const components: Components | undefined = allowImages
    ? { img: MarkdownImage, video: ReleaseVideo }
    : undefined;

  if (allowImages) remarkPlugins.push(remarkDirective, remarkReleaseVideo);

  return (
    <div {...props}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        skipHtml
        disallowedElements={allowImages ? undefined : ["img"]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
