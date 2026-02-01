import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import packagesData from "../src/app/projects/assets/packages.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const githubToken = process.env.GITHUB_TOKEN;
export const gitBaseUrl = "https://api.github.com/repos";
export const pathForJson = "../src/app/projects/assets";
export const gitOwner = "mindfiredigital";

export const npmPackages = packagesData.filter((pkg) => pkg.type === "npM");
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
  // Retry loop
  for (let attempt = 1; attempt <= retries; attempt++) {
    // Create a new AbortController for each attempt to handle request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Perform the fetch with the AbortController's signal
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      // If the response is not OK (status 4xx or 5xx), throw an error
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `HTTP ${response.status} - ${response.statusText}: ${errorText}`
        );
      }

      // Parse and return JSON response
      return await response.json();
    } catch (error) {
      // Always clear the timeout in case of error
      clearTimeout(timeoutId);

      const isLastAttempt = attempt === retries;
      const isAbort = error.name === "AbortError";

      // Log warning for each failed attempt
      console.warn(
        `Fetch attempt ${attempt} failed for ${url}: ${error.message}`
      );

      // If this was the last attempt or a timeout occurred, throw the error
      if (isLastAttempt || isAbort) {
        throw new Error(
          `Failed to fetch ${url} after ${attempt} attempts: ${error.message}`
        );
      }

      // Optional: Wait before retrying (simple linear backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
