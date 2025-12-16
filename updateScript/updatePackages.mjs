import { fetchTotalDownloads } from "../pypiTotalStats.mjs";
import { fetchData } from "./config.mjs";

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch with retry logic for rate limiting
async function fetchWithRetry(url, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await fetchData(url);
      return data;
    } catch (error) {
      // Check if it's a rate limit error (typically 429 status)
      const isRateLimit = error.message?.includes('429') || 
                          error.message?.toLowerCase().includes('rate limit') ||
                          error.status === 429;
      
      if (isRateLimit && attempt < maxRetries - 1) {
        // Exponential backoff: wait longer with each retry
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await delay(waitTime);
        continue;
      }
      
      throw error;
    }
  }
}

// Function to fetch and aggregate statistics for all npm and PyPI packages
export async function getAllStats(npmPackages, pypiPackages) {
  const statsMap = {};
  
  // Process npm packages sequentially to avoid rate limiting
  for (const packageName of npmPackages) {
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
      
      // Add a small delay between packages to avoid rate limiting
      await delay(1000);
    } catch (error) {
      console.error(`Error fetching stats for ${packageName}:`, error);
    }
  }
  
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
    const data = await fetchWithRetry(url);
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
    const data = await fetchWithRetry(url);
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
