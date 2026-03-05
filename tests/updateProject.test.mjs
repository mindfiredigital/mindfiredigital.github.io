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
