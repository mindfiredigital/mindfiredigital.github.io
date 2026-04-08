/**
 * JSON-LD structured data schemas for Mindfire FOSS
 * Used by crawlers (Google, Bing, etc.) to understand page content.
 * Add each page's schema to its layout.tsx via <JsonLd> component.
 */

const BASE_URL = "https://mindfiredigital.github.io";
const ORG_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

// ── Shared Organisation entity (referenced by all pages) ──────────────────────
export const organizationSchema = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Mindfire FOSS",
  alternateName: "Mindfire Digital LLP",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.png`,
  },
  description:
    "Mindfire FOSS is an open source community by Mindfire Digital LLP, " +
    "building and maintaining free and open source software across web, " +
    "mobile, AI, and developer tooling.",
  foundingDate: "2023",
  sameAs: [
    "https://github.com/mindfiredigital",
    "https://twitter.com/mindfires",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "community support",
    url: `${BASE_URL}/join-us`,
  },
};

// ── WebSite (enables Sitelinks Search Box in Google) ─────────────────────────
export const websiteSchema = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: BASE_URL,
  name: "Mindfire FOSS",
  publisher: { "@id": ORG_ID },
};

// ── Home page ─────────────────────────────────────────────────────────────────
export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [organizationSchema, websiteSchema],
};

// ── About page ────────────────────────────────────────────────────────────────
export const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/about/#webpage`,
      url: `${BASE_URL}/about`,
      name: "About – Mindfire FOSS",
      description:
        "Learn about Mindfire FOSS — our mission, values, and the open source community we're building.",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: `${BASE_URL}/about`,
          },
        ],
      },
    },
  ],
};

// ── Projects page ─────────────────────────────────────────────────────────────
export const projectsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/projects/#webpage`,
      url: `${BASE_URL}/projects`,
      name: "Projects – Mindfire FOSS",
      description:
        "Explore Mindfire FOSS open source projects — web, mobile, AI, and developer tools.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: `${BASE_URL}/projects`,
          },
        ],
      },
    },
  ],
};

// ── Current Projects page ─────────────────────────────────────────────────────
export const currentProjectsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/current-projects/#webpage`,
      url: `${BASE_URL}/current-projects`,
      name: "Current Projects – Mindfire FOSS",
      description:
        "Browse all currently active open source projects maintained by Mindfire FOSS.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: `${BASE_URL}/projects`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Current Projects",
            item: `${BASE_URL}/current-projects`,
          },
        ],
      },
    },
  ],
};

// ── Upcoming Projects page ────────────────────────────────────────────────────
export const upcomingProjectsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/upcoming-projects/#webpage`,
      url: `${BASE_URL}/upcoming-projects`,
      name: "Upcoming Projects – Mindfire FOSS",
      description:
        "Preview upcoming open source projects being planned and developed by Mindfire FOSS.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: `${BASE_URL}/projects`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Upcoming Projects",
            item: `${BASE_URL}/upcoming-projects`,
          },
        ],
      },
    },
  ],
};

// ── Contributors page ─────────────────────────────────────────────────────────
export const contributorsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/contributors/#webpage`,
      url: `${BASE_URL}/contributors`,
      name: "Contributors – Mindfire FOSS",
      description:
        "Meet the contributors who build and maintain Mindfire FOSS open source projects. View leaderboard, scores, and stats.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contributors",
            item: `${BASE_URL}/contributors`,
          },
        ],
      },
    },
  ],
};

// ── Packages page ─────────────────────────────────────────────────────────────
export const packagesJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/packages/#webpage`,
      url: `${BASE_URL}/packages`,
      name: "Packages – Mindfire FOSS",
      description:
        "Explore open source npm, PyPI, and NuGet packages published by Mindfire FOSS.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Packages",
            item: `${BASE_URL}/packages`,
          },
        ],
      },
    },
  ],
};

// ── Join Us page ──────────────────────────────────────────────────────────────
export const joinUsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/join-us/#webpage`,
      url: `${BASE_URL}/join-us`,
      name: "Join Us – Mindfire FOSS",
      description:
        "Learn how to become a contributor to Mindfire FOSS open source projects. Get started with GitHub and submit your first pull request.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Join Us",
            item: `${BASE_URL}/join-us`,
          },
        ],
      },
    },
  ],
};

// ── Privacy Policy page ───────────────────────────────────────────────────────
export const privacyPolicyJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/privacy-policy/#webpage`,
      url: `${BASE_URL}/privacy-policy`,
      name: "Privacy Policy – Mindfire FOSS",
      description: "Privacy policy for the Mindfire FOSS website.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Privacy Policy",
            item: `${BASE_URL}/privacy-policy`,
          },
        ],
      },
    },
  ],
};

// ── Cookie Policy page ────────────────────────────────────────────────────────
export const cookiePolicyJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/cookie-policy/#webpage`,
      url: `${BASE_URL}/cookie-policy`,
      name: "Cookie Policy – Mindfire FOSS",
      description: "Cookie policy for the Mindfire FOSS website.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Cookie Policy",
            item: `${BASE_URL}/cookie-policy`,
          },
        ],
      },
    },
  ],
};

// ── Terms of Use page ─────────────────────────────────────────────────────────
export const termsOfUseJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/terms-of-use/#webpage`,
      url: `${BASE_URL}/terms-of-use`,
      name: "Terms of Use – Mindfire FOSS",
      description: "Terms of use for the Mindfire FOSS website.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Terms of Use",
            item: `${BASE_URL}/terms-of-use`,
          },
        ],
      },
    },
  ],
};