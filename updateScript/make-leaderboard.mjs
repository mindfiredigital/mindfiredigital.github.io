import fs from "fs";
import path from "path";
import logger from "../src/app/utils/logger.mjs";

/* CONFIGURATION */

const CONFIG = {
  INPUT_FILES: {
    contributors: "./src/asset/contributors.json",
    projects: "./src/asset/projects.json",
    contributorMapping: "./src/asset/contributor-mapping.json",
    cachedData: "./src/asset/leaderboard-cache.json",
  },

  OUTPUT_FILES: {
    leaderboard: "./src/asset/leaderboard.json",
    topScorers: "./src/asset/top-scorers.json",
    monthlyArchiveDir: "./public/leaderboard",
    manifest: "./public/leaderboard/manifest.json",
    scoringBundle: "./public/leaderboard/scoring-bundle.json",
  },

  SPECIAL_PROJECT_IDS: ["special-website"],
};

/* SCORING SYSTEM */

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

/* HELPERS */

function readJsonFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      logger.warn(`File not found: ${filePath}`);
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    logger.error(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    logger.info(`Successfully wrote to ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Error writing to ${filePath}: ${error.message}`);
    return false;
  }
}

/* APPLY MONTHLY CAPS — uses UTC so it matches toMonthKey() exactly */

function applyMonthlyCaps(items, cap, dateField = "created_at") {
  const byMonth = {};
  for (const item of items) {
    const d = new Date(item[dateField]);
    const monthKey = `${d.getUTCFullYear()}-${String(
      d.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    if (!byMonth[monthKey]) byMonth[monthKey] = [];
    byMonth[monthKey].push(item);
  }
  const capped = [];
  for (const month in byMonth) capped.push(...byMonth[month].slice(0, cap));
  return capped;
}

/* ANALYZE USER IN PROJECT */

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
      (commit) =>
        commit.author_login === username ||
        commit.author_name?.toLowerCase().includes(username.toLowerCase())
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
        changed_files: pr.changed_files || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        reviews_count: pr.reviews_count || 0,
      });

      if (
        pr.title?.toLowerCase().includes("test") ||
        pr.title?.toLowerCase().includes("spec")
      ) {
        stats.quality_metrics.has_tests++;
      }
      if (
        pr.title?.toLowerCase().includes("doc") ||
        pr.title?.toLowerCase().includes("readme") ||
        pr.title?.toLowerCase().includes("documentation")
      ) {
        stats.quality_metrics.has_docs++;
      }
      if (pr.reviews_count === 0) {
        stats.quality_metrics.zero_revisions++;
      }
    }
  }

  if (projectData.merged_prs) {
    for (const pr of projectData.merged_prs) {
      if (pr.reviews) {
        stats.pr_reviews_given += pr.reviews.filter(
          (r) => r.reviewer === username
        ).length;
      }
      if (pr.review_comments) {
        stats.code_review_comments += pr.review_comments.filter(
          (c) => c.author === username
        ).length;
      }
    }
  }

  if (projectData.issues) {
    stats.issues_opened = [
      ...projectData.issues.bugs.filter((i) => i.author === username),
      ...projectData.issues.enhancements.filter((i) => i.author === username),
      ...projectData.issues.documentation.filter((i) => i.author === username),
      ...projectData.issues.others.filter((i) => i.author === username),
    ];
  }

  if (projectData.issues) {
    const allIssues = [
      ...projectData.issues.bugs,
      ...projectData.issues.enhancements,
      ...projectData.issues.documentation,
      ...projectData.issues.others,
    ];

    for (const issue of allIssues) {
      if (!issue.comment_authors) continue;
      if (issue.author === username) continue;
      for (const comment of issue.comment_authors) {
        if (comment.author === username) {
          stats.issue_comments_given.push({ created_at: comment.created_at });
        }
      }
    }
  }

  return stats;
}

/* CALCULATE SCORE */

function calculateScore(userStats) {
  let prScore = 0;
  for (const pr of userStats.prs) {
    // Round per-PR so medium (6.5) and large (8.5) contribute integers.
    // Without this, Math.round on the total accumulates rounding bias across
    // months, causing monthly sums to exceed the all-time score by 1 pt per
    // month that has an odd count of medium+large PRs.
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
  ).reduce((sum, bonus) => sum + bonus, 0);

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
      pr_score: Math.round(prScore),
      commits_score: userStats.commits * SCORING.COMMIT,
      pr_reviews_score: userStats.pr_reviews_given * SCORING.PR_REVIEW_GIVEN,
      code_comments_score:
        userStats.code_review_comments * SCORING.CODE_REVIEW_COMMENT,
      issues_opened_score: cappedIssues.length * SCORING.ISSUE_OPENED,
      issue_comments_score: cappedIssueComments.length * SCORING.ISSUE_COMMENT,
      projects_score: projectDiversityScore,
      tests_score: userStats.quality_metrics.has_tests * SCORING.HAS_TESTS,
      docs_score: userStats.quality_metrics.has_docs * SCORING.HAS_DOCS,
      mentor_score:
        userStats.quality_metrics.first_time_mentor * SCORING.FIRST_TIME_MENTOR,
      zero_revisions_score:
        userStats.quality_metrics.zero_revisions * SCORING.ZERO_REVISIONS,
      impact_bonus_score: impactBonusTotal,
    },
    prs_by_complexity: {
      small: userStats.prs.filter((p) => p.complexity === "small").length,
      medium: userStats.prs.filter((p) => p.complexity === "medium").length,
      large: userStats.prs.filter((p) => p.complexity === "large").length,
    },
    capped_counts: {
      issues_opened: cappedIssues.length,
      issues_total: userStats.issues_opened.length,
      issue_comments: cappedIssueComments.length,
      issue_comments_total: userStats.issue_comments_given.length,
    },
  };
}

/* MONTHLY HELPERS */

function toMonthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getAllMonthKeys(cachedData) {
  const keys = new Set();
  for (const projectData of Object.values(cachedData)) {
    for (const commit of projectData.commits || []) {
      const k = toMonthKey(commit.date);
      if (k) keys.add(k);
    }
    for (const pr of projectData.merged_prs || []) {
      const k = toMonthKey(pr.merged_at);
      if (k) keys.add(k);
    }
    for (const category of [
      "bugs",
      "enhancements",
      "documentation",
      "others",
    ]) {
      for (const issue of projectData.issues?.[category] || []) {
        const k = toMonthKey(issue.created_at);
        if (k) keys.add(k);
      }
    }
  }
  return Array.from(keys).sort();
}

function sliceIssues(issues, monthKey) {
  const result = [];
  for (const issue of issues) {
    if (toMonthKey(issue.created_at) !== monthKey) continue;
    result.push({ ...issue, comment_authors: issue.comment_authors || [] });
  }
  return result;
}

function sliceCachedDataToMonth(cachedData, monthKey) {
  const sliced = {};
  for (const [projectId, projectData] of Object.entries(cachedData)) {
    sliced[projectId] = {
      ...projectData,
      commits: (projectData.commits || []).filter(
        (c) => toMonthKey(c.date) === monthKey
      ),
      merged_prs: (projectData.merged_prs || []).filter(
        (pr) => toMonthKey(pr.merged_at) === monthKey
      ),
      issues: {
        bugs: sliceIssues(projectData.issues?.bugs || [], monthKey),
        enhancements: sliceIssues(
          projectData.issues?.enhancements || [],
          monthKey
        ),
        documentation: sliceIssues(
          projectData.issues?.documentation || [],
          monthKey
        ),
        others: sliceIssues(projectData.issues?.others || [], monthKey),
      },
    };
  }
  return sliced;
}

function buildEarliestContributionMap(cachedData, contributors, allProjectIds) {
  const map = new Map();

  for (const contributor of contributors) {
    const username = contributor.login;
    const projectMap = new Map();

    for (const projectId of allProjectIds) {
      const projectData = cachedData[projectId];
      if (!projectData) continue;

      const dates = [];

      for (const commit of projectData.commits || []) {
        if (
          commit.author_login === username ||
          commit.author_name?.toLowerCase().includes(username.toLowerCase())
        ) {
          if (commit.date) dates.push(commit.date);
        }
      }
      for (const pr of projectData.merged_prs || []) {
        if (pr.author === username && pr.merged_at) dates.push(pr.merged_at);
      }
      for (const category of [
        "bugs",
        "enhancements",
        "documentation",
        "others",
      ]) {
        for (const issue of projectData.issues?.[category] || []) {
          if (issue.author === username && issue.created_at)
            dates.push(issue.created_at);
        }
      }

      if (dates.length > 0) {
        dates.sort();
        projectMap.set(projectId, toMonthKey(dates[0]));
      }
    }

    map.set(username, projectMap);
  }

  return map;
}

/* AGGREGATE MONTHLY → ALL-TIME */

function aggregateMonthlyToAllTime(monthlyRowsByUser, contributors) {
  logger.info("=".repeat(80));
  logger.info("AGGREGATING MONTHLY → ALL-TIME");
  logger.info("=".repeat(80));

  const contribMap = new Map(contributors.map((c) => [c.login, c]));
  const leaderboardData = [];

  for (const [username, rows] of monthlyRowsByUser) {
    if (rows.length === 0) continue;
    const contributor = contribMap.get(username);

    const totalCommits = rows.reduce((s, r) => s + r.totalCommits, 0);
    const totalPRs = rows.reduce((s, r) => s + r.totalPRs, 0);
    const totalPRReviewsGiven = rows.reduce((s, r) => s + r.totalPRReviewsGiven, 0);
    const totalCodeReviewComments = rows.reduce((s, r) => s + r.totalCodeReviewComments, 0);
    const totalIssuesOpened = rows.reduce((s, r) => s + r.totalIssuesOpened, 0);
    const totalIssueComments = rows.reduce((s, r) => s + r.totalIssueComments, 0);

    // All-time project count = sum of NEW projects per month (each counted once)
    const projectsWorkingOn = rows.reduce((s, r) => s + r.newProjectsThisMonth, 0);
    const projects = [...new Set(rows.flatMap((r) => r.projects || []))].sort();

    const prs_by_complexity = {
      small: rows.reduce((s, r) => s + r.prs_by_complexity.small, 0),
      medium: rows.reduce((s, r) => s + r.prs_by_complexity.medium, 0),
      large: rows.reduce((s, r) => s + r.prs_by_complexity.large, 0),
    };

    // Scores: all-time = sum of monthly (guarantees all-time = Σ monthly by construction)
    const total_score = rows.reduce((s, r) => s + r.total_score, 0);
    const code_score = rows.reduce((s, r) => s + r.code_score, 0);
    const community_score = rows.reduce((s, r) => s + r.community_score, 0);
    const quality_score = rows.reduce((s, r) => s + r.quality_score, 0);

    const score_breakdown = {
      pr_score: rows.reduce((s, r) => s + r.score_breakdown.pr_score, 0),
      commits_score: rows.reduce((s, r) => s + r.score_breakdown.commits_score, 0),
      pr_reviews_score: rows.reduce((s, r) => s + r.score_breakdown.pr_reviews_score, 0),
      code_comments_score: rows.reduce((s, r) => s + r.score_breakdown.code_comments_score, 0),
      issues_opened_score: rows.reduce((s, r) => s + r.score_breakdown.issues_opened_score, 0),
      issue_comments_score: rows.reduce((s, r) => s + r.score_breakdown.issue_comments_score, 0),
      projects_score: rows.reduce((s, r) => s + r.score_breakdown.projects_score, 0),
      tests_score: rows.reduce((s, r) => s + r.score_breakdown.tests_score, 0),
      docs_score: rows.reduce((s, r) => s + r.score_breakdown.docs_score, 0),
      mentor_score: rows.reduce((s, r) => s + r.score_breakdown.mentor_score, 0),
      zero_revisions_score: rows.reduce((s, r) => s + r.score_breakdown.zero_revisions_score, 0),
      impact_bonus_score: rows.reduce((s, r) => s + r.score_breakdown.impact_bonus_score, 0),
    };

    leaderboardData.push({
      rank: 0,
      username,
      id: contributor?.id ?? 0,
      avatar_url: contributor?.avatar_url ?? "",
      html_url: contributor?.html_url ?? "",
      totalCommits,
      totalPRs,
      totalPRReviewsGiven,
      totalCodeReviewComments,
      totalIssuesOpened,
      totalIssueComments,
      avgCommitsPerPR:
        totalPRs > 0 ? parseFloat((totalCommits / totalPRs).toFixed(2)) : 0,
      projectsWorkingOn,
      prs_by_complexity,
      total_score,
      code_score,
      community_score,
      quality_score,
      score_breakdown,
      projects,
      lastActiveDays: contributor?.lastActiveDays ?? null,
    });
  }

  leaderboardData.sort((a, b) => b.total_score - a.total_score);
  leaderboardData.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  logger.info(
    `Aggregated ${leaderboardData.length} contributors from monthly data`
  );
  return leaderboardData;
}

/* GENERATE MONTHLY BREAKDOWN FROM CACHE */

function generateMonthlyBreakdownFromCache(
  contributors,
  contributorMapping,
  cachedData
) {
  logger.info("=".repeat(80));
  logger.info("GENERATING MONTHLY BREAKDOWN FROM CACHE");
  logger.info("=".repeat(80));

  const allMonths = getAllMonthKeys(cachedData);
  if (allMonths.length === 0) {
    logger.warn("No month keys found in cache — skipping monthly breakdown");
    return new Map();
  }

  logger.info(
    `Found ${allMonths.length} months: ${allMonths[0]} → ${
      allMonths[allMonths.length - 1]
    }`
  );

  const allProjectIds = new Set(CONFIG.SPECIAL_PROJECT_IDS);
  for (const ids of Object.values(contributorMapping)) {
    for (const id of ids) allProjectIds.add(id);
  }

  const earliestMap = buildEarliestContributionMap(
    cachedData,
    contributors,
    Array.from(allProjectIds)
  );

  const projectTitleById = {};
  for (const [projectId, projectData] of Object.entries(cachedData)) {
    if (projectData.project_title)
      projectTitleById[projectId] = projectData.project_title;
  }

  // Accumulates every monthly row per contributor for aggregation later
  const monthlyRowsByUser = new Map();

  for (const monthKey of allMonths) {
    logger.info(`Scoring ${monthKey}...`);
    const monthSlice = sliceCachedDataToMonth(cachedData, monthKey);
    const monthResults = [];

    for (const contributor of contributors) {
      const username = contributor.login;
      const userMappedProjectIds = contributorMapping[username] || [];
      const userProjectIds = Array.from(
        new Set([...userMappedProjectIds, ...CONFIG.SPECIAL_PROJECT_IDS])
      );

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

      const activeProjectTitles = [];
      const userEarliestMap = earliestMap.get(username) || new Map();

      for (const projectId of userProjectIds) {
        const projectData = monthSlice[projectId];
        if (!projectData) continue;

        const projectStats = analyzeUserInProject(username, projectData);

        const hasContributions =
          projectStats.commits > 0 ||
          projectStats.prs.length > 0 ||
          projectStats.issues_opened.length > 0 ||
          projectStats.pr_reviews_given > 0 ||
          projectStats.code_review_comments > 0 ||
          projectStats.issue_comments_given.length > 0;

        if (!hasContributions) continue;

        const title = projectTitleById[projectId] || projectId;
        activeProjectTitles.push(title);

        userStats.commits += projectStats.commits;
        userStats.prs.push(...projectStats.prs);
        userStats.pr_reviews_given += projectStats.pr_reviews_given;
        userStats.code_review_comments += projectStats.code_review_comments;
        userStats.issues_opened.push(...projectStats.issues_opened);
        userStats.issue_comments_given.push(
          ...projectStats.issue_comments_given
        );
        userStats.quality_metrics.has_tests +=
          projectStats.quality_metrics.has_tests;
        userStats.quality_metrics.has_docs +=
          projectStats.quality_metrics.has_docs;
        userStats.quality_metrics.zero_revisions +=
          projectStats.quality_metrics.zero_revisions;

        const firstMonth = userEarliestMap.get(projectId);
        if (firstMonth === monthKey) userStats.projectsWorkingOn++;
      }

      const scoreData = calculateScore(userStats);
      if (scoreData.total === 0) continue;

      const row = {
        rank: 0,
        username,
        id: contributor.id,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
        totalCommits: userStats.commits,
        totalPRs: userStats.prs.length,
        totalPRReviewsGiven: userStats.pr_reviews_given,
        totalCodeReviewComments: userStats.code_review_comments,
        totalIssuesOpened: userStats.issues_opened.length,
        totalIssueComments: scoreData.capped_counts.issue_comments,
        avgCommitsPerPR:
          userStats.prs.length > 0
            ? parseFloat((userStats.commits / userStats.prs.length).toFixed(2))
            : 0,
        projectsWorkingOn: activeProjectTitles.length,
        projects: activeProjectTitles,
        newProjectsThisMonth: userStats.projectsWorkingOn,
        prs_by_complexity: scoreData.prs_by_complexity,
        total_score: scoreData.total,
        code_score: scoreData.code_score,
        community_score: scoreData.community_score,
        quality_score: scoreData.quality_score,
        score_breakdown: scoreData.breakdown,
        capped_counts: scoreData.capped_counts,
        lastActiveDays: contributor.lastActiveDays ?? null,
      };
      monthResults.push(row);
      if (!monthlyRowsByUser.has(username)) monthlyRowsByUser.set(username, []);
      monthlyRowsByUser.get(username).push(row);
    }

    monthResults.sort((a, b) => b.total_score - a.total_score);
    monthResults.forEach((c, i) => {
      c.rank = i + 1;
    });

    const [year, month] = monthKey.split("-");
    const monthLabel = new Date(
      Number(year),
      Number(month) - 1,
      1
    ).toLocaleString("default", { month: "long", year: "numeric" });

    const payload = {
      generated_at: new Date().toISOString(),
      period: "monthly",
      month_label: monthLabel,
      month_key: monthKey,
      total_contributors: monthResults.length,
      leaderboard: monthResults,
    };

    const filePath = path.join(
      CONFIG.OUTPUT_FILES.monthlyArchiveDir,
      `leaderboard-${monthKey}.json`
    );
    writeJsonFile(filePath, payload);

    if (monthResults[0]) {
      logger.info(
        `   🥇 ${monthResults[0].username} — ${monthResults[0].total_score} pts (${monthResults.length} active contributors)`
      );
    } else {
      logger.info(`   No active contributors`);
    }
  }

  const manifest = {
    months: Array.from(allMonths).reverse(),
    updated_at: new Date().toISOString(),
  };
  writeJsonFile(CONFIG.OUTPUT_FILES.manifest, manifest);
  logger.info(`manifest.json written — ${allMonths.length} months indexed`);

  return monthlyRowsByUser;
}

/* DISPLAY TOP SCORERS */

function displayTopScorers(leaderboard, topN = 10) {
  logger.info("=".repeat(80));
  logger.info(`TOP ${topN} CONTRIBUTORS`);
  logger.info("=".repeat(80));

  leaderboard.slice(0, topN).forEach((contributor, index) => {
    const rank = index + 1;
    logger.info(`${rank}. ${contributor.username}`);
    logger.info(
      `   Total Score: ${contributor.total_score} (Rank #${contributor.rank})`
    );
    logger.info(
      `   Code:      ${contributor.code_score} (PRs: ${contributor.score_breakdown.pr_score}, Commits: ${contributor.score_breakdown.commits_score}, Reviews: ${contributor.score_breakdown.pr_reviews_score})`
    );
    logger.info(
      `   Community: ${contributor.community_score} (Issues: ${contributor.score_breakdown.issues_opened_score}, Comments: ${contributor.score_breakdown.issue_comments_score}, Projects: ${contributor.score_breakdown.projects_score})`
    );
    logger.info(
      `   Quality:   ${contributor.quality_score} (Tests: ${contributor.score_breakdown.tests_score}, Docs: ${contributor.score_breakdown.docs_score}, ZeroRev: ${contributor.score_breakdown.zero_revisions_score})`
    );
    logger.info(
      `   Metrics: ${contributor.totalCommits} commits, ${contributor.totalPRs} PRs (S:${contributor.prs_by_complexity.small} M:${contributor.prs_by_complexity.medium} L:${contributor.prs_by_complexity.large}), ${contributor.totalPRReviewsGiven} reviews, ${contributor.projectsWorkingOn} projects`
    );
  });

  logger.info("=".repeat(80));
}

/* MAIN */

function main() {
  try {
    logger.info("Starting Leaderboard Generation...");

    // Load raw inputs (contributors / mapping / cache)
    const contributors = readJsonFile(CONFIG.INPUT_FILES.contributors) || [];
    const contributorMapping =
      readJsonFile(CONFIG.INPUT_FILES.contributorMapping) || {};
    const cachedData = readJsonFile(CONFIG.INPUT_FILES.cachedData) || {};

    logger.info(`Loaded:`);
    logger.info(`   Contributors: ${contributors.length}`);
    logger.info(`   Cached Projects: ${Object.keys(cachedData).length}`);

    // Step 1: generate + write all monthly archive files, collect rows per user
    const monthlyRowsByUser = generateMonthlyBreakdownFromCache(
      contributors,
      contributorMapping,
      cachedData
    );

    // Step 2: all-time = sum of monthly (guaranteed consistent by construction)
    const leaderboardData = aggregateMonthlyToAllTime(
      monthlyRowsByUser,
      contributors
    );

    const summary = {
      total_contributors: leaderboardData.length,
      total_commits: leaderboardData.reduce((sum, c) => sum + c.totalCommits, 0),
      total_prs: leaderboardData.reduce((sum, c) => sum + c.totalPRs, 0),
      total_pr_reviews: leaderboardData.reduce(
        (sum, c) => sum + c.totalPRReviewsGiven,
        0
      ),
      total_issues: leaderboardData.reduce(
        (sum, c) => sum + c.totalIssuesOpened,
        0
      ),
      avg_score:
        leaderboardData.length > 0
          ? Math.round(
              leaderboardData.reduce((sum, c) => sum + c.total_score, 0) /
                leaderboardData.length
            )
          : 0,
    };

    const outputData = {
      generated_at: new Date().toISOString(),
      scoring_formula: {
        description:
          "Total_Score = Code_Score + Community_Score + Quality_Score",
        code_formula:
          "(ΣPR × 5 × complexity) + (ΣCommits × 2) + (ΣReviews × 3) + (ΣComments × 1)",
        community_formula:
          "(ΣIssues × 2) [cap: 10/month] + (ΣIssue_Comments × 1) [cap: 20/month] + (ΣProjects × 10)",
        quality_formula:
          "Impact_bonuses + Tests×1 + Docs×1 + Mentor×5 + ZeroRevisions×2",
        note: "PRs and commits counted only on default branch. Monthly project diversity bonus awarded only in the first month a contributor joins a project. All month boundaries use UTC.",
      },
      scoring_weights: SCORING,
      summary,
      leaderboard: leaderboardData,
    };

    writeJsonFile(CONFIG.OUTPUT_FILES.leaderboard, outputData);

    const top50 = {
      generated_at: new Date().toISOString(),
      scoring_weights: SCORING,
      top_scorers: leaderboardData.slice(0, 50),
    };
    writeJsonFile(CONFIG.OUTPUT_FILES.topScorers, top50);

    displayTopScorers(leaderboardData, 10);

    logger.info("SUMMARY:");
    logger.info(`   Contributors: ${summary.total_contributors}`);
    logger.info(`   Commits:      ${summary.total_commits}`);
    logger.info(`   PRs:          ${summary.total_prs}`);
    logger.info(`   PR Reviews:   ${summary.total_pr_reviews}`);
    logger.info(`   Issues:       ${summary.total_issues}`);
    logger.info(`   Avg Score:    ${summary.avg_score}`);
    logger.info(
      `   Top Score:    ${leaderboardData[0]?.total_score || 0} (${
        leaderboardData[0]?.username || "N/A"
      })`
    );

    // Step 3: build compact scoring bundle for client-side range queries
    generateScoringBundle(contributors, contributorMapping, cachedData);

    logger.info("Done!");

    return leaderboardData;
  } catch (error) {
    logger.error(`Fatal error: ${error}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

/* GENERATE SCORING BUNDLE FOR CLIENT-SIDE RANGE QUERIES */

function generateScoringBundle(contributors, contributorMapping, cachedData) {
  logger.info("=".repeat(80));
  logger.info("GENERATING SCORING BUNDLE");
  logger.info("=".repeat(80));

  const allProjectIds = new Set(CONFIG.SPECIAL_PROJECT_IDS);
  for (const ids of Object.values(contributorMapping)) {
    for (const id of ids) allProjectIds.add(id);
  }

  // Build earliest-join map (same logic as monthly breakdown)
  const earliestMap = buildEarliestContributionMap(
    cachedData,
    contributors,
    Array.from(allProjectIds)
  );

  const bundle = {};

  for (const contributor of contributors) {
    const username = contributor.login;
    const userProjectIds = Array.from(
      new Set([...(contributorMapping[username] || []), ...CONFIG.SPECIAL_PROJECT_IDS])
    );
    const userEarliestMap = earliestMap.get(username) || new Map();

    const commits = [];
    const prs = [];
    const reviews = [];
    const codeComments = [];
    const issues = [];
    const issueComments = [];
    const projectFirsts = [];

    // Collect the first-join date for every project this user has contributed to
    for (const [pid, firstMonthKey] of userEarliestMap) {
      const pd = cachedData[pid];
      if (!pd) continue;

      // Find the exact earliest date (not just month key) for this project
      const dates = [];
      for (const c of pd.commits || []) {
        if (
          (c.author_login === username ||
            c.author_name?.toLowerCase().includes(username.toLowerCase())) &&
          c.date
        )
          dates.push(c.date);
      }
      for (const pr of pd.merged_prs || []) {
        if (pr.author === username && pr.merged_at) dates.push(pr.merged_at);
      }
      for (const cat of ["bugs", "enhancements", "documentation", "others"]) {
        for (const issue of pd.issues?.[cat] || []) {
          if (issue.author === username && issue.created_at)
            dates.push(issue.created_at);
        }
      }
      if (dates.length > 0) {
        dates.sort();
        projectFirsts.push({
          d: dates[0],
          title: pd.project_title || pid,
          firstMonthKey,
        });
      }
    }

    // Collect all contribution events from every user project
    for (const pid of userProjectIds) {
      const pd = cachedData[pid];
      if (!pd) continue;

      for (const c of pd.commits || []) {
        if (
          c.author_login === username ||
          c.author_name?.toLowerCase().includes(username.toLowerCase())
        ) {
          if (c.date) commits.push(c.date);
        }
      }

      for (const pr of pd.merged_prs || []) {
        if (pr.author !== username || !pr.merged_at) continue;
        const multiplier = pr.complexity_multiplier || 1.0;
        const complexity = pr.complexity || "small";
        const pts = Math.round(SCORING.PR_MERGED_BASE * multiplier);
        const zr = (pr.reviews_count || 0) === 0;
        const hasTest =
          pr.title?.toLowerCase().includes("test") ||
          pr.title?.toLowerCase().includes("spec") ||
          false;
        const hasDoc =
          pr.title?.toLowerCase().includes("doc") ||
          pr.title?.toLowerCase().includes("readme") ||
          pr.title?.toLowerCase().includes("documentation") ||
          false;
        prs.push({ d: pr.merged_at, pts, c: complexity, zr, t: hasTest, doc: hasDoc });
      }

      // PR reviews given
      for (const pr of pd.merged_prs || []) {
        if (pr.reviews) {
          for (const r of pr.reviews) {
            if (r.reviewer === username && r.submitted_at)
              reviews.push(r.submitted_at);
          }
        }
        // Code review comments
        if (pr.review_comments) {
          for (const rc of pr.review_comments) {
            if (rc.author === username && rc.created_at)
              codeComments.push(rc.created_at);
          }
        }
      }

      // Issues opened
      for (const cat of ["bugs", "enhancements", "documentation", "others"]) {
        for (const issue of pd.issues?.[cat] || []) {
          if (issue.author === username && issue.created_at)
            issues.push(issue.created_at);
          // Issue comments by this user on other people's issues
          if (issue.author !== username && issue.comment_authors) {
            for (const c of issue.comment_authors) {
              if (c.author === username && c.created_at)
                issueComments.push(c.created_at);
            }
          }
        }
      }
    }

    if (
      commits.length + prs.length + reviews.length + codeComments.length +
      issues.length + issueComments.length === 0
    )
      continue;

    bundle[username] = {
      id: contributor.id,
      avatar_url: contributor.avatar_url,
      html_url: contributor.html_url,
      lastActiveDays: contributor.lastActiveDays ?? null,
      commits,
      prs,
      reviews,
      codeComments,
      issues,
      issueComments,
      projectFirsts,
    };
  }

  const output = {
    generated_at: new Date().toISOString(),
    scoring_weights: {
      COMMIT: SCORING.COMMIT,
      PR_REVIEW_GIVEN: SCORING.PR_REVIEW_GIVEN,
      CODE_REVIEW_COMMENT: SCORING.CODE_REVIEW_COMMENT,
      ISSUE_OPENED: SCORING.ISSUE_OPENED,
      ISSUE_COMMENT: SCORING.ISSUE_COMMENT,
      HAS_TESTS: SCORING.HAS_TESTS,
      HAS_DOCS: SCORING.HAS_DOCS,
      FIRST_TIME_MENTOR: SCORING.FIRST_TIME_MENTOR,
      ZERO_REVISIONS: SCORING.ZERO_REVISIONS,
      PROJECT_DIVERSITY: SCORING.PROJECT_DIVERSITY,
      CAPS: SCORING.CAPS,
    },
    contributors: bundle,
  };

  writeJsonFile(CONFIG.OUTPUT_FILES.scoringBundle, output);
  logger.info(
    `Scoring bundle written — ${Object.keys(bundle).length} contributors`
  );
}

main();
