import { gitBaseUrl, gitOwner, githubToken } from "./config.mjs";
import { fetchData } from "./config.mjs";
import fs from "fs";
import axios from "axios";
import logger from "../src/app/utils/logger.mjs";

const PROJECTS_PATH = "./src/asset/projects.json";
const MAPPING_PATH = "./src/asset/contributor-mapping.json";
const TOKEN = process.env.GITHUB_TOKEN;

async function fetchDefaultBranch(owner, repo, token) {
  const repoDetails = await fetchData(`${gitBaseUrl}/${owner}/${repo}`, {
    headers: { Authorization: `token ${token}` },
  });
  return repoDetails.default_branch;
}

async function fetchPullRequestCount(owner, repo, author, token) {
  const defaultBranch = await fetchDefaultBranch(owner, repo, token);
  let page = 1;
  const perPage = 100;
  let total = 0;
  let more = true;

  while (more) {
    const url = `${gitBaseUrl}/${owner}/${repo}/pulls?state=closed&per_page=${perPage}&page=${page}`;
    const pullRequests = await fetchData(url, {
      headers: { Authorization: `token ${token}` },
    });

    for (const pr of pullRequests) {
      if (pr.user?.login === author && pr.base?.ref === defaultBranch) {
        const prDetailUrl = `${gitBaseUrl}/${owner}/${repo}/pulls/${pr.number}`;
        const prDetails = await fetchData(prDetailUrl, {
          headers: { Authorization: `token ${token}` },
        });
        if (prDetails.merged_at) total++;
      }
    }

    more = pullRequests.length === perPage;
    page++;
  }
  return total;
}

async function fetchAllIssueAuthors(owner, repo, token) {
  let page = 1;
  const perPage = 100;
  const authors = new Map();
  let more = true;

  while (more) {
    const url = `${gitBaseUrl}/${owner}/${repo}/issues?state=all&per_page=${perPage}&page=${page}`;
    const issues = await fetchData(url, {
      headers: { Authorization: `token ${token}` },
    });
    for (const issue of issues) {
      if (issue.pull_request || !issue.user?.login) continue;
      const login = issue.user.login;
      const existing = authors.get(login);
      if (existing) {
        existing.issueCount++;
      } else {
        authors.set(login, {
          login,
          avatar_url: issue.user.avatar_url,
          html_url: issue.user.html_url,
          id: issue.user.id,
          type: issue.user.type,
          issueCount: 1,
        });
      }
    }
    more = issues.length === perPage;
    page++;
  }
  return authors;
}

async function fetchAllCommits(owner, repo, branch = undefined, token) {
  let page = 1;
  let perPage = 100;
  const commits = [];
  let more = true;

  while (more) {
    const url = `${gitBaseUrl}/${owner}/${repo}/commits${
      branch ? `?sha=${branch}` : "?"
    }&per_page=${perPage}&page=${page}`;
    try {
      const pageCommits = await fetchData(url, {
        headers: { Authorization: `token ${token}` },
      });
      if (Array.isArray(pageCommits) && pageCommits.length > 0) {
        commits.push(...pageCommits);
        page++;
      } else {
        more = false;
      }
    } catch (err) {
      if (err.message.includes("404") || err.message.includes("403")) {
        logger.warn(
          `Repository ${owner}/${repo} is private or not found. Skipping.`
        );
        return [];
      }
      throw err;
    }
  }
  return commits;
}

async function getLastContributionDate(username) {
  if (!username) return null;
  try {
    let allEvents = [];
    let page = 1;
    let hasMoreEvents = true;

    while (hasMoreEvents && page <= 5) {
      const url = `https://api.github.com/users/${username}/events?per_page=100&page=${page}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${githubToken}` },
      });

      if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        logger.error(
          `Full Error for ${url}: ${JSON.stringify(errorDetails, null, 2)}`
        );
        throw new Error(
          `HTTP ${response.status}: ${errorDetails.message || "Unknown Error"}`
        );
      }

      const events = await response.json();
      if (events.length === 0) {
        hasMoreEvents = false;
      } else {
        allEvents = [...allEvents, ...events];
        page++;
      }
    }

    const orgEvents = allEvents.filter(
      (event) => event.org?.login === gitOwner
    );

    if (orgEvents.length > 0) {
      orgEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const lastEvent = orgEvents[0];
      const lastActiveDate = new Date(lastEvent.created_at);
      const lastActiveDateStr = lastActiveDate.toISOString().split("T")[0];
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      if (lastActiveDateStr === todayStr) return 0;
      const date1 = new Date(lastActiveDateStr);
      const date2 = new Date(todayStr);
      const timeDiff = date2.getTime() - date1.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      return daysDiff;
    }
    return null;
  } catch (error) {
    logger.error(`Error fetching events for ${username}: ${error}`);
    return null;
  }
}

async function fetchContributorsFromRepo(owner, repo, token) {
  const contributors = new Set();
  let page = 1;
  const perPage = 100;
  let more = true;

  if (owner === gitOwner) return contributors;

  while (more) {
    const url = `${gitBaseUrl}/${owner}/${repo}/contributors?per_page=${perPage}&page=${page}`;
    let pageContributors;
    try {
      pageContributors = await fetchData(url, {
        headers: { Authorization: `token ${token}` },
      });
    } catch (error) {
      logger.error(
        `Error fetching contributors for ${owner}/${repo}: ${error.message}`
      );
      break;
    }
    if (Array.isArray(pageContributors) && pageContributors.length > 0) {
      for (const contributor of pageContributors) {
        if (contributor?.login) contributors.add(contributor.login);
      }
      page++;
    } else {
      more = false;
    }
  }
  return contributors;
}

async function fetchContributorsFromBranchExcludingParent(
  owner,
  repo,
  branch,
  token
) {
  const repoData = await fetchData(`${gitBaseUrl}/${owner}/${repo}`, {
    headers: { Authorization: `token ${token}` },
  });
  let parentContributors = new Set();

  if (repoData.fork && repoData.parent) {
    const parentFullName = repoData.parent.full_name;
    const [parentOwner, parentRepo] = parentFullName.split("/");
    parentContributors = await fetchContributorsFromRepo(
      parentOwner,
      parentRepo,
      token
    );
  }

  const commits = await fetchAllCommits(owner, repo, branch, token);
  const contributors = {};

  for (const commit of commits) {
    const author = commit?.author;
    const login = author?.login;
    if (login && parentContributors.has(login)) continue;
    if (login) {
      if (!contributors[login]) {
        contributors[login] = {
          login,
          avatar_url: author?.avatar_url,
          contributions: 0,
          html_url: author?.html_url,
          id: author?.id,
        };
      }
      contributors[login].contributions++;
    }
  }
  return Object.values(contributors);
}

export async function getCollaboratorsWithDefault(owner, repo, token) {
  const defaultBranch = await fetchDefaultBranch(owner, repo, token);
  const defaultBranchContributors =
    await fetchContributorsFromBranchExcludingParent(
      owner,
      repo,
      defaultBranch,
      token
    );

  // Issue authors are tracked even when they have no commits/PRs, so raising
  // an issue counts as a contribution on its own.
  const issueAuthors = await fetchAllIssueAuthors(owner, repo, token);

  const codeContributors = await Promise.all(
    defaultBranchContributors.map(async (collab) => {
      const pullRequestCount = await fetchPullRequestCount(
        owner,
        repo,
        collab.login,
        token
      );
      const issueAuthor = issueAuthors.get(collab.login);
      issueAuthors.delete(collab.login);
      return {
        ...collab,
        pullRequestCount,
        issueCount: issueAuthor?.issueCount ?? 0,
      };
    })
  );

  const issueOnlyContributors = Array.from(issueAuthors.values()).map(
    (author) => ({
      login: author.login,
      avatar_url: author.avatar_url,
      html_url: author.html_url,
      id: author.id,
      type: author.type,
      contributions: 0,
      pullRequestCount: 0,
      issueCount: author.issueCount,
    })
  );

  return [...codeContributors, ...issueOnlyContributors];
}

export async function getContributorData(contributor) {
  const lastActiveDays = await getLastContributionDate(contributor.login);
  return { ...contributor, lastActiveDays };
}

async function generateMapping() {
  const currentProjects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf8"));
  const UPCOMING_PROJECTS_PATH = "./src/asset/upcomingProjects.json";
  let upcomingProjects = [];
  try {
    upcomingProjects = JSON.parse(
      fs.readFileSync(UPCOMING_PROJECTS_PATH, "utf8")
    );
    logger.info(`Loaded ${upcomingProjects.length} upcoming projects`);
  } catch (e) {
    logger.warn(
      "Could not load upcomingProjects.json, skipping upcoming projects"
    );
  }

  const allProjects = [...currentProjects, ...upcomingProjects];
  const mapping = {};

  logger.info(
    `Generating contributor-to-project mapping for ${allProjects.length} total projects (${currentProjects.length} current + ${upcomingProjects.length} upcoming)...`
  );

  for (const project of allProjects) {
    const repoUrl = project.githubUrl || project.github_repository_link || "";
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) continue;

    const [, owner, repo] = match;
    try {
      const [res, issueAuthors] = await Promise.all([
        axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contributors`,
          { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
        ),
        fetchAllIssueAuthors(owner, repo, TOKEN),
      ]);

      const logins = new Set(res.data.map((contributor) => contributor.login));
      issueAuthors.forEach((_, login) => logins.add(login));

      logins.forEach((login) => {
        if (!mapping[login]) mapping[login] = [];
        if (!mapping[login].includes(project.id)) {
          mapping[login].push(project.id);
        }
      });
      logger.info(
        `Synced: ${project.title} (${project.project_type || "upcoming"})`
      );
    } catch (e) {
      logger.error(
        `Failed: ${project.title} — ${e.response?.status || e.message}`
      );
    }
  }

  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  logger.info("Mapping saved to contributor-mapping.json");
}

generateMapping();
