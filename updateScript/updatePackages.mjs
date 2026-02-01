import { fetchTotalDownloads } from "../pypiTotalStats.mjs";
import { fetchData, writeJsonToFile } from "./config.mjs";

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Queue manager with concurrency control
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
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;

      // Add delay before processing next request
      if (this.queue.length > 0) {
        await delay(this.delayBetweenRequests);
      }

      this.process();
    }
  }
}

// Create a single queue instance for npm requests
const npmQueue = new RequestQueue(1, 1000); // concurrency: 1, delay: 1000ms

// Function to fetch with retry logic for rate limiting
async function fetchWithRetry(url, maxRetries = 5, initialDelay = 2000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await fetchData(url);
      return data;
    } catch (error) {
      // Check if it's a rate limit error
      const errorMessage = error.message?.toLowerCase() || "";
      const isRateLimit =
        error.status === 429 ||
        errorMessage.includes("429") ||
        errorMessage.includes("too many requests") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("cloudflare");

      if (isRateLimit && attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const baseWait = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        const waitTime = baseWait + jitter;

        console.log(
          `⏳ Rate limited. Waiting ${Math.round(
            waitTime / 1000
          )}s before retry ${attempt + 1}/${maxRetries - 1}`
        );
        await delay(waitTime);
        continue;
      }

      if (attempt === maxRetries - 1) {
        console.error(`❌ Failed after ${maxRetries} attempts`);
      }
      throw error;
    }
  }
}

// Queued fetch for npm API calls
async function queuedNpmFetch(url) {
  return npmQueue.add(() => fetchWithRetry(url, 5, 2000));
}

// Function to fetch and aggregate statistics for all npm and PyPI packages
export async function getAllStats(npmPackages, pypiPackages) {
  const statsMap = {};

  console.log(
    `📊 Fetching stats for ${npmPackages.length} npm packages and ${pypiPackages.length} PyPI packages...`
  );
  console.log(
    `⚙️  Using queue with concurrency=1 and 1000ms delay between requests\n`
  );

  // Process npm packages sequentially through the queue
  let completed = 0;
  for (const packageName of npmPackages) {
    try {
      console.log(
        `[${completed + 1}/${npmPackages.length}] Processing ${packageName}...`
      );

      // Fetch all stats for this package sequentially through the queue
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
        console.log(
          `✅ ${packageName}: day=${dayStats}, week=${weekStats}, year=${yearStats}, total=${totalStats}`
        );
      } else {
        console.log(`⚠️  ${packageName}: No downloads recorded`);
      }

      completed++;
    } catch (error) {
      console.error(
        `❌ Error fetching stats for ${packageName}:`,
        error.message
      );
      completed++;
    }
  }

  // Fetch stats for PyPI packages (parallel is ok, different API)
  console.log(`\n📊 Fetching PyPI stats...`);
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
            year: (stats.last_month || 0) * 12,
            total: totalDownloads || stats.last_month,
          };
          console.log(
            `✅ ${packageName} (PyPI): day=${stats.last_day}, week=${stats.last_week}, month=${stats.last_month}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error fetching stats for ${packageName} (PyPI):`,
          error.message
        );
      }
    })
  );

  console.log(
    `\n🎉 Completed! Retrieved stats for ${
      Object.keys(statsMap).length
    } packages.`
  );
  return Object.values(statsMap);
}

// Function to fetch PyPI download statistics for a given package
async function fetchPyPIDownloadStats(packageName) {
  console.log("Package name ", packageName);

  const url = `https://pypistats.org/api/packages/${packageName}/recent`;

  try {
    const data = await fetchWithRetry(url, 3, 1000);
    console.log("fetch data ", data);
    return data.data;
  } catch (error) {
    console.log(
      `Failed to fetch download stats for ${packageName} (PyPI): ${error.message}`
    );
    return null;
  }
}

// Function to fetch and process statistics for a package and period (npm)
async function getNpmStats(packageName, period) {
  try {
    const stats = await fetchDownloadStats(packageName, period);

    if (!stats || !stats.package) return 0;

    return calculateAverageDownloads(stats);
  } catch (error) {
    console.error(`${packageName} not available for period ${period}`);
    return 0;
  }
}

// Function to fetch download statistics for a given package and period
async function fetchDownloadStats(packageName, period) {
  const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;

  try {
    // Use queued fetch to ensure proper rate limiting
    const data = await queuedNpmFetch(url);
    return data;
  } catch (error) {
    console.log(
      `Failed to fetch download stats for ${packageName} (${period}): ${error.message}`
    );
    return null;
  }
}

// Function to calculate total downloads from the statistics
function calculateAverageDownloads(stats) {
  if (!stats.downloads || !Array.isArray(stats.downloads)) {
    return 0;
  }

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

    // Flatten the packages from all projects into a single list if needed
    const allPackages = projects.flatMap((project) =>
      project.packages.map((pkg) => ({
        name: pkg.package_name,
        title: pkg.package_name, // Or map to your desired title format
        type: pkg.package_type,
        url: pkg.package_url,
        projectTitle: project.title,
        status: pkg.status,
      }))
    );

    // Save to the assets folder
    writeJsonToFile("../src/app/projects/assets/packages.json", allPackages);

    const projectData = projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.short_description,
      isMonoRepo: project.is_mono_repo,
      repoUrl: project.github_repository_link,
      // We keep the packages nested inside the project
      packages: project.packages.map((pkg) => ({
        name: pkg.package_name,
        type: pkg.package_type,
        url: pkg.package_url,
        status: pkg.status,
      })),
    }));

    writeJsonToFile(
      "../src/app/projects/assets/projects_grouped.json",
      projectData
    );

    console.log("Successfully updated packages.json");
  } catch (error) {
    console.error("Failed to update packages:", error);
  }
}

updatePackages();
