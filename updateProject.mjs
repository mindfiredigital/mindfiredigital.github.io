/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchTotalDownloads } from "./pypiTotalStats.mjs";

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
  try {
    const data = await fetchData(url, options);
    // New: Check if the response is an array (valid collaborators data)
    if (Array.isArray(data)) {
      return data;
    } else {
      console.log(`No collaborators found or invalid response for URL: ${url}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching collaborators from ${url}:`, error.message);
    return [];
  }
}

// Function to get collaborators of a repository
async function getCollaborators(repoData, githubToken) {
  // Check if contributors_url exists
  if (!repoData.contributors_url) {
    console.log(`No contributors URL found for repository: ${repoData.name}`);
    return [];
  }

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

// Function to get repository data including topics
async function getRepoData(owner, repo) {
  if (!owner || !repo) return null;
  try {
    const [repoResponse, topicsResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.mercy-preview+json",
        },
      }),
    ]);

    if (!repoResponse.ok || !topicsResponse.ok) {
      console.error(`Failed to fetch data for ${owner}/${repo}`);
      return null;
    }

    const repoData = await repoResponse.json();
    const topicsData = await topicsResponse.json();

    return {
      ...repoData,
      topics: topicsData.names || [],
    };
  } catch (error) {
    console.error(`Error fetching repo data for ${owner}/${repo}:`, error);
    return null;
  }
}

// Function to get the last contribution date for a user in the organization
async function getLastContributionDate(username) {
  if (!username) return null;
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/events/public`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch events for ${username}`);
      return null;
    }

    const events = await response.json();
    const orgEvents = events.filter(
      (event) => event.org?.login === "mindfiredigital"
    );

    if (orgEvents.length > 0) {
      const lastEvent = orgEvents[0];
      const lastActiveDate = new Date(lastEvent.created_at);
      const now = new Date();
      const diffTime = Math.abs(now - lastActiveDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching events for ${username}:`, error);
    return null;
  }
}

// Function to get contributor data including last active days
async function getContributorData(contributor) {
  const lastActiveDays = await getLastContributionDate(contributor.login);
  return {
    ...contributor,
    lastActiveDays,
  };
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
            foss_projects(filter: { _and: [
              { project_type: { _eq: "current" }},
              { status: { _eq: "published" }}
            ]}) {
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
    const currentProjects = await Promise.all(
      currentProjectsData.data.foss_projects.map(async (entry) => {
        const repoUrl = entry.github_repository_link;
        const [owner, repo] =
          repoUrl && repoUrl !== "NA"
            ? repoUrl.replace("https://github.com/", "").split("/")
            : [null, null];

        const repoData = await getRepoData(owner, repo);

        return {
          ...entry,
          id: parseInt(entry.id),
          shortDescription: entry.short_description,
          githubUrl: entry.github_repository_link,
          documentationUrl: entry.documentation_link,
          stars: repoData ? repoData.stargazers_count : 0,
          tags: repoData ? repoData.topics.slice(0, 5) : [],
        };
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
      try {
        const repoData = await getRepoData("mindfiredigital", repoName);
        const contributors = await getCollaborators(repoData, githubToken);
        if (contributors.length > 0) {
          // Get last active days for each contributor
          const contributorsWithActivity = await Promise.all(
            contributors.map(getContributorData)
          );
          contributorsObject[repoName] = contributorsWithActivity;
        }
      } catch (error) {
        console.error(`Error processing contributors for ${repoName}:`, error);
      }
    }

    // Write contributors data to file
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/contributors.json"),
      JSON.stringify(contributorsObject, null, 2)
    );

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
            lastActiveDays: contributor.lastActiveDays,
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
    const npmPackages = [
      { name: "fmdapi-node-weaver", title: "FMDAPI Node Weaver" },
      { name: "react-canvas-editor", title: "Canvas Editor (React)" },
      { name: "angular-canvas-editor", title: "Canvas Editor (Angular)" },
      { name: "canvas-editor", title: "Canvas Editor" },
      { name: "react-text-igniter", title: "Text Igniter (React)" },
      { name: "eslint-plugin-hub", title: "ESLint Plugin Hub" },
      { name: "textigniterjs", title: "Text Igniter JS" },
      { name: "pivothead", title: "Pivot Head" },
      { name: "page-builder", title: "Page Builder" },
      { name: "page-builder-react", title: "Page Builder (React)" },
      {
        name: "page-builder-web-component",
        title: "Page Builder (Web Component)",
      },
    ];
    const pypiPackages = [
      { name: "neo-pusher", title: "Neo Pusher" },
      { name: "sqlrag", title: "SQL RAG" },
    ];
    getAllStats(
      npmPackages.map((p) => p.name),
      pypiPackages.map((p) => p.name)
    )
      .then((statsMap) => {
        // Add titles to the stats array
        const statsWithTitles = Object.values(statsMap)
          .map((value) => {
            const npmPackage = npmPackages.find((p) => p.name === value.name);
            const pypiPackage = pypiPackages.find((p) => p.name === value.name);
            const title = npmPackage?.title || pypiPackage?.title || value.name;
            return { ...value, title };
          })
          .sort((a, b) => b.total - a.total);

        fs.writeFileSync(
          path.join(__dirname, "src/app/projects/assets/stats.json"),
          JSON.stringify(statsWithTitles, null, 2)
        );

        console.log("Stats list updated successfully.");
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

// Function to fetch PyPI download statistics for a given package
async function fetchPyPIDownloadStats(packageName) {
  const url = `https://pypistats.org/api/packages/${packageName}/recent`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log(
      `Failed to fetch download stats for ${packageName} (PyPI): ${response.statusText}`
    );
    return null;
  }

  const data = await response.json();
  return data.data; // { last_day, last_week, last_month }
}

// Function to calculate average downloads from the statistics
function calculateAverageDownloads(stats) {
  return stats.downloads.reduce(
    (accumulator, download) => accumulator + download.downloads,
    0
  );
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

// Function to fetch and aggregate statistics for all npm and PyPI packages
async function getAllStats(npmPackages, pypiPackages) {
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

// Call the main function
updateProjects();
