import { siteDescription, siteUrl } from "../../lib/metadata";

/** schema.org description of Shift as free desktop software, for search results. */
export default function SoftwareJsonLd({ version }: { version?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Shift",
    description: siteDescription,
    url: siteUrl,
    downloadUrl: `${siteUrl}/downloads`,
    applicationCategory: "DesignApplication",
    operatingSystem: "macOS, Windows, Linux",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(version ? { softwareVersion: version } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
