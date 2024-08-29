/* eslint-disable no-undef */
// updateProjects.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fetch data from an API endpoint
async function fetchData(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }
  return await response.json();
}

// Function to fetch collaborators from GitHub
async function fetchCollaborators(url, githubToken) {
  const options = {
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  };
  return await fetchData(url, options);
}

// Function to get collaborators of a repository
async function getCollaborators(repoData, githubToken) {
  if (repoData.fork && repoData.parent?.contributors_url) {
    // If the repository is a fork and has a parent, fetch collaborators from both
    const [c1, c2] = await Promise.all([
      fetchCollaborators(repoData.contributors_url, githubToken),
      fetchCollaborators(repoData.parent.contributors_url, githubToken),
    ]);
    // Filter out collaborators from the repository who are also in the parent
    return c1.filter(
      (collab1) => !c2.some((collab2) => collab1.login === collab2.login)
    );
  }
  // Otherwise, fetch collaborators directly from the repository
  return fetchCollaborators(repoData.contributors_url, githubToken);
}

// Main function to update projects data
async function updateProjects() {
  const githubToken = process.env.GITHUB_TOKEN;

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    // Fetch data for current projects and upcoming projects
    const [currentProjectsData, upcomingProjectsData, repositories] =
      await Promise.all([
        // Fetch current projects data
        fetchData("https://directus.ourgoalplan.co.in/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query getCurrentProjects {
            foss_projects(filter: {project_type: { _eq: "current" }}) {
              id,
              title,
              short_description,
              github_repository_link,
              documentation_link,
              project_type,
              date_created,
              date_updated,
              status,
            }
          }`,
          }),
        }),
        // Fetch upcoming projects data
        fetchData("https://directus.ourgoalplan.co.in/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query getUpcomingProjects {
            foss_projects(filter: {project_type: { _eq: "upcoming" }}) {
              id,
              title,
              short_description,
              github_repository_link,
              documentation_link,
              project_type,
              date_created,
              date_updated,
              status,
            }
          }`,
          }),
        }),
        // Fetch repositories data from GitHub
        fetchData("https://api.github.com/users/mindfiredigital/repos", {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }),
      ]);

    // Process and write data for current projects
    const currentProjects = currentProjectsData.data.foss_projects.map(
      (entry) => ({
        ...entry,
        id: parseInt(entry.id),
        shortDescription: entry.short_description,
        githubUrl: entry.github_repository_link,
        documentationUrl: entry.documentation_link,
      })
    );
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/projects.json"),
      JSON.stringify(currentProjects, null, 2)
    );
    console.log("Current projects updated successfully.");

    // Process and write data for upcoming projects
    const upcomingProjects = upcomingProjectsData.data.foss_projects.map(
      (entry) => ({
        ...entry,
        id: parseInt(entry.id),
        shortDescription: entry.short_description,
        githubUrl: entry.github_repository_link,
        documentationUrl: entry.documentation_link,
      })
    );
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/upcomingProjects.json"),
      JSON.stringify(upcomingProjects, null, 2)
    );
    console.log("Upcoming projects updated successfully.");

    // Fetch and process contributors data for repositories
    const repoNames = repositories.map((repo) => repo.name);
    const contributorsObject = {};
    for (const repoName of repoNames) {
      const repoData = await fetchData(
        `https://api.github.com/repos/mindfiredigital/${repoName}`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      contributorsObject[repoName] = await getCollaborators(
        repoData,
        githubToken
      );
    }

    // Aggregate contributor from contributors
    const contributionsMap = {};

    for (const repo in contributorsObject) {
      // eslint-disable-next-line no-prototype-builtins
      if (contributorsObject.hasOwnProperty(repo)) {
        contributorsObject[repo].forEach((contributor) => {
          if (contributor.login === "github-actions[bot]") {
            // Skip processing GitHub Actions bot contributions
            return;
          }
          const { login, contributions, id, avatar_url, html_url } =
            contributor;
          // Update contributions map
          contributionsMap[login] = {
            id,
            contributions:
              (contributionsMap[login]?.contributions || 0) + contributions,
            html_url,
            avatar_url,
            login,
          };
        });
      }
    }

    // Sort contributions and write data to file
    const sortedContributions = Object.values(contributionsMap).sort(
      (a, b) => b.contributions - a.contributions
    );
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/contributors.json"),
      JSON.stringify(sortedContributions, null, 2)
    );
    console.log("Contributors list updated successfully.");

    getAllStats(repoNames)
      .then((statsMap) => {
        fs.writeFileSync(
          path.join(__dirname, "src/app/projects/assets/stats.json"),
          JSON.stringify(statsMap, null, 2)
        );

        console.log("Status list updated successfully.");
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Function to fetch download statistics for a given package and period
async function fetchDownloadStats(packageName, period) {
  const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log(
      `Failed to fetch download stats for ${packageName} (${period}): ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

// Function to fetch download statistics for a PyPI package
async function fetchPypiDownloadStats(packageName) {
  const url = `https://pypistats.org/api/packages/${packageName}/recent`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log(
      `Failed to fetch download stats for ${packageName}: ${response.statusText}`
    );
    return null;
  }

  const data = await response.json();
  return data.data;
}

// Function to fetch and process statistics for a PyPI package
async function getPypiStats(packageName) {
  try {
    const stats = await fetchPypiDownloadStats(packageName);
    if (!stats) return null;

    return {
      last_day: stats.last_day,
      last_week: stats.last_week,
      last_month: stats.last_month,
    };
  } catch (error) {
    console.error(`Error fetching PyPI stats for ${packageName}:`, error);
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

// Function to fetch and process statistics for a package and period
async function getStats(packageName, period) {
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

// Function to fetch and aggregate statistics for all packages and periods
async function getAllStats(npmPackages) {
  const statsMap = [];

  // Fetch stats for each package and period
  await Promise.all(
    npmPackages.map(async (packageData) => {
      try {
        let stats;
        if (packageData.type === "npm") {
          const [dayStats, weekStats, yearStats, totalStats] =
            await Promise.all([
              getStats(packageData.name, "last-day"),
              getStats(packageData.name, "last-week"),
              getStats(packageData.name, "last-year"),
              getStats(packageData.name, "1000-01-01:3000-01-01"),
            ]);

          stats = {
            name: packageData.name,
            type: "npm",
            day: dayStats,
            week: weekStats,
            year: yearStats,
            total: totalStats,
          };
        } else if (packageData.type === "pypi") {
          const pypiStats = await getPypiStats(packageData.name);
          stats = {
            name: packageData.name,
            type: "pypi",
            ...pypiStats,
          };
        }

        if (stats) {
          statsMap.push(stats);
        }
      } catch (error) {
        console.error(`Error fetching stats for ${packageData.name}:`, error);
      }
    })
  );

  return statsMap;
}

// Call the main function
updateProjects();
