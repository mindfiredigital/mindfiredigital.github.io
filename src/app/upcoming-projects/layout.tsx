import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";
import { METADATA_CONSTANTS } from "@/constants";
import JsonLd from "@/components/shared/JsonLd";
import { upcomingProjectsJsonLd } from "@/lib/jsonld";

/*
  Page-specific metadata for "Upcoming Projects"
  - This will be automatically added to the <head> of this route
  - Helps with SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].title,
  description: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].description,
  openGraph: {
    title: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].title,
    description: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].description,
    images: {
      url: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].openGraph.images,
      height: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].openGraph.url,
    type: METADATA_CONSTANTS.WEBSITE,
    siteName: METADATA_CONSTANTS.SITE_NAME,
    locale: METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].title,
    description: meta[METADATA_CONSTANTS.UPCOMING_PROJECT].description,
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

export default function UpcomingProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <JsonLd data={upcomingProjectsJsonLd} />
  return <>{children}</>;
}
