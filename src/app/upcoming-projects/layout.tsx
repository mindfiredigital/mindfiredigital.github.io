import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

/*
  Page-specific metadata for "Upcoming Projects"
  - This will be automatically added to the <head> of this route
  - Helps with SEO and social media previews
*/
export const metadata: Metadata = {
  title: meta["Upcoming-Projects"].title,
  description: meta["Upcoming-Projects"].description,

  /*
    Open Graph metadata
    - Used by platforms like Facebook, LinkedIn, WhatsApp
    - Controls preview (title, image, description) when link is shared
  */
  openGraph: {
    title: meta["Upcoming-Projects"].title,
    description: meta["Upcoming-Projects"].description,
    images: {
      url: meta["Upcoming-Projects"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Upcoming-Projects"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Upcoming-Projects"].title,
    description: meta["Upcoming-Projects"].description,
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

export default function UpcomingProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
