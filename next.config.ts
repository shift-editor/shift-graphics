import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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

export default nextConfig;
