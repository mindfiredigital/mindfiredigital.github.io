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

// Top scorer from top-scorers.json
export interface ScoreBreakdown {
  pr_score: number;
  commits_score: number;
  pr_reviews_score: number;
  code_comments_score: number;
  issues_opened_score: number;
  issue_comments_score: number;
  tests_score: number;
  docs_score: number;
  mentor_score: number;
  zero_revisions_score: number;
  impact_bonus_score: number;
  projects_score: number;
}

export interface PRComplexity {
  small: number;
  medium: number;
  large: number;
}

export interface TopScorer {
  rank: number;
  username: string;
  id: number;
  avatar_url: string;
  html_url: string;
  totalCommits: number;
  totalPRs: number;
  totalPRReviewsGiven: number;
  totalCodeReviewComments: number;
  totalIssuesOpened: number;
  totalIssueComments: number;
  avgCommitsPerPR: number;
  projectsWorkingOn: number;
  prs_by_complexity: PRComplexity;
  total_score: number;
  code_score: number;
  community_score: number;
  quality_score: number;
  score_breakdown: ScoreBreakdown;
  projects: string[];
}

export interface ContributorFilters {
  sortBy: string;
  activityFilter: string;
  scoreRange: string;
}

export interface ContributorFilterSidebarProps {
  filters: ContributorFilters;
  onFilterChange: (filters: Partial<ContributorFilters>) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}
