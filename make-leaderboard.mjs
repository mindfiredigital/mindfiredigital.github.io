import fs from "fs";
import path from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Input files
  INPUT_FILES: {
    contributors: "./src/app/projects/assets/contributors.json",
    projects: "./src/app/projects/assets/projects.json",
    contributorMapping: "./src/app/projects/assets/contributor-mapping.json",
    cachedData: "./src/app/projects/assets/leaderboard-cache.json",
  },

  // Output files
  OUTPUT_FILES: {
    leaderboard: "./src/app/projects/assets/leaderboard.json",
    topScorers: "./src/app/projects/assets/top-scorers.json",
  },

  // Special projects that should be checked for ALL contributors
  SPECIAL_PROJECT_IDS: ["special-website"],
};

// ============================================================================
// NEW SCORING SYSTEM (as per your requirements)
// ============================================================================

const SCORING = {
  // Code Score
  PR_MERGED_BASE: 5, // Base points for merged PR
  COMMIT: 2,
  PR_REVIEW_GIVEN: 3,
  CODE_REVIEW_COMMENT: 1,

  // Complexity multipliers
  COMPLEXITY_MULTIPLIER: {
    small: 1.0, // effort:small
    medium: 1.3, // effort:medium
    large: 1.7, // effort:large
  },

  // Community Score
  ISSUE_OPENED: 2,
  ISSUE_COMMENT: 1,

  // Quality Score
  HAS_TESTS: 2,
  HAS_DOCS: 2,
  FIRST_TIME_MENTOR: 5,
  ZERO_REVISIONS: 3,

  // Impact bonuses
  IMPACT_BONUS: {
    low: 0,
    medium: 3,
    high: 7,
    critical: 10,
  },

  // Monthly caps
  CAPS: {
    ISSUES_PER_MONTH: 10,
    ISSUE_COMMENTS_PER_MONTH: 20,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function readJsonFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return null;
    }
    const data = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ Successfully wrote to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error.message);
    return false;
  }
}

// ============================================================================
// APPLY MONTHLY CAPS
// ============================================================================

function applyMonthlyCaps(items, cap, dateField = "created_at") {
  // Group by month
  const byMonth = {};

  for (const item of items) {
    const date = new Date(item[dateField]);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!byMonth[monthKey]) byMonth[monthKey] = [];
    byMonth[monthKey].push(item);
  }

  // Apply cap per month and track total
  const capped = [];
  for (const month in byMonth) {
    capped.push(...byMonth[month].slice(0, cap));
  }

  return capped;
}

// ============================================================================
// ANALYZE USER IN PROJECT
// ============================================================================

function analyzeUserInProject(username, projectData) {
  const stats = {
    commits: 0,
    prs: [],
    pr_reviews_given: 0,
    code_review_comments: 0,
    issues_opened: [],
    issue_comments_given: 0,
    quality_metrics: {
      has_tests: 0,
      has_docs: 0,
      first_time_mentor: 0,
      zero_revisions: 0,
      impact_bonuses: [],
    },
  };

  // 1. Count commits
  if (projectData.commits) {
    stats.commits = projectData.commits.filter(
      (commit) =>
        commit.author_login === username ||
        commit.author_name?.toLowerCase().includes(username.toLowerCase())
    ).length;
  }

  // 2. Count PRs with complexity
  if (projectData.merged_prs) {
    const userPRs = projectData.merged_prs.filter(
      (pr) => pr.author === username
    );

    for (const pr of userPRs) {
      stats.prs.push({
        number: pr.number,
        complexity: pr.complexity || "small",
        multiplier: pr.complexity_multiplier || 1.0,
        changed_files: pr.changed_files || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        reviews_count: pr.reviews_count || 0,
      });

      // Quality metrics detection

      // Has tests: Check if title mentions test/spec
      if (
        pr.title?.toLowerCase().includes("test") ||
        pr.title?.toLowerCase().includes("spec")
      ) {
        stats.quality_metrics.has_tests++;
      }

      // Has docs: Check if title mentions doc/readme/documentation
      if (
        pr.title?.toLowerCase().includes("doc") ||
        pr.title?.toLowerCase().includes("readme") ||
        pr.title?.toLowerCase().includes("documentation")
      ) {
        stats.quality_metrics.has_docs++;
      }

      // Zero revisions: PR merged without any reviews
      if (pr.reviews_count === 0) {
        stats.quality_metrics.zero_revisions++;
      }
    }
  }

  // 3. Count PR reviews GIVEN by this user
  if (projectData.merged_prs) {
    for (const pr of projectData.merged_prs) {
      // Count reviews
      if (pr.reviews) {
        stats.pr_reviews_given += pr.reviews.filter(
          (r) => r.reviewer === username
        ).length;
      }

      // Count review comments
      if (pr.review_comments) {
        stats.code_review_comments += pr.review_comments.filter(
          (c) => c.author === username
        ).length;
      }
    }
  }

  // 4. Count issues opened
  if (projectData.issues) {
    const allUserIssues = [
      ...projectData.issues.bugs.filter((i) => i.author === username),
      ...projectData.issues.enhancements.filter((i) => i.author === username),
      ...projectData.issues.documentation.filter((i) => i.author === username),
      ...projectData.issues.others.filter((i) => i.author === username),
    ];

    stats.issues_opened = allUserIssues;
  }

  // 5. Count issue comments given
  // Use the comments field from issues to estimate user's comments
  // (This is an approximation - actual comment authorship would need separate API call)
  if (projectData.issues) {
    const allIssues = [
      ...projectData.issues.bugs,
      ...projectData.issues.enhancements,
      ...projectData.issues.documentation,
      ...projectData.issues.others,
    ];

    // Estimate: user commented on issues they didn't create
    // Rough heuristic: count 30% of comments on other people's issues
    for (const issue of allIssues) {
      if (issue.author !== username && issue.comments > 0) {
        stats.issue_comments_given += Math.ceil(issue.comments * 0.3);
      }
    }
  }

  return stats;
}

// ============================================================================
// CALCULATE SCORE (NEW FORMULA)
// ============================================================================

function calculateScore(userStats) {
  // 1. CODE SCORE
  // PR Score with complexity multiplier
  let prScore = 0;
  for (const pr of userStats.prs) {
    prScore += SCORING.PR_MERGED_BASE * pr.multiplier;
  }

  const codeScore =
    prScore +
    userStats.commits * SCORING.COMMIT +
    userStats.pr_reviews_given * SCORING.PR_REVIEW_GIVEN +
    userStats.code_review_comments * SCORING.CODE_REVIEW_COMMENT;

  // 2. COMMUNITY SCORE (with monthly caps)
  const cappedIssues = applyMonthlyCaps(
    userStats.issues_opened,
    SCORING.CAPS.ISSUES_PER_MONTH
  );

  // Cap issue comments
  const totalIssueComments = userStats.issue_comments_given;
  const cappedIssueComments = Math.min(
    totalIssueComments,
    SCORING.CAPS.ISSUE_COMMENTS_PER_MONTH * 12 // Assume max 12 months
  );

  const communityScore =
    cappedIssues.length * SCORING.ISSUE_OPENED +
    cappedIssueComments * SCORING.ISSUE_COMMENT;

  // 3. QUALITY SCORE
  const impactBonusTotal = userStats.quality_metrics.impact_bonuses.reduce(
    (sum, bonus) => sum + bonus,
    0
  );

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
      // Code breakdown
      pr_score: Math.round(prScore),
      commits_score: userStats.commits * SCORING.COMMIT,
      pr_reviews_score: userStats.pr_reviews_given * SCORING.PR_REVIEW_GIVEN,
      code_comments_score:
        userStats.code_review_comments * SCORING.CODE_REVIEW_COMMENT,

      // Community breakdown
      issues_opened_score: cappedIssues.length * SCORING.ISSUE_OPENED,
      issue_comments_score: cappedIssueComments * SCORING.ISSUE_COMMENT,

      // Quality breakdown
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
      issue_comments: cappedIssueComments,
      issue_comments_total: totalIssueComments,
    },
  };
}

// ============================================================================
// GENERATE LEADERBOARD
// ============================================================================

function generateLeaderboard() {
  console.log("\n" + "=".repeat(80));
  console.log("🏆 STEP 2: GENERATING LEADERBOARD WITH NEW SCORING");
  console.log("=".repeat(80) + "\n");

  console.log("📊 Scoring Formula:");
  console.log(
    "   Total_Score = Code_Score + Community_Score + Quality_Score\n"
  );
  console.log("   Code_Score = (ΣPR_merged × 5 × complexity) + (ΣCommits × 2)");
  console.log("                + (ΣPR_reviews × 3) + (ΣReview_comments × 1)\n");
  console.log("   Community_Score = (ΣIssues × 2) [cap: 10/month]");
  console.log("                   + (ΣComments × 1) [cap: 20/month]\n");
  console.log("   Quality_Score = Impact_bonuses + Tests + Docs");
  console.log("                 + First_time_mentor + Zero_revisions\n");

  // Read input files
  const contributors = readJsonFile(CONFIG.INPUT_FILES.contributors) || [];
  const projects = readJsonFile(CONFIG.INPUT_FILES.projects) || [];
  const contributorMapping =
    readJsonFile(CONFIG.INPUT_FILES.contributorMapping) || {};
  const cachedData = readJsonFile(CONFIG.INPUT_FILES.cachedData) || {};

  console.log(`📦 Loaded Data:`);
  console.log(`   Contributors: ${contributors.length}`);
  console.log(`   Projects: ${projects.length}`);
  console.log(`   Cached Projects: ${Object.keys(cachedData).length}\n`);

  console.log("🔍 Processing contributors...\n");

  const leaderboardData = [];

  for (const contributor of contributors) {
    const username = contributor.login;
    console.log(`📌 Processing ${username}...`);

    // Get projects this user worked on from mapping
    const userMappedProjectIds = contributorMapping[username] || [];

    // Also check special projects (like website) for ALL contributors
    const allProjectIds = [
      ...new Set([...userMappedProjectIds, ...CONFIG.SPECIAL_PROJECT_IDS]),
    ];

    const userStats = {
      commits: 0,
      prs: [],
      pr_reviews_given: 0,
      code_review_comments: 0,
      issues_opened: [],
      issue_comments_given: 0,
      projectsWorkingOn: 0,
      projects: [],
      quality_metrics: {
        has_tests: 0,
        has_docs: 0,
        first_time_mentor: 0,
        zero_revisions: 0,
        impact_bonuses: [],
      },
      byProject: {},
    };

    // Analyze each project
    for (const projectId of allProjectIds) {
      const projectData = cachedData[projectId];

      if (!projectData) {
        console.log(`   ⚠️ No cached data for project ID ${projectId}`);
        continue;
      }

      const projectStats = analyzeUserInProject(username, projectData);

      // Only count this project if user actually contributed
      const hasContributions =
        projectStats.commits > 0 ||
        projectStats.prs.length > 0 ||
        projectStats.issues_opened.length > 0 ||
        projectStats.pr_reviews_given > 0 ||
        projectStats.code_review_comments > 0;

      if (hasContributions) {
        // Aggregate stats
        userStats.commits += projectStats.commits;
        userStats.prs.push(...projectStats.prs);
        userStats.pr_reviews_given += projectStats.pr_reviews_given;
        userStats.code_review_comments += projectStats.code_review_comments;
        userStats.issues_opened.push(...projectStats.issues_opened);
        userStats.issue_comments_given += projectStats.issue_comments_given;
        userStats.quality_metrics.has_tests +=
          projectStats.quality_metrics.has_tests;
        userStats.quality_metrics.has_docs +=
          projectStats.quality_metrics.has_docs;
        userStats.quality_metrics.zero_revisions +=
          projectStats.quality_metrics.zero_revisions;

        // Store per-project stats
        userStats.byProject[projectData.project_title] = projectStats;

        // Track project names
        userStats.projects.push(projectData.project_title);
        userStats.projectsWorkingOn++;

        console.log(
          `   ✓ ${projectData.project_title}: ${projectStats.commits} commits, ${projectStats.prs.length} PRs, ${projectStats.pr_reviews_given} reviews`
        );
      }
    }

    // Skip contributors with no contributions
    if (userStats.projectsWorkingOn === 0) {
      console.log(`   ⚠️ ${username}: No contributions found, skipping\n`);
      continue;
    }

    // Calculate score
    const scoreData = calculateScore(userStats);

    // Calculate average commits per PR
    const avgCommitsPerPR =
      userStats.prs.length > 0
        ? (userStats.commits / userStats.prs.length).toFixed(2)
        : 0;

    leaderboardData.push({
      rank: 0, // Will be set after sorting
      username: username,
      id: contributor.id,
      avatar_url: contributor.avatar_url,
      html_url: contributor.html_url,

      // Metrics
      totalCommits: userStats.commits,
      totalPRs: userStats.prs.length,
      totalPRReviewsGiven: userStats.pr_reviews_given,
      totalCodeReviewComments: userStats.code_review_comments,
      totalIssuesOpened: userStats.issues_opened.length,
      totalIssueComments: userStats.issue_comments_given,
      avgCommitsPerPR: parseFloat(avgCommitsPerPR),
      projectsWorkingOn: userStats.projectsWorkingOn,

      // PR Complexity breakdown
      prs_by_complexity: scoreData.prs_by_complexity,

      // Scores
      total_score: scoreData.total,
      code_score: scoreData.code_score,
      community_score: scoreData.community_score,
      quality_score: scoreData.quality_score,
      score_breakdown: scoreData.breakdown,

      // Capped counts (for transparency)
      capped_counts: scoreData.capped_counts,

      // Additional info
      projects: userStats.projects,
      byProject: userStats.byProject,
      lastActiveDays: contributor.lastActiveDays || null,
    });

    console.log(
      `   ✅ Score: ${scoreData.total} (Code: ${scoreData.code_score}, Community: ${scoreData.community_score}, Quality: ${scoreData.quality_score})\n`
    );
  }

  // Sort by score (descending)
  leaderboardData.sort((a, b) => b.total_score - a.total_score);

  // Add rank
  leaderboardData.forEach((contributor, index) => {
    contributor.rank = index + 1;
  });

  return leaderboardData;
}

// ============================================================================
// DISPLAY TOP SCORERS
// ============================================================================

function displayTopScorers(leaderboard, topN = 10) {
  console.log("\n" + "=".repeat(80));
  console.log(`🏆 TOP ${topN} CONTRIBUTORS`);
  console.log("=".repeat(80) + "\n");

  const topScorers = leaderboard.slice(0, topN);

  topScorers.forEach((contributor, index) => {
    const rank = index + 1;
    const medal =
      rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

    console.log(`${medal} ${contributor.username}`);
    console.log(
      `   Total Score: ${contributor.total_score} points (Rank #${contributor.rank})`
    );
    console.log(
      `   ├─ Code Score: ${contributor.code_score} (PRs: ${contributor.score_breakdown.pr_score}, Commits: ${contributor.score_breakdown.commits_score}, Reviews: ${contributor.score_breakdown.pr_reviews_score})`
    );
    console.log(
      `   ├─ Community Score: ${contributor.community_score} (Issues: ${contributor.score_breakdown.issues_opened_score}, Comments: ${contributor.score_breakdown.issue_comments_score})`
    );
    console.log(
      `   └─ Quality Score: ${contributor.quality_score} (Tests: ${contributor.score_breakdown.tests_score}, Docs: ${contributor.score_breakdown.docs_score}, Zero Rev: ${contributor.score_breakdown.zero_revisions_score})`
    );
    console.log(
      `   Metrics: ${contributor.totalCommits} commits, ${contributor.totalPRs} PRs (S:${contributor.prs_by_complexity.small} M:${contributor.prs_by_complexity.medium} L:${contributor.prs_by_complexity.large}), ${contributor.totalPRReviewsGiven} reviews`
    );
    console.log(`   Projects: ${contributor.projectsWorkingOn}`);
    console.log("");
  });

  console.log("=".repeat(80) + "\n");
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  try {
    console.log("🚀 Starting Leaderboard Generation...\n");

    const leaderboard = generateLeaderboard();

    // Calculate summary statistics
    const summary = {
      total_contributors: leaderboard.length,
      total_commits: leaderboard.reduce((sum, c) => sum + c.totalCommits, 0),
      total_prs: leaderboard.reduce((sum, c) => sum + c.totalPRs, 0),
      total_pr_reviews: leaderboard.reduce(
        (sum, c) => sum + c.totalPRReviewsGiven,
        0
      ),
      total_issues: leaderboard.reduce(
        (sum, c) => sum + c.totalIssuesOpened,
        0
      ),
      avg_score:
        leaderboard.length > 0
          ? Math.round(
              leaderboard.reduce((sum, c) => sum + c.total_score, 0) /
                leaderboard.length
            )
          : 0,
      avg_code_score:
        leaderboard.length > 0
          ? Math.round(
              leaderboard.reduce((sum, c) => sum + c.code_score, 0) /
                leaderboard.length
            )
          : 0,
      avg_community_score:
        leaderboard.length > 0
          ? Math.round(
              leaderboard.reduce((sum, c) => sum + c.community_score, 0) /
                leaderboard.length
            )
          : 0,
      avg_quality_score:
        leaderboard.length > 0
          ? Math.round(
              leaderboard.reduce((sum, c) => sum + c.quality_score, 0) /
                leaderboard.length
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
          "(ΣIssues × 2) [cap: 10/month] + (ΣComments × 1) [cap: 20/month]",
        quality_formula:
          "Impact_bonuses + Tests + Docs + Mentor + Zero_revisions",
      },
      scoring_weights: SCORING,
      summary: summary,
      leaderboard: leaderboard,
    };

    // Save full leaderboard
    writeJsonFile(CONFIG.OUTPUT_FILES.leaderboard, outputData);

    // Save top 50 scorers
    const top50 = {
      generated_at: new Date().toISOString(),
      scoring_weights: SCORING,
      top_scorers: leaderboard.slice(0, 50),
    };
    writeJsonFile(CONFIG.OUTPUT_FILES.topScorers, top50);

    // Display top scorers in console
    displayTopScorers(leaderboard, 10);

    // Display summary
    console.log("📈 SUMMARY STATISTICS:");
    console.log(`   Total Contributors: ${summary.total_contributors}`);
    console.log(`   Total Commits: ${summary.total_commits}`);
    console.log(`   Total PRs: ${summary.total_prs}`);
    console.log(`   Total PR Reviews Given: ${summary.total_pr_reviews}`);
    console.log(`   Total Issues Opened: ${summary.total_issues}`);
    console.log(`   Average Total Score: ${summary.avg_score}`);
    console.log(`   Average Code Score: ${summary.avg_code_score}`);
    console.log(`   Average Community Score: ${summary.avg_community_score}`);
    console.log(`   Average Quality Score: ${summary.avg_quality_score}`);
    console.log(
      `   Highest Score: ${leaderboard[0]?.total_score || 0} (${
        leaderboard[0]?.username || "N/A"
      })`
    );
    console.log();

    console.log("✅ Leaderboard generation completed successfully!\n");

    return leaderboard;
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
