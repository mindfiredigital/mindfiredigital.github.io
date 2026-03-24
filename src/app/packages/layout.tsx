import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

/*
  Metadata for "Projects" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta["Packages"].title,
  description: meta["Packages"].description,

  openGraph: {
    title: meta["Packages"].title,
    description: meta["Packages"].description,
    images: {
      url: meta["Packages"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Packages"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Packages"].title,
    description: meta["Packages"].description,
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
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
