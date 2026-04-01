import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";
import { CONTRIBUTORS_METADATA_CONSTANTS } from "@/constants";

/*
  Metadata for "Contributors" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].title,
  description: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].description,

  openGraph: {
    title: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].title,
    description: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].description,
    images: {
      url: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].openGraph.images,
      height: CONTRIBUTORS_METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: CONTRIBUTORS_METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].openGraph.url,
    type: "website",
    siteName: CONTRIBUTORS_METADATA_CONSTANTS.SITE_NAME,
    locale: CONTRIBUTORS_METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].title,
    description: meta[CONTRIBUTORS_METADATA_CONSTANTS.CONTRIBUTORS].description,
    site: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_SITE,
    creator: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_CREATOR,
    app: {
      name: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_APP_NAME,
      id: {
        iphone: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_APP_ID_IPHONE,
        ipad: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_APP_ID_IPAD,
        googleplay: CONTRIBUTORS_METADATA_CONSTANTS.TWITTER_APP_ID_GOOGLEPLAY,
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
