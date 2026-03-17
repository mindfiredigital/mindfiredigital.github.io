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

describe("filterMergedPRs", () => {
  const sha1 = "abc123";
  const shas = new Set([sha1]);

  it("keeps PRs that are merged and on the default branch", () => {
    assert.equal(
      filterMergedPRs(
        [
          {
            merged_at: "2024-01-01",
            user: { login: "alice" },
            merge_commit_sha: sha1,
          },
        ],
        shas
      ).length,
      1
    );
  });

  it("removes PRs not in defaultBranchSHAs", () => {
    assert.equal(
      filterMergedPRs(
        [
          {
            merged_at: "2024-01-01",
            user: { login: "alice" },
            merge_commit_sha: "other",
          },
        ],
        shas
      ).length,
      0
    );
  });

  it("removes unmerged PRs (no merged_at)", () => {
    assert.equal(
      filterMergedPRs(
        [{ merged_at: null, user: { login: "alice" }, merge_commit_sha: sha1 }],
        shas
      ).length,
      0
    );
  });

  it("removes PRs from bots", () => {
    assert.equal(
      filterMergedPRs(
        [
          {
            merged_at: "2024-01-01",
            user: { login: "dependabot[bot]" },
            merge_commit_sha: sha1,
          },
        ],
        shas
      ).length,
      0
    );
  });

  it("removes PRs with null merge_commit_sha", () => {
    assert.equal(
      filterMergedPRs(
        [
          {
            merged_at: "2024-01-01",
            user: { login: "alice" },
            merge_commit_sha: null,
          },
        ],
        shas
      ).length,
      0
    );
  });

  it("handles empty PR list", () =>
    assert.deepEqual(filterMergedPRs([], shas), []));
});

describe("categorizeIssue", () => {
  it("categorizes 'bug' as bugs", () =>
    assert.equal(categorizeIssue(["bug"]), "bugs"));
  it("categorizes 'fix' as bugs", () =>
    assert.equal(categorizeIssue(["fix"]), "bugs"));
  it("categorizes 'enhancement' as enhancements", () =>
    assert.equal(categorizeIssue(["enhancement"]), "enhancements"));
  it("categorizes 'feature' as enhancements", () =>
    assert.equal(categorizeIssue(["feature"]), "enhancements"));
  it("categorizes 'improvement' as enhancements", () =>
    assert.equal(categorizeIssue(["improvement"]), "enhancements"));
  it("categorizes 'documentation' as documentation", () =>
    assert.equal(categorizeIssue(["documentation"]), "documentation"));
  it("categorizes 'docs' as documentation", () =>
    assert.equal(categorizeIssue(["docs"]), "documentation"));
  it("categorizes 'doc' as documentation", () =>
    assert.equal(categorizeIssue(["doc"]), "documentation"));
  it("categorizes unknown labels as others", () =>
    assert.equal(categorizeIssue(["question", "help-wanted"]), "others"));
  it("categorizes empty labels as others", () =>
    assert.equal(categorizeIssue([]), "others"));
  it("is case-insensitive", () =>
    assert.equal(categorizeIssue(["BUG"]), "bugs"));
  it("bug takes priority when mixed with enhancement", () =>
    assert.equal(categorizeIssue(["enhancement", "bug"]), "bugs"));
});

describe("normalizeCommit", () => {
  it("extracts all fields correctly", () => {
    const commit = {
      sha: "abc123",
      author: { login: "alice" },
      commit: {
        author: { name: "Alice", date: "2024-01-01" },
        message: "feat: add stuff",
      },
    };
    const result = normalizeCommit(commit);
    assert.equal(result.sha, "abc123");
    assert.equal(result.author_login, "alice");
    assert.equal(result.author_name, "Alice");
    assert.equal(result.date, "2024-01-01");
    assert.equal(result.message, "feat: add stuff");
  });

  it("truncates multi-line commit message to first line", () => {
    const commit = {
      sha: "xyz",
      author: { login: "bob" },
      commit: {
        author: { name: "Bob", date: "2024-02-01" },
        message: "feat: thing\n\nBody text",
      },
    };
    assert.equal(normalizeCommit(commit).message, "feat: thing");
  });

  it("uses null for missing author login", () => {
    const commit = {
      sha: "abc",
      author: null,
      commit: {
        author: { name: "Someone", date: "2024-01-01" },
        message: "fix: bug",
      },
    };
    assert.equal(normalizeCommit(commit).author_login, null);
  });

  it("handles empty message string", () => {
    const commit = {
      sha: "abc",
      author: { login: "alice" },
      commit: { author: { name: "Alice", date: "2024-01-01" }, message: "" },
    };
    assert.equal(normalizeCommit(commit).message, "");
  });
});

describe("mapIssue", () => {
  it("maps only the expected fields and drops extras", () => {
    const issue = {
      number: 42,
      author: "alice",
      title: "Something broke",
      created_at: "2024-01-01",
      comments: 3,
      comment_authors: [{ author: "bob" }],
      extra_field: "dropped",
    };
    const result = mapIssue(issue);
    assert.equal(result.number, 42);
    assert.equal(result.author, "alice");
    assert.equal(result.title, "Something broke");
    assert.equal(result.comments, 3);
    assert.equal(result.comment_authors.length, 1);
    assert.equal(result.extra_field, undefined);
  });
});
