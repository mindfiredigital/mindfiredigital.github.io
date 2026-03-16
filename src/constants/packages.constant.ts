export const STATS_HERO = {
  heading: "Our Packages",
  subheading:
    "Elevate your projects with Mindfire's game-changing open-source packages.",
} as const;

export const PACKAGE_CARD_LABELS = {
  totalDownloads: "Total Downloads",
  monorepoLabel: "Monorepo",
  viewAllPackages: "View All Packages",
  filterTitle: "Filter",
  githubTitle: "GitHub",
  viewPackageTitle: "View Package",
  availablePackages: "Available Packages",
  downloadsLabel: "downloads",
  selectLabel: "Select",
} as const;

export const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "NPM", value: "npm" },
  { label: "PyPI", value: "pypi" },
] as const;

export const NPM_RANGE_OPTIONS = [
  { label: "Total", value: "total" },
  { label: "Today", value: "Today" },
  { label: "Yesterday", value: "Yesterday" },
  { label: "Last month", value: "Last month" },
  { label: "This month", value: "this month" },
  { label: "Last quarter", value: "last quarter" },
  { label: "This year", value: "this year" },
  { label: "Custom Range", value: "custom" },
] as const;

export const PYPI_RANGE_OPTIONS = [
  { label: "Total", value: "total" },
  { label: "Last month", value: "month" },
  { label: "Yesterday", value: "day" },
  { label: "Last week", value: "week" },
] as const;

export const DATE_PICKER_LABELS = {
  startDate: "Start Date:",
  endDate: "End Date:",
} as const;

export const GITHUB_BASE_URL = "https://github.com/mindfiredigital" as const;

export const TOTAL_DOWNLOADS_LABEL = "Total Downloads" as const;
