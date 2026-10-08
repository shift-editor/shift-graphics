import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import DocsVideo from "./DocsVideo";

export function getDocsMdxComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    DocsVideo,
    Step,
    Steps,
    ...components,
  } satisfies MDXComponents;
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getDocsMdxComponents>;
}
