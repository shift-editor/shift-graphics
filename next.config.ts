import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Lets `next dev` serve other devices, e.g. DEV_ORIGINS=192.168.1.120,beelink
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(","),
  // Release pages and cards read content/ at request time when they revalidate.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: { test?: RegExp }) =>
      rule.test?.test?.(".svg")
    );
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule?.issuer,
        resourceQuery: { not: [...(fileLoaderRule?.resourceQuery?.not ?? []), /url/] },
        use: ["@svgr/webpack"],
      }
    );
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
