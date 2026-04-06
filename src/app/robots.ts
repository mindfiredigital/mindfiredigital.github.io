// app/robots.ts
// Next.js App Router — generates /robots.txt automatically at build time.
// No runtime cost; purely static.

import { MetadataRoute } from "next";
export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all well-behaved crawlers to index everything
        userAgent: "*",
        allow: "/",
        // Block Next.js internals & API routes from being indexed
        disallow: ["/api/", "/_next/", "/static/"],
      },
      {
        // GPTBot (OpenAI) — disallow if you don't want AI training on your content
        // Remove this block if you're fine with it.
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    // Points crawlers to the sitemap — already exists at app/sitemap.ts
    sitemap: `${BASE_URL}/sitemap.xml`,
    // Optional: declare canonical host
    host: BASE_URL,
  };
}
