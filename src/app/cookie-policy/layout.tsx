import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";
import { COOKIE_POLICY_METADATA_CONSTANTS } from "@/constants";

/*
  Metadata for "cookie-policy" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].title,
  description: meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].description,

  openGraph: {
    title: meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].title,
    description:
      meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].description,
    images: {
      url: meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].openGraph
        .images,
      height: COOKIE_POLICY_METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: COOKIE_POLICY_METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].openGraph.url,
    type: "website",
    siteName: COOKIE_POLICY_METADATA_CONSTANTS.SITE_NAME,
    locale: COOKIE_POLICY_METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].title,
    description:
      meta[COOKIE_POLICY_METADATA_CONSTANTS.COOKIE_POLICY].description,
    site: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_SITE,
    creator: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_CREATOR,
    app: {
      name: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_APP_NAME,
      id: {
        iphone: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_APP_ID_IPHONE,
        ipad: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_APP_ID_IPAD,
        googleplay: COOKIE_POLICY_METADATA_CONSTANTS.TWITTER_APP_ID_GOOGLEPLAY,
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
