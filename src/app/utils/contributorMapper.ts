import contributorsData from "../projects/assets/contributors.json";

interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  lastActiveDays: number;
  pullRequestCount: number;
  issueCount: number;
}

// Type-safe contributors data
const contributors = contributorsData as Contributor[];

// Create a map for quick lookup
const contributorMap = new Map(
  contributors.map((contributor) => [contributor.login, contributor])
);

/**
 * Get contributor information by GitHub URL
 * @param githubUrl - The GitHub profile URL
 * @returns Contributor object or undefined
 */
export function getContributorByUrl(
  githubUrl: string
): Contributor | undefined {
  const match = githubUrl.match(/github\.com\/([^/]+)/);
  if (match) {
    return contributorMap.get(match[1]);
  }
  return undefined;
}

/**
 * Get all contributors
 * @returns Array of all contributors
 */
export function getAllContributors(): Contributor[] {
  return contributors;
}

/**
 * Get contributors by login names
 * @param logins - Array of GitHub login names
 * @returns Array of contributors
 */
export function getContributorsByLogins(logins: string[]): Contributor[] {
  return logins
    .map((login) => contributorMap.get(login))
    .filter(
      (contributor): contributor is Contributor => contributor !== undefined
    );
}

/**
 * Search contributors by name (case-insensitive)
 * @param query - Search query
 * @returns Array of matching contributors
 */
export function searchContributors(query: string): Contributor[] {
  const lowercaseQuery = query.toLowerCase();
  return contributors.filter((contributor) =>
    contributor.login.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get top contributors by contribution count
 * @param limit - Number of top contributors to return
 * @returns Array of top contributors
 */
export function getTopContributors(limit = 10): Contributor[] {
  return [...contributors]
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, limit);
}

/**
 * Get contributor statistics
 * @returns Object containing contributor statistics
 */
export function getContributorStats() {
  const totalContributors = contributors.length;
  const totalContributions = contributors.reduce(
    (sum, c) => sum + c.contributions,
    0
  );
  const totalPullRequests = contributors.reduce(
    (sum, c) => sum + c.pullRequestCount,
    0
  );
  const totalIssues = contributors.reduce((sum, c) => sum + c.issueCount, 0);

  return {
    totalContributors,
    totalContributions,
    totalPullRequests,
    totalIssues,
    averageContributions: Math.round(totalContributions / totalContributors),
  };
}

export type { Contributor };
