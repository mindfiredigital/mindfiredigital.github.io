import { gitBaseUrl, gitOwner, githubToken } from "./config.mjs";
import { fetchData } from "./config.mjs";
import fs from "fs";
import path from "path";
import axios from "axios";

const PROJECTS_PATH = "./src/app/projects/assets/projects.json";
const MAPPING_PATH = "./src/app/projects/assets/contributor-mapping.json";
const TOKEN = process.env.GITHUB_TOKEN; // Use GITHUB_TOKEN from env (set in CI or .env.local)

async function fetchDefaultBranch(owner, repo, token) {
  const repoDetails = await fetchData(`${gitBaseUrl}/${owner}/${repo}`, {
    headers: { Authorization: `token ${token}` },
  });

  return repoDetails.default_branch; // e.g. "main"
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
        // Fetch full PR details to check if it was merged
        const prDetailUrl = `${gitBaseUrl}/${owner}/${repo}/pulls/${pr.number}`;
        const prDetails = await fetchData(prDetailUrl, {
          headers: { Authorization: `token ${token}` },
        });

        if (prDetails.merged_at) {
          total++;
        }
      }
    }

    more = pullRequests.length === perPage;
    page++;
  }

  return total;
}

async function fetchIssueCount(owner, repo, author, token) {
  let page = 1;
  let perPage = 100;
  let total = 0;
  let more = true;

  while (more) {
    const url = `${gitBaseUrl}/${owner}/${repo}/issues?state=all&per_page=${perPage}&page=${page}`;
    const issues = await fetchData(url, {
      headers: { Authorization: `token ${token}` },
    });

    total += issues.filter(
      (issue) => !issue.pull_request && issue.user?.login === author
    ).length;

    more = issues.length === perPage;
    page++;
  }

  return total;
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
        console.log(
          `Repository ${owner}/${repo} is private or not found. Skipping.`
        );
        return [];
      }
      throw err; // Re-throw for other errors
    }
  }

  return commits;
}

// Function to get the last contribution date for a user in the organization
async function getLastContributionDate(username) {
  if (!username) return null;
  try {
    // Fetch all available events with pagination to ensure we get the most recent
    let allEvents = [];
    let page = 1;
    let hasMoreEvents = true;

    while (hasMoreEvents && page <= 5) {
      const url = `https://api.github.com/users/${username}/events?per_page=100&page=${page}`;
      // Check up to 5 pages of events
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        console.error(
          `Full Error for ${url}:`,
          JSON.stringify(errorDetails, null, 2)
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

    // Filter for events specific to your organization
    const orgEvents = allEvents.filter(
      (event) => event.org?.login === gitOwner
    );

    if (orgEvents.length > 0) {
      // Sort events by date to ensure we get the most recent one
      orgEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const lastEvent = orgEvents[0];

      // Get date strings in YYYY-MM-DD format for precise day calculation
      const lastActiveDate = new Date(lastEvent.created_at);
      const lastActiveDateStr = lastActiveDate.toISOString().split("T")[0];

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      // If the activity was today, return 0 days
      if (lastActiveDateStr === todayStr) {
        return 0;
      }

      // Calculate exact days between dates
      const date1 = new Date(lastActiveDateStr);
      const date2 = new Date(todayStr);
      const timeDiff = date2.getTime() - date1.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      return daysDiff;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching events for ${username}:`, error);
    return null;
  }
}

async function fetchContributorsFromRepo(owner, repo, token) {
  const contributors = new Set();
  let page = 1;
  const perPage = 100;
  let more = true;

  if (owner === gitOwner) {
    return contributors;
  }

  while (more) {
    const url = `${gitBaseUrl}/${owner}/${repo}/contributors?per_page=${perPage}&page=${page}`;

    let pageContributors;
    try {
      pageContributors = await fetchData(url, {
        headers: { Authorization: `token ${token}` },
      });
    } catch (error) {
      console.error(
        `Error fetching contributors for ${owner}/${repo}:`,
        error.message
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
  // first check if this is a fork
  const repoData = await fetchData(`${gitBaseUrl}/${owner}/${repo}`, {
    headers: { Authorization: `token ${token}` },
  });

  let parentContributors = new Set();

  if (repoData.fork && repoData.parent) {
    // fetch contributors directly from parent
    const parentFullName = repoData.parent.full_name;
    const [parentOwner, parentRepo] = parentFullName.split("/");

    parentContributors = await fetchContributorsFromRepo(
      parentOwner,
      parentRepo,
      token
    );
  }

  // now fetch this branch's commits ignoring parent contributors
  const commits = await fetchAllCommits(owner, repo, branch, token);
  const contributors = {};

  for (const commit of commits) {
    const author = commit?.author;
    const login = author?.login;

    // Skip if this contributor already existed in parent
    if (login && parentContributors.has(login)) {
      continue;
    }
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

  // augment with pull and issue count

  return Promise.all(
    defaultBranchContributors.map(async (collab) => {
      const pullRequestCount = await fetchPullRequestCount(
        owner,
        repo,
        collab.login,
        token
      );
      const issueCount = await fetchIssueCount(
        owner,
        repo,
        collab.login,
        token
      );
      return {
        ...collab,
        pullRequestCount,
        issueCount,
      };
    })
  );
}

// Function to get contributor data including last active days
export async function getContributorData(contributor) {
  const lastActiveDays = await getLastContributionDate(contributor.login);
  return {
    ...contributor,
    lastActiveDays,
  };
}

async function generateMapping() {
  const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf8"));
  const mapping = {};

  console.log("🚀 Generating contributor-to-project mapping...");

  for (const project of projects) {
    // Extract owner and repo from githubUrl
    const match = project.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      const [, owner, repo] = match;
      try {
        const res = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contributors`,
          { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
        );

        res.data.forEach((contributor) => {
          if (!mapping[contributor.login]) mapping[contributor.login] = [];
          mapping[contributor.login].push(project.id);
        });
        console.log(`✅ Synced: ${project.title}`);
      } catch (e) {
        console.error(
          `❌ Failed: ${project.title} (Rate limit or invalid URL)`
        );
      }
    }
  }

  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log("✨ Mapping saved to contributor-mapping.json");
}

generateMapping();
