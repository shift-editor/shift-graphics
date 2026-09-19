import type { Metadata } from "next";
import { DM_Sans, Fragment_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
});

const publicSans = localFont({
  src: "./fonts/PublicSans-VariableFont_wght.ttf",
  variable: "--font-public-sans",
  weight: "100 900",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Shift",
  description: "A modern font editor built with TypeScript and Rust.",
  icons: {
    icon: [
      {
        url: "/favicon-light.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/xvg1cxs.css" />
      </head>
      <body className={`${fragmentMono.variable} ${publicSans.variable} ${inter.variable} ${dmSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
