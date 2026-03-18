import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ── Component imports ──────────────────────────────────────────────────────
import TopScorersPanel from "../../src/app/contributors/components/TopScorersPanel";
import TopContributors from "../../src/app/contributors/components/TopContributors";
import ScoringSystem from "../../src/app/contributors/components/ScoringSystem";
import PodiumSection from "../../src/app/contributors/components/Podiumsection";
import PanelHeader from "../../src/app/contributors/components/Panelheader";
import PanelBody from "../../src/app/contributors/components/Panelbody";
import RankListSection from "../../src/app/contributors/components/Ranklistsection";
import { RankRow } from "../../src/app/contributors/components/RankRow";
import ContributorFilterSidebar from "../../src/app/contributors/components/ContributorFilterSidebar";
import ContributorCard from "../../src/app/contributors/components/ContributorCard";
import ContributorListSection from "../../src/app/contributors/components/Contributorlistsection";
import ContributorHero from "../../src/app/contributors/components/Contributorhero";
import ContributorModal from "../../src/app/contributors/components/ContributorModal";
import { FilterSection } from "../../src/app/contributors/components/FilterSection";
import { RadioGroup } from "../../src/app/contributors/components/RadioGroup";
import ContributorCount from "../../src/app/contributors/components/ContributorCount";
import {
  PANEL_HEADER,
  CONTRIBUTORS_LIST,
  CONTRIBUTORS_HERO,
  SCORING_SYSTEM_LABELS,
  CONTRIBUTOR_CARD_LABELS,
  FILTER_LABELS,
  MODAL_SECTION_TITLES,
} from "../../src/constants";
import { TopScorer, Contributor } from "../../src/types";

// ── Shared mocks ───────────────────────────────────────────────────────────

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
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

jest.mock("../../src/app/utils/buildGroups", () => ({
  BuildGroups: () => [
    {
      icon: "🔥",
      label: "Top Contributors",
      items: [
        {
          login: "alice",
          html_url: "https://github.com/alice",
          avatar_url: "https://avatars.github.com/alice",
          stat: "120 pts",
        },
      ],
    },
  ],
}));

jest.mock("../../src/app/utils", () => ({
  getRankStyles: (_rank: number) => ({
    border: "border-gray-200",
    badge: "text-gray-700 border-gray-300",
    glow: "",
    scoreGradient: "from-red-500 to-orange-400",
    label: "",
    rankText: `#${_rank}`,
  }),
  formatMonthKey: (key: string) => key,
}));

jest.mock("../../src/hooks/useContributorModal", () => ({
  useContributorModal: (contributor: TopScorer) => ({
    prs_by_complexity: { small: 5, medium: 3, large: 1 },
    smallPct: 56,
    mediumPct: 33,
    largePct: 11,
    scoreItems: [
      { label: "Commits", value: contributor.code_score ?? 0 },
      { label: "PRs", value: contributor.quality_score ?? 0 },
    ],
    maxScore: contributor.total_score ?? 1,
    badge: {
      label: "Gold",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    projectsWorkedOn: 3,
  }),
}));

jest.mock("../../src/hooks/Usecontributorfilters", () => ({
  useContributorFilters: () => ({
    filters: {
      sortBy: "total_score",
      activityFilter: "all",
      scoreRange: "all",
    },
    searchQuery: "",
    filteredAndSorted: mockTopScorers,
    handleFilterChange: jest.fn(),
    handleSearchChange: jest.fn(),
    handleReset: jest.fn(),
  }),
}));

jest.mock("../../src/hooks/useMonthcalendarpicker", () => ({
  useMonthCalendarPicker: () => ({
    open: false,
    setOpen: jest.fn(),
    calYear: 2024,
    setCalYear: jest.fn(),
    yearPickerOpen: false,
    setYearPickerOpen: jest.fn(),
    dropdownRef: { current: null },
    availableSet: new Set(["2024-01"]),
    years: [2023, 2024],
    minYear: 2023,
    maxYear: 2024,
    handleMonthClick: jest.fn(),
    handleYearSelect: jest.fn(),
  }),
}));

// ── Shared fixtures ────────────────────────────────────────────────────────

const mockTopScorers: TopScorer[] = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  username: `user${i + 1}`,
  id: i + 1,
  avatar_url: `https://avatars.githubusercontent.com/u/${i + 1}`,
  html_url: `https://github.com/user${i + 1}`,
  totalCommits: 50 - i * 4,
  totalPRs: 20 - i,
  totalPRReviewsGiven: 15 - i,
  totalCodeReviewComments: 10 - i,
  totalIssuesOpened: 8 - i,
  totalIssueComments: 30 - i * 2,
  avgCommitsPerPR: parseFloat((2.5 - i * 0.1).toFixed(1)),
  projectsWorkingOn: 3,
  prs_by_complexity: { small: 5, medium: 3, large: 1 },
  total_score: 1000 - i * 80,
  code_score: 400 - i * 30,
  quality_score: 350 - i * 25,
  community_score: 250 - i * 25,
  score_breakdown: {
    pr_score: 100 - i * 8,
    commits_score: 80 - i * 6,
    pr_reviews_score: 60 - i * 5,
    code_comments_score: 40 - i * 3,
    issues_opened_score: 35 - i * 3,
    issue_comments_score: 30 - i * 2,
    tests_score: 25 - i * 2,
    docs_score: 20 - i * 2,
    mentor_score: 15 - i,
    zero_revisions_score: 10 - i,
    impact_bonus_score: 5,
    projects_score: 30 - i * 2,
  },
  projects: ["project-alpha", "project-beta"],
}));

const mockContributors: Contributor[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  contributions: 80 - i * 7,
  html_url: `https://github.com/user${i + 1}`,
  avatar_url: `https://avatars.githubusercontent.com/u/${i + 1}`,
  login: `user${i + 1}`,
  lastActiveDays: i === 0 ? null : i * 5,
  pullRequestCount: 20 - i,
  issueCount: 8 - i,
}));

jest.mock("../../src/hooks/useTopScorePanel", () => ({
  useTopScorersPanel: () => ({
    containerRef: { current: null },
    bodyRef: { current: null },
    activeTab: "alltime",
    setActiveTab: jest.fn(),
    mobileRestOpen: false,
    setMobileRestOpen: jest.fn(),
    isDownloading: false,
    isCopying: false,
    copied: false,
    handleDownload: jest.fn(),
    handleCopy: jest.fn(),
    curKey: "2024-01",
    availableMonths: ["2024-01", "2024-02"],
    selectedMonth: "2024-01",
    setSelectedMonth: jest.fn(),
    isLoadingMonth: false,
    displayLabel: "January 2024",
    top10: mockTopScorers.slice(0, 10),
    podium3: mockTopScorers.slice(0, 3),
    rest: mockTopScorers.slice(3, 10),
    maxScore: 1000,
  }),
}));

const mockPanelHeaderProps = {
  activeTab: "alltime" as const,
  top10Length: 10,
  isDownloading: false,
  isCopying: false,
  copied: false,
  onTabChange: jest.fn(),
  onDownload: jest.fn(),
  onCopy: jest.fn(),
  availableMonths: ["2024-01", "2024-02"],
  selectedMonth: "2024-01",
  curKey: "2024-01",
  isLoadingMonth: false,
  displayLabel: "January 2024",
  onMonthSelect: jest.fn(),
};

// ── TopScorersPanel ────────────────────────────────────────────────────────

describe("TopScorersPanel", () => {
  it("renders the panel without crashing", () => {
    render(
      <TopScorersPanel topScorers={mockTopScorers} onViewDetails={jest.fn()} />
    );
    expect(screen.getByText(PANEL_HEADER.title)).toBeInTheDocument();
  });

  it("renders the footer hint", () => {
    render(
      <TopScorersPanel topScorers={mockTopScorers} onViewDetails={jest.fn()} />
    );
    expect(screen.getByText(PANEL_HEADER.footerHint)).toBeInTheDocument();
  });

  it("renders the live badge", () => {
    render(
      <TopScorersPanel topScorers={mockTopScorers} onViewDetails={jest.fn()} />
    );
    expect(screen.getByText(PANEL_HEADER.liveLabel)).toBeInTheDocument();
  });

  it("renders top 10 count in header", () => {
    render(
      <TopScorersPanel topScorers={mockTopScorers} onViewDetails={jest.fn()} />
    );
    // Target the paragraph that combines prefix + count + suffix
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "P" &&
          el.textContent?.replace(/\s+/g, " ").trim() === "Top 10 Contributors"
      )
    ).toBeInTheDocument();
  });
});

// ── TopContributors ────────────────────────────────────────────────────────

describe("TopContributors", () => {
  it("renders contributor login name", () => {
    render(
      <TopContributors
        contributors={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("renders contributor stat text", () => {
    render(
      <TopContributors
        contributors={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(screen.getByText("120 pts")).toBeInTheDocument();
  });

  it("renders contributor avatar image", () => {
    render(
      <TopContributors
        contributors={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(screen.getByAltText("alice")).toBeInTheDocument();
  });

  it("renders at least one navigation dot button", () => {
    render(
      <TopContributors
        contributors={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("clicking a dot button does not throw", () => {
    render(
      <TopContributors
        contributors={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    const dots = screen
      .getAllByRole("button")
      .filter((btn) => btn.className.includes("rounded-full"));
    if (dots.length > 0) {
      expect(() => fireEvent.click(dots[0])).not.toThrow();
    }
  });

  it("renders group label", () => {
    render(
      <TopContributors
        contributors={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(screen.getByText("Top Contributors")).toBeInTheDocument();
  });
});

// ── ScoringSystem ──────────────────────────────────────────────────────────

describe("ScoringSystem", () => {
  it("renders the trigger heading", () => {
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

  it("scoring content is hidden by default", () => {
    const { container } = render(<ScoringSystem />);
    const panel = container.querySelector(".max-h-0");
    expect(panel).toBeInTheDocument();
  });

  it("clicking the trigger reveals scoring content", () => {
    render(<ScoringSystem />);
    fireEvent.click(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading).closest("button")!
    );
    expect(screen.getByText(SCORING_SYSTEM_LABELS.totalScore)).toBeVisible();
  });

  it("renders PR complexity multipliers after opening", () => {
    render(<ScoringSystem />);
    fireEvent.click(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading).closest("button")!
    );
    expect(screen.getByText("×1.0")).toBeInTheDocument();
    expect(screen.getByText("×1.3")).toBeInTheDocument();
    expect(screen.getByText("×1.7")).toBeInTheDocument();
  });

  it("renders effort labels after opening", () => {
    render(<ScoringSystem />);
    fireEvent.click(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading).closest("button")!
    );
    expect(screen.getByText("effort:small")).toBeInTheDocument();
    expect(screen.getByText("effort:medium")).toBeInTheDocument();
    expect(screen.getByText("effort:large")).toBeInTheDocument();
  });

  it("clicking trigger again collapses the content", () => {
    const { container } = render(<ScoringSystem />);
    const btn = screen
      .getByText(SCORING_SYSTEM_LABELS.triggerHeading)
      .closest("button")!;
    fireEvent.click(btn);
    fireEvent.click(btn);
    const panel = container.querySelector(".max-h-0");
    expect(panel).toBeInTheDocument();
  });

  it("renders the badge label after opening", () => {
    render(<ScoringSystem />);
    fireEvent.click(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading).closest("button")!
    );
    expect(screen.getByText(SCORING_SYSTEM_LABELS.badge)).toBeInTheDocument();
  });
});

// ── PodiumSection ──────────────────────────────────────────────────────────

describe("PodiumSection", () => {
  const podium3 = mockTopScorers.slice(0, 3);

  it("renders all 3 podium usernames", () => {
    render(<PodiumSection podium3={podium3} onViewDetails={jest.fn()} />);
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("user3")).toBeInTheDocument();
  });

  it("renders podium rank numbers 1, 2, 3", () => {
    render(<PodiumSection podium3={podium3} onViewDetails={jest.fn()} />);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("calls onViewDetails when a podium button is clicked", () => {
    const onViewDetails = jest.fn();
    render(<PodiumSection podium3={podium3} onViewDetails={onViewDetails} />);
    fireEvent.click(screen.getByText("user1").closest("button")!);
    expect(onViewDetails).toHaveBeenCalledWith(podium3[0]);
  });

  it("renders avatar images for each podium entry", () => {
    render(<PodiumSection podium3={podium3} onViewDetails={jest.fn()} />);
    expect(screen.getByAltText("user1")).toBeInTheDocument();
    expect(screen.getByAltText("user2")).toBeInTheDocument();
    expect(screen.getByAltText("user3")).toBeInTheDocument();
  });

  it("renders crown emoji for each podium slot", () => {
    render(<PodiumSection podium3={podium3} onViewDetails={jest.fn()} />);
    expect(screen.getAllByText(PANEL_HEADER.crown).length).toBe(3);
  });

  it("does not render missing slots when podium3 has fewer than 3 entries", () => {
    render(<PodiumSection podium3={[podium3[0]]} onViewDetails={jest.fn()} />);
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.queryByText("user2")).not.toBeInTheDocument();
  });
});

// ── PanelHeader ────────────────────────────────────────────────────────────

describe("PanelHeader", () => {
  it("renders the panel title", () => {
    render(<PanelHeader {...mockPanelHeaderProps} />);
    expect(screen.getByText(PANEL_HEADER.title)).toBeInTheDocument();
  });

  it("renders the live badge", () => {
    render(<PanelHeader {...mockPanelHeaderProps} />);
    expect(screen.getByText(PANEL_HEADER.liveLabel)).toBeInTheDocument();
  });

  it("renders top count prefix", () => {
    render(<PanelHeader {...mockPanelHeaderProps} />);
    // "Top 10 Contributors" is split across text nodes inside one <p>
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "P" &&
          el.textContent?.replace(/\s+/g, " ").trim() === "Top 10 Contributors"
      )
    ).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = jest.fn();
    render(<PanelHeader {...mockPanelHeaderProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onTabChange).toHaveBeenCalled();
  });

  it("calls onDownload when download button is clicked", () => {
    const onDownload = jest.fn();
    render(<PanelHeader {...mockPanelHeaderProps} onDownload={onDownload} />);
    fireEvent.click(screen.getByTitle(PANEL_HEADER.downloadTitle));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("calls onCopy when copy button is clicked", () => {
    const onCopy = jest.fn();
    render(<PanelHeader {...mockPanelHeaderProps} onCopy={onCopy} />);
    fireEvent.click(screen.getByTitle(PANEL_HEADER.copyTitle));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("disables download button when isDownloading is true", () => {
    render(<PanelHeader {...mockPanelHeaderProps} isDownloading={true} />);
    expect(screen.getByTitle(PANEL_HEADER.downloadTitle)).toBeDisabled();
  });

  it("disables copy button when isCopying is true", () => {
    render(<PanelHeader {...mockPanelHeaderProps} isCopying={true} />);
    expect(screen.getByTitle(PANEL_HEADER.copyTitle)).toBeDisabled();
  });

  it("shows copied title on copy button when copied is true", () => {
    render(<PanelHeader {...mockPanelHeaderProps} copied={true} />);
    expect(screen.getByTitle(PANEL_HEADER.copiedTitle)).toBeInTheDocument();
  });

  it("does not show month picker when activeTab is alltime", () => {
    render(<PanelHeader {...mockPanelHeaderProps} activeTab='alltime' />);
    expect(screen.queryByText("January 2024")).not.toBeInTheDocument();
  });

  it("shows month picker trigger when activeTab is monthly", () => {
    render(<PanelHeader {...mockPanelHeaderProps} activeTab='monthly' />);
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });
});

// ── PanelBody ──────────────────────────────────────────────────────────────

describe("PanelBody", () => {
  const basePanelBodyProps = {
    bodyRef: { current: null },
    isLoadingMonth: false,
    selectedMonth: "2024-01",
    top10: mockTopScorers.slice(0, 10),
    podium3: mockTopScorers.slice(0, 3),
    rest: mockTopScorers.slice(3, 10),
    maxScore: 1000,
    displayLabel: "January 2024",
    mobileRestOpen: false,
    onMobileToggle: jest.fn(),
    onViewDetails: jest.fn(),
  };

  it("renders podium usernames when data is available", () => {
    render(<PanelBody {...basePanelBodyProps} />);
    expect(screen.getByText("user1")).toBeInTheDocument();
  });

  it("renders loading spinner when isLoadingMonth is true", () => {
    const { container } = render(
      <PanelBody {...basePanelBodyProps} isLoadingMonth={true} />
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders empty state heading when top10 is empty", () => {
    render(
      <PanelBody {...basePanelBodyProps} top10={[]} podium3={[]} rest={[]} />
    );
    expect(
      screen.getByText(PANEL_HEADER.noActivityHeading)
    ).toBeInTheDocument();
  });

  it("renders noActivityEmoji in empty state", () => {
    render(
      <PanelBody {...basePanelBodyProps} top10={[]} podium3={[]} rest={[]} />
    );
    expect(screen.getByText(PANEL_HEADER.noActivityEmoji)).toBeInTheDocument();
  });

  it("shows display label in empty state subtext", () => {
    render(
      <PanelBody {...basePanelBodyProps} top10={[]} podium3={[]} rest={[]} />
    );
    expect(screen.getByText(/January 2024/)).toBeInTheDocument();
  });
});

// ── RankListSection ────────────────────────────────────────────────────────

describe("RankListSection", () => {
  const rest = mockTopScorers.slice(3, 10);

  it("renders rest scorer usernames", () => {
    render(
      <RankListSection
        rest={rest}
        maxScore={1000}
        mobileRestOpen={false}
        onMobileToggle={jest.fn()}
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getAllByText(/user[4-9]|user10/).length).toBeGreaterThan(0);
  });

  it("returns null when rest is empty", () => {
    const { container } = render(
      <RankListSection
        rest={[]}
        maxScore={1000}
        mobileRestOpen={false}
        onMobileToggle={jest.fn()}
        onViewDetails={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders mobile toggle button with arrow", () => {
    render(
      <RankListSection
        rest={rest}
        maxScore={1000}
        mobileRestOpen={false}
        onMobileToggle={jest.fn()}
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByText(/▾/)).toBeInTheDocument();
  });

  it("calls onMobileToggle when mobile button is clicked", () => {
    const onMobileToggle = jest.fn();
    render(
      <RankListSection
        rest={rest}
        maxScore={1000}
        mobileRestOpen={false}
        onMobileToggle={onMobileToggle}
        onViewDetails={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText(/▾/).closest("button")!);
    expect(onMobileToggle).toHaveBeenCalledTimes(1);
  });
});

// ── RankRow ────────────────────────────────────────────────────────────────

describe("RankRow", () => {
  const scorer = mockTopScorers[3];

  it("renders the username", () => {
    render(
      <RankRow
        scorer={scorer}
        rank={4}
        pct={72}
        accentClass='text-gray-600'
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByText(scorer.username)).toBeInTheDocument();
  });

  it("renders the rank number", () => {
    render(
      <RankRow
        scorer={scorer}
        rank={4}
        pct={72}
        accentClass='text-gray-600'
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders the total score", () => {
    render(
      <RankRow
        scorer={scorer}
        rank={4}
        pct={72}
        accentClass='text-gray-600'
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(scorer.total_score.toLocaleString())
    ).toBeInTheDocument();
  });

  it("calls onViewDetails when clicked", () => {
    const onViewDetails = jest.fn();
    render(
      <RankRow
        scorer={scorer}
        rank={4}
        pct={72}
        accentClass='text-gray-600'
        onViewDetails={onViewDetails}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onViewDetails).toHaveBeenCalledWith(scorer);
  });

  it("renders the avatar image", () => {
    render(
      <RankRow
        scorer={scorer}
        rank={4}
        pct={72}
        accentClass='text-gray-600'
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByAltText(scorer.username)).toBeInTheDocument();
  });

  it("renders progress bar with correct width style", () => {
    const { container } = render(
      <RankRow
        scorer={scorer}
        rank={4}
        pct={72}
        accentClass='text-gray-600'
        onViewDetails={jest.fn()}
      />
    );
    expect(
      container.querySelector('[style*="width: 72%"]')
    ).toBeInTheDocument();
  });
});

// ── ContributorFilterSidebar ───────────────────────────────────────────────

describe("ContributorFilterSidebar", () => {
  const baseFilterProps = {
    filters: {
      sortBy: "total_score",
      activityFilter: "all",
      scoreRange: "all",
    },
    onFilterChange: jest.fn(),
    onReset: jest.fn(),
    searchQuery: "",
    onSearchChange: jest.fn(),
    isMobileOpen: false,
    onMobileToggle: jest.fn(),
  };

  it("renders the filter heading", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    // The h3 inside the sidebar panel specifically
    expect(
      screen.getByRole("heading", { name: FILTER_LABELS.heading })
    ).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    expect(
      screen.getByPlaceholderText(FILTER_LABELS.searchPlaceholder)
    ).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search", () => {
    const onSearchChange = jest.fn();
    render(
      <ContributorFilterSidebar
        {...baseFilterProps}
        onSearchChange={onSearchChange}
      />
    );
    fireEvent.change(
      screen.getByPlaceholderText(FILTER_LABELS.searchPlaceholder),
      { target: { value: "alice" } }
    );
    expect(onSearchChange).toHaveBeenCalledWith("alice");
  });

  it("does not show reset button when no active filters", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    expect(screen.queryByText(/Reset/)).not.toBeInTheDocument();
  });

  it("shows reset button when a non-default filter is active", () => {
    render(
      <ContributorFilterSidebar
        {...baseFilterProps}
        filters={{ ...baseFilterProps.filters, activityFilter: "7" }}
      />
    );
    expect(screen.getByText(/Reset/)).toBeInTheDocument();
  });

  it("calls onReset when reset button is clicked", () => {
    const onReset = jest.fn();
    render(
      <ContributorFilterSidebar
        {...baseFilterProps}
        filters={{ ...baseFilterProps.filters, activityFilter: "7" }}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByText(/Reset/));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders Sort By filter section", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("renders Last Active filter section", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    expect(screen.getByText("Last Active")).toBeInTheDocument();
  });

  it("renders Min Total Score filter section", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    expect(screen.getByText("Min Total Score")).toBeInTheDocument();
  });

  it("renders mobile Filters button — multiple matches expected", () => {
    render(<ContributorFilterSidebar {...baseFilterProps} />);
    // Both the floating pill button span AND the sidebar h3 render "Filters"
    expect(screen.getAllByText("Filters").length).toBeGreaterThan(0);
  });

  it("calls onMobileToggle when mobile Filters button is clicked", () => {
    const onMobileToggle = jest.fn();
    render(
      <ContributorFilterSidebar
        {...baseFilterProps}
        onMobileToggle={onMobileToggle}
      />
    );
    // The floating pill button is the first element that contains the "Filters" text
    const mobileBtn = screen.getAllByText("Filters")[0].closest("button")!;
    fireEvent.click(mobileBtn);
    expect(onMobileToggle).toHaveBeenCalledTimes(1);
  });
});

// ── ContributorCard ────────────────────────────────────────────────────────

describe("ContributorCard", () => {
  const contributor = mockTopScorers[0];

  it("renders the contributor username", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByText(contributor.username)).toBeInTheDocument();
  });

  it("renders the total score", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(contributor.total_score.toLocaleString())
    ).toBeInTheDocument();
  });

  it("renders the score suffix", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(CONTRIBUTOR_CARD_LABELS.scoreSuffix)
    ).toBeInTheDocument();
  });

  it("renders the total score label", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(CONTRIBUTOR_CARD_LABELS.totalScoreLabel)
    ).toBeInTheDocument();
  });

  it("renders commit count", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(contributor.totalCommits.toString())
    ).toBeInTheDocument();
  });

  it("renders PR count", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(contributor.totalPRs.toString())
    ).toBeInTheDocument();
  });

  it("renders the avatar image", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByAltText(contributor.username)).toBeInTheDocument();
  });

  it("renders view profile button label", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(CONTRIBUTOR_CARD_LABELS.viewProfileLabel)
    ).toBeInTheDocument();
  });

  it("calls onViewDetails when view profile is clicked", () => {
    const onViewDetails = jest.fn();
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={onViewDetails}
      />
    );
    fireEvent.click(screen.getByText(CONTRIBUTOR_CARD_LABELS.viewProfileLabel));
    expect(onViewDetails).toHaveBeenCalledWith(contributor);
  });

  it("renders the rank text", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("renders highlight bar for top-3 contributor", () => {
    const { container } = render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(container.querySelector(".h-0\\.5")).toBeInTheDocument();
  });

  it("does not render highlight bar for rank > 3", () => {
    const { container } = render(
      <ContributorCard
        contributor={mockTopScorers[4]}
        displayRank={5}
        onViewDetails={jest.fn()}
      />
    );
    expect(container.querySelector(".h-0\\.5")).not.toBeInTheDocument();
  });

  it("renders projects count", () => {
    render(
      <ContributorCard
        contributor={contributor}
        displayRank={1}
        onViewDetails={jest.fn()}
      />
    );
    expect(
      screen.getByText(`${contributor.projectsWorkingOn} projects`)
    ).toBeInTheDocument();
  });
});

// ── ContributorListSection ─────────────────────────────────────────────────

describe("ContributorListSection", () => {
  const sectionRef = { current: null };

  it("renders the section heading", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={mockTopScorers.length}
        onViewDetails={jest.fn()}
        onReset={jest.fn()}
        sectionRef={sectionRef}
      />
    );
    expect(screen.getByText(CONTRIBUTORS_LIST.heading)).toBeInTheDocument();
  });

  it("renders the count badge with filtered and total count", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={20}
        onViewDetails={jest.fn()}
        onReset={jest.fn()}
        sectionRef={sectionRef}
      />
    );
    expect(
      screen.getByText(`${mockTopScorers.length} of 20`)
    ).toBeInTheDocument();
  });

  it("renders a card for each contributor", () => {
    render(
      <ContributorListSection
        filteredAndSorted={mockTopScorers}
        totalCount={mockTopScorers.length}
        onViewDetails={jest.fn()}
        onReset={jest.fn()}
        sectionRef={sectionRef}
      />
    );
    mockTopScorers.forEach((scorer) => {
      expect(screen.getByText(scorer.username)).toBeInTheDocument();
    });
  });

  it("renders empty state message when filteredAndSorted is empty", () => {
    render(
      <ContributorListSection
        filteredAndSorted={[]}
        totalCount={10}
        onViewDetails={jest.fn()}
        onReset={jest.fn()}
        sectionRef={sectionRef}
      />
    );
    expect(
      screen.getByText(CONTRIBUTORS_LIST.emptyMessage)
    ).toBeInTheDocument();
  });

  it("renders clear filters label in empty state", () => {
    render(
      <ContributorListSection
        filteredAndSorted={[]}
        totalCount={10}
        onViewDetails={jest.fn()}
        onReset={jest.fn()}
        sectionRef={sectionRef}
      />
    );
    expect(
      screen.getByText(CONTRIBUTORS_LIST.clearFiltersLabel)
    ).toBeInTheDocument();
  });

  it("calls onReset when clear filters is clicked", () => {
    const onReset = jest.fn();
    render(
      <ContributorListSection
        filteredAndSorted={[]}
        totalCount={10}
        onViewDetails={jest.fn()}
        onReset={onReset}
        sectionRef={sectionRef}
      />
    );
    fireEvent.click(screen.getByText(CONTRIBUTORS_LIST.clearFiltersLabel));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

// ── ContributorHero ────────────────────────────────────────────────────────

describe("ContributorHero", () => {
  it("renders the hero heading", () => {
    render(
      <ContributorHero
        contributorsArray={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(screen.getByText(CONTRIBUTORS_HERO.heading)).toBeInTheDocument();
  });

  it("renders top contributors heading", () => {
    render(
      <ContributorHero
        contributorsArray={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(
      screen.getByText(CONTRIBUTORS_HERO.topContributorsHeading)
    ).toBeInTheDocument();
  });

  it("renders top contributors subheading", () => {
    render(
      <ContributorHero
        contributorsArray={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(
      screen.getByText(CONTRIBUTORS_HERO.topContributorsSubheading)
    ).toBeInTheDocument();
  });

  it("renders the contributor count badge with correct value", () => {
    render(
      <ContributorHero
        contributorsArray={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    // Scope to the animated gradient span to avoid ambiguity with other text nodes
    const countSpan = document.querySelector(
      "span.bg-gradient-to-r.from-mindfire-text-red"
    );
    expect(countSpan).toBeInTheDocument();
    expect(countSpan?.textContent).toBe(mockTopScorers.length.toString());
  });

  it("renders the scoring system accordion trigger", () => {
    render(
      <ContributorHero
        contributorsArray={mockContributors}
        topScorers={mockTopScorers}
      />
    );
    expect(
      screen.getByText(SCORING_SYSTEM_LABELS.triggerHeading)
    ).toBeInTheDocument();
  });
});

// ── ContributorModal ───────────────────────────────────────────────────────

describe("ContributorModal", () => {
  const contributor = mockTopScorers[0];

  it("renders the username in the modal header", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getAllByText(contributor.username).length).toBeGreaterThan(0);
  });

  it("renders the GitHub profile link", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("View GitHub Profile")).toBeInTheDocument();
  });

  it("renders total score tile label", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("Total Score")).toBeInTheDocument();
  });

  it("renders code score tile label", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("Code Score")).toBeInTheDocument();
  });

  it("renders quality score tile label", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("Quality Score")).toBeInTheDocument();
  });

  it("renders community score tile label", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("Community Score")).toBeInTheDocument();
  });

  it("renders score composition section title", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(
      screen.getByText(MODAL_SECTION_TITLES.scoreComposition)
    ).toBeInTheDocument();
  });

  it("renders activity section title", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText(MODAL_SECTION_TITLES.activity)).toBeInTheDocument();
  });

  it("renders PR complexity section title", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(
      screen.getByText(MODAL_SECTION_TITLES.prComplexity)
    ).toBeInTheDocument();
  });

  it("calls onClose when the X close button is clicked", () => {
    const onClose = jest.fn();
    act(() => {
      render(<ContributorModal contributor={contributor} onClose={onClose} />);
    });
    // The close button is the first button rendered (top-right X icon, no accessible name)
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = jest.fn();
    act(() => {
      render(<ContributorModal contributor={contributor} onClose={onClose} />);
    });
    const backdrop = document.querySelector(".bg-black.bg-opacity-50");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("renders projects section heading", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(
      screen.getByText(`Projects (${contributor.projectsWorkingOn})`)
    ).toBeInTheDocument();
  });

  it("renders each project tag", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("project-alpha")).toBeInTheDocument();
    expect(screen.getByText("project-beta")).toBeInTheDocument();
  });

  it("renders PR complexity labels", () => {
    act(() => {
      render(
        <ContributorModal contributor={contributor} onClose={jest.fn()} />
      );
    });
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
  });
});

// ── FilterSection ──────────────────────────────────────────────────────────

describe("FilterSection", () => {
  it("renders the section title", () => {
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={jest.fn()}>
        <span>Child content</span>
      </FilterSection>
    );
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("renders children when expanded is true", () => {
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={jest.fn()}>
        <span>Child content</span>
      </FilterSection>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("does not render children when expanded is false", () => {
    render(
      <FilterSection title='Sort By' expanded={false} onToggle={jest.fn()}>
        <span>Child content</span>
      </FilterSection>
    );
    expect(screen.queryByText("Child content")).not.toBeInTheDocument();
  });

  it("calls onToggle when the header button is clicked", () => {
    const onToggle = jest.fn();
    render(
      <FilterSection title='Sort By' expanded={true} onToggle={onToggle}>
        <span>Child content</span>
      </FilterSection>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders an svg icon inside the toggle button", () => {
    const { container } = render(
      <FilterSection title='Sort By' expanded={true} onToggle={jest.fn()}>
        <span />
      </FilterSection>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

// ── RadioGroup ─────────────────────────────────────────────────────────────

describe("RadioGroup", () => {
  const options = [
    { id: "total_score", label: "Total Score" },
    { id: "code_score", label: "Code Score" },
    { id: "quality_score", label: "Quality Score" },
  ];

  it("renders all option labels", () => {
    render(
      <RadioGroup
        name='sortBy'
        value='total_score'
        onChange={jest.fn()}
        options={options}
      />
    );
    options.forEach((opt) => {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    });
  });

  it("applies active styling to the selected option", () => {
    render(
      <RadioGroup
        name='sortBy'
        value='total_score'
        onChange={jest.fn()}
        options={options}
      />
    );
    const activeLabel = screen.getByText("Total Score").closest("label");
    expect(activeLabel?.className).toContain("bg-red-50");
  });

  it("does not apply active styling to inactive options", () => {
    render(
      <RadioGroup
        name='sortBy'
        value='total_score'
        onChange={jest.fn()}
        options={options}
      />
    );
    const inactiveLabel = screen.getByText("Code Score").closest("label");
    expect(inactiveLabel?.className).not.toContain("bg-red-50");
  });

  it("calls onChange with correct id when a radio is clicked", () => {
    const onChange = jest.fn();
    render(
      <RadioGroup
        name='sortBy'
        value='total_score'
        onChange={onChange}
        options={options}
      />
    );
    const radio = screen
      .getAllByRole("radio")
      .find((r) => (r as HTMLInputElement).value === "code_score")!;
    fireEvent.click(radio);
    expect(onChange).toHaveBeenCalledWith("code_score");
  });

  it("checks the radio matching the current value", () => {
    render(
      <RadioGroup
        name='sortBy'
        value='quality_score'
        onChange={jest.fn()}
        options={options}
      />
    );
    const checked = screen
      .getAllByRole("radio")
      .find((r) => (r as HTMLInputElement).checked) as HTMLInputElement;
    expect(checked?.value).toBe("quality_score");
  });

  it("renders all native radio inputs as sr-only", () => {
    const { container } = render(
      <RadioGroup
        name='sortBy'
        value='total_score'
        onChange={jest.fn()}
        options={options}
      />
    );
    container
      .querySelectorAll('input[type="radio"]')
      .forEach((r) => expect(r.className).toContain("sr-only"));
  });
});

// ── ContributorCount ───────────────────────────────────────────────────────

describe("ContributorCount", () => {
  it("renders the animated contributor count", () => {
    render(<ContributorCount totalContributors={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the github icon", () => {
    render(<ContributorCount totalContributors={10} />);
    expect(screen.getByAltText("github_contributors")).toBeInTheDocument();
  });

  it("renders the BorderBeam decoration", () => {
    render(<ContributorCount totalContributors={5} />);
    expect(screen.getByTestId("border-beam")).toBeInTheDocument();
  });

  it("renders 0 when totalContributors is 0", () => {
    render(<ContributorCount totalContributors={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders large counts correctly", () => {
    render(<ContributorCount totalContributors={999} />);
    expect(screen.getByText("999")).toBeInTheDocument();
  });
});
