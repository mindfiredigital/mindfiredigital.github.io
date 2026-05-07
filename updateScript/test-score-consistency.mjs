/**
 * Comprehensive score-consistency diagnostic.
 * Checks every contributor: SUM(all monthly total_scores) vs all-time total_score.
 *
 * Run: node updateScript/test-score-consistency.mjs [username]
 *
 * Without a username, prints every contributor whose monthly sum ≠ all-time.
 * With a username, always prints that contributor's full breakdown.
 */

import fs from "fs";
import path from "path";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const INPUT = {
  cache: "./src/asset/leaderboard-cache.json",
  contributors: "./src/asset/contributors.json",
  contributorMapping: "./src/asset/contributor-mapping.json",
};
const SPECIAL_PROJECT_IDS = ["special-website"];

const SCORING = {
  PR_MERGED_BASE: 5,
  COMMIT: 2,
  PR_REVIEW_GIVEN: 3,
  CODE_REVIEW_COMMENT: 1,
  COMPLEXITY_MULTIPLIER: { small: 1.0, medium: 1.3, large: 1.7 },
  ISSUE_OPENED: 2,
  ISSUE_COMMENT: 1,
  HAS_TESTS: 1,
  HAS_DOCS: 1,
  FIRST_TIME_MENTOR: 5,
  ZERO_REVISIONS: 2,
  IMPACT_BONUS: { low: 0, medium: 3, high: 7, critical: 10 },
  PROJECT_DIVERSITY: 10,
  CAPS: { ISSUES_PER_MONTH: 10, ISSUE_COMMENTS_PER_MONTH: 20 },
};

// ─── HELPERS (identical to make-leaderboard.mjs) ─────────────────────────────

function toMonthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function applyMonthlyCaps(items, cap, dateField = "created_at") {
  const byMonth = {};
  for (const item of items) {
    const d = new Date(item[dateField]);
    const mk = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (!byMonth[mk]) byMonth[mk] = [];
    byMonth[mk].push(item);
  }
  const capped = [];
  for (const m in byMonth) capped.push(...byMonth[m].slice(0, cap));
  return capped;
}

function analyzeUserInProject(username, projectData) {
  const stats = {
    commits: 0,
    prs: [],
    pr_reviews_given: 0,
    code_review_comments: 0,
    issues_opened: [],
    issue_comments_given: [],
    quality_metrics: {
      has_tests: 0,
      has_docs: 0,
      first_time_mentor: 0,
      zero_revisions: 0,
      impact_bonuses: [],
    },
  };

  if (projectData.commits) {
    stats.commits = projectData.commits.filter(
      (c) =>
        c.author_login === username ||
        c.author_name?.toLowerCase().includes(username.toLowerCase())
    ).length;
  }

  if (projectData.merged_prs) {
    const userPRs = projectData.merged_prs.filter(
      (pr) => pr.author === username
    );
    for (const pr of userPRs) {
      stats.prs.push({
        number: pr.number,
        merged_at: pr.merged_at || null,
        complexity: pr.complexity || "small",
        multiplier: pr.complexity_multiplier || 1.0,
        reviews_count: pr.reviews_count || 0,
      });
      if (
        pr.title?.toLowerCase().includes("test") ||
        pr.title?.toLowerCase().includes("spec")
      )
        stats.quality_metrics.has_tests++;
      if (
        pr.title?.toLowerCase().includes("doc") ||
        pr.title?.toLowerCase().includes("readme") ||
        pr.title?.toLowerCase().includes("documentation")
      )
        stats.quality_metrics.has_docs++;
      if (pr.reviews_count === 0) stats.quality_metrics.zero_revisions++;
    }
    for (const pr of projectData.merged_prs) {
      if (pr.reviews)
        stats.pr_reviews_given += pr.reviews.filter(
          (r) => r.reviewer === username
        ).length;
      if (pr.review_comments)
        stats.code_review_comments += pr.review_comments.filter(
          (c) => c.author === username
        ).length;
    }
  }

  if (projectData.issues) {
    stats.issues_opened = [
      ...projectData.issues.bugs.filter((i) => i.author === username),
      ...projectData.issues.enhancements.filter((i) => i.author === username),
      ...projectData.issues.documentation.filter((i) => i.author === username),
      ...projectData.issues.others.filter((i) => i.author === username),
    ];
    const allIssues = [
      ...projectData.issues.bugs,
      ...projectData.issues.enhancements,
      ...projectData.issues.documentation,
      ...projectData.issues.others,
    ];
    for (const issue of allIssues) {
      if (!issue.comment_authors) continue;
      if (issue.author === username) continue;
      for (const c of issue.comment_authors) {
        if (c.author === username)
          stats.issue_comments_given.push({ created_at: c.created_at });
      }
    }
  }
  return stats;
}

function calculateScore(userStats) {
  let prScore = 0;
  for (const pr of userStats.prs) {
    // Round per-PR so medium (6.5) and large (8.5) contribute integers.
    prScore += Math.round(SCORING.PR_MERGED_BASE * pr.multiplier);
  }

  const codeScore =
    prScore +
    userStats.commits * SCORING.COMMIT +
    userStats.pr_reviews_given * SCORING.PR_REVIEW_GIVEN +
    userStats.code_review_comments * SCORING.CODE_REVIEW_COMMENT;

  const cappedIssues = applyMonthlyCaps(
    userStats.issues_opened,
    SCORING.CAPS.ISSUES_PER_MONTH
  );
  const cappedIssueComments = applyMonthlyCaps(
    userStats.issue_comments_given,
    SCORING.CAPS.ISSUE_COMMENTS_PER_MONTH
  );
  const projectDiversityScore =
    (userStats.projectsWorkingOn || 0) * SCORING.PROJECT_DIVERSITY;
  const communityScore =
    cappedIssues.length * SCORING.ISSUE_OPENED +
    cappedIssueComments.length * SCORING.ISSUE_COMMENT +
    projectDiversityScore;

  const impactBonusTotal = (
    userStats.quality_metrics.impact_bonuses || []
  ).reduce((s, b) => s + b, 0);
  const qualityScore =
    impactBonusTotal +
    userStats.quality_metrics.has_tests * SCORING.HAS_TESTS +
    userStats.quality_metrics.has_docs * SCORING.HAS_DOCS +
    userStats.quality_metrics.first_time_mentor * SCORING.FIRST_TIME_MENTOR +
    userStats.quality_metrics.zero_revisions * SCORING.ZERO_REVISIONS;

  const totalScore = codeScore + communityScore + qualityScore;

  return {
    total: Math.round(totalScore),
    code_score: Math.round(codeScore),
    community_score: Math.round(communityScore),
    quality_score: Math.round(qualityScore),
    breakdown: {
      pr_score: prScore,
      commits_score: userStats.commits * SCORING.COMMIT,
      pr_reviews_score: userStats.pr_reviews_given * SCORING.PR_REVIEW_GIVEN,
      issues_opened_score: cappedIssues.length * SCORING.ISSUE_OPENED,
      issue_comments_score: cappedIssueComments.length * SCORING.ISSUE_COMMENT,
      projects_score: projectDiversityScore,
      tests_score: userStats.quality_metrics.has_tests * SCORING.HAS_TESTS,
      docs_score: userStats.quality_metrics.has_docs * SCORING.HAS_DOCS,
      zero_revisions_score:
        userStats.quality_metrics.zero_revisions * SCORING.ZERO_REVISIONS,
    },
  };
}

// ─── SLICE / MAP HELPERS ──────────────────────────────────────────────────────

function sliceIssues(issues, monthKey) {
  return issues
    .filter((i) => toMonthKey(i.created_at) === monthKey)
    .map((i) => ({ ...i, comment_authors: i.comment_authors || [] }));
}

function sliceCachedDataToMonth(cachedData, monthKey) {
  const sliced = {};
  for (const [pid, pd] of Object.entries(cachedData)) {
    sliced[pid] = {
      ...pd,
      commits: (pd.commits || []).filter(
        (c) => toMonthKey(c.date) === monthKey
      ),
      merged_prs: (pd.merged_prs || []).filter(
        (pr) => toMonthKey(pr.merged_at) === monthKey
      ),
      issues: {
        bugs: sliceIssues(pd.issues?.bugs || [], monthKey),
        enhancements: sliceIssues(pd.issues?.enhancements || [], monthKey),
        documentation: sliceIssues(pd.issues?.documentation || [], monthKey),
        others: sliceIssues(pd.issues?.others || [], monthKey),
      },
    };
  }
  return sliced;
}

function buildEarliestContributionMap(cachedData, username, allProjectIds) {
  const projectMap = new Map();
  for (const pid of allProjectIds) {
    const pd = cachedData[pid];
    if (!pd) continue;
    const dates = [];
    for (const c of pd.commits || []) {
      if (
        c.author_login === username ||
        c.author_name?.toLowerCase().includes(username.toLowerCase())
      )
        if (c.date) dates.push(c.date);
    }
    for (const pr of pd.merged_prs || []) {
      if (pr.author === username && pr.merged_at) dates.push(pr.merged_at);
    }
    // Also include reviews and issue comments so every "active" project gets a first-month
    for (const pr of pd.merged_prs || []) {
      if (pr.reviews) {
        for (const r of pr.reviews) {
          if (r.reviewer === username && r.submitted_at)
            dates.push(r.submitted_at);
        }
      }
      if (pr.review_comments) {
        for (const rc of pr.review_comments) {
          if (rc.author === username && rc.created_at)
            dates.push(rc.created_at);
        }
      }
    }
    for (const cat of ["bugs", "enhancements", "documentation", "others"]) {
      for (const issue of pd.issues?.[cat] || []) {
        if (issue.author === username && issue.created_at)
          dates.push(issue.created_at);
        // Issue comments by username on other people's issues
        if (issue.comment_authors && issue.author !== username) {
          for (const c of issue.comment_authors) {
            if (c.author === username && c.created_at) dates.push(c.created_at);
          }
        }
      }
    }
    if (dates.length > 0) {
      dates.sort();
      projectMap.set(pid, toMonthKey(dates[0]));
    }
  }
  return projectMap;
}

function getAllMonthKeys(cachedData) {
  const keys = new Set();
  for (const pd of Object.values(cachedData)) {
    for (const c of pd.commits || []) {
      const k = toMonthKey(c.date);
      if (k) keys.add(k);
    }
    for (const pr of pd.merged_prs || []) {
      const k = toMonthKey(pr.merged_at);
      if (k) keys.add(k);
    }
    for (const cat of ["bugs", "enhancements", "documentation", "others"]) {
      for (const i of pd.issues?.[cat] || []) {
        const k = toMonthKey(i.created_at);
        if (k) keys.add(k);
      }
    }
  }
  return Array.from(keys).sort();
}

// ─── SCORE COMPUTERS ─────────────────────────────────────────────────────────

function computeAllTimeScore(username, cachedData, userProjectIds) {
  const userStats = {
    commits: 0,
    prs: [],
    pr_reviews_given: 0,
    code_review_comments: 0,
    issues_opened: [],
    issue_comments_given: [],
    projectsWorkingOn: 0,
    quality_metrics: {
      has_tests: 0,
      has_docs: 0,
      first_time_mentor: 0,
      zero_revisions: 0,
      impact_bonuses: [],
    },
  };
  for (const pid of userProjectIds) {
    const pd = cachedData[pid];
    if (!pd) continue;
    const ps = analyzeUserInProject(username, pd);
    const hasAny =
      ps.commits > 0 ||
      ps.prs.length > 0 ||
      ps.issues_opened.length > 0 ||
      ps.pr_reviews_given > 0 ||
      ps.code_review_comments > 0 ||
      ps.issue_comments_given.length > 0;
    if (!hasAny) continue;
    userStats.commits += ps.commits;
    userStats.prs.push(...ps.prs);
    userStats.pr_reviews_given += ps.pr_reviews_given;
    userStats.code_review_comments += ps.code_review_comments;
    userStats.issues_opened.push(...ps.issues_opened);
    userStats.issue_comments_given.push(...ps.issue_comments_given);
    userStats.quality_metrics.has_tests += ps.quality_metrics.has_tests;
    userStats.quality_metrics.has_docs += ps.quality_metrics.has_docs;
    userStats.quality_metrics.zero_revisions +=
      ps.quality_metrics.zero_revisions;
    userStats.projectsWorkingOn++;
  }
  return userStats.projectsWorkingOn > 0
    ? {
        score: calculateScore(userStats),
        numProjects: userStats.projectsWorkingOn,
      }
    : null;
}

function computeMonthlyScore(
  username,
  cachedData,
  userProjectIds,
  monthKey,
  earliestMap
) {
  const monthSlice = sliceCachedDataToMonth(cachedData, monthKey);
  const userStats = {
    commits: 0,
    prs: [],
    pr_reviews_given: 0,
    code_review_comments: 0,
    issues_opened: [],
    issue_comments_given: [],
    projectsWorkingOn: 0,
    quality_metrics: {
      has_tests: 0,
      has_docs: 0,
      first_time_mentor: 0,
      zero_revisions: 0,
      impact_bonuses: [],
    },
  };
  for (const pid of userProjectIds) {
    const pd = monthSlice[pid];
    if (!pd) continue;
    const ps = analyzeUserInProject(username, pd);
    const hasAny =
      ps.commits > 0 ||
      ps.prs.length > 0 ||
      ps.issues_opened.length > 0 ||
      ps.pr_reviews_given > 0 ||
      ps.code_review_comments > 0 ||
      ps.issue_comments_given.length > 0;
    if (!hasAny) continue;
    userStats.commits += ps.commits;
    userStats.prs.push(...ps.prs);
    userStats.pr_reviews_given += ps.pr_reviews_given;
    userStats.code_review_comments += ps.code_review_comments;
    userStats.issues_opened.push(...ps.issues_opened);
    userStats.issue_comments_given.push(...ps.issue_comments_given);
    userStats.quality_metrics.has_tests += ps.quality_metrics.has_tests;
    userStats.quality_metrics.has_docs += ps.quality_metrics.has_docs;
    userStats.quality_metrics.zero_revisions +=
      ps.quality_metrics.zero_revisions;
    const firstMonth = earliestMap.get(pid);
    if (firstMonth === monthKey) userStats.projectsWorkingOn++;
  }
  const s = calculateScore(userStats);
  return s.total > 0 ? s : null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main() {
  const targetUser = process.argv[2] || null;

  const cachedData = JSON.parse(
    fs.readFileSync(path.resolve(INPUT.cache), "utf8")
  );
  const contributors = JSON.parse(
    fs.readFileSync(path.resolve(INPUT.contributors), "utf8")
  );
  const contributorMapping = JSON.parse(
    fs.readFileSync(path.resolve(INPUT.contributorMapping), "utf8")
  );

  const allMonths = getAllMonthKeys(cachedData);

  const allProjectIds = new Set(SPECIAL_PROJECT_IDS);
  for (const ids of Object.values(contributorMapping))
    for (const id of ids) allProjectIds.add(id);

  const usersToCheck = targetUser
    ? contributors.filter((c) => c.login === targetUser)
    : contributors;

  let overcountCount = 0,
    undercountCount = 0,
    exactCount = 0;

  console.log(
    `\nChecking ${usersToCheck.length} contributor(s) across ${allMonths.length} months`
  );
  console.log(
    `Month range: ${allMonths[0]} → ${allMonths[allMonths.length - 1]}`
  );
  console.log("=".repeat(90));

  for (const contributor of usersToCheck) {
    const username = contributor.login;
    const userProjectIds = Array.from(
      new Set([...(contributorMapping[username] || []), ...SPECIAL_PROJECT_IDS])
    );

    const allTimeResult = computeAllTimeScore(
      username,
      cachedData,
      userProjectIds
    );
    if (!allTimeResult) continue;
    const { score: allTime, numProjects: allTimeProjects } = allTimeResult;

    const earliestMap = buildEarliestContributionMap(
      cachedData,
      username,
      userProjectIds
    );

    let monthlySum = 0;
    let monthlyProjectSum = 0;
    const activeMonths = [];

    for (const mk of allMonths) {
      const m = computeMonthlyScore(
        username,
        cachedData,
        userProjectIds,
        mk,
        earliestMap
      );
      if (!m) continue;
      monthlySum += m.total;
      monthlyProjectSum += m.breakdown.projects_score;
      activeMonths.push({
        month: mk,
        total: m.total,
        proj: m.breakdown.projects_score,
      });
    }

    const diff = monthlySum - allTime.total;

    if (diff !== 0 || targetUser) {
      if (diff > 0) overcountCount++;
      else if (diff < 0) undercountCount++;

      console.log(`\n👤  ${username}`);
      console.log(
        `    All-time total_score  : ${allTime.total}  (${allTimeProjects} projects, projects_score=${allTime.breakdown.projects_score})`
      );
      console.log(
        `    Monthly sum (all time): ${monthlySum}  (monthly projects_score sum=${monthlyProjectSum})`
      );
      console.log(`    Diff (monthly − all)  : ${diff > 0 ? "+" : ""}${diff}`);
      if (diff !== 0) {
        console.log(`    ── All-time breakdown ──`);
        for (const [k, v] of Object.entries(allTime.breakdown)) {
          console.log(`       ${k.padEnd(22)}: ${v}`);
        }
        console.log(`    ── Active months ──`);
        for (const row of activeMonths) {
          if (row.total > 0)
            console.log(
              `       ${row.month}: total=${row.total}  proj_bonus=${row.proj}`
            );
        }
        // Identify likely cause
        const projDiff = allTime.breakdown.projects_score - monthlyProjectSum;
        if (projDiff !== 0) {
          console.log(
            `\n    ⚠️  Project-bonus gap: all-time=${allTime.breakdown.projects_score}, monthly-sum=${monthlyProjectSum}, diff=${projDiff}`
          );
          console.log(
            `       Cause: buildEarliestContributionMap missed projects where only`
          );
          console.log(
            `              reviews / code-comments / issue-comments exist (no commit/PR/issue authored).`
          );
        }
        const roundingCause = diff > 0 && projDiff === 0;
        if (roundingCause) {
          console.log(
            `\n    ⚠️  Rounding bias: per-month Math.round overcounting (check PR multipliers).`
          );
        }
      }
    } else {
      exactCount++;
    }
  }

  console.log("\n" + "=".repeat(90));
  console.log(`\nSummary:`);
  console.log(`  Exact (monthly sum = all-time)  : ${exactCount}`);
  console.log(
    `  Overcounting (monthly > all-time): ${overcountCount}  ← rounding bias`
  );
  console.log(
    `  Undercounting (all-time > monthly): ${undercountCount}  ← project-bonus gap`
  );
}

main();
