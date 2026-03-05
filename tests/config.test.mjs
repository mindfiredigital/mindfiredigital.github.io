import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function writeJsonToFile(basePath, relativePath, data) {
  const fullPath = path.join(basePath, relativePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

async function fetchData(
  fetchFn,
  url,
  options = {},
  retries = 3,
  timeoutMs = 10000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchFn(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `HTTP ${response.status} - ${response.statusText}: ${errorText}`
        );
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      const isLastAttempt = attempt === retries;
      const isAbort = error.name === "AbortError";
      if (isLastAttempt || isAbort) {
        throw new Error(
          `Failed to fetch ${url} after ${attempt} attempts: ${error.message}`
        );
      }
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

describe("writeJsonToFile", () => {
  const tmpDir = path.join(__dirname, "__tmp__");

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes valid JSON to file", () => {
    const data = { hello: "world", count: 42 };
    writeJsonToFile(tmpDir, "output.json", data);
    const parsed = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "output.json"), "utf8")
    );
    assert.deepEqual(parsed, data);
  });

  it("writes array data to file", () => {
    const data = [{ id: 1 }, { id: 2 }];
    writeJsonToFile(tmpDir, "array.json", data);
    const parsed = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "array.json"), "utf8")
    );
    assert.deepEqual(parsed, data);
  });

  it("pretty-prints with 2-space indentation", () => {
    writeJsonToFile(tmpDir, "pretty.json", { a: 1 });
    const raw = fs.readFileSync(path.join(tmpDir, "pretty.json"), "utf8");
    assert.ok(raw.includes("  "));
    assert.ok(raw.includes("\n"));
  });

  it("overwrites existing file", () => {
    writeJsonToFile(tmpDir, "overwrite.json", { v: 1 });
    writeJsonToFile(tmpDir, "overwrite.json", { v: 2 });
    const parsed = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "overwrite.json"), "utf8")
    );
    assert.equal(parsed.v, 2);
  });

  it("handles empty object", () => {
    writeJsonToFile(tmpDir, "empty.json", {});
    const parsed = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "empty.json"), "utf8")
    );
    assert.deepEqual(parsed, {});
  });

  it("handles empty array", () => {
    writeJsonToFile(tmpDir, "emptyarr.json", []);
    const parsed = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "emptyarr.json"), "utf8")
    );
    assert.deepEqual(parsed, []);
  });
});
