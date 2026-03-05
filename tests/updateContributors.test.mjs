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
