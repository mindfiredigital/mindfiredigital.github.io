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
  UPCOMING_PROJECTS_FILE: "./src/app/projects/assets/upcomingProjects.json",

  // Fix 4: Progress checkpoint file
  PROGRESS_FILE: "./src/app/projects/assets/leaderboard-progress.json",

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
// RATE LIMIT HELPERS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class RequestQueue {
  constructor(concurrency = 1, delayBetweenRequests = 500) {
    this.concurrency = concurrency;
    this.delayBetweenRequests = delayBetweenRequests;
    this.queue = [];
    this.running = 0;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        await delay(this.delayBetweenRequests);
      }
      this.process();
    }
  }
}

const githubQueue = new RequestQueue(1, 500);

// ============================================================================
// Fix 3: Smart retry that reads Retry-After / X-RateLimit-Reset headers
// ============================================================================

async function fetchWithRetry(url, maxRetries = 5, initialDelay = 2000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await rawFetchGitHub(url);
      return data;
    } catch (error) {
      const msg = error.message?.toLowerCase() || "";
      const isRateLimit =
        error.status === 429 ||
        error.status === 403 ||
        msg.includes("429") ||
        msg.includes("rate limit") ||
        msg.includes("rate limited");

      if (isRateLimit && attempt < maxRetries - 1) {
        let waitTime;

        if (error.retryAfterMs && error.retryAfterMs > 0) {
          // GitHub told us exactly how long — trust it + 1s buffer
          waitTime = error.retryAfterMs + 1000;
          console.warn(
            `⏳ Rate limited (header). Waiting ${Math.round(waitTime / 1000)}s` +
              ` (retry ${attempt + 1}/${maxRetries - 1}) — ${url}`
          );
        } else if (error.resetAtMs && error.resetAtMs > Date.now()) {
          // X-RateLimit-Reset: unix timestamp when quota refills
          waitTime = error.resetAtMs - Date.now() + 1500;
          console.warn(
            `⏳ Rate limited (reset). Waiting ${Math.round(waitTime / 1000)}s` +
              ` (retry ${attempt + 1}/${maxRetries - 1}) — ${url}`
          );
        } else {
          // Fallback: exponential backoff with jitter
          const baseWait = initialDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 1000;
          waitTime = baseWait + jitter;
          console.warn(
            `⏳ Rate limited (backoff). Waiting ${Math.round(waitTime / 1000)}s` +
              ` (retry ${attempt + 1}/${maxRetries - 1}) — ${url}`
          );
        }

        await delay(waitTime);
        continue;
      }

      if (attempt === maxRetries - 1) {
        console.error(`❌ Failed after ${maxRetries} attempts: ${url}`);
      }
      throw error;
    }
  }
}

async function fetchGitHub(url) {
  return githubQueue.add(() => fetchWithRetry(url));
}

// ============================================================================
// HELPERS
// ============================================================================

// Fix 3: rawFetchGitHub now extracts rate-limit headers and attaches to error
async function rawFetchGitHub(url) {
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
          if (res.statusCode === 403 || res.statusCode === 429) {
            const err = new Error(
              `Rate limited. Retry after: ${res.headers["retry-after"] ?? "unknown"}s`
            );
            err.status = res.statusCode;

            // Attach parsed header values so fetchWithRetry can use them
            const retryAfterRaw = res.headers["retry-after"];
            const rateLimitReset = res.headers["x-ratelimit-reset"];

            if (retryAfterRaw) {
              err.retryAfterMs = parseInt(retryAfterRaw, 10) * 1000;
            }
            if (rateLimitReset) {
              err.resetAtMs = parseInt(rateLimitReset, 10) * 1000;
            }

            reject(err);
          } else if (res.statusCode !== 200) {
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
// Fix 4: PROGRESS CHECKPOINT — resume from crash without re-fetching
// ============================================================================

function loadProgress() {
  try {
    const fullPath = path.resolve(CONFIG.PROGRESS_FILE);
    if (!fs.existsSync(fullPath)) return { completed: {}, partialCache: {} };
    const saved = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const count = Object.keys(saved.completed || {}).length;
    if (count > 0) {
      console.log(
        `♻️  Resuming — ${count} project(s) already cached, skipping:`
      );
      Object.keys(saved.completed).forEach((id) =>
        console.log(`   ✓ ${saved.completed[id].title} (${id})`)
      );
      console.log();
    }
    return saved;
  } catch {
    return { completed: {}, partialCache: {} };
  }
}

function saveProgress(projectId, projectTitle, projectData, progress) {
  progress.completed[projectId] = {
    title: projectTitle,
    savedAt: new Date().toISOString(),
  };
  progress.partialCache[projectId] = projectData;
  writeJsonFile(CONFIG.PROGRESS_FILE, progress);
}

function clearProgress() {
  try {
    const fullPath = path.resolve(CONFIG.PROGRESS_FILE);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {}
}

// ============================================================================
// FETCH DEFAULT BRANCH
// ============================================================================

async function fetchDefaultBranch(owner, repo) {
  try {
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
      const commits = await fetchGitHub(url);
      apiCalls++;
      if (!commits || commits.length === 0) break;

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
// ============================================================================

async function fetchAllMergedPRsToDefault(
  owner,
  repo,
  defaultBranch,
  defaultBranchSHAs
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
      const prs = await fetchGitHub(url);
      apiCalls++;
      if (!prs || prs.length === 0) break;

      for (const pr of prs) {
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
      const fullPR = await fetchGitHub(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}`
      );

      const complexity = analyzePRComplexity(fullPR);

      let reviews = [];
      try {
        reviews = await fetchGitHub(
          `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/reviews`
        );
      } catch (err) {
        console.error(`      ⚠️ Error fetching reviews for PR #${pr.number}`);
      }

      let reviewComments = [];
      try {
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
  const allRawIssues = [];

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`;
    try {
      const allIssues = await fetchGitHub(url);
      if (!allIssues || allIssues.length === 0) break;

      for (const issue of allIssues) {
        if (issue.pull_request) continue;
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
// ============================================================================

async function processProject(projectId, projectTitle, repoName) {
  console.log(`\n📊 Processing: ${projectTitle} (${repoName})`);

  try {
    const defaultBranch = await fetchDefaultBranch(CONFIG.OWNER, repoName);
    console.log(`   🌿 Default branch: ${defaultBranch}`);

    const commits = await fetchAllCommitsFromDefaultBranch(
      CONFIG.OWNER,
      repoName,
      defaultBranch
    );
    const defaultBranchSHAs = new Set(commits.map((c) => c.sha));

    const mergedPRs = await fetchAllMergedPRsToDefault(
      CONFIG.OWNER,
      repoName,
      defaultBranch,
      defaultBranchSHAs
    );

    const issues = await fetchCategorizedIssues(CONFIG.OWNER, repoName);

    const normalizedCommits = commits.map((c) => ({
      sha: c.sha,
      author_login: c.author?.login || null,
      author_name: c.commit?.author?.name || null,
      date: c.commit?.author?.date || null,
      message: (c.commit?.message || "").split("\n")[0],
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
  console.log(`  📝 Commits  = only commits on the default branch`);
  console.log(
    `  🔀 PRs      = only merged PRs whose merge_commit_sha is on default branch`
  );
  console.log(`  🎯 Complexity: small / medium / large`);
  console.log(`  👀 PR reviews + review comments`);
  console.log(`  🐛 Issues categorized (bugs / enhancements / docs / others)`);
  console.log(`  💬 Issue comments — real authors fetched per issue`);
  console.log(`  ⚙️  Queue: concurrency=1, 500ms delay`);
  console.log(`  ✅ Fix 3: Reads Retry-After / X-RateLimit-Reset headers`);
  console.log(
    `  ✅ Fix 4: Checkpointed — crashes resume from last completed project\n`
  );

  const contributors = readJsonFile(CONFIG.CONTRIBUTORS_FILE) || [];
  const projects = readJsonFile(CONFIG.PROJECTS_FILE) || [];
  const upcomingProjects = readJsonFile(CONFIG.UPCOMING_PROJECTS_FILE) || [];
  const allProjects = [...projects, ...upcomingProjects];

  if (!contributors.length) {
    console.error("❌ No contributors found!");
    return;
  }

  console.log(
    `📦 Loaded ${contributors.length} contributors, ${projects.length} projects`
  );
  console.log(`   Special projects: ${CONFIG.SPECIAL_PROJECTS.length}\n`);

  // Fix 4: Load existing progress — skip already-completed projects
  const progress = loadProgress();
  const allProjectsData = { ...progress.partialCache };
  const skippedCount = Object.keys(progress.completed).length;

  const totalProjects = allProjects.length + CONFIG.SPECIAL_PROJECTS.length;
  let processedCount = 0;

  for (const project of allProjects) {
    processedCount++;

    const repoMatch = (
      project.githubUrl ||
      project.github_repository_link ||
      ""
    ).match(/github\.com\/[^\/]+\/([^\/]+)/);

    if (!repoMatch) {
      console.log(`\n[${processedCount}/${totalProjects}] 📌 ${project.title}`);
      console.log(`   ⚠️ Skipping — no valid GitHub URL`);
      continue;
    }

    // Fix 4: Skip if already done in a previous run
    if (progress.completed[project.id]) {
      console.log(
        `\n[${processedCount}/${totalProjects}] ⏭️  ${project.title} — already cached, skipping`
      );
      continue;
    }

    console.log(`\n[${processedCount}/${totalProjects}] 📌 ${project.title}`);

    const projectData = await processProject(
      project.id,
      project.title,
      repoMatch[1]
    );

    if (projectData) {
      allProjectsData[project.id] = projectData;
      saveProgress(project.id, project.title, projectData, progress);
      console.log(`   💾 Progress saved (${project.title})`);
    }
  }

  for (const sp of CONFIG.SPECIAL_PROJECTS) {
    processedCount++;

    if (progress.completed[sp.id]) {
      console.log(
        `\n[${processedCount}/${totalProjects}] ⏭️  ${sp.title} — already cached, skipping`
      );
      continue;
    }

    console.log(`\n[${processedCount}/${totalProjects}] 🌟 ${sp.title}`);

    const projectData = await processProject(sp.id, sp.title, sp.repoName);
    if (projectData) {
      allProjectsData[sp.id] = projectData;
      saveProgress(sp.id, sp.title, projectData, progress);
      console.log(`   💾 Progress saved (${sp.title})`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("💾 Saving final cache...");

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
    console.log(
      `✅ Cached ${Object.keys(allProjectsData).length} projects total`
    );
    console.log(`   ⏭️  Skipped (already cached): ${skippedCount}`);
    console.log(
      `   🆕 Newly fetched this run:   ${Object.keys(allProjectsData).length - skippedCount}`
    );
    console.log(`   Total commits (default branch): ${totalCommits}`);
    console.log(`   Total merged PRs (default branch): ${totalPRs}`);
    console.log(`📁 → ${CONFIG.CACHE_FILE}`);

    // Fix 4: Clean up checkpoint now that everything succeeded
    clearProgress();
    console.log(`🧹 Progress checkpoint cleared`);
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
