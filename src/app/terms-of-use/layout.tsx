import type { Metadata } from "next";
import meta from "@/metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["Terms-Of-Use"].title,
  description: meta["Terms-Of-Use"].description,
  openGraph: {
    title: meta["Terms-Of-Use"].title,
    description: meta["Terms-Of-Use"].description,
    images: {
      url: meta["Terms-Of-Use"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Terms-Of-Use"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Terms-Of-Use"].title,
    description: meta["Terms-Of-Use"].description,
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

export default function TermsOfUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
