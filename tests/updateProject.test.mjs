import { describe, it } from "node:test";
import assert from "node:assert/strict";

function parseRepoFromUrl(url) {
  if (!url || url === "NA") return [null, null];
  const stripped = url.replace("https://github.com/", "");
  const parts = stripped.split("/");
  return [parts[0] || null, parts[1] || null];
}

function shapeCurrentProject(entry, repoData) {
  return {
    ...entry,
    id: parseInt(entry.id),
    shortDescription: entry.short_description,
    githubUrl: entry.github_repository_link,
    documentationUrl: entry.documentation_link,
    stars: repoData ? repoData.stargazers_count : 0,
    tags: repoData ? repoData.topics.slice(0, 5) : [],
    lastPushedAt: repoData ? repoData.pushed_at : entry.date_created,
  };
}

function shapeUpcomingProject(entry, repoData) {
  return {
    ...entry,
    id: parseInt(entry.id),
    shortDescription: entry.short_description,
    githubUrl: entry.github_repository_link,
    documentationUrl: entry.documentation_link,
    stars: repoData ? repoData.stargazers_count : 0,
    tags: repoData ? repoData.topics.slice(0, 5) : [],
    lastPushedAt: repoData ? repoData.pushed_at : entry.date_created,
  };
}

function filterContributors(contributors) {
  return contributors.filter(
    (c) => c.type !== "Bot" && !c.login?.startsWith("github-actions")
  );
}

const baseEntry = {
  id: "42",
  title: "My Project",
  short_description: "A short desc",
  github_repository_link: "https://github.com/org/repo",
  documentation_link: "https://docs.example.com",
  date_created: "2024-01-01",
  project_type: "current",
  status: "published",
};

describe("parseRepoFromUrl", () => {
  it("parses owner and repo from valid GitHub URL", () => {
    const [owner, repo] = parseRepoFromUrl(
      "https://github.com/mindfiredigital/my-repo"
    );
    assert.equal(owner, "mindfiredigital");
    assert.equal(repo, "my-repo");
  });

  it("returns [null, null] for null input", () => {
    const [owner, repo] = parseRepoFromUrl(null);
    assert.equal(owner, null);
    assert.equal(repo, null);
  });

  it("returns [null, null] for 'NA' string", () => {
    const [owner, repo] = parseRepoFromUrl("NA");
    assert.equal(owner, null);
    assert.equal(repo, null);
  });

  it("returns [null, null] for empty string", () => {
    const [owner, repo] = parseRepoFromUrl("");
    assert.equal(owner, null);
    assert.equal(repo, null);
  });

  it("handles URLs with trailing segments (takes first two)", () => {
    const [owner, repo] = parseRepoFromUrl(
      "https://github.com/org/repo/tree/main"
    );
    assert.equal(owner, "org");
    assert.equal(repo, "repo");
  });
});

describe("shapeCurrentProject", () => {
  it("converts id string to integer", () => {
    assert.equal(typeof shapeCurrentProject(baseEntry, null).id, "number");
    assert.equal(shapeCurrentProject(baseEntry, null).id, 42);
  });

  it("maps short_description to shortDescription", () => {
    assert.equal(
      shapeCurrentProject(baseEntry, null).shortDescription,
      "A short desc"
    );
  });

  it("maps github_repository_link to githubUrl", () => {
    assert.equal(
      shapeCurrentProject(baseEntry, null).githubUrl,
      "https://github.com/org/repo"
    );
  });

  it("maps documentation_link to documentationUrl", () => {
    assert.equal(
      shapeCurrentProject(baseEntry, null).documentationUrl,
      "https://docs.example.com"
    );
  });

  it("uses 0 stars when repoData is null", () => {
    assert.equal(shapeCurrentProject(baseEntry, null).stars, 0);
  });

  it("uses stargazers_count from repoData", () => {
    assert.equal(
      shapeCurrentProject(baseEntry, {
        stargazers_count: 128,
        topics: [],
        pushed_at: "2024-06-01",
      }).stars,
      128
    );
  });

  it("uses empty tags when repoData is null", () => {
    assert.deepEqual(shapeCurrentProject(baseEntry, null).tags, []);
  });

  it("slices topics to max 5 tags", () => {
    const result = shapeCurrentProject(baseEntry, {
      stargazers_count: 0,
      topics: ["a", "b", "c", "d", "e", "f", "g"],
      pushed_at: "2024-06-01",
    });
    assert.equal(result.tags.length, 5);
  });

  it("uses date_created as lastPushedAt when repoData is null", () => {
    assert.equal(
      shapeCurrentProject(baseEntry, null).lastPushedAt,
      "2024-01-01"
    );
  });

  it("uses pushed_at from repoData as lastPushedAt", () => {
    assert.equal(
      shapeCurrentProject(baseEntry, {
        stargazers_count: 0,
        topics: [],
        pushed_at: "2024-09-15",
      }).lastPushedAt,
      "2024-09-15"
    );
  });

  it("preserves original entry fields", () => {
    const result = shapeCurrentProject(baseEntry, null);
    assert.equal(result.title, "My Project");
    assert.equal(result.status, "published");
  });
});

describe("shapeUpcomingProject", () => {
  const upcomingEntry = {
    id: "7",
    title: "Coming Soon",
    short_description: "Will be great",
    github_repository_link: "https://github.com/org/coming-soon",
    documentation_link: null,
    date_created: "2024-05-01",
    project_type: "upcoming",
    status: "draft",
  };

  it("converts id to integer", () =>
    assert.equal(shapeUpcomingProject(upcomingEntry, null).id, 7));
  it("maps shortDescription without repoData", () =>
    assert.equal(
      shapeUpcomingProject(upcomingEntry, null).shortDescription,
      "Will be great"
    ));
  it("uses 0 stars without repoData", () =>
    assert.equal(shapeUpcomingProject(upcomingEntry, null).stars, 0));
  it("uses repoData stars when available", () =>
    assert.equal(
      shapeUpcomingProject(upcomingEntry, {
        stargazers_count: 42,
        topics: ["ts"],
        pushed_at: "2024-07-01",
      }).stars,
      42
    ));
  it("slices topics to 5 for upcoming projects", () => {
    const result = shapeUpcomingProject(upcomingEntry, {
      stargazers_count: 0,
      topics: ["a", "b", "c", "d", "e", "f"],
      pushed_at: "2024-07-01",
    });
    assert.equal(result.tags.length, 5);
  });
});

describe("filterContributors", () => {
  it("removes Bot type contributors", () => {
    const result = filterContributors([
      { login: "human", type: "User" },
      { login: "automaton", type: "Bot" },
    ]);
    assert.equal(result.length, 1);
    assert.equal(result[0].login, "human");
  });

  it("removes github-actions prefixed logins", () => {
    const result = filterContributors([
      { login: "github-actions[bot]", type: "User" },
      { login: "dev", type: "User" },
    ]);
    assert.equal(result.length, 1);
    assert.equal(result[0].login, "dev");
  });

  it("keeps regular users", () =>
    assert.equal(
      filterContributors([
        { login: "alice", type: "User" },
        { login: "bob", type: "User" },
      ]).length,
      2
    ));
  it("handles empty array", () => assert.deepEqual(filterContributors([]), []));

  it("removes multiple bots at once", () => {
    const result = filterContributors([
      { login: "github-actions[bot]", type: "Bot" },
      { login: "dependabot[bot]", type: "Bot" },
      { login: "real-user", type: "User" },
    ]);
    assert.equal(result.length, 1);
    assert.equal(result[0].login, "real-user");
  });
});
