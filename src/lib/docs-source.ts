import { loader } from "fumadocs-core/source";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      /** Guides for features readers can't download yet. */
      draft: z.boolean().default(false),
    }),
  },
});

const draftsVisible =
  process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

const source = docs.toFumadocsSource();

export const docsSource = loader({
  baseUrl: "/docs",
  source: draftsVisible
    ? source
    : {
        files: source.files.filter((file) => file.type !== "page" || !file.data.draft),
      },
});
