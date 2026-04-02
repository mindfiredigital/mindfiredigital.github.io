import { PODIUM_SLOTS } from "@/app/contributors/components/PodiumSection";

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

export interface ContributorUtil {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  lastActiveDays: number;
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

export interface ContributorCardProps {
  contributor: TopScorer;
  displayRank: number;
  onViewDetails: (contributor: TopScorer) => void;
}

export interface ContributorModalProps {
  contributor: TopScorer;
  onClose: () => void;
}

export interface TopContributorsProps {
  contributors: Contributor[];
  topScorers: TopScorer[];
}

export interface DisplayContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  stat: string;
}

export interface TopScorersPanelProps {
  topScorers: TopScorer[];
  onViewDetails: (contributor: TopScorer) => void;
}

export type TabId = "alltime" | "monthly";

export interface MonthlyPayload {
  month_label: string;
  month_key?: string;
  leaderboard: TopScorer[];
}

export interface Manifest {
  months: string[];
  updated_at?: string;
}

export interface ContributorListSectionProps {
  filteredAndSorted: TopScorer[];
  totalCount: number;
  onViewDetails: (contributor: TopScorer) => void;
  onReset: () => void;
  sectionRef: React.RefObject<HTMLDivElement>;
}

export interface ContributorHeroProps {
  contributorsArray: Contributor[];
  topScorers: TopScorer[];
}

export interface PanelBodyProps {
  bodyRef: React.RefObject<HTMLDivElement>;
  isLoadingMonth: boolean;
  selectedMonth: string;
  top10: TopScorer[];
  podium3: TopScorer[];
  rest: TopScorer[];
  maxScore: number;
  displayLabel: string;
  mobileRestOpen: boolean;
  onMobileToggle: () => void;
  onViewDetails: (scorer: TopScorer) => void;
}

export interface PanelHeaderProps {
  activeTab: TabId;
  top10Length: number;
  isDownloading: boolean;
  isCopying: boolean;
  copied: boolean;
  onTabChange: (tab: TabId) => void;
  onDownload: () => void;
  onCopy: () => void;
  // monthly calendar picker props
  availableMonths: string[];
  selectedMonth: string;
  curKey: string;
  isLoadingMonth: boolean;
  displayLabel: string;
  onMonthSelect: (key: string) => void;
}

export type PodiumSlot = (typeof PODIUM_SLOTS)[number];

export interface PodiumSectionProps {
  podium3: TopScorer[];
  onViewDetails: (scorer: TopScorer) => void;
}

export interface RankListSectionProps {
  rest: TopScorer[];
  maxScore: number;
  mobileRestOpen: boolean;
  onMobileToggle: () => void;
  onViewDetails: (scorer: TopScorer) => void;
}
