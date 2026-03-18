import React from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import meta from "@/metadata/metadata.json";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mindfiredigital.github.io/"),
  title: meta["Home"].title,
  description: meta["Home"].description,
  applicationName: "Mindfire FOSS",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Mindfire",
    "FOSS",
    "Mindfire FOSS",
    "React",
    "JavaScript",
    "next.js",
    "Opensource community",
    "Software Development",
  ],
  authors: [
    { name: "Mindfire" },
    { name: "Mindfire", url: "https://mindfiredigital.github.io" },
  ],
  creator: "Mindfire Digital LLP",
  publisher: "Mindfire Digital LLP",

  openGraph: {
    title: meta["Home"].openGraph.title,
    description: meta["Home"].description,
    images: {
      // url: "https://mindfiredigital.github.io/_next/static/media/mindfire_foss_logo.0c507a60.png",
      url: meta["Home"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Home"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Home"].twitter.title,
    description: meta["Home"].description,
    site: "@mindfires",
    creator: "@mindfires",
    app: {
      name: "twitter_app",
      id: {
        iphone: "twitter_app://iphone",
        ipad: "twitter_app://ipad",
        googleplay: "twitter_app://googleplay",
      },
    },
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${roboto.className} !scroll-smooth`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
