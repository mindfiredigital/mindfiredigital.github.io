// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     unoptimized: true,
//   },
//   output: "export",
//   // distDir: "build" // Optional: Change the output directory `out` -> `build`
// };

// module.exports = nextConfig;

const { PHASE_PRODUCTION_BUILD } = require("next/constants");

module.exports = (phase, { defaultConfig }) => {
  const images = {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  };

  if (phase === PHASE_PRODUCTION_BUILD) {
    return {
      images,
      output: "export",
      distDir: "build"
    };
  }

  return {
    images,
  };
};
