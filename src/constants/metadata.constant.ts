export const METADATA_CONSTANTS = {
  ABOUT: "About",
  CONTRIBUTORS: "Contributors",
  COOKIE_POLICY: "Cookie-Policy",
  CURRENT_PROJECT: "Current-Projects",
  JOIN_US: "Join-Us",
  PACKAGE: "Packages",
  PRIVACY_POLICY: "Privacy-Policy",
  PROJECTS: "Projects",
  TERMS_OF_USE: "Terms-Of-Use",
  UPCOMING_PROJECT: "Upcoming-Projects",

  WEBSITE: "website",
  OPEN_GRAPH_IMAGE_HEIGHT: "627",
  OPEN_GRAPH_IMAGE_WIDTH: "1200",

  SITE_NAME: "Mindfire Digital LLP",
  LOCALE: "en_US",

  TWITTER_CARD_TYPE: "app",
  TWITTER_SITE: "@mindfires",
  TWITTER_CREATOR: "@mindfires",
  TWITTER_APP_NAME: "twitter_app",
  TWITTER_APP_ID_IPHONE: "twitter_app://iphone",
  TWITTER_APP_ID_IPAD: "twitter_app://ipad",
  TWITTER_APP_ID_GOOGLEPLAY: "twitter_app://googleplay",

  BASE_URL: "https://mindfiredigital.github.io/",
  APPLICATION_NAME: "Mindfire FOSS",
  REFERRER: "origin-when-cross-origin" as const,
  CREATOR: "Mindfire Digital LLP",
  PUBLISHER: "Mindfire Digital LLP",

  // ── Keywords ────────────────────────────────────────────────────────────
  KEYWORDS: [
    "Mindfire",
    "FOSS",
    "Mindfire FOSS",
    "React",
    "JavaScript",
    "next.js",
    "Opensource community",
    "Software Development",
  ],

  // ── Authors ─────────────────────────────────────────────────────────────
  AUTHORS: [
    { name: "Mindfire" },
    { name: "Mindfire", url: "https://mindfiredigital.github.io" },
  ],

  // ── Robots ──────────────────────────────────────────────────────────────
  ROBOTS_INDEX: false,
  ROBOTS_FOLLOW: true,
  ROBOTS_NOCACHE: true,

  // ── GoogleBot ───────────────────────────────────────────────────────────
  GOOGLEBOT_INDEX: true,
  GOOGLEBOT_FOLLOW: false,
  GOOGLEBOT_NO_IMAGE_INDEX: true,
  GOOGLEBOT_MAX_VIDEO_PREVIEW: -1,
  GOOGLEBOT_MAX_IMAGE_PREVIEW: "large" as const,
  GOOGLEBOT_MAX_SNIPPET: -1,

  HOME: "Home",
} as const;
