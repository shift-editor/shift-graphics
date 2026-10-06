import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified, type Plugin } from "unified";

const extractReleaseTitle: Plugin<[], Root> = () => (tree, file) => {
  const titleIndex = tree.children.findIndex(
    (node) => node.type === "heading" && node.depth === 1,
  );

  if (titleIndex === -1) {
    throw new Error("Release notes must contain a level-one heading");
  }

  const [title] = tree.children.splice(titleIndex, 1);
  file.data.releaseTitle = toString(title).trim();
};

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(extractReleaseTitle)
  .use(remarkStringify);

export function parseReleaseNotes(markdown: string): {
  title: string;
  body: string;
} {
  const file = parser.processSync(markdown);
  const title = file.data.releaseTitle;

  if (typeof title !== "string" || !title) {
    throw new Error("Release notes must have a nonempty title");
  }

  return {
    title,
    body: String(file).trim(),
  };
}

/** The plain text of a release body's first paragraph, for meta descriptions. */
export function releaseSummary(body: string): string | undefined {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkDirective).parse(body);
  const paragraph = tree.children.find((node) => node.type === "paragraph");
  return paragraph ? toString(paragraph).trim() : undefined;
}
