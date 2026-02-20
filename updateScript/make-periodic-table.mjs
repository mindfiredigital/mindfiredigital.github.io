import https from "https";
import fs from "fs";
import path from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  OWNER: "mindfiredigital",

  INPUT_FILES: {
    contributors: "./src/app/projects/assets/contributors.json",
    projects: "./src/app/projects/assets/projects.json",
    contributorMapping: "./src/app/projects/assets/contributor-mapping.json",
  },
  OUTPUT_FILES: {
    monthly: "./src/app/projects/assets/leaderboard-monthly.json",
  },

  SPECIAL_PROJECTS: [
    {
      id: "special-website",
      title: "Mindfire Digital Website",
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
  DELAY_MS: 150,
};

const SCORING = {
  PR_MERGED_BASE: 5,
  COMMIT: 2,
  PR_REVIEW_GIVEN: 3,
  CODE_REVIEW_COMMENT: 1,
  COMPLEXITY_MULTIPLIER: { small: 1.0, medium: 1.3, large: 1.7 },
  ISSUE_OPENED: 2,
  ISSUE_COMMENT: 1,
  HAS_TESTS: 2,
  HAS_DOCS: 2,
  ZERO_REVISIONS: 3,
  CAPS: { ISSUES_PER_MONTH: 10, ISSUE_COMMENTS_PER_MONTH: 20 },
};

// ============================================================================
// HELPERS
// ============================================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readJsonFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Not found: ${filePath}`);
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (e) {
    console.error(`❌ Read error ${filePath}:`, e.message);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ Wrote ${filePath}`);
  } catch (e) {
    console.error(`❌ Write error ${filePath}:`, e.message);
  }
}

function isBot(username) {
  if (!username) return false;
  const lower = username.toLowerCase();
  return CONFIG.BOT_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

/**
 * Returns midnight UTC on the 1st of the current calendar month.
 * e.g. Feb 19 2026 → Feb 01 2026 00:00:00 UTC
 */
function getCurrentMonthStart() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
}

async function fetchGitHub(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Authorization: `Bearer ${CONFIG.GITHUB_TOKEN}`,
        "User-Agent": "GitHub-Periodic-Leaderboard",
        Accept: "application/vnd.github.v3+json",
      },
    };
    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 403 || res.statusCode === 429) {
            reject(
              new Error(
                `Rate limited. Retry after: ${
                  res.headers["retry-after"] ?? "unknown"
                }s`
              )
            );
          } else if (res.statusCode !== 200) {
            reject(
              new Error(`HTTP ${res.statusCode}: ${url}\n${data.slice(0, 200)}`)
            );
          } else {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`JSON parse error: ${e.message}`));
            }
          }
        });
      })
      .on("error", reject);
  });
}

async function fetchAllPages(baseUrl, since = null) {
  let page = 1;
  const results = [];
  while (true) {
    const sep = baseUrl.includes("?") ? "&" : "?";
    const sinceParam = since ? `&since=${since.toISOString()}` : "";
    const url = `${baseUrl}${sep}per_page=100&page=${page}${sinceParam}`;
    try {
      await delay(CONFIG.DELAY_MS);
      const data = await fetchGitHub(url);
      if (!Array.isArray(data) || data.length === 0) break;
      results.push(...data);
      if (data.length < 100) break;
      page++;
    } catch (e) {
      console.error(`   ⚠️ ${e.message}`);
      break;
    }
  }
  return results;
}

// ============================================================================
// FETCH DEFAULT BRANCH
// ============================================================================

async function fetchDefaultBranch(repo) {
  try {
    await delay(CONFIG.DELAY_MS);
    const data = await fetchGitHub(
      `https://api.github.com/repos/${CONFIG.OWNER}/${repo}`
    );
    return data.default_branch || "main";
  } catch (e) {
    console.warn(
      `   ⚠️ Could not fetch default branch for ${repo}: ${e.message}`
    );
    return "main";
  }
}

// ============================================================================
// FETCH COMMITS ON DEFAULT BRANCH SINCE monthStart
//
// Returns normalized objects: { sha, author_login, author_name, date }
// — same shape as the all-time cache so scoreUser() uses identical field names.
// Only commits on sha=<defaultBranch> with date >= since are returned.
// ============================================================================

async function fetchCommitsSince(repo, branch, since) {
  console.log(
    `      → commits on ${branch} since ${since.toISOString().slice(0, 10)}`
  );

  const raw = await fetchAllPages(
    `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/commits?sha=${branch}`,
    since
  );

  const commits = raw
    .filter((c) => !isBot(c.author?.login) && !isBot(c.commit?.author?.name))
    .map((c) => ({
      sha: c.sha,
      // Normalize to author_login / author_name — same fields generate-leaderboard.js uses
      author_login: c.author?.login || null,
      author_name: c.commit?.author?.name || null,
      date: c.commit?.author?.date || null,
    }));

  console.log(`         ${commits.length} commits on ${branch}`);
  return commits;
}

// ============================================================================
// FETCH MERGED PRS SINCE monthStart THAT LANDED ON DEFAULT BRANCH
//
// Reuses the SHA set already built from the commits fetch — no second pass.
// Only PRs with merged_at >= since AND merge_commit_sha in SHA set are kept.
// ============================================================================

async function fetchMergedPRsSince(
  repo,
  defaultBranch,
  since,
  defaultBranchSHAs
) {
  console.log(
    `      → merged PRs on ${defaultBranch} since ${since
      .toISOString()
      .slice(0, 10)}`
  );
  console.log(
    `         checking against ${defaultBranchSHAs.size} commit SHAs`
  );

  let page = 1;
  const candidates = [];
  let done = false;

  while (!done) {
    const url = `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`;
    try {
      await delay(CONFIG.DELAY_MS);
      const prs = await fetchGitHub(url);
      if (!prs || prs.length === 0) break;

      for (const pr of prs) {
        if (new Date(pr.updated_at) < since) {
          done = true;
          break;
        }
        if (!pr.merged_at) continue;
        if (new Date(pr.merged_at) < since) continue;
        console.log(
          `PR #${pr.number} by ${pr.user?.login}: merged_at=${
            pr.merged_at
          }, sha_match=${defaultBranchSHAs.has(pr.merge_commit_sha)}`
        );
        if (isBot(pr.user?.login)) continue;
        // Core rule: merge commit must exist on the default branch
        if (!pr.merge_commit_sha || !defaultBranchSHAs.has(pr.merge_commit_sha))
          continue;
        candidates.push(pr);
      }
      if (prs.length < 100) break;
      page++;
    } catch (e) {
      console.error(`   ⚠️ PR fetch error: ${e.message}`);
      break;
    }
  }

  console.log(
    `         ${candidates.length} PRs confirmed merged into ${defaultBranch}`
  );

  const enriched = [];
  for (const pr of candidates) {
    try {
      await delay(CONFIG.DELAY_MS);
      const full = await fetchGitHub(
        `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/pulls/${pr.number}`
      );

      const files = full.changed_files || 0;
      const lines = (full.additions || 0) + (full.deletions || 0);
      let complexity = "small",
        multiplier = 1.0;
      if (files >= 8 || lines >= 500) {
        complexity = "large";
        multiplier = 1.7;
      } else if (files >= 3 || lines >= 100) {
        complexity = "medium";
        multiplier = 1.3;
      }

      await delay(CONFIG.DELAY_MS);
      let reviews = [];
      try {
        reviews = await fetchGitHub(
          `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/pulls/${pr.number}/reviews`
        );
      } catch (_) {}

      await delay(CONFIG.DELAY_MS);
      let reviewComments = [];
      try {
        reviewComments = await fetchGitHub(
          `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/pulls/${pr.number}/comments`
        );
      } catch (_) {}

      const humanReviews = (reviews || []).filter((r) => !isBot(r.user?.login));
      const humanComments = (reviewComments || []).filter(
        (c) => !isBot(c.user?.login)
      );

      enriched.push({
        number: pr.number,
        author: pr.user?.login,
        title: pr.title,
        merged_at: pr.merged_at,
        created_at: pr.created_at,
        changed_files: full.changed_files || 0,
        additions: full.additions || 0,
        deletions: full.deletions || 0,
        complexity,
        complexity_multiplier: multiplier,
        reviews_count: humanReviews.length,
        reviews: humanReviews.map((r) => ({
          reviewer: r.user?.login,
          state: r.state,
        })),
        review_comments: humanComments.map((c) => ({ author: c.user?.login })),
      });
    } catch (e) {
      console.error(`   ⚠️ Enrich PR #${pr.number}: ${e.message}`);
    }
  }

  console.log(`         ${enriched.length} PRs enriched`);
  return enriched;
}

// ============================================================================
// FETCH ISSUES SINCE monthStart (with real comment authors in window)
// ============================================================================

async function fetchIssuesSince(repo, since) {
  console.log(`      → issues since ${since.toISOString().slice(0, 10)}`);
  const raw = await fetchAllPages(
    `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/issues?state=all&sort=created&direction=desc`,
    since
  );

  const issues = { bugs: [], enhancements: [], documentation: [], others: [] };
  const rawIssues = raw.filter(
    (issue) =>
      !issue.pull_request &&
      !isBot(issue.user?.login) &&
      new Date(issue.created_at) >= since
  );

  console.log(
    `         fetching comment authors for ${rawIssues.length} issues...`
  );

  for (const issue of rawIssues) {
    let comment_authors = [];
    if (issue.comments > 0) {
      let page = 1;
      while (true) {
        const url = `https://api.github.com/repos/${CONFIG.OWNER}/${repo}/issues/${issue.number}/comments?per_page=100&page=${page}`;
        try {
          await delay(CONFIG.DELAY_MS);
          const comments = await fetchGitHub(url);
          if (!comments || comments.length === 0) break;
          for (const comment of comments) {
            if (
              !isBot(comment.user?.login) &&
              new Date(comment.created_at) >= since
            ) {
              comment_authors.push({
                author: comment.user?.login,
                created_at: comment.created_at,
              });
            }
          }
          if (comments.length < 100) break;
          page++;
        } catch (err) {
          console.error(
            `      ⚠️ Comments for issue #${issue.number}: ${err.message}`
          );
          break;
        }
      }
    }

    const labels = issue.labels.map((l) => l.name.toLowerCase());
    const item = {
      number: issue.number,
      author: issue.user?.login,
      title: issue.title,
      labels,
      created_at: issue.created_at,
      state: issue.state,
      comments: issue.comments || 0,
      comment_authors,
    };

    if (labels.some((l) => l.includes("bug") || l.includes("fix")))
      issues.bugs.push(item);
    else if (
      labels.some(
        (l) =>
          l.includes("enhancement") ||
          l.includes("feature") ||
          l.includes("improvement")
      )
    )
      issues.enhancements.push(item);
    else if (labels.some((l) => l.includes("doc") || l.includes("readme")))
      issues.documentation.push(item);
    else issues.others.push(item);
  }

  return issues;
}

// ============================================================================
// PROCESS ONE REPO
// Commits fetched once → SHA set reused for PR filtering (no double API pass).
// ============================================================================

async function processRepo(repoName, projectTitle, since) {
  console.log(`\n   📁 ${projectTitle} (${repoName})`);
  try {
    const branch = await fetchDefaultBranch(repoName);

    // Fetch & normalize commits first
    const commits = await fetchCommitsSince(repoName, branch, since);

    // Build SHA set from already-fetched commits — reused for PR filtering
    const defaultBranchSHAs = new Set(commits.map((c) => c.sha));

    const mergedPRs = await fetchMergedPRsSince(
      repoName,
      branch,
      since,
      defaultBranchSHAs
    );
    const issues = await fetchIssuesSince(repoName, since);

    return {
      project_title: projectTitle,
      commits,
      merged_prs: mergedPRs,
      issues,
    };
  } catch (e) {
    console.error(`   ❌ ${projectTitle}: ${e.message}`);
    return null;
  }
}

// ============================================================================
// SCORE A USER
// Uses author_login / author_name — same fields as the normalized cache shape.
// ============================================================================

function applyMonthlyCaps(items, cap, dateField = "created_at") {
  const byMonth = {};
  for (const item of items) {
    const date = new Date(item[dateField]);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(item);
  }
  const capped = [];
  for (const month in byMonth) capped.push(...byMonth[month].slice(0, cap));
  return capped;
}

function scoreUser(username, projectDataList) {
  let commits = 0,
    prs = [],
    pr_reviews_given = 0,
    code_review_comments = 0,
    issues_opened = [],
    issue_comments_given = [];
  const qm = { has_tests: 0, has_docs: 0, zero_revisions: 0 };
  const projectNames = [];

  for (const pd of projectDataList) {
    if (!pd) continue;

    // Commits: match author_login (exact) or author_name (substring fallback)
    const userCommits = pd.commits.filter(
      (c) =>
        c.author_login === username ||
        c.author_name?.toLowerCase().includes(username.toLowerCase())
    );
    commits += userCommits.length;

    // PRs already filtered to default branch by fetchMergedPRsSince
    const userPRs = pd.merged_prs.filter((pr) => pr.author === username);
    for (const pr of userPRs) {
      prs.push(pr);
      if (
        pr.title?.toLowerCase().includes("test") ||
        pr.title?.toLowerCase().includes("spec")
      )
        qm.has_tests++;
      if (
        pr.title?.toLowerCase().includes("doc") ||
        pr.title?.toLowerCase().includes("readme")
      )
        qm.has_docs++;
      if (pr.reviews_count === 0) qm.zero_revisions++;
    }

    for (const pr of pd.merged_prs) {
      if (pr.author === username) continue;
      pr_reviews_given += (pr.reviews || []).filter(
        (r) => r.reviewer === username
      ).length;
      code_review_comments += (pr.review_comments || []).filter(
        (c) => c.author === username
      ).length;
    }

    const allIssues = [
      ...pd.issues.bugs,
      ...pd.issues.enhancements,
      ...pd.issues.documentation,
      ...pd.issues.others,
    ];
    issues_opened.push(...allIssues.filter((i) => i.author === username));

    for (const issue of allIssues) {
      if (issue.author === username) continue;
      if (!issue.comment_authors) continue;
      for (const comment of issue.comment_authors) {
        if (comment.author === username)
          issue_comments_given.push({ created_at: comment.created_at });
      }
    }

    if (
      userCommits.length > 0 ||
      userPRs.length > 0 ||
      issues_opened.length > 0
    )
      projectNames.push(pd.project_title);
  }

  if (
    commits === 0 &&
    prs.length === 0 &&
    issues_opened.length === 0 &&
    issue_comments_given.length === 0
  )
    return null;

  let prScore = 0;
  for (const pr of prs)
    prScore +=
      SCORING.PR_MERGED_BASE *
      (SCORING.COMPLEXITY_MULTIPLIER[pr.complexity] || 1.0);

  const codeScore =
    prScore +
    commits * SCORING.COMMIT +
    pr_reviews_given * SCORING.PR_REVIEW_GIVEN +
    code_review_comments * SCORING.CODE_REVIEW_COMMENT;

  const cappedIssues = applyMonthlyCaps(
    issues_opened,
    SCORING.CAPS.ISSUES_PER_MONTH
  );
  const cappedComments = applyMonthlyCaps(
    issue_comments_given,
    SCORING.CAPS.ISSUE_COMMENTS_PER_MONTH
  );

  const communityScore =
    cappedIssues.length * SCORING.ISSUE_OPENED +
    cappedComments.length * SCORING.ISSUE_COMMENT;

  const qualityScore =
    qm.has_tests * SCORING.HAS_TESTS +
    qm.has_docs * SCORING.HAS_DOCS +
    qm.zero_revisions * SCORING.ZERO_REVISIONS;

  const total = Math.round(codeScore + communityScore + qualityScore);
  if (total === 0) return null;

  return {
    commits,
    prs,
    pr_reviews_given,
    code_review_comments,
    issues_opened,
    issue_comments_given,
    projectNames,
    scores: {
      total,
      codeScore: Math.round(codeScore),
      communityScore: Math.round(communityScore),
      qualityScore: Math.round(qualityScore),
      prScore: Math.round(prScore),
      prs_by_complexity: {
        small: prs.filter((p) => p.complexity === "small").length,
        medium: prs.filter((p) => p.complexity === "medium").length,
        large: prs.filter((p) => p.complexity === "large").length,
      },
      breakdown: {
        pr_score: Math.round(prScore),
        commits_score: commits * SCORING.COMMIT,
        pr_reviews_score: pr_reviews_given * SCORING.PR_REVIEW_GIVEN,
        code_comments_score: code_review_comments * SCORING.CODE_REVIEW_COMMENT,
        issues_opened_score: cappedIssues.length * SCORING.ISSUE_OPENED,
        issue_comments_score: cappedComments.length * SCORING.ISSUE_COMMENT,
        tests_score: qm.has_tests * SCORING.HAS_TESTS,
        docs_score: qm.has_docs * SCORING.HAS_DOCS,
        mentor_score: 0,
        zero_revisions_score: qm.zero_revisions * SCORING.ZERO_REVISIONS,
        impact_bonus_score: 0,
      },
      capped_counts: {
        issues_opened: cappedIssues.length,
        issues_total: issues_opened.length,
        issue_comments: cappedComments.length,
        issue_comments_total: issue_comments_given.length,
      },
    },
  };
}

// ============================================================================
// BUILD LEADERBOARD
// ============================================================================

async function generateLeaderboard(contributors, projectDataList, label) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🏆 Building ${label} leaderboard...`);

  const results = [];
  for (const contributor of contributors) {
    const username = contributor.login;
    const result = scoreUser(username, projectDataList);
    if (!result) continue;

    results.push({
      rank: 0,
      username,
      id: contributor.id,
      avatar_url: contributor.avatar_url,
      html_url: contributor.html_url,
      totalCommits: result.commits,
      totalPRs: result.prs.length,
      totalPRReviewsGiven: result.pr_reviews_given,
      totalCodeReviewComments: result.code_review_comments,
      totalIssuesOpened: result.issues_opened.length,
      totalIssueComments: result.scores.capped_counts.issue_comments,
      avgCommitsPerPR:
        result.prs.length > 0
          ? parseFloat((result.commits / result.prs.length).toFixed(2))
          : 0,
      projectsWorkingOn: result.projectNames.length,
      projects: result.projectNames,
      prs_by_complexity: result.scores.prs_by_complexity,
      total_score: result.scores.total,
      code_score: result.scores.codeScore,
      community_score: result.scores.communityScore,
      quality_score: result.scores.qualityScore,
      score_breakdown: result.scores.breakdown,
      capped_counts: result.scores.capped_counts,
      lastActiveDays: contributor.lastActiveDays ?? null,
    });

    console.log(
      `   ✅ ${username}: ${result.scores.total} pts  ` +
        `(${result.prs.length} merged PRs on default branch, ` +
        `${result.commits} commits on default branch)`
    );
  }

  results.sort((a, b) => b.total_score - a.total_score);
  results.forEach((c, i) => {
    c.rank = i + 1;
  });
  console.log(`\n   📊 ${results.length} contributors active this month`);
  return results;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 FETCH MONTHLY LEADERBOARD DATA");
  console.log("   Window  : 1st of current calendar month → today");
  console.log("   Commits : default branch only (sha= param)");
  console.log(
    "   PRs     : merged_at >= window start + merge_commit_sha on default branch"
  );
  console.log("=".repeat(60));

  if (!CONFIG.GITHUB_TOKEN) {
    console.error("❌ GITHUB_TOKEN env var is required");
    process.exit(1);
  }

  const contributors = readJsonFile(CONFIG.INPUT_FILES.contributors) || [];
  const projects = readJsonFile(CONFIG.INPUT_FILES.projects) || [];

  if (!contributors.length) {
    console.error("❌ No contributors found");
    process.exit(1);
  }

  const monthStart = getCurrentMonthStart();
  const now = new Date();

  console.log(
    `\n📅 Window: ${monthStart.toISOString().slice(0, 10)} → ${now
      .toISOString()
      .slice(0, 10)}`
  );

  const repoList = [];
  for (const project of projects) {
    const match = (
      project.githubUrl ||
      project.github_repository_link ||
      ""
    ).match(/github\.com\/[^/]+\/([^/]+)/);
    if (match) repoList.push({ repoName: match[1], title: project.title });
  }
  for (const sp of CONFIG.SPECIAL_PROJECTS) {
    repoList.push({ repoName: sp.repoName, title: sp.title });
  }

  console.log(`\n📦 Repos: ${repoList.length}`);

  const projectDataList = [];
  for (const repo of repoList) {
    const data = await processRepo(repo.repoName, repo.title, monthStart);
    if (data) projectDataList.push(data);
  }

  const monthly = await generateLeaderboard(
    contributors,
    projectDataList,
    "MONTHLY (current calendar month)"
  );

  const nowIso = now.toISOString();
  writeJsonFile(CONFIG.OUTPUT_FILES.monthly, {
    generated_at: nowIso,
    period: "monthly",
    window_start: monthStart.toISOString(),
    window_end: nowIso,
    month_label: monthStart.toLocaleString("default", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    total_contributors: monthly.length,
    leaderboard: monthly,
  });

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Done! Month: ${monthStart.toISOString().slice(0, 7)}`);
  console.log(`   Active contributors: ${monthly.length}`);
  console.log("=".repeat(60) + "\n");
}

main().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});
