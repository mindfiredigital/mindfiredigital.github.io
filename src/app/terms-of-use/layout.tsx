import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";
import { METADATA_CONSTANTS } from "@/constants";

/*
  Metadata for "Terms of Use" page
  - Automatically injected into <head> by Next.js
  - Helps improve SEO and link previews
*/
export const metadata: Metadata = {
  title: meta[METADATA_CONSTANTS.TERMS_OF_USE].title,
  description: meta[METADATA_CONSTANTS.TERMS_OF_USE].description,
  openGraph: {
    title: meta[METADATA_CONSTANTS.TERMS_OF_USE].title,
    description: meta[METADATA_CONSTANTS.TERMS_OF_USE].description,
    images: {
      url: meta[METADATA_CONSTANTS.TERMS_OF_USE].openGraph.images,
      height: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[METADATA_CONSTANTS.TERMS_OF_USE].openGraph.url,
    type: METADATA_CONSTANTS.WEBSITE,
    siteName: METADATA_CONSTANTS.SITE_NAME,
    locale: METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[METADATA_CONSTANTS.TERMS_OF_USE].title,
    description: meta[METADATA_CONSTANTS.TERMS_OF_USE].description,
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

export default function TermsOfUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
