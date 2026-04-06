const { PHASE_PRODUCTION_BUILD } = require("next/constants");
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

// Export the config wrapped only with bundle analyzer
module.exports = withBundleAnalyzer(config);