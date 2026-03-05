import { describe, it } from "node:test";
import assert from "node:assert/strict";

function mergeStats(npmResults, pypiResults) {
  const statsMap = {};
  for (const pkg of npmResults) {
    statsMap[pkg.name] = {
      name: pkg.name,
      type: "npm",
      weekly: pkg.weekly ?? 0,
      monthly: pkg.monthly ?? 0,
      total: pkg.total ?? 0,
    };
  }
  for (const pkg of pypiResults) {
    statsMap[pkg.name] = {
      name: pkg.name,
      type: "pypi",
      weekly: pkg.weekly ?? 0,
      monthly: pkg.monthly ?? 0,
      total: pkg.total ?? 0,
    };
  }
  return statsMap;
}

function enrichWithTitles(statsMap, npmPackages, pypiPackages) {
  return Object.values(statsMap)
    .map((value) => {
      const npmPkg = npmPackages.find((p) => p.name === value.name);
      const pypiPkg = pypiPackages.find((p) => p.name === value.name);
      const title = npmPkg?.title || pypiPkg?.title || value.name;
      return { ...value, title };
    })
    .sort((a, b) => b.total - a.total);
}

function parseNpmDownloads(apiResponse, packageName) {
  if (!apiResponse || !apiResponse.downloads)
    return { name: packageName, weekly: 0, monthly: 0, total: 0 };
  const downloads = apiResponse.downloads;
  return {
    name: packageName,
    weekly: downloads.slice(-7).reduce((s, d) => s + d.downloads, 0),
    monthly: downloads.slice(-30).reduce((s, d) => s + d.downloads, 0),
    total: downloads.reduce((sum, d) => sum + (d.downloads || 0), 0),
  };
}

function parsePypiDownloads(apiResponse, packageName) {
  if (!apiResponse || !apiResponse.data)
    return { name: packageName, weekly: 0, monthly: 0, total: 0 };
  const { last_week, last_month } = apiResponse.data;
  return {
    name: packageName,
    weekly: last_week ?? 0,
    monthly: last_month ?? 0,
    total: last_month ?? 0,
  };
}

describe("mergeStats", () => {
  it("merges npm and pypi results into a single map", () => {
    const result = mergeStats(
      [{ name: "pkg-a", weekly: 100, monthly: 400, total: 5000 }],
      [{ name: "pypi-b", weekly: 50, monthly: 200, total: 2000 }]
    );
    assert.ok(result["pkg-a"]);
    assert.ok(result["pypi-b"]);
    assert.equal(Object.keys(result).length, 2);
  });

  it("sets correct type for npm packages", () => {
    const result = mergeStats(
      [{ name: "x", weekly: 0, monthly: 0, total: 0 }],
      []
    );
    assert.equal(result["x"].type, "npm");
  });

  it("sets correct type for pypi packages", () => {
    const result = mergeStats(
      [],
      [{ name: "y", weekly: 0, monthly: 0, total: 0 }]
    );
    assert.equal(result["y"].type, "pypi");
  });

  it("handles empty npm and pypi arrays", () => {
    assert.deepEqual(mergeStats([], []), {});
  });

  it("defaults missing fields to 0", () => {
    const result = mergeStats([{ name: "z" }], []);
    assert.equal(result["z"].weekly, 0);
    assert.equal(result["z"].monthly, 0);
    assert.equal(result["z"].total, 0);
  });

  it("pypi entry overwrites npm entry if same name", () => {
    const result = mergeStats(
      [{ name: "shared", weekly: 100, monthly: 400, total: 5000 }],
      [{ name: "shared", weekly: 50, monthly: 200, total: 2000 }]
    );
    assert.equal(result["shared"].type, "pypi");
  });
});

describe("enrichWithTitles", () => {
  const npmPkgs = [{ name: "pkg-a", title: "Package A" }];
  const pypiPkgs = [{ name: "pypi-b", title: "PyPI B" }];

  it("adds title from npm package list", () => {
    const result = enrichWithTitles(
      { "pkg-a": { name: "pkg-a", type: "npm", total: 100 } },
      npmPkgs,
      pypiPkgs
    );
    assert.equal(result[0].title, "Package A");
  });

  it("adds title from pypi package list", () => {
    const result = enrichWithTitles(
      { "pypi-b": { name: "pypi-b", type: "pypi", total: 50 } },
      npmPkgs,
      pypiPkgs
    );
    assert.equal(result[0].title, "PyPI B");
  });

  it("falls back to package name when no title found", () => {
    const result = enrichWithTitles(
      { "unknown-pkg": { name: "unknown-pkg", type: "npm", total: 10 } },
      [],
      []
    );
    assert.equal(result[0].title, "unknown-pkg");
  });

  it("sorts by total downloads descending", () => {
    const statsMap = {
      low: { name: "low", type: "npm", total: 10 },
      high: { name: "high", type: "npm", total: 9999 },
      mid: { name: "mid", type: "npm", total: 500 },
    };
    const result = enrichWithTitles(statsMap, [], []);
    assert.equal(result[0].name, "high");
    assert.equal(result[1].name, "mid");
    assert.equal(result[2].name, "low");
  });

  it("handles empty stats map", () => {
    assert.deepEqual(enrichWithTitles({}, [], []), []);
  });
});

describe("parseNpmDownloads", () => {
  it("returns zeros for null response", () => {
    assert.deepEqual(parseNpmDownloads(null, "my-pkg"), {
      name: "my-pkg",
      weekly: 0,
      monthly: 0,
      total: 0,
    });
  });

  it("returns zeros for response with no downloads array", () => {
    assert.deepEqual(parseNpmDownloads({}, "my-pkg"), {
      name: "my-pkg",
      weekly: 0,
      monthly: 0,
      total: 0,
    });
  });

  it("sums total correctly", () => {
    const result = parseNpmDownloads(
      {
        downloads: [{ downloads: 100 }, { downloads: 200 }, { downloads: 300 }],
      },
      "my-pkg"
    );
    assert.equal(result.total, 600);
  });

  it("computes weekly from last 7 entries", () => {
    const downloads = Array.from({ length: 35 }, (_, i) => ({
      downloads: i + 1,
    }));
    const result = parseNpmDownloads({ downloads }, "my-pkg");
    const expectedWeekly = downloads
      .slice(-7)
      .reduce((s, d) => s + d.downloads, 0);
    assert.equal(result.weekly, expectedWeekly);
  });

  it("preserves package name", () => {
    assert.equal(
      parseNpmDownloads({ downloads: [] }, "cool-lib").name,
      "cool-lib"
    );
  });
});
