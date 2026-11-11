import { load as cheerioLoad } from "cheerio";
import { fetchTotalDownloads } from "./pypiTotalStats.mjs";
import { fetchData, writeJsonToFile } from "./config.mjs";
import logger from "../src/app/utils/logger.mjs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to extract package name from URL
function extractPackageNameFromUrl(url) {
  if (!url) return null;
  const npmMatch = url.match(/\/package\/@mindfiredigital\/(.+?)(?:\/|$)/);
  if (npmMatch) return npmMatch[1];
  const pypiMatch = url.match(/\/project\/(.+?)(?:\/|$)/);
  if (pypiMatch) return pypiMatch[1];
  const nugetMatch = url.match(/nuget\.org\/packages\/(.+?)(?:\/|$)/);
  if (nugetMatch) return nugetMatch[1];
  const goMatch = url.match(/pkg\.go\.dev\/(.+?)(?:\/|$)/);
  if (goMatch) {
    const parts = goMatch[1].split("/");
    return parts[parts.length - 1];
  }
  return null;
}

class RequestQueue {
  constructor(concurrency = 1, delayBetweenRequests = 1000) {
    this.concurrency = concurrency;
    this.delayBetweenRequests = delayBetweenRequests;
    this.queue = [];
    this.running = 0;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    this.running++;
    const { fn, resolve, reject } = this.queue.shift();
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      if (this.queue.length > 0) await delay(this.delayBetweenRequests);
      this.process();
    }
  }
}

const npmQueue = new RequestQueue(1, 1000);

async function fetchWithRetry(url, maxRetries = 5, initialDelay = 2000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await fetchData(url);
      return data;
    } catch (error) {
      const errorMessage = error.message?.toLowerCase() || "";
      const isRateLimit =
        error.status === 429 ||
        errorMessage.includes("429") ||
        errorMessage.includes("too many requests") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("cloudflare");

      if (isRateLimit && attempt < maxRetries - 1) {
        const baseWait = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        const waitTime = baseWait + jitter;
        logger.info(
          `Rate limited. Waiting ${Math.round(waitTime / 1000)}s before retry ${
            attempt + 1
          }/${maxRetries - 1}`
        );
        await delay(waitTime);
        continue;
      }
      if (attempt === maxRetries - 1)
        logger.error(`Failed after ${maxRetries} attempts`);
      throw error;
    }
  }
}

async function queuedNpmFetch(url) {
  return npmQueue.add(() => fetchWithRetry(url, 5, 2000));
}

// NEW - fetches true all-time total by chunking in 18-month windows
async function getNpmTotalAllTime(packageName) {
  const start = new Date("2015-01-10");
  const end = new Date();
  let total = 0;

  let chunkStart = new Date(start);
  while (chunkStart < end) {
    let chunkEnd = new Date(chunkStart);
    chunkEnd.setMonth(chunkEnd.getMonth() + 18);
    if (chunkEnd > end) chunkEnd = end;

    const s = chunkStart.toISOString().split("T")[0];
    const e = chunkEnd.toISOString().split("T")[0];

    const url = `https://api.npmjs.org/downloads/range/${s}:${e}/@mindfiredigital/${packageName}`;
    try {
      const data = await queuedNpmFetch(url);
      if (data?.downloads) {
        total += data.downloads.reduce((acc, d) => acc + d.downloads, 0);
      }
    } catch (error) {
      logger.warn(`Failed to fetch chunk ${s}:${e} for ${packageName}`);
    }

    chunkStart = new Date(chunkEnd);
    chunkStart.setDate(chunkStart.getDate() + 1);
  }

  return total;
}

export async function getAllStats(
  npmPackages,
  pypiPackages,
  golangPackages = []
) {
  const statsMap = {};

  logger.info(
    `Fetching stats for ${npmPackages.length} npm packages, ${pypiPackages.length} PyPI packages, and ${golangPackages.length} Golang packages...`
  );
  logger.info(
    `Using queue with concurrency=1 and 1000ms delay between requests`
  );

  let completed = 0;
  for (const pkg of npmPackages) {
    try {
      const packageName = pkg.name;
      const cleanName = extractPackageNameFromUrl(pkg.url) || packageName;
      logger.info(
        `[${completed + 1}/${
          npmPackages.length
        }] Processing ${packageName} (clean name: ${cleanName})...`
      );

      const dayStats = await getNpmStats(cleanName, "last-day");
      const weekStats = await getNpmStats(cleanName, "last-week");
      const yearStats = await getNpmStats(cleanName, "last-year");
      // FIXED - use chunked all-time instead of capped single range
      const totalStats = await getNpmTotalAllTime(cleanName);

      if (
        dayStats !== 0 ||
        weekStats !== 0 ||
        yearStats !== 0 ||
        totalStats !== 0
      ) {
        statsMap[packageName] = {
          name: packageName,
          type: "npm",
          day: dayStats,
          week: weekStats,
          year: yearStats,
          total: totalStats,
        };
        logger.info(
          `${packageName}: day=${dayStats}, week=${weekStats}, year=${yearStats}, total=${totalStats}`
        );
      } else {
        logger.warn(`${packageName}: No downloads recorded`);
      }
      completed++;
    } catch (error) {
      logger.error(`Error fetching stats for ${pkg.name}: ${error.message}`);
      completed++;
    }
  }

  logger.info(`Fetching PyPI stats...`);
  await Promise.all(
    pypiPackages.map(async (pkg) => {
      try {
        const packageName = pkg.name;
        const cleanName = extractPackageNameFromUrl(pkg.url) || packageName;
        const stats = await fetchPyPIDownloadStats(cleanName);
        const totalDownloads = await fetchTotalDownloads(cleanName);
        if (stats) {
          statsMap[packageName] = {
            name: packageName,
            type: "pypi",
            day: stats.last_day || 0,
            week: stats.last_week || 0,
            month: stats.last_month || 0,
            year: 0,
            total: totalDownloads,
          };
          logger.info(
            `${packageName} (PyPI): day=${stats.last_day}, week=${stats.last_week}, month=${stats.last_month}, total=${totalDownloads}`
          );
        }
      } catch (error) {
        logger.error(
          `Error fetching stats for ${pkg.name} (PyPI): ${error.message}`
        );
      }
    })
  );

  logger.info(`Fetching Golang stats...`);
  await Promise.all(
    golangPackages.map(async (pkg) => {
      try {
        const packageName = pkg.name;
        const stats = await fetchGolangStats(pkg);
        statsMap[`Golang:${packageName}`] = {
          name: packageName,
          type: pkg.type || "golang",
          url: pkg.url,
          day: 0,
          week: 0,
          month: 0,
          year: 0,
          total: stats.importCount || 0,
          version: stats.latestVersion || "",
          versionsCount: stats.versionsCount || 0,
        };
        logger.info(
          `${packageName} (${pkg.type}): import count=${stats.importCount}, latestVersion=${stats.latestVersion}, versionsCount=${stats.versionsCount}`
        );
      } catch (error) {
        logger.error(
          `Error fetching stats for ${pkg.name} (Golang): ${error.message}`
        );
      }
    })
  );

  logger.info(
    `Completed! Retrieved stats for ${Object.keys(statsMap).length} packages.`
  );
  return Object.values(statsMap);
}

async function fetchPyPIDownloadStats(packageName) {
  const url = `https://pypistats.org/api/packages/${packageName}/recent`;
  try {
    const data = await fetchWithRetry(url, 3, 1000);
    return data.data;
  } catch (error) {
    logger.warn(
      `Failed to fetch download stats for ${packageName} (PyPI): ${error.message}`
    );
    return null;
  }
}

async function fetchPkgGoDevHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MindfireFOSS/1.0; +https://mindfiredigital.github.io)",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return response.text();
}

function parseImportedByCount($) {
  const el = $('[data-test-id="UnitHeader-importedby"]');
  if (el.length === 0) return null;
  const text = el.text().trim();
  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
}

async function fetchGolangStats(pkg) {
  const url = pkg.url || "";
  let modulePath = null;
  let owner = "mindfiredigital";
  let repo = pkg.name;

  const goDevMatch = url.match(
    /pkg\.go\.dev\/(github\.com\/([^/]+)\/([^/]+))/i
  );
  if (goDevMatch) {
    modulePath = goDevMatch[1];
    owner = goDevMatch[2];
    repo = goDevMatch[3];
  } else if (url.includes("github.com")) {
    const ghMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (ghMatch) {
      owner = ghMatch[1];
      repo = ghMatch[2].replace(/\.git$/, "");
      modulePath = `github.com/${owner}/${repo}`;
    }
  } else if (url && !url.includes("pkg.go.dev")) {
    // Non-package URL (e.g. documentation link like github.io)
    return { importCount: 0, latestVersion: "", versionsCount: 0 };
  } else {
    modulePath = `github.com/${owner}/${pkg.name}`;
  }

  let importCount = 0;
  let latestVersion = "";
  let versionsCount = 0;

  // 1. Fetch import count directly from pkg.go.dev
  const pkgGoDevUrl = url.includes("pkg.go.dev")
    ? url
    : `https://pkg.go.dev/${modulePath}`;
  try {
    const html = await fetchPkgGoDevHtml(pkgGoDevUrl);
    const $ = cheerioLoad(html);

    // Extract latest version if present in header
    const versionText = $('[data-test-id="UnitHeader-version"] a')
      .first()
      .text()
      .replace(/Version:\s*/i, "")
      .trim();
    if (versionText) {
      latestVersion = versionText;
    }

    const directCount = parseImportedByCount($);
    if (directCount !== null) {
      importCount = directCount;
    } else {
      // Module root page without a root package: check exported subpackages
      const subLinks = [];
      $(
        '[data-test-id="UnitDirectories-table"] tr:not(.UnitDirectories-internal) a'
      ).each((_, a) => {
        const href = $(a).attr("href");
        if (href && !href.includes("/internal")) {
          const cleanHref = href.replace(/@[^/]+/, "");
          subLinks.push(`https://pkg.go.dev${cleanHref}`);
        }
      });

      for (const subUrl of subLinks) {
        try {
          const subHtml = await fetchPkgGoDevHtml(subUrl);
          const $sub = cheerioLoad(subHtml);
          const subCount = parseImportedByCount($sub);
          if (subCount !== null) {
            importCount += subCount;
          }
        } catch (subErr) {
          logger.warn(
            `Could not fetch pkg.go.dev subpackage ${subUrl}: ${subErr.message}`
          );
        }
      }
    }
  } catch (err) {
    logger.warn(
      `Could not fetch import count from ${pkgGoDevUrl}: ${err.message}`
    );
  }

  // 2. Fetch versions info from deps.dev
  try {
    const depsUrl = `https://api.deps.dev/v3/systems/go/packages/${encodeURIComponent(
      modulePath
    )}`;
    const depsData = await fetchData(depsUrl).catch(() => null);
    if (depsData && Array.isArray(depsData.versions)) {
      versionsCount = depsData.versions.length;
      if (!latestVersion) {
        const defaultVer = depsData.versions.find((v) => v.isDefault);
        latestVersion =
          defaultVer?.versionKey?.version ||
          depsData.versions[depsData.versions.length - 1]?.versionKey
            ?.version ||
          "";
      }
    }
  } catch (err) {
    logger.warn(
      `Could not fetch deps.dev info for ${modulePath}: ${err.message}`
    );
  }

  // 3. Fallback to proxy.golang.org if latestVersion not resolved
  if (!latestVersion && modulePath) {
    try {
      const encodedModule = modulePath
        .split("/")
        .map((part) => part.replace(/[A-Z]/g, (c) => "!" + c.toLowerCase()))
        .join("/");
      const proxyData = await fetchData(
        `https://proxy.golang.org/${encodedModule}/@latest`
      ).catch(() => null);
      if (proxyData?.Version) {
        latestVersion = proxyData.Version;
      }
    } catch {
      // Ignore fallback
    }
  }

  return {
    importCount,
    latestVersion,
    versionsCount,
  };
}

async function getNpmStats(packageName, period) {
  try {
    const stats = await fetchDownloadStats(packageName, period);
    if (!stats || !stats.package) return 0;
    return calculateAverageDownloads(stats);
  } catch (error) {
    logger.warn(`${packageName} not available for period ${period}`);
    return 0;
  }
}

async function fetchDownloadStats(packageName, period) {
  const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;
  try {
    const data = await queuedNpmFetch(url);
    return data;
  } catch (error) {
    logger.warn(
      `Failed to fetch download stats for ${packageName} (${period}): ${error.message}`
    );
    return null;
  }
}

function calculateAverageDownloads(stats) {
  if (!stats.downloads || !Array.isArray(stats.downloads)) return 0;
  return stats.downloads.reduce(
    (accumulator, download) => accumulator + download.downloads,
    0
  );
}

export async function updatePackages() {
  const query = `
    query getCurrentProjects {
      foss_projects(filter: { _and: [{ project_type: { _eq: "current" }}, { status: { _eq: "published" }}]}) {
        id
        title
        is_mono_repo
        packages {
          package_name
          package_type
          package_url
          status
        }
      }
    }
  `;

  try {
    const response = await fetchData(
      "https://directus.ourgoalplan.co.in/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }
    );

    const projects = response.data.foss_projects;

    const allPackages = projects.flatMap((project) =>
      project.packages.map((pkg) => ({
        name: pkg.package_name,
        title: pkg.package_name,
        type: pkg.package_type,
        url: pkg.package_url,
        projectTitle: project.title,
        status: pkg.status,
      }))
    );

    writeJsonToFile("../src/asset/packages.json", allPackages);

    const projectData = projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.short_description,
      isMonoRepo: project.is_mono_repo,
      repoUrl: project.github_repository_link,
      packages: project.packages.map((pkg) => ({
        name: pkg.package_name,
        type: pkg.package_type,
        url: pkg.package_url,
        status: pkg.status,
      })),
    }));

    writeJsonToFile("../src/asset/projects_grouped.json", projectData);
    logger.info("Successfully updated packages.json");
  } catch (error) {
    logger.error(`Failed to update packages: ${error}`);
  }
}

import { fileURLToPath } from "url";
const isMain =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith("updatePackages.mjs"));
if (isMain) {
  updatePackages();
}
