import {
  githubToken,
  gitOwner,
  pathForJson,
  writeJsonToFile,
  fetchData,
} from "./config.mjs";
import logger from "../src/app/utils/logger.mjs";

const PER_PAGE = 100;

function buildHeaders(token) {
  return {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function trimIssue(issue, repoName) {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    html_url: issue.html_url,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    state: issue.state,
    comments: issue.comments,
    repository_url:
      issue.repository_url ??
      `https://api.github.com/repos/${gitOwner}/${repoName}`,
    repoName,
    labels: (issue.labels ?? []).map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      description: l.description ?? null,
    })),
    user: {
      login: issue.user.login,
      avatar_url: issue.user.avatar_url,
      html_url: issue.user.html_url,
    },
  };
}

async function fetchAllRepos(org, headers) {
  let page = 1;
  const repos = [];
  while (true) {
    const url = `https://api.github.com/orgs/${org}/repos?type=public&per_page=${PER_PAGE}&page=${page}`;
    let data;
    try {
      data = await fetchData(url, { headers });
    } catch (err) {
      logger.error(`Failed to fetch repos page ${page}: ${err.message}`);
      break;
    }
    if (!Array.isArray(data) || data.length === 0) break;
    repos.push(...data.map((r) => r.name));
    if (data.length < PER_PAGE) break;
    page++;
  }
  return repos;
}

async function fetchRepoIssues(org, repo, headers) {
  let page = 1;
  const issues = [];
  while (true) {
    const url = `https://api.github.com/repos/${org}/${repo}/issues?state=open&per_page=${PER_PAGE}&page=${page}`;
    let data;
    try {
      data = await fetchData(url, { headers });
    } catch (err) {
      logger.warn(`  Skipping ${repo} page ${page}: ${err.message}`);
      break;
    }
    if (!Array.isArray(data) || data.length === 0) break;

    // GitHub Issues API returns PRs too — exclude them
    const onlyIssues = data.filter((item) => !item.pull_request);
    issues.push(...onlyIssues.map((issue) => trimIssue(issue, repo)));

    if (data.length < PER_PAGE) break;
    page++;

    await new Promise((r) => setTimeout(r, githubToken ? 80 : 1200));
  }
  return issues;
}

async function updateIssues() {
  if (!githubToken) {
    logger.warn(
      "No GITHUB_TOKEN — unauthenticated requests are capped at 60/hour. Set GITHUB_TOKEN for full access."
    );
  }

  const headers = buildHeaders(githubToken);

  logger.info(`Fetching all public repos for org: ${gitOwner}`);
  const repos = await fetchAllRepos(gitOwner, headers);
  logger.info(`Found ${repos.length} repositories. Fetching open issues...`);

  const allIssues = [];

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    process.stdout.write(
      `  [${i + 1}/${repos.length}] ${repo} ... `
    );
    const issues = await fetchRepoIssues(gitOwner, repo, headers);
    process.stdout.write(`${issues.length} issues\n`);
    allIssues.push(...issues);

    if (i < repos.length - 1) {
      await new Promise((r) => setTimeout(r, githubToken ? 80 : 1200));
    }
  }

  // Sort newest first (consistent default for the UI)
  allIssues.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const output = {
    total_count: allIssues.length,
    fetched_count: allIssues.length,
    fetched_at: new Date().toISOString(),
    issues: allIssues,
  };

  writeJsonToFile(`${pathForJson}/issues.json`, output);
  logger.info(
    `Done! Saved ${allIssues.length} open issues across ${repos.length} repos.`
  );
}

updateIssues().catch((e) => {
  logger.warn(`updateIssues failed: ${e.message}`);
  process.exit(0);
});
