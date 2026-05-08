import type {
  ScoringBundle,
  ScoringBundleContributor,
  TopScorer,
} from "@/types";

const BUNDLE_URL = "/leaderboard/scoring-bundle.json";

let bundleCache: ScoringBundle | null = null;

export async function loadScoringBundle(): Promise<ScoringBundle> {
  if (bundleCache) return bundleCache;
  const res = await fetch(BUNDLE_URL);
  if (!res.ok) throw new Error(`Failed to load scoring bundle: ${res.status}`);
  bundleCache = (await res.json()) as ScoringBundle;
  return bundleCache;
}

// Group an array of ISO date strings by "YYYY-MM"
function groupByMonth(dates: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = d.slice(0, 7); // "YYYY-MM"
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function scoreContributorInRange(
  username: string,
  c: ScoringBundleContributor,
  from: string,
  to: string,
  weights: ScoringBundle["scoring_weights"]
): number {
  // Inclusive date comparison using ISO string lexicographic ordering.
  // from/to are "YYYY-MM-DD"; event dates are full ISO strings — slice to date
  // portion for comparison so "2025-05-05T10:00:00Z" >= "2025-05-05" is true.
  const inRange = (isoDate: string) => {
    const d = isoDate.slice(0, 10);
    return d >= from && d <= to;
  };

  let score = 0;

  // Commits
  const commitsInRange = c.commits.filter(inRange);
  score += commitsInRange.length * weights.COMMIT;

  // PRs
  for (const pr of c.prs) {
    if (!inRange(pr.d)) continue;
    score += pr.pts; // base PR score
    if (pr.zr) score += weights.ZERO_REVISIONS;
    if (pr.t) score += weights.HAS_TESTS;
    if (pr.doc) score += weights.HAS_DOCS;
  }

  // PR reviews
  score += c.reviews.filter(inRange).length * weights.PR_REVIEW_GIVEN;

  // Code review comments
  score += c.codeComments.filter(inRange).length * weights.CODE_REVIEW_COMMENT;

  // Issues opened — apply monthly cap within the range
  const issuesInRange = c.issues.filter(inRange);
  const issuesByMonth = groupByMonth(issuesInRange);
  issuesByMonth.forEach((count) => {
    score +=
      Math.min(count, weights.CAPS.ISSUES_PER_MONTH) * weights.ISSUE_OPENED;
  });

  // Issue comments — apply monthly cap within the range
  const commentsInRange = c.issueComments.filter(inRange);
  const commentsByMonth = groupByMonth(commentsInRange);
  commentsByMonth.forEach((count) => {
    score +=
      Math.min(count, weights.CAPS.ISSUE_COMMENTS_PER_MONTH) *
      weights.ISSUE_COMMENT;
  });

  // Project diversity — only count projects where the all-time first
  // contribution falls within the range
  const newProjects = c.projectFirsts.filter((pf) => inRange(pf.d));
  score += newProjects.length * weights.PROJECT_DIVERSITY;

  return score;
}

export function computeRangeLeaderboard(
  bundle: ScoringBundle,
  from: string,
  to: string
): TopScorer[] {
  const { contributors, scoring_weights } = bundle;
  const results: TopScorer[] = [];

  for (const [username, c] of Object.entries(contributors)) {
    const totalScore = scoreContributorInRange(
      username,
      c,
      from,
      to,
      scoring_weights
    );
    if (totalScore === 0) continue;

    const prsInRange = c.prs.filter(
      (pr) => pr.d.slice(0, 10) >= from && pr.d.slice(0, 10) <= to
    );
    const commitsInRange = c.commits.filter(
      (d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to
    );

    const prScore = prsInRange.reduce((s, pr) => s + pr.pts, 0);
    const commitsScore = commitsInRange.length * scoring_weights.COMMIT;
    const reviewsScore =
      c.reviews.filter((d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to)
        .length * scoring_weights.PR_REVIEW_GIVEN;
    const codeCommentsScore =
      c.codeComments.filter(
        (d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to
      ).length * scoring_weights.CODE_REVIEW_COMMENT;

    const issuesInRange = c.issues.filter(
      (d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to
    );
    const issuesByMonth = groupByMonth(issuesInRange);
    let issuesScore = 0;
    issuesByMonth.forEach((count) => {
      issuesScore +=
        Math.min(count, scoring_weights.CAPS.ISSUES_PER_MONTH) *
        scoring_weights.ISSUE_OPENED;
    });

    const commentsInRange = c.issueComments.filter(
      (d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to
    );
    const commentsByMonth = groupByMonth(commentsInRange);
    let commentsScore = 0;
    commentsByMonth.forEach((count) => {
      commentsScore +=
        Math.min(count, scoring_weights.CAPS.ISSUE_COMMENTS_PER_MONTH) *
        scoring_weights.ISSUE_COMMENT;
    });

    const newProjects = c.projectFirsts.filter(
      (pf) => pf.d.slice(0, 10) >= from && pf.d.slice(0, 10) <= to
    );
    const projectsScore =
      newProjects.length * scoring_weights.PROJECT_DIVERSITY;

    const testsScore =
      prsInRange.filter((pr) => pr.t).length * scoring_weights.HAS_TESTS;
    const docsScore =
      prsInRange.filter((pr) => pr.doc).length * scoring_weights.HAS_DOCS;
    const zeroRevScore =
      prsInRange.filter((pr) => pr.zr).length * scoring_weights.ZERO_REVISIONS;

    const codeScore = prScore + commitsScore + reviewsScore + codeCommentsScore;
    const communityScore = issuesScore + commentsScore + projectsScore;
    const qualityScore = testsScore + docsScore + zeroRevScore;

    const prs_by_complexity = {
      small: prsInRange.filter((pr) => pr.c === "small").length,
      medium: prsInRange.filter((pr) => pr.c === "medium").length,
      large: prsInRange.filter((pr) => pr.c === "large").length,
    };

    results.push({
      rank: 0,
      username,
      id: c.id,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      totalCommits: commitsInRange.length,
      totalPRs: prsInRange.length,
      totalPRReviewsGiven: c.reviews.filter(
        (d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to
      ).length,
      totalCodeReviewComments: c.codeComments.filter(
        (d) => d.slice(0, 10) >= from && d.slice(0, 10) <= to
      ).length,
      totalIssuesOpened: issuesInRange.length,
      totalIssueComments: commentsInRange.length,
      avgCommitsPerPR:
        prsInRange.length > 0
          ? parseFloat((commitsInRange.length / prsInRange.length).toFixed(2))
          : 0,
      projectsWorkingOn: newProjects.length,
      prs_by_complexity,
      total_score: totalScore,
      code_score: codeScore,
      community_score: communityScore,
      quality_score: qualityScore,
      score_breakdown: {
        pr_score: prScore,
        commits_score: commitsScore,
        pr_reviews_score: reviewsScore,
        code_comments_score: codeCommentsScore,
        issues_opened_score: issuesScore,
        issue_comments_score: commentsScore,
        tests_score: testsScore,
        docs_score: docsScore,
        mentor_score: 0,
        zero_revisions_score: zeroRevScore,
        impact_bonus_score: 0,
        projects_score: projectsScore,
      },
      projects: newProjects.map((pf) => pf.title),
    });
  }

  results.sort((a, b) => b.total_score - a.total_score);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });
  return results;
}
