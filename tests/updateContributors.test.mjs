import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BOT_PATTERNS = ["github-actions", "[bot]", "dependabot", "renovate"];

function isBot(contributor) {
  return (
    contributor.type === "Bot" ||
    contributor.login?.startsWith("github-actions") ||
    BOT_PATTERNS.some((p) =>
      contributor.login?.toLowerCase().includes(p.toLowerCase())
    )
  );
}

function filterBots(contributors) {
  return contributors.filter((c) => !isBot(c));
}

function aggregateContributions(contributorsObject) {
  const contributionsMap = {};
  for (const repo in contributorsObject) {
    if (!Object.prototype.hasOwnProperty.call(contributorsObject, repo))
      continue;
    contributorsObject[repo].forEach((contributor) => {
      const {
        login,
        contributions,
        id,
        avatar_url,
        html_url,
        pullRequestCount,
        issueCount,
      } = contributor;
      contributionsMap[login] = {
        id,
        contributions:
          (contributionsMap[login]?.contributions || 0) + contributions,
        html_url,
        avatar_url,
        login,
        lastActiveDays: contributor.lastActiveDays,
        pullRequestCount:
          (contributionsMap[login]?.pullRequestCount || 0) + pullRequestCount,
        issueCount: (contributionsMap[login]?.issueCount || 0) + issueCount,
      };
    });
  }
  return Object.values(contributionsMap).sort(
    (a, b) => b.contributions - a.contributions
  );
}

function calculateLastActiveDays(lastActivityDate) {
  if (!lastActivityDate) return null;
  const last = new Date(lastActivityDate);
  const now = new Date();
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}

describe("filterBots", () => {
  it("removes contributors with type=Bot", () => {
    const contributors = [
      { login: "alice", type: "User" },
      { login: "bot-user", type: "Bot" },
    ];
    const result = filterBots(contributors);
    assert.equal(result.length, 1);
    assert.equal(result[0].login, "alice");
  });

  it("removes contributors whose login starts with github-actions", () => {
    const contributors = [
      { login: "github-actions[bot]", type: "User" },
      { login: "bob", type: "User" },
    ];
    const result = filterBots(contributors);
    assert.equal(result.length, 1);
    assert.equal(result[0].login, "bob");
  });

  it("removes dependabot", () => {
    const contributors = [
      { login: "dependabot[bot]", type: "User" },
      { login: "carol", type: "User" },
    ];
    assert.equal(filterBots(contributors).length, 1);
    assert.equal(filterBots(contributors)[0].login, "carol");
  });

  it("keeps all human contributors", () => {
    const contributors = [
      { login: "alice", type: "User" },
      { login: "bob", type: "User" },
      { login: "carol", type: "User" },
    ];
    assert.equal(filterBots(contributors).length, 3);
  });

  it("returns empty array when all are bots", () => {
    const contributors = [
      { login: "github-actions[bot]", type: "Bot" },
      { login: "dependabot[bot]", type: "Bot" },
    ];
    assert.equal(filterBots(contributors).length, 0);
  });

  it("handles empty input", () => {
    assert.deepEqual(filterBots([]), []);
  });

  it("handles contributors with missing login gracefully", () => {
    const contributors = [
      { login: undefined, type: "User" },
      { login: "alice", type: "User" },
    ];
    const result = filterBots(contributors);
    assert.ok(result.some((c) => c.login === "alice"));
  });
});

describe("aggregateContributions", () => {
  it("aggregates contributions from multiple repos for same user", () => {
    const input = {
      "repo-a": [
        {
          login: "alice",
          contributions: 10,
          id: 1,
          avatar_url: "",
          html_url: "",
          pullRequestCount: 2,
          issueCount: 1,
          lastActiveDays: 3,
        },
      ],
      "repo-b": [
        {
          login: "alice",
          contributions: 5,
          id: 1,
          avatar_url: "",
          html_url: "",
          pullRequestCount: 1,
          issueCount: 0,
          lastActiveDays: 1,
        },
      ],
    };
    const result = aggregateContributions(input);
    const alice = result.find((c) => c.login === "alice");
    assert.equal(alice.contributions, 15);
    assert.equal(alice.pullRequestCount, 3);
    assert.equal(alice.issueCount, 1);
  });

  it("handles multiple contributors across repos", () => {
    const input = {
      "repo-a": [
        {
          login: "alice",
          contributions: 10,
          id: 1,
          avatar_url: "",
          html_url: "",
          pullRequestCount: 2,
          issueCount: 1,
          lastActiveDays: 5,
        },
        {
          login: "bob",
          contributions: 3,
          id: 2,
          avatar_url: "",
          html_url: "",
          pullRequestCount: 1,
          issueCount: 0,
          lastActiveDays: 10,
        },
      ],
    };
    assert.equal(aggregateContributions(input).length, 2);
  });

  it("sorts by contributions descending", () => {
    const input = {
      "repo-a": [
        {
          login: "alice",
          contributions: 3,
          id: 1,
          avatar_url: "",
          html_url: "",
          pullRequestCount: 0,
          issueCount: 0,
          lastActiveDays: 0,
        },
        {
          login: "bob",
          contributions: 10,
          id: 2,
          avatar_url: "",
          html_url: "",
          pullRequestCount: 0,
          issueCount: 0,
          lastActiveDays: 0,
        },
      ],
    };
    const result = aggregateContributions(input);
    assert.equal(result[0].login, "bob");
    assert.equal(result[1].login, "alice");
  });

  it("handles empty contributors object", () => {
    assert.deepEqual(aggregateContributions({}), []);
  });

  it("handles repo with empty contributor array", () => {
    assert.deepEqual(aggregateContributions({ "repo-a": [] }), []);
  });

  it("preserves avatar_url and html_url", () => {
    const input = {
      "repo-a": [
        {
          login: "alice",
          contributions: 5,
          id: 1,
          avatar_url: "https://avatar.com/alice",
          html_url: "https://github.com/alice",
          pullRequestCount: 1,
          issueCount: 0,
          lastActiveDays: 2,
        },
      ],
    };
    const result = aggregateContributions(input);
    assert.equal(result[0].avatar_url, "https://avatar.com/alice");
    assert.equal(result[0].html_url, "https://github.com/alice");
  });

  it("does not include prototype properties", () => {
    const input = Object.create({
      injected: [{ login: "evil", contributions: 9999 }],
    });
    input["repo-a"] = [];
    const result = aggregateContributions(input);
    assert.ok(!result.find((c) => c.login === "evil"));
  });
});

describe("calculateLastActiveDays", () => {
  it("returns null for null input", () =>
    assert.equal(calculateLastActiveDays(null), null));
  it("returns null for undefined input", () =>
    assert.equal(calculateLastActiveDays(undefined), null));
  it("returns 0 for today's date", () =>
    assert.equal(calculateLastActiveDays(new Date().toISOString()), 0));
  it("returns correct days for a past date", () => {
    const pastDate = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000
    ).toISOString();
    assert.equal(calculateLastActiveDays(pastDate), 5);
  });
  it("always returns non-negative number", () => {
    const pastDate = new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000
    ).toISOString();
    assert.ok(calculateLastActiveDays(pastDate) >= 0);
  });
});
