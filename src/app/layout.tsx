import React from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import meta from "@/metadata/metadata.json";
import { METADATA_CONSTANTS } from "@/constants";
import JsonLd from "@/components/shared/JsonLd";
import { homeJsonLd } from "@/lib/jsonld";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_CONSTANTS.BASE_URL),
  title: meta[METADATA_CONSTANTS.HOME].title,
  description: meta[METADATA_CONSTANTS.HOME].description,
  applicationName: METADATA_CONSTANTS.APPLICATION_NAME,
  referrer: METADATA_CONSTANTS.REFERRER,
  keywords: [...METADATA_CONSTANTS.KEYWORDS],
  authors: [...METADATA_CONSTANTS.AUTHORS],
  creator: METADATA_CONSTANTS.CREATOR,
  publisher: METADATA_CONSTANTS.PUBLISHER,

  openGraph: {
    title: meta[METADATA_CONSTANTS.HOME].openGraph.title,
    description: meta[METADATA_CONSTANTS.HOME].description,
    images: {
      url: meta[METADATA_CONSTANTS.HOME].openGraph.images,
      height: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_HEIGHT,
      width: METADATA_CONSTANTS.OPEN_GRAPH_IMAGE_WIDTH,
    },
    url: meta[METADATA_CONSTANTS.HOME].openGraph.url,
    type: METADATA_CONSTANTS.WEBSITE,
    siteName: METADATA_CONSTANTS.SITE_NAME,
    locale: METADATA_CONSTANTS.LOCALE,
  },

  twitter: {
    card: METADATA_CONSTANTS.TWITTER_CARD_TYPE,
    title: meta[METADATA_CONSTANTS.HOME].twitter.title,
    description: meta[METADATA_CONSTANTS.HOME].description,
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

  robots: {
    index: METADATA_CONSTANTS.ROBOTS_INDEX,
    follow: METADATA_CONSTANTS.ROBOTS_FOLLOW,
    nocache: METADATA_CONSTANTS.ROBOTS_NOCACHE,
    googleBot: {
      index: METADATA_CONSTANTS.GOOGLEBOT_INDEX,
      follow: METADATA_CONSTANTS.GOOGLEBOT_FOLLOW,
      noimageindex: METADATA_CONSTANTS.GOOGLEBOT_NO_IMAGE_INDEX,
      "max-video-preview": METADATA_CONSTANTS.GOOGLEBOT_MAX_VIDEO_PREVIEW,
      "max-image-preview": METADATA_CONSTANTS.GOOGLEBOT_MAX_IMAGE_PREVIEW,
      "max-snippet": METADATA_CONSTANTS.GOOGLEBOT_MAX_SNIPPET,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${roboto.className} !scroll-smooth`}>
      <head>
        {/* JSON-LD structured data for the home / root level — crawlers only */}
        <JsonLd data={homeJsonLd} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
