/* eslint-env node */

/** @type {import('@lhci/cli').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      /* Use build:ci (frontend only, no data scripts) then serve the ./build output */
      buildDir: "./build",
      startServerCommand: "npm run start:build",
      startServerReadyPattern: "Accepting connections",
      startServerReadyTimeout: 30000,

      url: [
        "http://localhost:3000/",
        "http://localhost:3000/about/",
        "http://localhost:3000/projects/",
        "http://localhost:3000/contributors/",
        "http://localhost:3000/packages/",
      ],

      numberOfRuns: 3 /* median of 3 runs per URL for stable scores */,

      settings: {
        preset: "desktop",
        throttlingMethod: "simulate",
        chromeFlags: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu", // prevents GPU process from locking temp files on Windows
          "--disable-extensions", // reduces chrome subprocess noise
          "--headless=new", // new headless mode, more stable on Windows
        ].join(" "),
      },

      maxWaitForLoad: 45000,
    },

    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],

        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 3000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        interactive: ["warn", { maxNumericValue: 4000 }],
      },
    },

    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-reports",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%",
    },
  },
};
