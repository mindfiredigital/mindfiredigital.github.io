import { describe, it } from "node:test";
import assert from "node:assert/strict";

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
  PROJECT_DIVERSITY: 10,
  CAPS: { ISSUES_PER_MONTH: 10, ISSUE_COMMENTS_PER_MONTH: 20 },
};

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

function analyzePRComplexity(pr) {
  const filesChanged = pr.changed_files || 0;
  const linesChanged = (pr.additions || 0) + (pr.deletions || 0);
  if (filesChanged >= 8 || linesChanged >= 500)
    return { level: "large", multiplier: 1.7 };
  if (filesChanged >= 3 || linesChanged >= 100)
    return { level: "medium", multiplier: 1.3 };
  return { level: "small", multiplier: 1.0 };
}

function calculateScore(userStats) {
  let prScore = 0;
  for (const pr of userStats.prs)
    prScore += SCORING.PR_MERGED_BASE * pr.multiplier;

  const codeScore =
    prScore +
    userStats.commits * SCORING.COMMIT +
    userStats.pr_reviews_given * SCORING.PR_REVIEW_GIVEN +
    userStats.code_review_comments * SCORING.CODE_REVIEW_COMMENT;

  const cappedIssues = applyMonthlyCaps(
    userStats.issues_opened,
    SCORING.CAPS.ISSUES_PER_MONTH
  );
  const cappedComments = applyMonthlyCaps(
    userStats.issue_comments_given,
    SCORING.CAPS.ISSUE_COMMENTS_PER_MONTH
  );
  const projectDiversityScore =
    (userStats.projectsWorkingOn || 0) * SCORING.PROJECT_DIVERSITY;

  const communityScore =
    cappedIssues.length * SCORING.ISSUE_OPENED +
    cappedComments.length * SCORING.ISSUE_COMMENT +
    projectDiversityScore;

  const impactBonusTotal = userStats.quality_metrics.impact_bonuses.reduce(
    (s, b) => s + b,
    0
  );
  const qualityScore =
    impactBonusTotal +
    userStats.quality_metrics.has_tests * SCORING.HAS_TESTS +
    userStats.quality_metrics.has_docs * SCORING.HAS_DOCS +
    userStats.quality_metrics.first_time_mentor * SCORING.FIRST_TIME_MENTOR +
    userStats.quality_metrics.zero_revisions * SCORING.ZERO_REVISIONS;

  return {
    total: Math.round(codeScore + communityScore + qualityScore),
    code_score: Math.round(codeScore),
    community_score: Math.round(communityScore),
    quality_score: Math.round(qualityScore),
  };
}

function emptyStats(overrides = {}) {
  return {
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
    ...overrides,
  };
}

describe("analyzePRComplexity", () => {
  it("classifies small PR (1 file, 15 lines)", () => {
    const r = analyzePRComplexity({
      changed_files: 1,
      additions: 10,
      deletions: 5,
    });
    assert.equal(r.level, "small");
    assert.equal(r.multiplier, 1.0);
  });

  it("classifies medium PR by file count (4 files)", () => {
    const r = analyzePRComplexity({
      changed_files: 4,
      additions: 20,
      deletions: 10,
    });
    assert.equal(r.level, "medium");
    assert.equal(r.multiplier, 1.3);
  });

  it("classifies medium PR by line count (110 lines)", () => {
    const r = analyzePRComplexity({
      changed_files: 1,
      additions: 80,
      deletions: 30,
    });
    assert.equal(r.level, "medium");
  });

  it("classifies large PR by file count (10 files)", () => {
    const r = analyzePRComplexity({
      changed_files: 10,
      additions: 50,
      deletions: 20,
    });
    assert.equal(r.level, "large");
    assert.equal(r.multiplier, 1.7);
  });

  it("classifies large PR by line count (550 lines)", () => {
    const r = analyzePRComplexity({
      changed_files: 2,
      additions: 400,
      deletions: 150,
    });
    assert.equal(r.level, "large");
  });

  it("handles missing fields, defaults to small", () =>
    assert.equal(analyzePRComplexity({}).level, "small"));
  it("exactly 500 lines is large", () =>
    assert.equal(
      analyzePRComplexity({ changed_files: 1, additions: 300, deletions: 200 })
        .level,
      "large"
    ));
  it("exactly 100 lines is medium", () =>
    assert.equal(
      analyzePRComplexity({ changed_files: 1, additions: 60, deletions: 40 })
        .level,
      "medium"
    ));
  it("8 files is large regardless of lines", () =>
    assert.equal(
      analyzePRComplexity({ changed_files: 8, additions: 10, deletions: 5 })
        .level,
      "large"
    ));
});

describe("applyMonthlyCaps", () => {
  it("does not cap when items are below limit", () => {
    const items = [{ created_at: "2024-01-05" }, { created_at: "2024-01-10" }];
    assert.equal(applyMonthlyCaps(items, 10).length, 2);
  });

  it("caps items at limit per month", () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      created_at: `2024-01-${String(i + 1).padStart(2, "0")}`,
    }));
    assert.equal(applyMonthlyCaps(items, 10).length, 10);
  });

  it("applies cap independently per month (10 Jan + 10 Feb = 20)", () => {
    const items = [
      ...Array.from({ length: 12 }, () => ({ created_at: "2024-01-15" })),
      ...Array.from({ length: 12 }, () => ({ created_at: "2024-02-15" })),
    ];
    assert.equal(applyMonthlyCaps(items, 10).length, 20);
  });

  it("returns empty array for empty input", () =>
    assert.deepEqual(applyMonthlyCaps([], 10), []));

  it("uses custom date field", () => {
    const items = [{ merged_at: "2024-03-01" }, { merged_at: "2024-03-02" }];
    assert.equal(applyMonthlyCaps(items, 1, "merged_at").length, 1);
  });
});
