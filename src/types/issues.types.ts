export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: GitHubLabel[];
  user: GitHubUser;
  repository_url: string;
  state: "open" | "closed";
  comments: number;
  repoName: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssue[];
}

export type IssueType = "bug" | "feature" | "docs" | "others";

export interface IssueFilters {
  repos: string[];
  authors: string[];
  types: IssueType[];
  sortBy: "newest" | "oldest" | "most-comments";
}

export const DEFAULT_ISSUE_FILTERS: IssueFilters = {
  repos: [],
  authors: [],
  types: [],
  sortBy: "newest",
};
