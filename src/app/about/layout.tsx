import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";
import { ABOUT_METADATA_CONSTANTS } from "@/constants";

/*
  Metadata for "Projects" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta[ABOUT_METADATA_CONSTANTS.ABOUT].title,
  description: meta[ABOUT_METADATA_CONSTANTS.ABOUT].description,

  openGraph: {
    title: meta[ABOUT_METADATA_CONSTANTS.ABOUT].title,
    description: meta[ABOUT_METADATA_CONSTANTS.ABOUT].description,
    images: {
      url: meta[ABOUT_METADATA_CONSTANTS.ABOUT].openGraph.images,
      height: ABOUT_METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: ABOUT_METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[ABOUT_METADATA_CONSTANTS.ABOUT].openGraph.url,
    type: ABOUT_METADATA_CONSTANTS.WEBSITE,
    siteName: ABOUT_METADATA_CONSTANTS.SITE_NAME,
    locale: ABOUT_METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: ABOUT_METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[ABOUT_METADATA_CONSTANTS.ABOUT].title,
    description: meta[ABOUT_METADATA_CONSTANTS.ABOUT].description,
    site: ABOUT_METADATA_CONSTANTS.TWITTER_SITE,
    creator: ABOUT_METADATA_CONSTANTS.TWITTER_CREATOR,
    app: {
      name: ABOUT_METADATA_CONSTANTS.TWITTER_APP_NAME,
      id: {
        iphone: ABOUT_METADATA_CONSTANTS.TWITTER_APP_ID_IPHONE,
        ipad: ABOUT_METADATA_CONSTANTS.TWITTER_APP_ID_IPAD,
        googleplay: ABOUT_METADATA_CONSTANTS.TWITTER_APP_ID_GOOGLEPLAY,
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
