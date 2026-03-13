export const PANEL_HEADER = {
  trophy: "🏆",
  crown: "👑",
  title: "Hall of Fame",
  liveLabel: "Live",
  footerHint: "Click any contributor to view full profile",
  topCountPrefix: "Top",
  topCountSuffix: "Contributors",
  scoreSuffix: "pts",
  downloadTitle: "Download image",
  noActivityEmoji: "😴",
  noActivityHeading: "No activity yet",
  fileNamePrefix: "hall-of-fame-",
  noContributor: "No contributors found",
} as const;

export const COPIED_RESET_MS = 2000 as const;

export const SCORING_SYSTEM_LABELS = {
  triggerHeading: "How is the score calculated?",
  triggerSubheading: "View the complete scoring formula",
  badge: "Scoring Formula",
  totalScore: "Total Score",
  codeScore: "Code Score",
  qualityScore: "Quality Score",
  communityScore: "Community Score",
  complexityTitle: "PR Complexity Multipliers",
} as const;

export const CODE_SCORE_ITEMS = [
  { label: "PR merged", multiplier: 5, suffix: "× complexity" },
  { label: "Commits", multiplier: 2, suffix: "" },
  { label: "PR reviews", multiplier: 3, suffix: "" },
  { label: "Code comments", multiplier: 1, suffix: "" },
] as const;

export const QUALITY_SCORE_ITEMS = [
  { label: "Has tests", multiplier: 1, suffix: "" },
  { label: "Has docs", multiplier: 1, suffix: "" },
  { label: "First-time mentor", multiplier: 5, suffix: "" },
  { label: "Zero revisions", multiplier: 2, suffix: "" },
] as const;

export const COMMUNITY_SCORE_ITEMS = [
  { label: "Issues opened", multiplier: 2, cap: "cap: 10/month" },
  { label: "Issue comments", multiplier: 1, cap: "cap: 20/month" },
  { label: "Projects worked on", multiplier: 10, cap: "" },
] as const;
