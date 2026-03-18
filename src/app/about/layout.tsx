import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["About"].title,
  description: meta["About"].description,

  openGraph: {
    title: meta["About"].title,
    description: meta["About"].description,
    images: {
      url: meta["About"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["About"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["About"].title,
    description: meta["About"].description,
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
