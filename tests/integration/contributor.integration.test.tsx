import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderHook, act } from "@testing-library/react";

// ── Shared mocks ────────────────────────────────────────────────────────────
// ALL jest.mock() calls must have inline data — never reference outer variables
// because jest.mock() is hoisted before any const/let declarations.

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={typeof src === "string" ? src : "mock-image"} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    target,
  }: {
    href: string;
    children: React.ReactNode;
    target?: string;
  }) => (
    <a href={href} target={target}>
      {children}
    </a>
  ),
}));

jest.mock("../../src/components/shared/BorderBeam", () => ({
  BorderBeam: () => <div data-testid='border-beam' />,
}));

jest.mock("../../src/hooks/useAnimatedCounter", () => ({
  useAnimatedCounter: (val: number) => val,
}));

jest.mock("../../src/hooks/useHashScroll", () => ({
  useHashScroll: () => {},
}));

// lucide-react icons — lightweight stubs
jest.mock("lucide-react", () => ({
  GitCommit: () => <svg data-testid='icon-git-commit' />,
  GitPullRequest: () => <svg data-testid='icon-git-pr' />,
  Eye: () => <svg data-testid='icon-eye' />,
  AlertCircle: () => <svg data-testid='icon-alert' />,
  ArrowUpRight: () => <svg data-testid='icon-arrow-up-right' />,
  X: () => <svg data-testid='icon-x' />,
  Search: () => <svg data-testid='icon-search' />,
  SlidersHorizontal: () => <svg data-testid='icon-sliders' />,
  ChevronDown: () => <svg data-testid='icon-chevron-down' />,
  ChevronUp: () => <svg data-testid='icon-chevron-up' />,
  ExternalLink: () => <svg data-testid='icon-external-link' />,
  Github: () => <svg data-testid='icon-github' />,
  MessageSquare: () => <svg data-testid='icon-message-square' />,
  Layers: () => <svg data-testid='icon-layers' />,
  Info: () => <svg data-testid='icon-info' />,
}));

// html-to-image — prevent real DOM capture in tests
jest.mock("html-to-image", () => ({
  toPng: jest.fn().mockResolvedValue("data:image/png;base64,mock"),
}));

// ── Utility mocks ─────────────────────────────────────────────────────────────
// contributorMapper.ts imports contributors.json as a plain array and calls
// .map() on it at module-evaluation time — before our asset mock can run.
// Mocking the module directly prevents that crash entirely.
jest.mock("../../src/app/utils/contributorMapper", () => ({
  getContributorByLogin: jest.fn((login: string) => ({
    login,
    id: 0,
    avatar_url: "",
    html_url: `https://github.com/${login}`,
    contributions: 0,
    lastActiveDays: null,
    pullRequestCount: 0,
    issueCount: 0,
  })),
  contributorMap: new Map(),
}));

// BuildGroups uses contributorMapper internally — stub it so TopContributors
// renders without touching the real contributor array.
jest.mock("../../src/app/utils/buildGroups", () => ({
  BuildGroups: jest.fn(() => [
    {
      label: "Most Commits",
      icon: "🔥",
      items: [
        {
          login: "anandmindfire",
          avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
          html_url: "https://github.com/anandmindfire",
          stat: "1081 commits",
        },
      ],
    },
  ]),
}));

// Mock the utils barrel (src/app/utils/index.ts) so every re-export that
// touches contributorMapper is also intercepted.
jest.mock("../../src/app/utils", () => ({
  groupPackages: jest.fn(() => []),
  getRankStyles: jest.fn(() => ({
    border: "border-gray-200",
    badge: "text-gray-500 bg-gray-50 border-gray-200",
    glow: "",
    scoreGradient: "from-gray-400 to-gray-500",
    label: "",
    rankText: "#1",
  })),
  getRankBadge: jest.fn(() => ({
    label: "🥇 Gold",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  })),
  toBase64Url: jest.fn(async (src: string) => src),
  formatMonthKey: jest.fn((key: string) => key),
  currentMonthKey: jest.fn(() => "2026-03"),
  getContributorByLogin: jest.fn((login: string) => ({
    login,
    id: 0,
    avatar_url: "",
    html_url: `https://github.com/${login}`,
    contributions: 0,
    lastActiveDays: null,
    pullRequestCount: 0,
    issueCount: 0,
  })),
  BuildGroups: jest.fn(() => []),

  // ✅ Contributors page calls this at render time — must be mocked
  buildFilterSidebarProps: jest.fn(() => ({
    filters: {
      sortBy: "total_score",
      activityFilter: "all",
      scoreRange: "all",
    },
    searchQuery: "",
    onFilterChange: jest.fn(),
    onSearchChange: jest.fn(),
    onReset: jest.fn(),
    isMobileOpen: false,
    onMobileToggle: jest.fn(),
  })),
}));

// ── Asset mocks — ALL data inlined inside the factory ───────────────────────

jest.mock(
  "../../src/asset/contributors.json",
  () => ({
    "155735575": {
      id: 155735575,
      contributions: 1083,
      html_url: "https://github.com/anandmindfire",
      avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
      login: "anandmindfire",
      lastActiveDays: null,
      pullRequestCount: 124,
      issueCount: 51,
    },
    "155735643": {
      id: 155735643,
      contributions: 653,
      html_url: "https://github.com/deepakyadav-01",
      avatar_url: "https://avatars.githubusercontent.com/u/155735643?v=4",
      login: "deepakyadav-01",
      lastActiveDays: 5,
      pullRequestCount: 186,
      issueCount: 39,
    },
    "193932396": {
      id: 193932396,
      contributions: 341,
      html_url: "https://github.com/ParasMindfire",
      avatar_url: "https://avatars.githubusercontent.com/u/193932396?v=4",
      login: "ParasMindfire",
      lastActiveDays: 1,
      pullRequestCount: 30,
      issueCount: 66,
    },
    "116242186": {
      id: 116242186,
      contributions: 296,
      html_url: "https://github.com/ashutosh-jena-mindfire",
      avatar_url: "https://avatars.githubusercontent.com/u/116242186?v=4",
      login: "ashutosh-jena-mindfire",
      lastActiveDays: 1,
      pullRequestCount: 29,
      issueCount: 12,
    },
  }),
  { virtual: true }
);

jest.mock(
  "../../src/asset/leaderboard.json",
  () => ({
    leaderboard: [
      {
        rank: 1,
        username: "anandmindfire",
        id: 155735575,
        avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
        html_url: "https://github.com/anandmindfire",
        totalCommits: 1081,
        totalPRs: 151,
        totalPRReviewsGiven: 37,
        totalCodeReviewComments: 19,
        totalIssuesOpened: 51,
        totalIssueComments: 1,
        avgCommitsPerPR: 7.16,
        projectsWorkingOn: 10,
        prs_by_complexity: { small: 58, medium: 33, large: 60 },
        total_score: 3787,
        code_score: 3307,
        community_score: 175,
        quality_score: 305,
        score_breakdown: {
          pr_score: 1015,
          commits_score: 2162,
          pr_reviews_score: 111,
          code_comments_score: 19,
          issues_opened_score: 74,
          issue_comments_score: 1,
          projects_score: 100,
          tests_score: 1,
          docs_score: 2,
          mentor_score: 0,
          zero_revisions_score: 302,
          impact_bonus_score: 0,
        },
        projects: ["ESLint Plugin Hub", "Page Builder", "Pivothead"],
      },
      {
        rank: 2,
        username: "deepakyadav-01",
        id: 155735643,
        avatar_url: "https://avatars.githubusercontent.com/u/155735643?v=4",
        html_url: "https://github.com/deepakyadav-01",
        totalCommits: 654,
        totalPRs: 213,
        totalPRReviewsGiven: 22,
        totalCodeReviewComments: 5,
        totalIssuesOpened: 39,
        totalIssueComments: 3,
        avgCommitsPerPR: 3.07,
        projectsWorkingOn: 6,
        prs_by_complexity: { small: 80, medium: 90, large: 43 },
        total_score: 3372,
        code_score: 2900,
        community_score: 220,
        quality_score: 252,
        score_breakdown: {
          pr_score: 900,
          commits_score: 1800,
          pr_reviews_score: 66,
          code_comments_score: 5,
          issues_opened_score: 57,
          issue_comments_score: 3,
          projects_score: 60,
          tests_score: 0,
          docs_score: 1,
          mentor_score: 0,
          zero_revisions_score: 480,
          impact_bonus_score: 0,
        },
        projects: ["ESLint Plugin Hub", "Canvas Editor"],
      },
      {
        rank: 3,
        username: "ParasMindfire",
        id: 193932396,
        avatar_url: "https://avatars.githubusercontent.com/u/193932396?v=4",
        html_url: "https://github.com/ParasMindfire",
        totalCommits: 341,
        totalPRs: 88,
        totalPRReviewsGiven: 15,
        totalCodeReviewComments: 3,
        totalIssuesOpened: 66,
        totalIssueComments: 2,
        avgCommitsPerPR: 3.87,
        projectsWorkingOn: 5,
        prs_by_complexity: { small: 30, medium: 35, large: 23 },
        total_score: 1950,
        code_score: 1600,
        community_score: 180,
        quality_score: 170,
        score_breakdown: {
          pr_score: 500,
          commits_score: 900,
          pr_reviews_score: 45,
          code_comments_score: 3,
          issues_opened_score: 96,
          issue_comments_score: 2,
          projects_score: 50,
          tests_score: 0,
          docs_score: 0,
          mentor_score: 0,
          zero_revisions_score: 354,
          impact_bonus_score: 0,
        },
        projects: ["Page Builder", "Pivothead"],
      },
      {
        rank: 4,
        username: "ashutosh-jena-mindfire",
        id: 116242186,
        avatar_url: "https://avatars.githubusercontent.com/u/116242186?v=4",
        html_url: "https://github.com/ashutosh-jena-mindfire",
        totalCommits: 296,
        totalPRs: 29,
        totalPRReviewsGiven: 10,
        totalCodeReviewComments: 2,
        totalIssuesOpened: 12,
        totalIssueComments: 0,
        avgCommitsPerPR: 10.2,
        projectsWorkingOn: 3,
        prs_by_complexity: { small: 12, medium: 10, large: 7 },
        total_score: 1200,
        code_score: 1000,
        community_score: 100,
        quality_score: 100,
        score_breakdown: {
          pr_score: 300,
          commits_score: 600,
          pr_reviews_score: 30,
          code_comments_score: 2,
          issues_opened_score: 18,
          issue_comments_score: 0,
          projects_score: 30,
          tests_score: 0,
          docs_score: 0,
          mentor_score: 0,
          zero_revisions_score: 220,
          impact_bonus_score: 0,
        },
        projects: ["Canvas Editor"],
      },
    ],
  }),
  { virtual: true }
);

jest.mock(
  "../../src/asset/leaderboard-monthly.json",
  () => ({
    month_label: "March 2026",
    month_key: "2026-03",
    leaderboard: [
      {
        rank: 1,
        username: "anandmindfire",
        id: 155735575,
        avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
        html_url: "https://github.com/anandmindfire",
        totalCommits: 100,
        totalPRs: 20,
        totalPRReviewsGiven: 5,
        totalCodeReviewComments: 2,
        totalIssuesOpened: 8,
        totalIssueComments: 0,
        avgCommitsPerPR: 5.0,
        projectsWorkingOn: 3,
        prs_by_complexity: { small: 8, medium: 7, large: 5 },
        total_score: 800,
        code_score: 700,
        community_score: 50,
        quality_score: 50,
        score_breakdown: {
          pr_score: 200,
          commits_score: 400,
          pr_reviews_score: 15,
          code_comments_score: 2,
          issues_opened_score: 12,
          issue_comments_score: 0,
          projects_score: 30,
          tests_score: 0,
          docs_score: 0,
          mentor_score: 0,
          zero_revisions_score: 141,
          impact_bonus_score: 0,
        },
        projects: ["ESLint Plugin Hub"],
      },
    ],
  }),
  { virtual: true }
);

// Mock fetch for manifest and monthly leaderboard API calls
global.fetch = jest.fn();

const mockManifestFetch = () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ months: ["2026-03", "2026-02", "2026-01"] }),
  });
};

// ── Component & hook imports — MUST come after all jest.mock() calls ─────────

import Contributors from "../../src/app/contributors/page";
import ContributorCard from "../../src/app/contributors/components/ContributorCard";
import ContributorModal from "../../src/app/contributors/components/ContributorModal";
import ContributorFilterSidebar from "../../src/app/contributors/components/ContributorFilterSidebar";
import ContributorListSection from "../../src/app/contributors/components/ContributorListSection";
import ContributorCount from "../../src/app/contributors/components/ContributorCount";
import ScoringSystem from "../../src/app/contributors/components/ScoringSystem";
import { FilterSection } from "../../src/app/contributors/components/FilterSection";
import { RadioGroup } from "../../src/app/contributors/components/RadioGroup";
import { useContributorFilters } from "../../src/hooks/useContributorfilters";

import {
  CONTRIBUTORS_HERO,
  CONTRIBUTORS_LIST,
  FILTER_LABELS,
  CONTRIBUTOR_CARD_LABELS,
  SCORING_SYSTEM_LABELS,
} from "../../src/constants";
import { Contributor, TopScorer, ContributorFilters } from "../../src/types";

// ── Test fixtures — declared AFTER all mocks, safe to use in test bodies ─────

const mockContributors: Contributor[] = [
  {
    id: 155735575,
    contributions: 1083,
    html_url: "https://github.com/anandmindfire",
    avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
    login: "anandmindfire",
    lastActiveDays: null,
    pullRequestCount: 124,
    issueCount: 51,
  },
  {
    id: 155735643,
    contributions: 653,
    html_url: "https://github.com/deepakyadav-01",
    avatar_url: "https://avatars.githubusercontent.com/u/155735643?v=4",
    login: "deepakyadav-01",
    lastActiveDays: 5,
    pullRequestCount: 186,
    issueCount: 39,
  },
  {
    id: 193932396,
    contributions: 341,
    html_url: "https://github.com/ParasMindfire",
    avatar_url: "https://avatars.githubusercontent.com/u/193932396?v=4",
    login: "ParasMindfire",
    lastActiveDays: 1,
    pullRequestCount: 30,
    issueCount: 66,
  },
  {
    id: 116242186,
    contributions: 296,
    html_url: "https://github.com/ashutosh-jena-mindfire",
    avatar_url: "https://avatars.githubusercontent.com/u/116242186?v=4",
    login: "ashutosh-jena-mindfire",
    lastActiveDays: 1,
    pullRequestCount: 29,
    issueCount: 12,
  },
];

const mockTopScorers: TopScorer[] = [
  {
    rank: 1,
    username: "anandmindfire",
    id: 155735575,
    avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
    html_url: "https://github.com/anandmindfire",
    totalCommits: 1081,
    totalPRs: 151,
    totalPRReviewsGiven: 37,
    totalCodeReviewComments: 19,
    totalIssuesOpened: 51,
    totalIssueComments: 1,
    avgCommitsPerPR: 7.16,
    projectsWorkingOn: 10,
    prs_by_complexity: { small: 58, medium: 33, large: 60 },
    total_score: 3787,
    code_score: 3307,
    community_score: 175,
    quality_score: 305,
    score_breakdown: {
      pr_score: 1015,
      commits_score: 2162,
      pr_reviews_score: 111,
      code_comments_score: 19,
      issues_opened_score: 74,
      issue_comments_score: 1,
      projects_score: 100,
      tests_score: 1,
      docs_score: 2,
      mentor_score: 0,
      zero_revisions_score: 302,
      impact_bonus_score: 0,
    },
    projects: ["ESLint Plugin Hub", "Page Builder", "Pivothead"],
  },
  {
    rank: 2,
    username: "deepakyadav-01",
    id: 155735643,
    avatar_url: "https://avatars.githubusercontent.com/u/155735643?v=4",
    html_url: "https://github.com/deepakyadav-01",
    totalCommits: 654,
    totalPRs: 213,
    totalPRReviewsGiven: 22,
    totalCodeReviewComments: 5,
    totalIssuesOpened: 39,
    totalIssueComments: 3,
    avgCommitsPerPR: 3.07,
    projectsWorkingOn: 6,
    prs_by_complexity: { small: 80, medium: 90, large: 43 },
    total_score: 3372,
    code_score: 2900,
    community_score: 220,
    quality_score: 252,
    score_breakdown: {
      pr_score: 900,
      commits_score: 1800,
      pr_reviews_score: 66,
      code_comments_score: 5,
      issues_opened_score: 57,
      issue_comments_score: 3,
      projects_score: 60,
      tests_score: 0,
      docs_score: 1,
      mentor_score: 0,
      zero_revisions_score: 480,
      impact_bonus_score: 0,
    },
    projects: ["ESLint Plugin Hub", "Canvas Editor"],
  },
  {
    rank: 3,
    username: "ParasMindfire",
    id: 193932396,
    avatar_url: "https://avatars.githubusercontent.com/u/193932396?v=4",
    html_url: "https://github.com/ParasMindfire",
    totalCommits: 341,
    totalPRs: 88,
    totalPRReviewsGiven: 15,
    totalCodeReviewComments: 3,
    totalIssuesOpened: 66,
    totalIssueComments: 2,
    avgCommitsPerPR: 3.87,
    projectsWorkingOn: 5,
    prs_by_complexity: { small: 30, medium: 35, large: 23 },
    total_score: 1950,
    code_score: 1600,
    community_score: 180,
    quality_score: 170,
    score_breakdown: {
      pr_score: 500,
      commits_score: 900,
      pr_reviews_score: 45,
      code_comments_score: 3,
      issues_opened_score: 96,
      issue_comments_score: 2,
      projects_score: 50,
      tests_score: 0,
      docs_score: 0,
      mentor_score: 0,
      zero_revisions_score: 354,
      impact_bonus_score: 0,
    },
    projects: ["Page Builder", "Pivothead"],
  },
  {
    rank: 4,
    username: "ashutosh-jena-mindfire",
    id: 116242186,
    avatar_url: "https://avatars.githubusercontent.com/u/116242186?v=4",
    html_url: "https://github.com/ashutosh-jena-mindfire",
    totalCommits: 296,
    totalPRs: 29,
    totalPRReviewsGiven: 10,
    totalCodeReviewComments: 2,
    totalIssuesOpened: 12,
    totalIssueComments: 0,
    avgCommitsPerPR: 10.2,
    projectsWorkingOn: 3,
    prs_by_complexity: { small: 12, medium: 10, large: 7 },
    total_score: 1200,
    code_score: 1000,
    community_score: 100,
    quality_score: 100,
    score_breakdown: {
      pr_score: 300,
      commits_score: 600,
      pr_reviews_score: 30,
      code_comments_score: 2,
      issues_opened_score: 18,
      issue_comments_score: 0,
      projects_score: 30,
      tests_score: 0,
      docs_score: 0,
      mentor_score: 0,
      zero_revisions_score: 220,
      impact_bonus_score: 0,
    },
    projects: ["Canvas Editor"],
  },
];

const defaultFilters: ContributorFilters = {
  sortBy: "total_score",
  activityFilter: "all",
  scoreRange: "all",
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. Contributors Page — structure & hero
// ═══════════════════════════════════════════════════════════════════════════

describe("Contributors Page — structure and hero", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManifestFetch();
    render(<Contributors />);
  });

  it("renders the hero heading", () => {
    expect(
      screen.getByRole("heading", { name: CONTRIBUTORS_HERO.heading })
    ).toBeInTheDocument();
  });

  it("renders the top contributors subheading", () => {
    expect(
      screen.getByText(CONTRIBUTORS_HERO.topContributorsHeading)
    ).toBeInTheDocument();
  });

  it("renders the contributors subheading text", () => {
    expect(
      screen.getByText(CONTRIBUTORS_HERO.topContributorsSubheading)
    ).toBeInTheDocument();
  });

  it("renders the ContributorCount badge", () => {
    expect(screen.getByAltText("github_contributors")).toBeInTheDocument();
  });

  it("renders the Contributors list heading", () => {
    expect(screen.getByText(CONTRIBUTORS_LIST.heading)).toBeInTheDocument();
  });

  it("renders the '4 of 4' count badge", () => {
    expect(screen.getByText(/4 of 4/)).toBeInTheDocument();
  });

  it("does not show ContributorModal on initial render", () => {
    // Modal renders an overlay backdrop — should not be present
    expect(
      screen.queryByRole("button", { name: /close/i })
    ).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Contributors Page — ContributorModal user journey
// ═══════════════════════════════════════════════════════════════════════════

describe("Contributors Page — ContributorModal open/close user journey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockManifestFetch();
    render(<Contributors />);
  });

  it("opens ContributorModal when 'View Profile' is clicked on a card", async () => {
    const viewProfileBtns = screen.getAllByRole("button", {
      name: new RegExp(CONTRIBUTOR_CARD_LABELS.viewProfileLabel, "i"),
    });
    act(() => {
      fireEvent.click(viewProfileBtns[0]);
    });

    await waitFor(() => {
      // Modal renders the contributor's username as a heading
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(
        headings.some((h) => h.textContent?.includes("anandmindfire"))
      ).toBe(true);
    });
  });

  it("modal shows the GitHub link for the contributor", async () => {
    const viewProfileBtns = screen.getAllByRole("button", {
      name: new RegExp(CONTRIBUTOR_CARD_LABELS.viewProfileLabel, "i"),
    });
    act(() => {
      fireEvent.click(viewProfileBtns[0]);
    });

    await waitFor(() => {
      expect(screen.getByText("View GitHub Profile")).toBeInTheDocument();
    });
  });

  it("modal shows PR complexity section", async () => {
    const viewProfileBtns = screen.getAllByRole("button", {
      name: new RegExp(CONTRIBUTOR_CARD_LABELS.viewProfileLabel, "i"),
    });
    act(() => {
      fireEvent.click(viewProfileBtns[0]);
    });

    await waitFor(() => {
      expect(screen.getAllByText("Small").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Medium").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Large").length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. ContributorCard component
// ═══════════════════════════════════════════════════════════════════════════

describe("ContributorCard", () => {
  const onViewDetails = jest.fn();
  const topScorer = mockTopScorers[0]; // anandmindfire, rank 1

  afterEach(() => jest.clearAllMocks());

  it("renders the contributor username", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(screen.getByText("anandmindfire")).toBeInTheDocument();
  });

  it("renders total score", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(screen.getByText("3,787")).toBeInTheDocument();
  });

  it("renders the score suffix label", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(
      screen.getByText(CONTRIBUTOR_CARD_LABELS.scoreSuffix)
    ).toBeInTheDocument();
  });

  it("renders the total score label", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(
      screen.getByText(CONTRIBUTOR_CARD_LABELS.totalScoreLabel)
    ).toBeInTheDocument();
  });

  it("renders the projects count correctly (singular)", () => {
    const singleProjectScorer = { ...topScorer, projectsWorkingOn: 1 };
    render(
      <ContributorCard
        contributor={singleProjectScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(screen.getByText("1 project")).toBeInTheDocument();
  });

  it("renders the projects count correctly (plural)", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(screen.getByText("10 projects")).toBeInTheDocument();
  });

  it("renders commit, PR, reviews, issues stats", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(screen.getByText("Commits")).toBeInTheDocument();
    expect(screen.getByText("PRs")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Issues")).toBeInTheDocument();
  });

  it("renders the avatar image with the contributor's username as alt", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(screen.getByAltText("anandmindfire")).toBeInTheDocument();
  });

  it("renders a GitHub profile link", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(
      screen.getByRole("link", {
        name: new RegExp("anandmindfire", "i"),
      })
    ).toHaveAttribute("href", "https://github.com/anandmindfire");
  });

  it("renders the 'View Profile' button", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    expect(
      screen.getByRole("button", {
        name: new RegExp(CONTRIBUTOR_CARD_LABELS.viewProfileLabel, "i"),
      })
    ).toBeInTheDocument();
  });

  it("calls onViewDetails with the contributor when 'View Profile' is clicked", () => {
    render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(CONTRIBUTOR_CARD_LABELS.viewProfileLabel, "i"),
      })
    );
    expect(onViewDetails).toHaveBeenCalledTimes(1);
    expect(onViewDetails).toHaveBeenCalledWith(
      expect.objectContaining({ username: "anandmindfire" })
    );
  });

  it("renders a top-3 highlight for rank 1", () => {
    const { container } = render(
      <ContributorCard
        contributor={topScorer}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    // Top-3 cards get the gradient highlight bar
    const highlightBar = container.querySelector(".h-0\\.5");
    expect(highlightBar).toBeInTheDocument();
  });

  it("does not render highlight bar for rank 4+", () => {
    const { container } = render(
      <ContributorCard
        contributor={{ ...topScorer, rank: 4 }}
        displayRank={4}
        onViewDetails={onViewDetails}
      />
    );
    const highlightBar = container.querySelector(".h-0\\.5");
    expect(highlightBar).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. ContributorModal component
// ═══════════════════════════════════════════════════════════════════════════

describe("ContributorModal", () => {
  const onClose = jest.fn();
  const contributor = mockTopScorers[0]; // anandmindfire

  afterEach(() => jest.clearAllMocks());

  it("renders contributor username as the modal title", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(
      screen.getByRole("heading", { name: "anandmindfire" })
    ).toBeInTheDocument();
  });

  it("renders all four score tiles", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(screen.getByText("Total Score")).toBeInTheDocument();
    expect(screen.getByText("Code Score")).toBeInTheDocument();
    expect(screen.getByText("Quality Score")).toBeInTheDocument();
    expect(screen.getByText("Community Score")).toBeInTheDocument();
  });

  it("renders total score value correctly", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(screen.getByText("3,787")).toBeInTheDocument();
  });

  it("renders the View GitHub Profile link with correct href", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(
      screen.getByText("View GitHub Profile").closest("a")
    ).toHaveAttribute("href", "https://github.com/anandmindfire");
  });

  it("renders PR complexity section with Small, Medium, Large", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(screen.getAllByText("Small").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Medium").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Large").length).toBeGreaterThan(0);
  });

  it("renders the projects list when projects are available", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(screen.getByText("ESLint Plugin Hub")).toBeInTheDocument();
    expect(screen.getByText("Page Builder")).toBeInTheDocument();
  });

  it("calls onClose when the close (X) button is clicked", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    const closeBtn = document.querySelector(
      ".sticky button"
    )! as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the overlay backdrop is clicked", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    const overlay = document.querySelector(
      ".absolute.inset-0.bg-black"
    ) as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders score_breakdown items in the score breakdown section", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    // PR Score appears in the breakdown list
    expect(screen.getByText("PR Score")).toBeInTheDocument();
    expect(screen.getByText("Commits Score")).toBeInTheDocument();
  });

  it("renders avgCommitsPerPR stat", () => {
    render(<ContributorModal contributor={contributor} onClose={onClose} />);
    expect(screen.getByText("Avg Commits/PR")).toBeInTheDocument();
    expect(screen.getByText("7.2")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. ContributorFilterSidebar component
// ═══════════════════════════════════════════════════════════════════════════

describe("ContributorFilterSidebar", () => {
  const baseProps = {
    filters: defaultFilters,
    onFilterChange: jest.fn(),
    onReset: jest.fn(),
    searchQuery: "",
    onSearchChange: jest.fn(),
    isMobileOpen: false,
    onMobileToggle: jest.fn(),
  };

  afterEach(() => jest.clearAllMocks());

  it("renders Sort By filter section", () => {
    render(<ContributorFilterSidebar {...baseProps} />);
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("renders Last Active filter section", () => {
    render(<ContributorFilterSidebar {...baseProps} />);
    expect(screen.getByText("Last Active")).toBeInTheDocument();
  });

  it("renders Min Total Score filter section", () => {
    render(<ContributorFilterSidebar {...baseProps} />);
    expect(screen.getByText("Min Total Score")).toBeInTheDocument();
  });

  it("does not show Reset button when no active filters", () => {
    render(<ContributorFilterSidebar {...baseProps} />);
    expect(screen.queryByText(/Reset/)).not.toBeInTheDocument();
  });

  it("shows Reset button when a filter is active", () => {
    render(
      <ContributorFilterSidebar
        {...baseProps}
        filters={{ ...defaultFilters, scoreRange: "1000" }}
      />
    );
    expect(screen.getByText(/Reset \(1\)/)).toBeInTheDocument();
  });

  it("shows Reset (2) when two filters are active", () => {
    render(
      <ContributorFilterSidebar
        {...baseProps}
        filters={{
          sortBy: "total_score",
          activityFilter: "7",
          scoreRange: "1000",
        }}
      />
    );
    expect(screen.getByText(/Reset \(2\)/)).toBeInTheDocument();
  });

  it("calls onReset when Reset button is clicked", () => {
    const onReset = jest.fn();
    render(
      <ContributorFilterSidebar
        {...baseProps}
        filters={{ ...defaultFilters, scoreRange: "1000" }}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByText(/Reset \(1\)/));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("calls onSearchChange when search input changes", async () => {
    const onSearchChange = jest.fn();
    render(
      <ContributorFilterSidebar
        {...baseProps}
        onSearchChange={onSearchChange}
      />
    );
    await userEvent.type(
      screen.getByPlaceholderText(FILTER_LABELS.searchPlaceholder),
      "test"
    );
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("shows clear (X) icon when searchQuery is non-empty", () => {
    render(<ContributorFilterSidebar {...baseProps} searchQuery='anand' />);
    // The X button appears when searchQuery is truthy
    const clearBtns = screen.getAllByTestId("icon-x");
    expect(clearBtns.length).toBeGreaterThan(0);
  });

  it("calls onMobileToggle when the mobile filter button is clicked", () => {
    const onMobileToggle = jest.fn();
    render(
      <ContributorFilterSidebar
        {...baseProps}
        onMobileToggle={onMobileToggle}
      />
    );
    // Mobile floating button is always rendered
    const filtersBtns = screen.getAllByText("Filters");
    fireEvent.click(filtersBtns[0]);
    expect(onMobileToggle).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. ContributorListSection component
// ═══════════════════════════════════════════════════════════════════════════

describe("ContributorListSection", () => {
  const sectionRef = { current: null } as React.RefObject<HTMLDivElement>;
  const onViewDetails = jest.fn();
  const onReset = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it("renders the section heading", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    expect(screen.getByText(CONTRIBUTORS_LIST.heading)).toBeInTheDocument();
  });

  it("renders the '4 of 4' count badge", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    expect(screen.getByText("4 of 4")).toBeInTheDocument();
  });

  it("renders contributor cards for every item in filteredAndSorted", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    expect(screen.getByText("anandmindfire")).toBeInTheDocument();
    expect(screen.getByText("deepakyadav-01")).toBeInTheDocument();
    expect(screen.getByText("ParasMindfire")).toBeInTheDocument();
    expect(screen.getByText("ashutosh-jena-mindfire")).toBeInTheDocument();
  });

  it("shows empty state when filteredAndSorted is empty", () => {
    render(
      <ContributorListSection
        filteredAndSorted={[]}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    expect(
      screen.getByText(CONTRIBUTORS_LIST.emptyMessage)
    ).toBeInTheDocument();
  });

  it("shows the '0 of 4' count when filtered list is empty", () => {
    render(
      <ContributorListSection
        filteredAndSorted={[]}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    expect(screen.getByText("0 of 4")).toBeInTheDocument();
  });

  it("calls onReset when the Clear filters button in empty state is clicked", () => {
    render(
      <ContributorListSection
        filteredAndSorted={[]}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    fireEvent.click(screen.getByText(CONTRIBUTORS_LIST.clearFiltersLabel));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("assigns displayRank correctly — first card gets rank 1", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={4}
        onViewDetails={onViewDetails}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    // Top card for rank 1 shows "10 projects" (anandmindfire's projectsWorkingOn)
    expect(screen.getByText("10 projects")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. ContributorCount component
// ═══════════════════════════════════════════════════════════════════════════

describe("ContributorCount", () => {
  it("renders the total contributor count", () => {
    render(<ContributorCount totalContributors={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders 0 when totalContributors is 0", () => {
    render(<ContributorCount totalContributors={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders the github_contributors icon", () => {
    render(<ContributorCount totalContributors={10} />);
    expect(screen.getByAltText("github_contributors")).toBeInTheDocument();
  });

  it("renders the BorderBeam decoration", () => {
    render(<ContributorCount totalContributors={10} />);
    expect(screen.getByTestId("border-beam")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. ScoringSystem component
// ═══════════════════════════════════════════════════════════════════════════

describe("ScoringSystem", () => {
  it("renders the trigger button heading", () => {
    render(<ScoringSystem />);
    expect(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading)
    ).toBeInTheDocument();
  });

  it("renders the trigger subheading", () => {
    render(<ScoringSystem />);
    expect(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerSubheading)
    ).toBeInTheDocument();
  });

  it("shows scoring content after clicking the trigger", () => {
    render(<ScoringSystem />);
    fireEvent.click(screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading));
    expect(screen.getByText(SCORING_SYSTEM_LABELS.badge)).toBeInTheDocument();
  });

  it("shows PR complexity multipliers section after expanding", () => {
    render(<ScoringSystem />);
    fireEvent.click(screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading));
    expect(screen.getByText("PR Complexity Multipliers")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. FilterSection component
// ═══════════════════════════════════════════════════════════════════════════

describe("FilterSection", () => {
  const onToggle = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it("renders the section title", () => {
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={onToggle}>
        <div>child content</div>
      </FilterSection>
    );
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("renders children when expanded is true", () => {
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={onToggle}>
        <div>child content</div>
      </FilterSection>
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("does not render children when expanded is false", () => {
    render(
      <FilterSection title='Sort By' expanded={false} onToggle={onToggle}>
        <div>child content</div>
      </FilterSection>
    );
    expect(screen.queryByText("child content")).not.toBeInTheDocument();
  });

  it("calls onToggle when the section header button is clicked", () => {
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={onToggle}>
        <div>child content</div>
      </FilterSection>
    );
    fireEvent.click(screen.getByText("Sort By"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows ChevronUp icon when expanded", () => {
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={onToggle}>
        <div />
      </FilterSection>
    );
    expect(screen.getByTestId("icon-chevron-up")).toBeInTheDocument();
  });

  it("shows ChevronDown icon when collapsed", () => {
    render(
      <FilterSection title='Sort By' expanded={false} onToggle={onToggle}>
        <div />
      </FilterSection>
    );
    expect(screen.getByTestId("icon-chevron-down")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. RadioGroup component
// ═══════════════════════════════════════════════════════════════════════════

describe("RadioGroup", () => {
  const onChange = jest.fn();
  const options = [
    { id: "all", label: "Any time" },
    { id: "7", label: "Last 7 days" },
    { id: "30", label: "Last 30 days" },
  ];

  afterEach(() => jest.clearAllMocks());

  it("renders all option labels", () => {
    render(
      <RadioGroup
        name='activityFilter'
        value='all'
        onChange={onChange}
        options={options}
      />
    );
    expect(screen.getByText("Any time")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("marks the active option as checked", () => {
    render(
      <RadioGroup
        name='activityFilter'
        value='7'
        onChange={onChange}
        options={options}
      />
    );
    const checked = screen.getByRole("radio", { name: "Last 7 days" });
    expect(checked).toBeChecked();
  });

  it("marks inactive options as unchecked", () => {
    render(
      <RadioGroup
        name='activityFilter'
        value='7'
        onChange={onChange}
        options={options}
      />
    );
    expect(screen.getByRole("radio", { name: "Any time" })).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Last 30 days" })
    ).not.toBeChecked();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. useContributorFilters hook
// ═══════════════════════════════════════════════════════════════════════════

describe("useContributorFilters hook", () => {
  it("returns all top scorers unfiltered by default", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    expect(result.current.filteredAndSorted).toHaveLength(
      mockTopScorers.length
    );
  });

  it("default sortBy is total_score — highest score first", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    const scores = result.current.filteredAndSorted.map((c) => c.total_score);
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
    expect(scores[1]).toBeGreaterThanOrEqual(scores[2]);
  });

  it("filters by search query (case-insensitive)", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleSearchChange("ANAND");
    });
    expect(result.current.filteredAndSorted).toHaveLength(1);
    expect(result.current.filteredAndSorted[0].username).toBe("anandmindfire");
  });

  it("returns empty array when search matches nobody", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleSearchChange("zzznomatch");
    });
    expect(result.current.filteredAndSorted).toHaveLength(0);
  });

  it("scoreRange filter 2000 keeps only contributors with score >= 2000", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ scoreRange: "2000" });
    });
    result.current.filteredAndSorted.forEach((c) => {
      expect(c.total_score).toBeGreaterThanOrEqual(2000);
    });
  });

  it("activityFilter '7' excludes contributors with null lastActiveDays", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ activityFilter: "7" });
    });
    // anandmindfire has lastActiveDays: null — should be excluded
    expect(
      result.current.filteredAndSorted.find(
        (c) => c.username === "anandmindfire"
      )
    ).toBeUndefined();
  });

  it("activityFilter '7' keeps contributors active within 7 days", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ activityFilter: "7" });
    });
    // deepakyadav-01 has lastActiveDays: 5 — should pass
    expect(
      result.current.filteredAndSorted.find(
        (c) => c.username === "deepakyadav-01"
      )
    ).toBeDefined();
  });

  it("sortBy totalCommits reorders by commit count descending", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ sortBy: "totalCommits" });
    });
    const commits = result.current.filteredAndSorted.map((c) => c.totalCommits);
    expect(commits[0]).toBeGreaterThanOrEqual(commits[1]);
  });

  it("sortBy totalPRs reorders by PR count descending", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ sortBy: "totalPRs" });
    });
    const prs = result.current.filteredAndSorted.map((c) => c.totalPRs);
    expect(prs[0]).toBeGreaterThanOrEqual(prs[1]);
  });

  it("sortBy code_score reorders by code score descending", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ sortBy: "code_score" });
    });
    const scores = result.current.filteredAndSorted.map((c) => c.code_score);
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
  });

  it("handleReset restores all contributors and clears search", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({ scoreRange: "2000" });
      result.current.handleSearchChange("anand");
    });
    act(() => {
      result.current.handleReset();
    });
    expect(result.current.filteredAndSorted).toHaveLength(
      mockTopScorers.length
    );
    expect(result.current.searchQuery).toBe("");
  });

  it("handleReset resets filters to default values", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleFilterChange({
        activityFilter: "7",
        scoreRange: "1000",
      });
    });
    act(() => {
      result.current.handleReset();
    });
    expect(result.current.filters.activityFilter).toBe("all");
    expect(result.current.filters.scoreRange).toBe("all");
  });

  it("combining search and scoreRange applies both filters", () => {
    const { result } = renderHook(() =>
      useContributorFilters(mockContributors, mockTopScorers)
    );
    act(() => {
      result.current.handleSearchChange("a"); // matches multiple
      result.current.handleFilterChange({ scoreRange: "2000" });
    });
    result.current.filteredAndSorted.forEach((c) => {
      expect(c.total_score).toBeGreaterThanOrEqual(2000);
      expect(c.username.toLowerCase()).toContain("a");
    });
  });
});
