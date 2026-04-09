import React from "react";
import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";
import { METADATA_CONSTANTS } from "@/constants";
import JsonLd from "@/components/shared/JsonLd";
import { privacyPolicyJsonLd } from "@/lib/jsonld";

/*
  Metadata for "Privacy Policy" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta[METADATA_CONSTANTS.PRIVACY_POLICY].title,
  description: meta[METADATA_CONSTANTS.PRIVACY_POLICY].description,

  openGraph: {
    title: meta[METADATA_CONSTANTS.PRIVACY_POLICY].title,
    description: meta[METADATA_CONSTANTS.PRIVACY_POLICY].description,
    images: {
      url: meta[METADATA_CONSTANTS.PRIVACY_POLICY].openGraph.images,
      height: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[METADATA_CONSTANTS.PRIVACY_POLICY].openGraph.url,
    type: METADATA_CONSTANTS.WEBSITE,
    siteName: METADATA_CONSTANTS.SITE_NAME,
    locale: METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[METADATA_CONSTANTS.PRIVACY_POLICY].title,
    description: meta[METADATA_CONSTANTS.PRIVACY_POLICY].description,
    site: METADATA_CONSTANTS.TWITTER_SITE,
    creator: METADATA_CONSTANTS.TWITTER_CREATOR,
    app: {
      name: METADATA_CONSTANTS.TWITTER_APP_NAME,
      id: {
        iphone: METADATA_CONSTANTS.TWITTER_APP_ID_IPHONE,
        ipad: METADATA_CONSTANTS.TWITTER_APP_ID_IPAD,
        googleplay: METADATA_CONSTANTS.TWITTER_APP_ID_GOOGLEPLAY,
      },
    },
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <JsonLd data={privacyPolicyJsonLd} />;
  return <>{children}</>;
}
