import type { Metadata } from "next";
import meta from "../../metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["Projects"].title,
  description: meta["Projects"].description,
  openGraph: {
    title: meta["Projects"].title,
    description: meta["Projects"].description,
    images: {
      url: meta["Projects"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Projects"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Projects"].title,
    description: meta["Projects"].description,
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

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
