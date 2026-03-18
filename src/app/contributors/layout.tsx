import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["Contributors"].title,
  description: meta["Contributors"].description,

  openGraph: {
    title: meta["Contributors"].title,
    description: meta["Contributors"].description,
    images: {
      url: meta["Contributors"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Contributors"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Contributors"].title,
    description: meta["Contributors"].description,
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

export default function ContributorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
