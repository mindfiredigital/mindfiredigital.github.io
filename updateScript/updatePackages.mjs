import { fetchTotalDownloads } from "../pypiTotalStats.mjs";
import { fetchData, writeJsonToFile } from "./config.mjs";
import logger from "../src/app/utils/logger.ts";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

export async function getAllStats(npmPackages, pypiPackages) {
  const statsMap = {};

  logger.info(
    `Fetching stats for ${npmPackages.length} npm packages and ${pypiPackages.length} PyPI packages...`
  );
  logger.info(
    `Using queue with concurrency=1 and 1000ms delay between requests`
  );

  let completed = 0;
  for (const packageName of npmPackages) {
    try {
      logger.info(
        `[${completed + 1}/${npmPackages.length}] Processing ${packageName}...`
      );

      const dayStats = await getNpmStats(packageName, "last-day");
      const weekStats = await getNpmStats(packageName, "last-week");
      const yearStats = await getNpmStats(packageName, "last-year");
      const totalStats = await getNpmStats(
        packageName,
        "1000-01-01:3000-01-01"
      );

      if (dayStats !== 0 || weekStats !== 0 || yearStats !== 0) {
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
      logger.error(`Error fetching stats for ${packageName}: ${error.message}`);
      completed++;
    }
  }

  logger.info(`Fetching PyPI stats...`);
  await Promise.all(
    pypiPackages.map(async (packageName) => {
      try {
        const stats = await fetchPyPIDownloadStats(packageName);
        const totalDownloads = await fetchTotalDownloads(packageName);
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
          `Error fetching stats for ${packageName} (PyPI): ${error.message}`
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

async function updatePackages() {
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

updatePackages();
