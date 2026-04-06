const { PHASE_PRODUCTION_BUILD } = require("next/constants");
const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

let config = (phase, { defaultConfig }) => {
  const images = {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  };

  if (phase === PHASE_PRODUCTION_BUILD) {
    return { images, output: "export", distDir: "build" };
  }

  return { images };
};

// Wrap with bundle analyzer first, then Sentry
module.exports = withSentryConfig(withBundleAnalyzer(config), {
  org: "mindfire-lr",
  project: "mindfire-digital-foss",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },
  },
});