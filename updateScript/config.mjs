import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import packagesData from "../src/asset/packages.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const githubToken = process.env.GITHUB_TOKEN;
export const gitBaseUrl = "https://api.github.com/repos";
export const pathForJson = "../src/asset";
export const gitOwner = "mindfiredigital";

export const npmPackages = packagesData.filter((pkg) => pkg.type === "npm");
export const pypiPackages = packagesData.filter((pkg) => pkg.type === "PyPi");

export function writeJsonToFile(relativePath, data) {
  const fullPath = path.join(__dirname, relativePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

export async function fetchData(
  url,
  options = {},
  retries = 3,
  timeoutMs = 10000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
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
      console.warn(
        `Fetch attempt ${attempt} failed for ${url}: ${error.message}`
      );
      if (isLastAttempt || isAbort) {
        throw new Error(
          `Failed to fetch ${url} after ${attempt} attempts: ${error.message}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
