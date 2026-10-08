import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocsMdxComponents } from "@/app/components/docsMdxComponents";
import { docsSource } from "@/lib/docs-source";
import { pageMetadata } from "@/lib/metadata";

// Only guides in content/docs exist.
export const dynamicParams = false;

export default async function DocsArticle({ params }: PageProps<"/docs/[[...slug]]">) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const Body = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <Body components={getDocsMdxComponents({ a: createRelativeLink(docsSource, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  return {
    ...pageMetadata({
      title: page.url === "/docs" ? "Docs" : page.data.title,
      description: page.data.description,
      path: page.url,
    }),
    ...(page.data.draft ? { robots: { index: false, follow: false } } : {}),
  };
}
