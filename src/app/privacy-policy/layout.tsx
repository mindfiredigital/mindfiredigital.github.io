import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

/*
  Metadata for "Projects" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta["Privacy-Policy"].title,
  description: meta["Privacy-Policy"].description,

  openGraph: {
    title: meta["Privacy-Policy"].title,
    description: meta["Privacy-Policy"].description,
    images: {
      url: meta["Privacy-Policy"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Privacy-Policy"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Privacy-Policy"].title,
    description: meta["Privacy-Policy"].description,
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

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
