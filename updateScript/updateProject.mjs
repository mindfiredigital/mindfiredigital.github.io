/* eslint-disable no-undef */
import { getAllStats } from "./updatePackages.mjs";
import {
  getContributorData,
  getCollaboratorsWithDefaultAndDev,
} from "./updateContributors.mjs";
import { gitBaseUrl, gitOwner, githubToken, pathForJson } from "./config.mjs";
import {
  writeJsonToFile,
  fetchData,
  npmPackages,
  pypiPackages,
} from "./config.mjs";

// Function to get repository data including topics
async function getRepoData(owner, repo) {
  if (!owner || !repo) return null;
  try {
    const [repoResponse, topicsResponse] = await Promise.all([
      fetch(`${gitBaseUrl}/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }),
      fetch(`${gitBaseUrl}/${owner}/${repo}/topics`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
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

async function fetchAllGithubRepos(username, token) {
  let page = 1;
  const perPage = 100;
  let allRepos = [];

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
    let data;

    try {
      data = await fetchData(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
    } catch (error) {
      console.error(
        `Error fetching repositories for ${username}:`,
        error.message
      );
      break;
    }

    if (!Array.isArray(data) || data.length === 0) break;

    allRepos = allRepos.concat(data);
    page++;
  }

  return allRepos;
}

// Main function to update projects data
async function updateProjects() {
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
        await fetchAllGithubRepos(gitOwner, githubToken),
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
    writeJsonToFile(`${pathForJson}/projects.json`, currentProjects);
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
    writeJsonToFile(`${pathForJson}/upcomingProjects.json`, upcomingProjects);
    console.log("Upcoming projects updated successfully.");

    // Fetch and process contributors data for repositories
    const repoNames = repositories.map((repo) => repo.name);
    const contributorsObject = {};
    for (const repoName of repoNames) {
      try {
        const contributorsWithBot = await getCollaboratorsWithDefaultAndDev(
          gitOwner, // owner
          repoName, // repository name
          githubToken
        );
        const contributors = contributorsWithBot.filter(
          (contributor) =>
            contributor.type !== "Bot" &&
            !contributor.login.startsWith("github-actions")
        );

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
    writeJsonToFile(`${pathForJson}/contributors.json`, contributorsObject);
    // Aggregate contributor from contributors
    const contributionsMap = {};

    for (const repo in contributorsObject) {
      // eslint-disable-next-line no-prototype-builtins
      if (contributorsObject.hasOwnProperty(repo)) {
        contributorsObject[repo].forEach((contributor) => {
          const {
            login,
            contributions,
            id,
            avatar_url,
            html_url,
            pullRequestCount,
            issueCount,
          } = contributor;
          // Update contributions map
          contributionsMap[login] = {
            id,
            contributions:
              (contributionsMap[login]?.contributions || 0) + contributions,
            html_url,
            avatar_url,
            login,
            lastActiveDays: contributor.lastActiveDays,
            pullRequestCount:
              (contributionsMap[login]?.pullRequestCount || 0) +
              pullRequestCount,
            issueCount: (contributionsMap[login]?.issueCount || 0) + issueCount,
          };
        });
      }
    }

    // Sort contributions and write data to file
    const sortedContributions = Object.values(contributionsMap).sort(
      (a, b) => b.contributions - a.contributions
    );
    writeJsonToFile(`${pathForJson}/contributors.json`, sortedContributions);
    console.log("Contributors list updated successfully.");

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

        writeJsonToFile(`${pathForJson}/stats.json`, statsWithTitles);

        console.log("Stats list updated successfully.");
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Call the main function
updateProjects();
