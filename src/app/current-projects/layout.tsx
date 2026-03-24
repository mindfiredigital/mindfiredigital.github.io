import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

/*
  Metadata for "Projects" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta["Current-Projects"].title,
  description: meta["Current-Projects"].description,

  openGraph: {
    title: meta["Current-Projects"].title,
    description: meta["Current-Projects"].description,
    images: {
      url: meta["Current-Projects"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Current-Projects"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Current-Projects"].title,
    description: meta["Current-Projects"].description,
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

export default function CurrentProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
