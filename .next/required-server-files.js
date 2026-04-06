self.__SERVER_FILES_MANIFEST={
  "version": 1,
  "config": {
    "env": {
      "_sentryRewriteFramesDistDir": "build",
      "_sentryRewriteFramesAssetPrefixPath": "",
      "_sentryRelease": "d49c50fce39030f9e91ddd211dd2dc492c1c7dfa"
    },
    "webpack": null,
    "typescript": {
      "ignoreBuildErrors": false
    },
    "typedRoutes": false,
    "distDir": ".next",
    "cleanDistDir": true,
    "assetPrefix": "",
    "cacheMaxMemorySize": 52428800,
    "configOrigin": "next.config.js",
    "useFileSystemPublicRoutes": true,
    "generateEtags": true,
    "pageExtensions": [
      "tsx",
      "ts",
      "jsx",
      "js"
    ],
    "poweredByHeader": true,
    "compress": true,
    "images": {
      "deviceSizes": [
        640,
        750,
        828,
        1080,
        1200,
        1920,
        2048,
        3840
      ],
      "imageSizes": [
        32,
        48,
        64,
        96,
        128,
        256,
        384
      ],
      "path": "/_next/image",
      "loader": "default",
      "loaderFile": "",
      "domains": [],
      "disableStaticImages": false,
      "minimumCacheTTL": 14400,
      "formats": [
        "image/webp"
      ],
      "maximumRedirects": 3,
      "maximumResponseBody": 50000000,
      "dangerouslyAllowLocalIP": false,
      "dangerouslyAllowSVG": false,
      "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;",
      "contentDispositionType": "attachment",
      "localPatterns": [
        {
          "pathname": "**",
          "search": ""
        }
      ],
      "remotePatterns": [
        {
          "protocol": "https",
          "hostname": "avatars.githubusercontent.com"
        }
      ],
      "qualities": [
        75
      ],
      "unoptimized": true,
      "customCacheHandler": false
    },
    "devIndicators": {
      "position": "bottom-left"
    },
    "onDemandEntries": {
      "maxInactiveAge": 60000,
      "pagesBufferLength": 5
    },
    "basePath": "",
    "sassOptions": {},
    "trailingSlash": false,
    "i18n": null,
    "productionBrowserSourceMaps": true,
    "excludeDefaultMomentLocales": true,
    "reactProductionProfiling": false,
    "reactStrictMode": null,
    "reactMaxHeadersLength": 6000,
    "httpAgentOptions": {
      "keepAlive": true
    },
    "logging": {
      "serverFunctions": true,
      "browserToTerminal": "warn"
    },
    "compiler": {},
    "expireTime": 31536000,
    "staticPageGenerationTimeout": 60,
    "output": "export",
    "modularizeImports": {
      "@mui/icons-material": {
        "transform": "@mui/icons-material/{{member}}"
      },
      "lodash": {
        "transform": "lodash/{{member}}"
      }
    },
    "outputFileTracingRoot": "/home/runner/work/mindfiredigital.github.io/mindfiredigital.github.io",
    "cacheComponents": false,
    "cacheLife": {
      "default": {
        "stale": 300,
        "revalidate": 900,
        "expire": 4294967294
      },
      "seconds": {
        "stale": 30,
        "revalidate": 1,
        "expire": 60
      },
      "minutes": {
        "stale": 300,
        "revalidate": 60,
        "expire": 3600
      },
      "hours": {
        "stale": 300,
        "revalidate": 3600,
        "expire": 86400
      },
      "days": {
        "stale": 300,
        "revalidate": 86400,
        "expire": 604800
      },
      "weeks": {
        "stale": 300,
        "revalidate": 604800,
        "expire": 2592000
      },
      "max": {
        "stale": 300,
        "revalidate": 2592000,
        "expire": 31536000
      }
    },
    "cacheHandlers": {},
    "experimental": {
      "appNewScrollHandler": false,
      "useSkewCookie": false,
      "cssChunking": true,
      "multiZoneDraftMode": false,
      "appNavFailHandling": false,
      "prerenderEarlyExit": true,
      "serverMinification": true,
      "linkNoTouchStart": false,
      "caseSensitiveRoutes": false,
      "cachedNavigations": false,
      "partialFallbacks": false,
      "dynamicOnHover": false,
      "varyParams": false,
      "prefetchInlining": false,
      "preloadEntriesOnStart": true,
      "clientRouterFilter": true,
      "clientRouterFilterRedirects": false,
      "fetchCacheKeyPrefix": "",
      "proxyPrefetch": "flexible",
      "optimisticClientCache": true,
      "manualClientBasePath": false,
      "cpus": 3,
      "memoryBasedWorkersCount": false,
      "imgOptConcurrency": null,
      "imgOptTimeoutInSeconds": 7,
      "imgOptMaxInputPixels": 268402689,
      "imgOptSequentialRead": null,
      "imgOptSkipMetadata": null,
      "isrFlushToDisk": true,
      "workerThreads": false,
      "optimizeCss": false,
      "nextScriptWorkers": false,
      "scrollRestoration": false,
      "externalDir": false,
      "disableOptimizedLoading": false,
      "gzipSize": true,
      "craCompat": false,
      "esmExternals": true,
      "fullySpecified": false,
      "swcTraceProfiling": false,
      "forceSwcTransforms": false,
      "largePageDataBytes": 128000,
      "typedEnv": false,
      "clientTraceMetadata": [
        "baggage",
        "sentry-trace"
      ],
      "parallelServerCompiles": false,
      "parallelServerBuildTraces": false,
      "ppr": false,
      "authInterrupts": false,
      "webpackMemoryOptimizations": false,
      "optimizeServerReact": true,
      "strictRouteTypes": false,
      "viewTransition": false,
      "removeUncaughtErrorAndRejectionListeners": false,
      "validateRSCRequestHeaders": false,
      "staleTimes": {
        "dynamic": 0,
        "static": 300
      },
      "reactDebugChannel": true,
      "serverComponentsHmrCache": true,
      "staticGenerationMaxConcurrency": 8,
      "staticGenerationMinPagesPerWorker": 25,
      "transitionIndicator": false,
      "gestureTransition": false,
      "inlineCss": false,
      "useCache": false,
      "globalNotFound": false,
      "browserDebugInfoInTerminal": "warn",
      "lockDistDir": true,
      "proxyClientMaxBodySize": 10485760,
      "hideLogsAfterAbort": false,
      "mcpServer": true,
      "turbopackFileSystemCacheForDev": true,
      "turbopackFileSystemCacheForBuild": false,
      "turbopackInferModuleSideEffects": true,
      "turbopackPluginRuntimeStrategy": "childProcesses",
      "optimizePackageImports": [
        "lucide-react",
        "date-fns",
        "lodash-es",
        "ramda",
        "antd",
        "react-bootstrap",
        "ahooks",
        "@ant-design/icons",
        "@headlessui/react",
        "@headlessui-float/react",
        "@heroicons/react/20/solid",
        "@heroicons/react/24/solid",
        "@heroicons/react/24/outline",
        "@visx/visx",
        "@tremor/react",
        "rxjs",
        "@mui/material",
        "@mui/icons-material",
        "recharts",
        "react-use",
        "effect",
        "@effect/schema",
        "@effect/platform",
        "@effect/platform-node",
        "@effect/platform-browser",
        "@effect/platform-bun",
        "@effect/sql",
        "@effect/sql-mssql",
        "@effect/sql-mysql2",
        "@effect/sql-pg",
        "@effect/sql-sqlite-node",
        "@effect/sql-sqlite-bun",
        "@effect/sql-sqlite-wasm",
        "@effect/sql-sqlite-react-native",
        "@effect/rpc",
        "@effect/rpc-http",
        "@effect/typeclass",
        "@effect/experimental",
        "@effect/opentelemetry",
        "@material-ui/core",
        "@material-ui/icons",
        "@tabler/icons-react",
        "mui-core",
        "react-icons/ai",
        "react-icons/bi",
        "react-icons/bs",
        "react-icons/cg",
        "react-icons/ci",
        "react-icons/di",
        "react-icons/fa",
        "react-icons/fa6",
        "react-icons/fc",
        "react-icons/fi",
        "react-icons/gi",
        "react-icons/go",
        "react-icons/gr",
        "react-icons/hi",
        "react-icons/hi2",
        "react-icons/im",
        "react-icons/io",
        "react-icons/io5",
        "react-icons/lia",
        "react-icons/lib",
        "react-icons/lu",
        "react-icons/md",
        "react-icons/pi",
        "react-icons/ri",
        "react-icons/rx",
        "react-icons/si",
        "react-icons/sl",
        "react-icons/tb",
        "react-icons/tfi",
        "react-icons/ti",
        "react-icons/vsc",
        "react-icons/wi"
      ],
      "trustHostHeader": false,
      "isExperimentalCompile": false
    },
    "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight",
    "bundlePagesRouterDependencies": false,
    "configFileName": "next.config.js",
    "serverExternalPackages": [
      "amqplib",
      "connect",
      "dataloader",
      "express",
      "generic-pool",
      "graphql",
      "@hapi/hapi",
      "ioredis",
      "kafkajs",
      "koa",
      "lru-memoizer",
      "mongodb",
      "mongoose",
      "mysql",
      "mysql2",
      "knex",
      "pg",
      "pg-pool",
      "@node-redis/client",
      "@redis/client",
      "redis",
      "tedious"
    ],
    "turbopack": {
      "debugIds": true,
      "rules": {
        "**/instrumentation-client.*": {
          "condition": {
            "not": "foreign"
          },
          "loaders": [
            {
              "loader": "/home/runner/work/mindfiredigital.github.io/mindfiredigital.github.io/node_modules/@sentry/nextjs/build/cjs/config/loaders/valueInjectionLoader.js",
              "options": {
                "values": {
                  "_sentryRouteManifest": "{\"dynamicRoutes\":[],\"staticRoutes\":[{\"path\":\"/\"},{\"path\":\"/about\"},{\"path\":\"/contributors\"},{\"path\":\"/cookie-policy\"},{\"path\":\"/current-projects\"},{\"path\":\"/join-us\"},{\"path\":\"/packages\"},{\"path\":\"/privacy-policy\"},{\"path\":\"/projects\"},{\"path\":\"/terms-of-use\"},{\"path\":\"/upcoming-projects\"}],\"isrRoutes\":[]}",
                  "_sentryNextJsVersion": "16.2.2"
                }
              }
            }
          ]
        },
        "**/instrumentation.*": {
          "condition": {
            "not": "foreign"
          },
          "loaders": [
            {
              "loader": "/home/runner/work/mindfiredigital.github.io/mindfiredigital.github.io/node_modules/@sentry/nextjs/build/cjs/config/loaders/valueInjectionLoader.js",
              "options": {
                "values": {
                  "__SENTRY_SERVER_MODULES__": {
                    "@headlessui/react": "^1.7.18",
                    "@sentry/nextjs": "^10.44.0",
                    "axios": "^1.7.7",
                    "cheerio": "^1.0.0",
                    "clsx": "^2.0.0",
                    "html-to-image": "^1.11.13",
                    "i": "^0.3.7",
                    "lucide-react": "^0.563.0",
                    "moment": "^2.30.1",
                    "next": "^16.2.2",
                    "npm": "^10.2.0",
                    "react": "^18",
                    "react-dom": "^18",
                    "react-icons": "^5.5.0",
                    "react-markdown": "^9.0.0",
                    "react-type-animation": "^3.2.0",
                    "remark": "^15.0.1",
                    "remark-gfm": "^4.0.0",
                    "remark-html": "^16.0.1",
                    "tailwind-merge": "^1.14.0",
                    "winston": "^3.19.0",
                    "@commitlint/cli": "^18.4.3",
                    "@commitlint/config-conventional": "^18.4.3",
                    "@next/bundle-analyzer": "^16.2.2",
                    "@testing-library/jest-dom": "^6.9.1",
                    "@testing-library/react": "^16.3.2",
                    "@testing-library/user-event": "^14.6.1",
                    "@types/jest": "^30.0.0",
                    "@types/node": "^20",
                    "@types/react": "^18",
                    "@types/react-dom": "^18",
                    "@typescript-eslint/eslint-plugin": "^6.13.2",
                    "@typescript-eslint/parser": "^6.13.2",
                    "autoprefixer": "^10",
                    "babel-jest": "^29.7.0",
                    "cross-env": "^10.1.0",
                    "eslint": "^8.55.0",
                    "eslint-config-next": "13.5.4",
                    "eslint-config-prettier": "^9.1.0",
                    "eslint-plugin-react": "^7.33.2",
                    "husky": "^8.0.0",
                    "identity-obj-proxy": "^3.0.0",
                    "jest": "^30.3.0",
                    "jest-environment-jsdom": "^30.3.0",
                    "motion": "^12.6.3",
                    "postcss": "^8",
                    "prettier": "^3.1.1",
                    "serve": "^14.2.1",
                    "tailwindcss": "^3",
                    "tsx": "^4.21.0",
                    "typescript": "^5"
                  },
                  "_sentryNextJsVersion": "16.2.2"
                }
              }
            }
          ]
        }
      },
      "root": "/home/runner/work/mindfiredigital.github.io/mindfiredigital.github.io"
    },
    "distDirRoot": "build"
  },
  "appDir": "/home/runner/work/mindfiredigital.github.io/mindfiredigital.github.io",
  "relativeAppDir": "",
  "files": [
    ".next/routes-manifest.json",
    ".next/server/pages-manifest.json",
    ".next/build-manifest.json",
    ".next/prerender-manifest.json",
    ".next/server/functions-config-manifest.json",
    ".next/server/middleware-manifest.json",
    ".next/server/middleware-build-manifest.js",
    ".next/server/app-paths-manifest.json",
    ".next/app-path-routes-manifest.json",
    ".next/server/server-reference-manifest.js",
    ".next/server/server-reference-manifest.json",
    ".next/server/prefetch-hints.json",
    ".next/BUILD_ID",
    ".next/server/next-font-manifest.js",
    ".next/server/next-font-manifest.json",
    ".next/required-server-files.json",
    ".next/server/instrumentation.js"
  ],
  "ignore": []
}