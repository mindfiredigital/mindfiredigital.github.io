import { fetchTotalDownloads } from "../pypiTotalStats.mjs";
import { fetchData } from "./config.mjs";

// Function to fetch and aggregate statistics for all npm and PyPI packages
export async function getAllStats(npmPackages, pypiPackages) {
  const statsMap = {};

  // Fetch stats for npm packages
  await Promise.all(
    npmPackages.map(async (packageName) => {
      try {
        const [dayStats, weekStats, yearStats, totalStats] = await Promise.all([
          getNpmStats(packageName, "last-day"),
          getNpmStats(packageName, "last-week"),
          getNpmStats(packageName, "last-year"),
          getNpmStats(packageName, "1000-01-01:3000-01-01"),
        ]);

        if (dayStats !== 0 || weekStats !== 0 || yearStats !== 0) {
          statsMap[packageName] = {
            name: packageName,
            type: "npm",
            day: dayStats,
            week: weekStats,
            year: yearStats,
            total: totalStats,
          };
        }
      } catch (error) {
        console.error(`Error fetching stats for ${packageName}:`, error);
      }
    })
  );

  // Fetch stats for PyPI packages
  await Promise.all(
    pypiPackages.map(async (packageName) => {
      try {
        const stats = await fetchPyPIDownloadStats(packageName);
        const totalDownloads = await fetchTotalDownloads(packageName);

        if (stats) {
          statsMap[packageName] = {
            name: packageName,
            type: "pypi",
            last_day: stats.last_day,
            last_week: stats.last_week,
            last_month: stats.last_month,
            total: totalDownloads || stats.last_month,
          };
        }
      } catch (error) {
        console.error(`Error fetching stats for ${packageName} (PyPI):`, error);
      }
    })
  );

  return Object.values(statsMap);
}

// Function to fetch PyPI download statistics for a given package
async function fetchPyPIDownloadStats(packageName) {
  const url = `https://pypistats.org/api/packages/${packageName}/recent`;

  try {
    const data = await fetchData(url); // Already parsed JSON
    return data.data; // { last_day, last_week, last_month }
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
    // Fetch download statistics
    const stats = await fetchDownloadStats(packageName, period);

    // Check if stats exist
    if (!stats || !stats.package) return 0;

    // Calculate average downloads
    return calculateAverageDownloads(stats);
  } catch (error) {
    // Log and handle errors
    console.error(`${packageName} not present`);
    return null;
  }
}

// Function to fetch download statistics for a given package and period
async function fetchDownloadStats(packageName, period) {
  const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;

  try {
    const data = await fetchData(url); // Already parsed JSON
    return data;
  } catch (error) {
    console.log(
      `Failed to fetch download stats for ${packageName} (${period}): ${error.message}`
    );
    return null;
  }
}

// Function to calculate average downloads from the statistics
function calculateAverageDownloads(stats) {
  return stats.downloads.reduce(
    (accumulator, download) => accumulator + download.downloads,
    0
  );
}
