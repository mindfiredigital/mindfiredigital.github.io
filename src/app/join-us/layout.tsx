import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["Join-Us"].title,
  description: meta["Join-Us"].description,

  openGraph: {
    title: meta["Join-Us"].title,
    description: meta["Join-Us"].description,
    images: {
      url: meta["Join-Us"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Join-Us"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Join-Us"].title,
    description: meta["Join-Us"].description,
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

export default function JoinUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
