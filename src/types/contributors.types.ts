export interface Contributor {
  id: number;
  contributions: number;
  html_url: string;
  avatar_url: string;
  login: string;
  lastActiveDays: number | null;
  pullRequestCount: number;
  issueCount: number;
}

export interface ContributorCountProps {
  totalContributors: number;
}

export interface TopContributorsProps {
  contributors: Contributor[];
}
