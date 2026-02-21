import https from "https";
import fs from "fs";
import path from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  OWNER: "mindfiredigital",

  CONTRIBUTORS_FILE: "./src/app/projects/assets/contributors.json",
  PROJECTS_FILE: "./src/app/projects/assets/projects.json",
  CONTRIBUTOR_MAPPING_FILE:
    "./src/app/projects/assets/contributor-mapping.json",
  CACHE_FILE: "./src/app/projects/assets/leaderboard-cache.json",

  SPECIAL_PROJECTS: [
    {
      id: "special-website",
      title: "Mindfire Foss Website",
      repoName: "mindfiredigital.github.io",
    },
  ],

  SKIP_BOTS: true,
  BOT_PATTERNS: [
    "github-actions",
    "dependabot",
    "renovate",
    "snyk-bot",
    "codecov",
    "greenkeeper",
    "[bot]",
  ],

  DELAY_MS: 100,
};

// ============================================================================
// HELPERS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchGitHub(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Authorization: `Bearer ${CONFIG.GITHUB_TOKEN}`,
        "User-Agent": "GitHub-Leaderboard-Fetcher",
        Accept: "application/vnd.github.v3+json",
      },
    };
    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(JSON.parse(data));
          }
        });
      })
      .on("error", reject);
  });
}

function isBot(username) {
  if (!username) return false;
  const lower = username.toLowerCase();
  return CONFIG.BOT_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

function readJsonFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error.message);
    return false;
  }
}

// ============================================================================
// FETCH DEFAULT BRANCH
// ============================================================================

async function fetchDefaultBranch(owner, repo) {
  try {
    await delay(CONFIG.DELAY_MS);
    const repoData = await fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}`
    );
    return repoData.default_branch;
  } catch (error) {
    console.error(`   ⚠️ Error fetching default branch: ${error.message}`);
    return "main";
  }
}

// ============================================================================
// FETCH ALL COMMITS FROM DEFAULT BRANCH ONLY
// Returns both the commits array AND the SHA set so we can reuse it for PR
// filtering without making a second API pass.
// ============================================================================

async function fetchAllCommitsFromDefaultBranch(owner, repo, defaultBranch) {
  console.log(
    `   🔍 Fetching ALL commits on ${defaultBranch} (default branch only)...`
  );
  let page = 1;
  const allCommits = [];
  let apiCalls = 0;

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${defaultBranch}&per_page=100&page=${page}`;
    try {
      await delay(CONFIG.DELAY_MS);
      const commits = await fetchGitHub(url);
      apiCalls++;

      if (!commits || commits.length === 0) break;

      // Only keep human commits — bots don't count toward anyone's score
      const humanCommits = commits.filter(
        (c) => !isBot(c.author?.login) && !isBot(c.commit?.author?.name)
      );
      allCommits.push(...humanCommits);

      if (commits.length < 100) break;
      page++;
    } catch (error) {
      console.error(
        `      ⚠️ Error fetching commits page ${page}: ${error.message}`
      );
      break;
    }
  }

  console.log(
    `   ✅ Found ${allCommits.length} commits on ${defaultBranch} (${apiCalls} API calls)`
  );
  return allCommits;
}

// ============================================================================
// ANALYZE PR COMPLEXITY
// ============================================================================

function analyzePRComplexity(pr) {
  const filesChanged = pr.changed_files || 0;
  const linesChanged = (pr.additions || 0) + (pr.deletions || 0);

  if (filesChanged >= 8 || linesChanged >= 500) {
    return { level: "large", multiplier: 1.7 };
  } else if (filesChanged >= 3 || linesChanged >= 100) {
    return { level: "medium", multiplier: 1.3 };
  } else {
    return { level: "small", multiplier: 1.0 };
  }
}

// ============================================================================
// FETCH ALL MERGED PRS THAT LANDED ON DEFAULT BRANCH
//
// Strategy:
//   1. Build the set of all commit SHAs on the default branch (reuse the
//      commits we already fetched — passed in as `defaultBranchSHAs`).
//   2. Fetch every closed PR.
//   3. Keep only PRs where merged_at !== null AND
//      merge_commit_sha is in defaultBranchSHAs.
//      → This guarantees the PR's code actually reached the default branch,
//        even if it was merged via a release/staging branch first.
//   4. Enrich each qualifying PR with file-count/line-count (complexity),
//      reviews, and review comments.
// ============================================================================

async function fetchAllMergedPRsToDefault(
  owner,
  repo,
  defaultBranch,
  defaultBranchSHAs // reuse the SHA set built from commits fetch
) {
  console.log(
    `   🔍 Fetching merged PRs whose merge_commit_sha is on ${defaultBranch}...`
  );
  console.log(
    `   📊 Default branch has ${defaultBranchSHAs.size} commit SHAs to check against`
  );

  let page = 1;
  const candidatePRs = [];
  let apiCalls = 0;

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=${page}&sort=updated&direction=desc`;
    try {
      await delay(CONFIG.DELAY_MS);
      const prs = await fetchGitHub(url);
      apiCalls++;

      if (!prs || prs.length === 0) break;

      for (const pr of prs) {
        // Must be merged (not just closed), not a bot, and its merge commit
        // must exist on the default branch
        if (!pr.merged_at) continue;
        if (isBot(pr.user?.login)) continue;
        if (!pr.merge_commit_sha) continue;
        if (!defaultBranchSHAs.has(pr.merge_commit_sha)) continue;

        candidatePRs.push(pr);
      }

      if (prs.length < 100) break;
      page++;
    } catch (error) {
      console.error(
        `      ⚠️ Error fetching PRs page ${page}: ${error.message}`
      );
      break;
    }
  }

  console.log(
    `   📊 ${candidatePRs.length} PRs confirmed merged into ${defaultBranch} (${apiCalls} API calls)`
  );
  console.log(`   🔍 Enriching PRs with complexity + reviews...`);

  const enrichedPRs = [];

  for (let i = 0; i < candidatePRs.length; i++) {
    const pr = candidatePRs[i];

    try {
      await delay(CONFIG.DELAY_MS);
      const fullPR = await fetchGitHub(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}`
      );

      const complexity = analyzePRComplexity(fullPR);

      let reviews = [];
      try {
        await delay(CONFIG.DELAY_MS);
        reviews = await fetchGitHub(
          `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/reviews`
        );
      } catch (err) {
        console.error(`      ⚠️ Error fetching reviews for PR #${pr.number}`);
      }

      let reviewComments = [];
      try {
        await delay(CONFIG.DELAY_MS);
        reviewComments = await fetchGitHub(
          `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/comments`
        );
      } catch (err) {
        console.error(
          `      ⚠️ Error fetching review comments for PR #${pr.number}`
        );
      }

      const humanReviews = (reviews || []).filter((r) => !isBot(r.user?.login));
      const humanComments = (reviewComments || []).filter(
        (c) => !isBot(c.user?.login)
      );

      enrichedPRs.push({
        number: pr.number,
        author: pr.user?.login,
        title: pr.title,
        merged_at: pr.merged_at,
        created_at: pr.created_at,
        base_ref: pr.base?.ref,
        merge_commit_sha: pr.merge_commit_sha,
        changed_files: fullPR.changed_files || 0,
        additions: fullPR.additions || 0,
        deletions: fullPR.deletions || 0,
        complexity: complexity.level,
        complexity_multiplier: complexity.multiplier,
        reviews_count: humanReviews.length,
        review_comments_count: humanComments.length,
        reviews: humanReviews.map((r) => ({
          reviewer: r.user?.login,
          state: r.state,
          submitted_at: r.submitted_at,
        })),
        review_comments: humanComments.map((c) => ({
          author: c.user?.login,
          created_at: c.created_at,
        })),
      });

      if ((i + 1) % 10 === 0) {
        console.log(
          `   Progress: ${i + 1}/${candidatePRs.length} PRs enriched...`
        );
      }
    } catch (error) {
      console.error(
        `      ⚠️ Error enriching PR #${pr.number}: ${error.message}`
      );
    }
  }

  console.log(`   ✅ ${enrichedPRs.length} PRs fully enriched`);
  return enrichedPRs;
}

// ============================================================================
// FETCH REAL ISSUE COMMENT AUTHORS
// ============================================================================

async function fetchIssueCommentAuthors(owner, repo, issueNumber) {
  let page = 1;
  const authors = [];

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100&page=${page}`;
    try {
      await delay(CONFIG.DELAY_MS);
      const comments = await fetchGitHub(url);
      if (!comments || comments.length === 0) break;

      for (const comment of comments) {
        if (!isBot(comment.user?.login)) {
          authors.push({
            author: comment.user?.login,
            created_at: comment.created_at,
          });
        }
      }

      if (comments.length < 100) break;
      page++;
    } catch (err) {
      console.error(
        `      ⚠️ Error fetching comments for issue #${issueNumber}: ${err.message}`
      );
      break;
    }
  }

  return authors;
}

async function fetchCategorizedIssues(owner, repo) {
  console.log(`   🔍 Fetching categorized issues...`);
  let page = 1;
  const issues = { bugs: [], enhancements: [], documentation: [], others: [] };
  let apiCalls = 0;
  const allRawIssues = [];

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`;
    try {
      await delay(CONFIG.DELAY_MS);
      const allIssues = await fetchGitHub(url);
      apiCalls++;

      if (!allIssues || allIssues.length === 0) break;

      for (const issue of allIssues) {
        if (issue.pull_request) continue; // skip PRs listed in issues endpoint
        if (isBot(issue.user?.login)) continue;
        allRawIssues.push(issue);
      }

      if (allIssues.length < 100) break;
      page++;
    } catch (error) {
      console.error(`      ⚠️ Error fetching issues: ${error.message}`);
      break;
    }
  }

  console.log(
    `   🔍 Fetching real comment authors for ${allRawIssues.length} issues...`
  );

  for (let i = 0; i < allRawIssues.length; i++) {
    const issue = allRawIssues[i];

    const commentAuthors =
      issue.comments > 0
        ? await fetchIssueCommentAuthors(owner, repo, issue.number)
        : [];

    const labels = issue.labels.map((label) => label.name.toLowerCase());

    const issueData = {
      number: issue.number,
      author: issue.user?.login,
      title: issue.title,
      labels,
      created_at: issue.created_at,
      state: issue.state,
      comments: issue.comments || 0,
      comment_authors: commentAuthors,
    };

    if (labels.some((l) => l.includes("bug") || l.includes("fix"))) {
      issues.bugs.push(issueData);
    } else if (
      labels.some(
        (l) =>
          l.includes("enhancement") ||
          l.includes("feature") ||
          l.includes("improvement")
      )
    ) {
      issues.enhancements.push(issueData);
    } else if (
      labels.some(
        (l) =>
          l.includes("documentation") || l.includes("docs") || l.includes("doc")
      )
    ) {
      issues.documentation.push(issueData);
    } else {
      issues.others.push(issueData);
    }

    if ((i + 1) % 20 === 0) {
      console.log(
        `   Progress: ${i + 1}/${allRawIssues.length} issues processed...`
      );
    }
  }

  console.log(
    `   ✅ Found ${issues.bugs.length} bugs, ${issues.enhancements.length} enhancements, ${issues.documentation.length} docs, ${issues.others.length} others`
  );
  return issues;
}

// ============================================================================
// PROCESS SINGLE PROJECT
// Commits are fetched ONCE and the SHA set is reused for PR filtering.
// ============================================================================

async function processProject(projectId, projectTitle, repoName) {
  console.log(`\n📊 Processing: ${projectTitle} (${repoName})`);

  try {
    const defaultBranch = await fetchDefaultBranch(CONFIG.OWNER, repoName);
    console.log(`   🌿 Default branch: ${defaultBranch}`);

    // Fetch commits ONCE — reuse SHA set for PR filtering (no double fetch)
    const commits = await fetchAllCommitsFromDefaultBranch(
      CONFIG.OWNER,
      repoName,
      defaultBranch
    );
    const defaultBranchSHAs = new Set(commits.map((c) => c.sha));

    // Pass SHA set directly — avoids a second full commit fetch
    const mergedPRs = await fetchAllMergedPRsToDefault(
      CONFIG.OWNER,
      repoName,
      defaultBranch,
      defaultBranchSHAs
    );

    const issues = await fetchCategorizedIssues(CONFIG.OWNER, repoName);

    // Normalize commit shape for generate-leaderboard.js
    // Fields: author_login, author_name, date, sha, message
    const normalizedCommits = commits.map((c) => ({
      sha: c.sha,
      author_login: c.author?.login || null,
      author_name: c.commit?.author?.name || null,
      date: c.commit?.author?.date || null,
      message: (c.commit?.message || "").split("\n")[0], // first line only
    }));

    const mapIssue = (i) => ({
      number: i.number,
      author: i.author,
      title: i.title,
      created_at: i.created_at,
      comments: i.comments,
      comment_authors: i.comment_authors,
    });

    return {
      project_id: projectId,
      project_title: projectTitle,
      repo_name: repoName,
      default_branch: defaultBranch,
      fetched_at: new Date().toISOString(),
      commits: normalizedCommits,
      merged_prs: mergedPRs,
      issues: {
        bugs: issues.bugs.map(mapIssue),
        enhancements: issues.enhancements.map(mapIssue),
        documentation: issues.documentation.map(mapIssue),
        others: issues.others.map(mapIssue),
      },
      stats: {
        total_commits: normalizedCommits.length,
        total_merged_prs: mergedPRs.length,
        total_bugs: issues.bugs.length,
        total_enhancements: issues.enhancements.length,
        total_documentation: issues.documentation.length,
        total_others: issues.others.length,
      },
    };
  } catch (error) {
    console.error(`   ❌ Error processing ${projectTitle}: ${error.message}`);
    return null;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function cacheLeaderboardData() {
  console.log("\n" + "=".repeat(80));
  console.log("🏆 LEADERBOARD DATA FETCHER");
  console.log("=".repeat(80));
  console.log(`Rules:`);
  console.log(`  📝 Commits = only commits on the default branch`);
  console.log(
    `  🔀 PRs     = only merged PRs whose merge_commit_sha is on default branch`
  );
  console.log(
    `  🎯 PR complexity: small (<3 files & <100 lines) / medium / large`
  );
  console.log(`  👀 PR reviews + review comments`);
  console.log(`  🐛 Issues categorized (bugs / enhancements / docs / others)`);
  console.log(`  💬 Issue comments — real authors fetched per issue\n`);

  const contributors = readJsonFile(CONFIG.CONTRIBUTORS_FILE) || [];
  const projects = readJsonFile(CONFIG.PROJECTS_FILE) || [];

  if (!contributors.length) {
    console.error("❌ No contributors found!");
    return;
  }

  console.log(
    `📦 Loaded ${contributors.length} contributors, ${projects.length} projects`
  );
  console.log(`   Special projects: ${CONFIG.SPECIAL_PROJECTS.length}\n`);

  const allProjectsData = {};
  const totalProjects = projects.length + CONFIG.SPECIAL_PROJECTS.length;
  let processedCount = 0;

  for (const project of projects) {
    processedCount++;
    console.log(`\n[${processedCount}/${totalProjects}] 📌 ${project.title}`);

    const repoMatch = (
      project.githubUrl ||
      project.github_repository_link ||
      ""
    ).match(/github\.com\/[^\/]+\/([^\/]+)/);

    if (!repoMatch) {
      console.log(`   ⚠️ Skipping — no valid GitHub URL`);
      continue;
    }

    const projectData = await processProject(
      project.id,
      project.title,
      repoMatch[1]
    );

    if (projectData) allProjectsData[project.id] = projectData;
  }

  for (const sp of CONFIG.SPECIAL_PROJECTS) {
    processedCount++;
    console.log(`\n[${processedCount}/${totalProjects}] 🌟 ${sp.title}`);

    const projectData = await processProject(sp.id, sp.title, sp.repoName);
    if (projectData) allProjectsData[sp.id] = projectData;
  }

  console.log("\n" + "=".repeat(80));
  console.log("💾 Saving cache...");

  const success = writeJsonFile(CONFIG.CACHE_FILE, allProjectsData);

  if (success) {
    const totalCommits = Object.values(allProjectsData).reduce(
      (s, p) => s + (p.stats?.total_commits || 0),
      0
    );
    const totalPRs = Object.values(allProjectsData).reduce(
      (s, p) => s + (p.stats?.total_merged_prs || 0),
      0
    );
    console.log(`✅ Cached ${Object.keys(allProjectsData).length} projects`);
    console.log(`   Total commits (default branch): ${totalCommits}`);
    console.log(`   Total merged PRs (default branch): ${totalPRs}`);
    console.log(`📁 → ${CONFIG.CACHE_FILE}`);
  }

  console.log("=".repeat(80) + "\n");
  return allProjectsData;
}

const startTime = Date.now();
cacheLeaderboardData()
  .then(() => {
    const s = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ Completed in ${Math.floor(s / 60)}m ${s % 60}s`);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
