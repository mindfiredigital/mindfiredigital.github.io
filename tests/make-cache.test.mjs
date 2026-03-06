import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BOT_PATTERNS = [
  "github-actions",
  "dependabot",
  "renovate",
  "snyk-bot",
  "codecov",
  "greenkeeper",
  "[bot]",
];

function isBot(username) {
  if (!username) return false;
  const lower = username.toLowerCase();
  return BOT_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
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

function categorizeIssue(labels) {
  const l = labels.map((x) => x.toLowerCase());
  if (l.some((x) => x.includes("bug") || x.includes("fix"))) return "bugs";
  if (
    l.some(
      (x) =>
        x.includes("enhancement") ||
        x.includes("feature") ||
        x.includes("improvement")
    )
  )
    return "enhancements";
  if (
    l.some(
      (x) =>
        x.includes("documentation") || x.includes("docs") || x.includes("doc")
    )
  )
    return "documentation";
  return "others";
}

function filterHumanCommits(commits) {
  return commits.filter(
    (c) => !isBot(c.author?.login) && !isBot(c.commit?.author?.name)
  );
}

function filterMergedPRs(prs, defaultBranchSHAs) {
  return prs.filter(
    (pr) =>
      pr.merged_at &&
      !isBot(pr.user?.login) &&
      pr.merge_commit_sha &&
      defaultBranchSHAs.has(pr.merge_commit_sha)
  );
}

function normalizeCommit(c) {
  return {
    sha: c.sha,
    author_login: c.author?.login || null,
    author_name: c.commit?.author?.name || null,
    date: c.commit?.author?.date || null,
    message: (c.commit?.message || "").split("\n")[0],
  };
}

function mapIssue(i) {
  return {
    number: i.number,
    author: i.author,
    title: i.title,
    created_at: i.created_at,
    comments: i.comments,
    comment_authors: i.comment_authors,
  };
}

describe("isBot", () => {
  it("detects [bot] suffix", () => assert.ok(isBot("dependabot[bot]")));
  it("detects github-actions prefix", () =>
    assert.ok(isBot("github-actions[bot]")));
  it("detects renovate", () => assert.ok(isBot("renovate[bot]")));
  it("detects snyk-bot", () => assert.ok(isBot("snyk-bot")));
  it("detects codecov", () => assert.ok(isBot("codecov")));
  it("detects greenkeeper", () => assert.ok(isBot("greenkeeper[bot]")));
  it("returns false for normal user", () => assert.ok(!isBot("alice")));
  it("returns false for null", () => assert.ok(!isBot(null)));
  it("returns false for undefined", () => assert.ok(!isBot(undefined)));
  it("is case-insensitive", () => assert.ok(isBot("DEPENDABOT[BOT]")));
});

describe("filterHumanCommits", () => {
  it("keeps commits from human authors", () => {
    assert.equal(
      filterHumanCommits([
        { author: { login: "alice" }, commit: { author: { name: "Alice" } } },
      ]).length,
      1
    );
  });

  it("removes commits from bot login", () => {
    const commits = [
      {
        author: { login: "dependabot[bot]" },
        commit: { author: { name: "Dependabot" } },
      },
      { author: { login: "alice" }, commit: { author: { name: "Alice" } } },
    ];
    assert.equal(filterHumanCommits(commits).length, 1);
    assert.equal(filterHumanCommits(commits)[0].author.login, "alice");
  });

  it("removes commits where commit author name matches bot pattern", () => {
    const commits = [
      { author: null, commit: { author: { name: "github-actions" } } },
      { author: { login: "bob" }, commit: { author: { name: "Bob" } } },
    ];
    assert.equal(filterHumanCommits(commits).length, 1);
  });

  it("handles empty input", () => assert.deepEqual(filterHumanCommits([]), []));

  it("handles commits with null author without throwing", () => {
    const commits = [
      { author: null, commit: { author: { name: "Regular User" } } },
    ];
    assert.equal(filterHumanCommits(commits).length, 1);
  });
});
