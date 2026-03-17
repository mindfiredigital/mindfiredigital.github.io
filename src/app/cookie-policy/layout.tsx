import React from "react";
import type { Metadata } from "next";
import meta from "../../metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["Cookie-Policy"].title,
  description: meta["Cookie-Policy"].description,

  openGraph: {
    title: meta["Cookie-Policy"].title,
    description: meta["Cookie-Policy"].description,
    images: {
      url: meta["Cookie-Policy"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Cookie-Policy"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Cookie-Policy"].title,
    description: meta["Cookie-Policy"].description,
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

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
