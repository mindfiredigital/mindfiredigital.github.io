/* eslint-disable no-undef */
import { getAllStats } from "./updatePackages.mjs";
import {
  getContributorData,
  getCollaboratorsWithDefault,
} from "./updateContributors.mjs";
import { gitBaseUrl, gitOwner, githubToken, pathForJson } from "./config.mjs";
import {
  writeJsonToFile,
  fetchData,
  npmPackages,
  pypiPackages,
} from "./config.mjs";
import logger from "../src/app/utils/logger.mjs";

async function getRepoData(owner, repo) {
  if (!owner || !repo) return null;
  try {
    const [repoResponse, topicsResponse] = await Promise.all([
      fetch(`${gitBaseUrl}/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${githubToken}` },
      }),
      fetch(`${gitBaseUrl}/${owner}/${repo}/topics`, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.mercy-preview+json",
        },
      }),
    ]);

    if (!repoResponse.ok || !topicsResponse.ok) {
      logger.error(`Failed to fetch data for ${owner}/${repo}`);
      return null;
    }

    const repoData = await repoResponse.json();
    const topicsData = await topicsResponse.json();
    return { ...repoData, topics: topicsData.names || [] };
  } catch (error) {
    logger.error(`Error fetching repo data for ${owner}/${repo}: ${error}`);
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
      logger.error(
        `Error fetching repositories for ${username}: ${error.message}`
      );
      break;
    }
    if (!Array.isArray(data) || data.length === 0) break;
    allRepos = allRepos.concat(data);
    page++;
  }
  return allRepos;
}

async function updateProjects() {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

    const [currentProjectsData, upcomingProjectsData, repositories] =
      await Promise.all([
        fetchData("https://directus.ourgoalplan.co.in/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query getCurrentProjects { foss_projects(filter: { _and: [{ project_type: { _eq: "current" }},{ status: { _eq: "published" }}]}) { id, title, short_description, github_repository_link, documentation_link, project_type, date_created, date_updated, status } }`,
          }),
        }),
        fetchData("https://directus.ourgoalplan.co.in/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query getUpcomingProjects { foss_projects(filter: {project_type: { _eq: "upcoming" }}) { id, title, short_description, github_repository_link, documentation_link, project_type, date_created, date_updated, status } }`,
          }),
        }),
        await fetchAllGithubRepos(gitOwner, githubToken),
      ]);

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
          lastPushedAt: repoData ? repoData.pushed_at : entry.date_created,
        };
      })
    );
    writeJsonToFile(`${pathForJson}/projects.json`, currentProjects);
    logger.info("Current projects updated successfully.");

    const upcomingProjects = await Promise.all(
      upcomingProjectsData.data.foss_projects.map(async (entry) => {
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
          lastPushedAt: repoData ? repoData.pushed_at : entry.date_created,
        };
      })
    );
    writeJsonToFile(`${pathForJson}/upcomingProjects.json`, upcomingProjects);
    logger.info("Upcoming projects updated successfully.");

    const repoNames = repositories.map((repo) => repo.name);
    const contributorsObject = {};

    for (const repoName of repoNames) {
      try {
        const contributorsWithBot = await getCollaboratorsWithDefault(
          gitOwner,
          repoName,
          githubToken
        );
        const contributors = contributorsWithBot.filter(
          (contributor) =>
            contributor.type !== "Bot" &&
            !contributor.login.startsWith("github-actions")
        );
        if (contributors.length > 0) {
          const contributorsWithActivity = await Promise.all(
            contributors.map(getContributorData)
          );
          contributorsObject[repoName] = contributorsWithActivity;
        }
      } catch (error) {
        logger.error(`Error processing contributors for ${repoName}: ${error}`);
      }
    }
    writeJsonToFile(`${pathForJson}/contributors.json`, contributorsObject);

    const contributionsMap = {};
    for (const repo in contributorsObject) {
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
          const existing = contributionsMap[login];
          contributionsMap[login] = {
            id,
            contributions: (existing?.contributions || 0) + contributions,
            html_url,
            avatar_url,
            login,
            lastActiveDays:
              existing?.lastActiveDays !== undefined &&
              existing?.lastActiveDays !== null &&
              contributor.lastActiveDays !== null
                ? Math.min(existing.lastActiveDays, contributor.lastActiveDays)
                : contributor.lastActiveDays ??
                  existing?.lastActiveDays ??
                  null,
            pullRequestCount:
              (existing?.pullRequestCount || 0) + pullRequestCount,
            issueCount: (existing?.issueCount || 0) + issueCount,
          };
        });
      }
    }

    const sortedContributions = Object.values(contributionsMap).sort(
      (a, b) => b.contributions - a.contributions
    );
    writeJsonToFile(`${pathForJson}/contributors.json`, sortedContributions);
    logger.info(
      `Contributors list updated successfully. Total: ${sortedContributions.length}`
    );

    getAllStats(
      npmPackages.map((p) => p.name),
      pypiPackages.map((p) => p.name)
    )
      .then((statsMap) => {
        const statsWithTitles = Object.values(statsMap)
          .map((value) => {
            const npmPackage = npmPackages.find((p) => p.name === value.name);
            const pypiPackage = pypiPackages.find((p) => p.name === value.name);
            const title = npmPackage?.title || pypiPackage?.title || value.name;
            return { ...value, title };
          })
          .sort((a, b) => b.total - a.total);
        writeJsonToFile(`${pathForJson}/stats.json`, statsWithTitles);
        logger.info("Stats list updated successfully.");
      })
      .catch((error) => {
        logger.error(`Error fetching stats: ${error}`);
      });
  } catch (error) {
    logger.error(`An error occurred: ${error}`);
  }
}

updateProjects().catch((e) => {
  logger.warn(`updateProjects failed, continuing: ${e.message}`);
  process.exit(0);
});
