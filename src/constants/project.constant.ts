// ── Projects Page ─────────────────────────────────────────────────────────────

export const PROJECTS_HEROZ = {
  heading: "Discover Amazing Open Source Projects",
  subheading: "Explore our collection of innovative open source projects.",
  ctaLabel: "Browse Projects",
  ctaHref: "#current-projects",
  currProject: "Current Project",
  imageAlt: "projects",
} as const;

export const CURRENT_PROJECTS = {
  emptyMessage: "No current projects found.",
} as const;

export const UPCOMING_PROJECTS = {
  heading: "Upcoming Projects",
  emptyMessage: "No upcoming projects found.",
} as const;

export const PROJECTS_FILTERS_DEFAULT = {
  tags: [],
  technologies: [],
  starRange: "all",
  contributorRange: "all",
  selectedContributor: [],
  sortBy: "stars",
} as const;

export const PROJECT_SORT_OPTIONS = [
  { id: "activity", label: "Most Active (Recent Commits)" },
  { id: "stars", label: "Stars (Highest to Lowest)" },
  { id: "newest", label: "Recently Created" },
  { id: "oldest", label: "Oldest Projects" },
  { id: "name", label: "Name (A to Z)" },
] as const;

export const STAR_RANGE_OPTIONS = [
  "all",
  "10+",
  "50+",
  "100+",
  "500+",
] as const;

export const CONTRIBUTOR_RANGE_OPTIONS = [
  "all",
  "5+",
  "10+",
  "20+",
  "50+",
] as const;

export const STAR_RANGES = ["all", "10+", "50+", "100+", "500+"];

export const CONTRIBUTOR_LIST_LIMIT = 50 as const;

export const PROJECT_FILTER_SIDEBAR_LABELS = {
  heading: "Filters",
  clearLabel: (count: number) => `Clear (${count})`,
  searchProjectsPlaceholder: "Search projects...",
  searchContributorsPlaceholder: "Search contributors...",
  sortByTitle: "Sort By",
  contributorsTitle: "Contributors",
  starsTitle: "Stars",
  contributorsCountTitle: "Contributors Count",
  technologyTitle: "Technology",
  tagsTitle: "Tags",
  selectedLabel: "Selected:",
  clearAllLabel: "Clear All",
  scoreLabel: (score: number) => `Score: ${score}`,
  showingFirstN: (n: number) => `Showing first ${n} contributors`,
} as const;

export const PROJECT_TECHNOLOGY_TAGS = [
  "react",
  "vue",
  "angular",
  "typescript",
  "javascript",
  "python",
  "node.js",
  "next.js",
  "svelte",
  "tailwind",
  "css",
  "html",
] as const;

export const SORT_OPTIONS = [
  { id: "activity", label: "Most Active (Recent Commits)" },
  { id: "stars", label: "Stars (Highest to Lowest)" },
  { id: "newest", label: "Recently Created" },
  { id: "oldest", label: "Oldest Projects" },
  { id: "name", label: "Name (A to Z)" },
];

export const PROJECT_CARD_LABELS = {
  repositoryLabel: "Repository",
  docsLabel: "Docs",
} as const;

export const CONTRIBUTOR_RANGES = ["all", "5+", "10+", "20+", "50+"];

export const PROJECT_SIDEBAR = {
  CLEAR: "Clear All",
  FIRST_50: "Showing first 50 contributors",
};

export const COUNT_DURATION = 800;
