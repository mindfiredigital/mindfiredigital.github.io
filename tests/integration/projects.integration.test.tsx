import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Shared mocks ───────────────────────────────────────────────────────────

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
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
jest.mock("lucide-react", () => ({
  Filter: () => <svg data-testid='filter-icon' />,
  X: () => <svg data-testid='x-icon' />,
  Search: () => <svg data-testid='search-icon' />,
  ChevronDown: () => <svg data-testid='chevron-down' />,
  ChevronUp: () => <svg data-testid='chevron-up' />,
}));

// ── Fixtures ───────────────────────────────────────────────────────────────

const mockProjects = [
  {
    id: 2,
    title: "Canvas Editor",
    short_description: "Multipage document editor based on HTML5 canvas.",
    github_repository_link: "https://github.com/mindfiredigital/canvas-editor",
    documentation_link: "https://mindfiredigital.github.io/canvas-editor",
    project_type: "current",
    date_created: "2023-12-20T10:35:03.000Z",
    date_updated: null,
    status: "published",
    stars: 20,
    tags: ["typescript"],
    lastPushedAt: "2026-03-02T08:42:54Z",
  },
  {
    id: 3,
    title: "NFT Marketplace",
    short_description:
      "A multi-chain platform for fans to connect with their favorite celebrities.",
    github_repository_link:
      "https://github.com/mindfiredigital/nft-marketplace",
    documentation_link: "https://github.com/mindfiredigital/nft-marketplace",
    project_type: "current",
    date_created: "2023-12-20T10:36:13.000Z",
    date_updated: null,
    status: "published",
    stars: 11,
    tags: ["bitcoin", "blockchain"],
    lastPushedAt: "2023-11-22T10:09:56Z",
  },
  {
    id: 4,
    title: "FMDAPI Node Weaver",
    short_description: "Seamless frontend integration with Filemaker Database.",
    github_repository_link:
      "https://github.com/mindfiredigital/fmdapi-node-weaver",
    documentation_link: "https://github.com/mindfiredigital/fmdapi-node-weaver",
    project_type: "current",
    date_created: "2023-12-20T10:37:14.000Z",
    date_updated: null,
    status: "published",
    stars: 11,
    tags: [],
    lastPushedAt: "2024-04-03T08:07:14Z",
  },
];

const mockUpcomingProjects = [
  {
    id: 34,
    title: "ADAC (Architecture Diagram as Code)",
    short_description:
      "ADAC is a proof-of-concept tool for defining cloud infrastructure using code.",
    github_repository_link: "https://github.com/mindfiredigital/adac-tools",
    documentation_link:
      "https://github.com/mindfiredigital/adac-tools/blob/main/README.md",
    project_type: "upcoming",
    date_created: "2026-02-05T10:10:41.000Z",
    date_updated: null,
    status: "draft",
    stars: 15,
    tags: [],
    lastPushedAt: "2026-03-16T07:48:01Z",
  },
  {
    id: 35,
    title: "Agentic Web Starter",
    short_description:
      "Agentic Web Starter is a FastAPI-based backend template for building agentic applications.",
    github_repository_link:
      "https://github.com/mindfiredigital/Agentic-Web-Starter",
    documentation_link:
      "https://github.com/mindfiredigital/Agentic-Web-Starter/blob/main/LICENSE",
    project_type: "upcoming",
    date_created: "2026-02-05T10:14:52.000Z",
    date_updated: null,
    status: "draft",
    stars: 17,
    tags: ["agent", "ai", "fastapi"],
    lastPushedAt: "2026-03-10T07:28:56Z",
  },
];

const mockContributors = [
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
];

// contributor-mapping.json — login → array of project ids
const mockContributorMapping = {
  anandmindfire: [2, 3],
  "deepakyadav-01": [2],
  ParasMindfire: [3, 4],
};

const mockLeaderboard = [
  {
    rank: 1,
    username: "anandmindfire",
    id: 155735575,
    avatar_url: "https://avatars.githubusercontent.com/u/155735575?v=4",
    html_url: "https://github.com/anandmindfire",
    totalCommits: 1081,
    totalPRs: 151,
    total_score: 3787,
  },
  {
    rank: 2,
    username: "deepakyadav-01",
    id: 155735643,
    avatar_url: "https://avatars.githubusercontent.com/u/155735643?v=4",
    html_url: "https://github.com/deepakyadav-01",
    totalCommits: 654,
    totalPRs: 213,
    total_score: 3372,
  },
];

// ── Asset mocks ────────────────────────────────────────────────────────────

jest.mock(
  "../../src/asset/projects.json",
  () => [
    {
      id: 2,
      title: "Canvas Editor",
      short_description: "Multipage document editor based on HTML5 canvas.",
      github_repository_link:
        "https://github.com/mindfiredigital/canvas-editor",
      documentation_link: "https://mindfiredigital.github.io/canvas-editor",
      project_type: "current",
      date_created: "2023-12-20T10:35:03.000Z",
      date_updated: null,
      status: "published",
      stars: 20,
      tags: ["typescript"],
      lastPushedAt: "2026-03-02T08:42:54Z",
    },
    {
      id: 3,
      title: "NFT Marketplace",
      short_description:
        "A multi-chain platform for fans to connect with their favorite celebrities.",
      github_repository_link:
        "https://github.com/mindfiredigital/nft-marketplace",
      documentation_link: "https://github.com/mindfiredigital/nft-marketplace",
      project_type: "current",
      date_created: "2023-12-20T10:36:13.000Z",
      date_updated: null,
      status: "published",
      stars: 11,
      tags: ["bitcoin", "blockchain"],
      lastPushedAt: "2023-11-22T10:09:56Z",
    },
    {
      id: 4,
      title: "FMDAPI Node Weaver",
      short_description:
        "Seamless frontend integration with Filemaker Database.",
      github_repository_link:
        "https://github.com/mindfiredigital/fmdapi-node-weaver",
      documentation_link:
        "https://github.com/mindfiredigital/fmdapi-node-weaver",
      project_type: "current",
      date_created: "2023-12-20T10:37:14.000Z",
      date_updated: null,
      status: "published",
      stars: 11,
      tags: [],
      lastPushedAt: "2024-04-03T08:07:14Z",
    },
  ],
  { virtual: true }
);

jest.mock(
  "../../src/asset/upcomingProjects.json",
  () => [
    {
      id: 34,
      title: "ADAC (Architecture Diagram as Code)",
      short_description:
        "ADAC is a proof-of-concept tool for defining cloud infrastructure using code.",
      github_repository_link: "https://github.com/mindfiredigital/adac-tools",
      documentation_link:
        "https://github.com/mindfiredigital/adac-tools/blob/main/README.md",
      project_type: "upcoming",
      date_created: "2026-02-05T10:10:41.000Z",
      date_updated: null,
      status: "draft",
      stars: 15,
      tags: [],
      lastPushedAt: "2026-03-16T07:48:01Z",
    },
    {
      id: 35,
      title: "Agentic Web Starter",
      short_description:
        "Agentic Web Starter is a FastAPI-based backend template for building agentic applications.",
      github_repository_link:
        "https://github.com/mindfiredigital/Agentic-Web-Starter",
      documentation_link:
        "https://github.com/mindfiredigital/Agentic-Web-Starter/blob/main/LICENSE",
      project_type: "upcoming",
      date_created: "2026-02-05T10:14:52.000Z",
      date_updated: null,
      status: "draft",
      stars: 17,
      tags: ["agent", "ai", "fastapi"],
      lastPushedAt: "2026-03-10T07:28:56Z",
    },
  ],
  { virtual: true }
);

jest.mock(
  "../../src/asset/contributors.json",
  () => [
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
  ],
  { virtual: true }
);

jest.mock(
  "../../src/asset/contributor-mapping.json",
  () => ({
    anandmindfire: [2, 3],
    "deepakyadav-01": [2],
    ParasMindfire: [3, 4],
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
        total_score: 3787,
      },
      {
        rank: 2,
        username: "deepakyadav-01",
        id: 155735643,
        avatar_url: "https://avatars.githubusercontent.com/u/155735643?v=4",
        html_url: "https://github.com/deepakyadav-01",
        totalCommits: 654,
        totalPRs: 213,
        total_score: 3372,
      },
    ],
  }),
  { virtual: true }
);

// ── Component imports (after all mocks) ───────────────────────────────────

import ProjectsPage from "../../src/app/projects/page";
import CurrentProjectsSection from "../../src/app/projects/components/CurrentProjectsSection";
import UpcomingProjectsSection from "../../src/app/projects/components/UpcomingProjectsSection";
import FilterSidebar from "../../src/app/projects/components/FilterSidebar";
import ProjectCard from "../../src/app/projects/components/ProjectCard";
import { useProjectFilters } from "../../src/hooks/useProjectFilters";

import {
  PROJECTS_HEROZ,
  CURRENT_PROJECTS,
  UPCOMING_PROJECTS,
  STAR_RANGES,
  CONTRIBUTOR_RANGES,
} from "../../src/constants";
import {
  Project,
  ContributorProject,
  TopScorer,
  ContributorMap,
  Filters,
} from "../../src/types";

// ── 1. ProjectsPage — hero + structure ────────────────────────────────────

describe("ProjectsPage — hero and structure", () => {
  beforeEach(() => {
    render(<ProjectsPage />);
  });

  it("renders the hero heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      PROJECTS_HEROZ.heading
    );
  });

  it("renders the hero subheading", () => {
    expect(screen.getByText(PROJECTS_HEROZ.subheading)).toBeInTheDocument();
  });

  it("renders the CTA link pointing to current-projects", () => {
    expect(
      screen.getByRole("link", { name: PROJECTS_HEROZ.ctaLabel })
    ).toHaveAttribute("href", "#current-projects");
  });

  it("renders Current Project heading", () => {
    expect(screen.getByText(PROJECTS_HEROZ.currProject)).toBeInTheDocument();
  });

  it("renders Upcoming Projects heading", () => {
    expect(screen.getByText(UPCOMING_PROJECTS.heading)).toBeInTheDocument();
  });

  it("renders the filter sidebar", () => {
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });
});

// ── 2. CurrentProjectsSection ──────────────────────────────────────────────

describe("CurrentProjectsSection", () => {
  it("renders all project titles", () => {
    render(<CurrentProjectsSection projects={mockProjects as Project[]} />);
    expect(screen.getByText("Canvas Editor")).toBeInTheDocument();
    expect(screen.getByText("NFT Marketplace")).toBeInTheDocument();
    expect(screen.getByText("FMDAPI Node Weaver")).toBeInTheDocument();
  });

  it("renders empty state when no projects", () => {
    render(<CurrentProjectsSection projects={[]} />);
    expect(screen.getByText(CURRENT_PROJECTS.emptyMessage)).toBeInTheDocument();
  });

  it("does not render empty state when projects exist", () => {
    render(<CurrentProjectsSection projects={mockProjects as Project[]} />);
    expect(
      screen.queryByText(CURRENT_PROJECTS.emptyMessage)
    ).not.toBeInTheDocument();
  });

  it("renders correct number of project cards", () => {
    render(<CurrentProjectsSection projects={mockProjects as Project[]} />);
    expect(screen.getAllByText(/Repository/i)).toHaveLength(3);
  });
});

// ── 3. UpcomingProjectsSection ─────────────────────────────────────────────

describe("UpcomingProjectsSection", () => {
  it("renders the upcoming projects heading", () => {
    render(
      <UpcomingProjectsSection projects={mockUpcomingProjects as Project[]} />
    );
    expect(screen.getByText(UPCOMING_PROJECTS.heading)).toBeInTheDocument();
  });

  it("renders all upcoming project titles", () => {
    render(
      <UpcomingProjectsSection projects={mockUpcomingProjects as Project[]} />
    );
    expect(
      screen.getByText("ADAC (Architecture Diagram as Code)")
    ).toBeInTheDocument();
    expect(screen.getByText("Agentic Web Starter")).toBeInTheDocument();
  });

  it("renders empty state when no upcoming projects", () => {
    render(<UpcomingProjectsSection projects={[]} />);
    expect(
      screen.getByText(UPCOMING_PROJECTS.emptyMessage)
    ).toBeInTheDocument();
  });

  it("does not show GitHub/Docs links for upcoming projects", () => {
    render(
      <UpcomingProjectsSection projects={mockUpcomingProjects as Project[]} />
    );
    expect(screen.queryByText("Repository")).not.toBeInTheDocument();
  });
});

// ── 4. ProjectCard ─────────────────────────────────────────────────────────

describe("ProjectCard", () => {
  const baseProps = {
    title: "Canvas Editor",
    parentTitle: "Current Projects",
    shortDescription: "Multipage document editor based on HTML5 canvas.",
    githubUrl: "https://github.com/mindfiredigital/canvas-editor",
    documentationUrl: "https://mindfiredigital.github.io/canvas-editor",
    stars: 20,
    tags: ["typescript", "react"],
  };

  it("renders title", () => {
    render(<ProjectCard {...baseProps} />);
    expect(screen.getByText("Canvas Editor")).toBeInTheDocument();
  });

  it("renders star count", () => {
    render(<ProjectCard {...baseProps} />);
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ProjectCard {...baseProps} />);
    expect(
      screen.getByText("Multipage document editor based on HTML5 canvas.")
    ).toBeInTheDocument();
  });

  it("renders Repository link with correct href", () => {
    render(<ProjectCard {...baseProps} />);
    expect(screen.getByRole("link", { name: /Repository/i })).toHaveAttribute(
      "href",
      baseProps.githubUrl
    );
  });

  it("renders Docs link with correct href", () => {
    render(<ProjectCard {...baseProps} />);
    expect(screen.getByRole("link", { name: /Docs/i })).toHaveAttribute(
      "href",
      baseProps.documentationUrl
    );
  });

  it("renders tags", () => {
    render(<ProjectCard {...baseProps} />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  it("does not render links for upcoming projects", () => {
    render(<ProjectCard {...baseProps} parentTitle='Upcoming Projects' />);
    expect(screen.queryByText("Repository")).not.toBeInTheDocument();
    expect(screen.queryByText("Docs")).not.toBeInTheDocument();
  });

  it("does not render tags for upcoming projects", () => {
    render(<ProjectCard {...baseProps} parentTitle='Upcoming Projects' />);
    expect(screen.queryByText("typescript")).not.toBeInTheDocument();
  });

  it("shows more/less toggle for long descriptions", () => {
    const longDesc = "A".repeat(130);
    render(<ProjectCard {...baseProps} shortDescription={longDesc} />);
    expect(screen.getByText("more")).toBeInTheDocument();
  });

  it("expands description on clicking more", () => {
    const longDesc = "A".repeat(130);
    render(<ProjectCard {...baseProps} shortDescription={longDesc} />);
    fireEvent.click(screen.getByText("more"));
    expect(screen.getByText("less")).toBeInTheDocument();
  });

  it("does not show more toggle for short descriptions", () => {
    render(<ProjectCard {...baseProps} shortDescription='Short desc.' />);
    expect(screen.queryByText("more")).not.toBeInTheDocument();
  });

  it("skips githubUrl if it is NA", () => {
    render(<ProjectCard {...baseProps} githubUrl='NA' />);
    expect(screen.queryByText("Repository")).not.toBeInTheDocument();
  });
});

// ── 5. FilterSidebar ───────────────────────────────────────────────────────

const defaultFilters: Filters = {
  tags: [],
  technologies: [],
  starRange: "all",
  contributorRange: "all",
  selectedContributor: [],
  sortBy: "stars",
};

const sidebarProps = {
  allTags: ["bitcoin", "blockchain"],
  allTechnologies: ["typescript", "react"],
  contributors: mockContributors as ContributorProject[],
  filters: defaultFilters,
  onFilterChange: jest.fn(),
  onReset: jest.fn(),
  searchQuery: "",
  onSearchChange: jest.fn(),
  isMobileOpen: false,
  onMobileToggle: jest.fn(),
};

describe("FilterSidebar", () => {
  it("renders the Filters heading", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(
      screen.getByPlaceholderText("Search projects...")
    ).toBeInTheDocument();
  });

  it("calls onSearchChange when search input changes", async () => {
    const onSearchChange = jest.fn();
    render(<FilterSidebar {...sidebarProps} onSearchChange={onSearchChange} />);
    await userEvent.type(
      screen.getByPlaceholderText("Search projects..."),
      "canvas"
    );
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("renders Sort By section", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("renders Stars filter section", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("Stars")).toBeInTheDocument();
  });

  it("renders Contributors Count filter section", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("Contributors Count")).toBeInTheDocument();
  });

  it("renders Technology filter section", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("Technology")).toBeInTheDocument();
  });

  it("renders Tags filter section", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("does not show Clear button when no active filters", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.queryByText(/Clear \(/)).not.toBeInTheDocument();
  });

  it("shows Clear button when filters are active", () => {
    render(
      <FilterSidebar
        {...sidebarProps}
        filters={{ ...defaultFilters, starRange: "10+" }}
      />
    );
    expect(screen.getByText(/Clear \(1\)/)).toBeInTheDocument();
  });

  it("calls onReset when Clear button clicked", () => {
    const onReset = jest.fn();
    render(
      <FilterSidebar
        {...sidebarProps}
        filters={{ ...defaultFilters, starRange: "10+" }}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByText(/Clear \(1\)/));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders contributor list with login names", () => {
    render(<FilterSidebar {...sidebarProps} />);
    expect(screen.getByText("anandmindfire")).toBeInTheDocument();
    expect(screen.getByText("deepakyadav-01")).toBeInTheDocument();
  });

  it("calls onFilterChange when a tag checkbox is toggled", () => {
    const onFilterChange = jest.fn();
    render(<FilterSidebar {...sidebarProps} onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByLabelText("bitcoin"));
    expect(onFilterChange).toHaveBeenCalledWith({ tags: ["bitcoin"] });
  });

  it("calls onFilterChange when a technology checkbox is toggled", () => {
    const onFilterChange = jest.fn();
    render(<FilterSidebar {...sidebarProps} onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByLabelText("typescript"));
    expect(onFilterChange).toHaveBeenCalledWith({
      technologies: ["typescript"],
    });
  });

  it("calls onFilterChange when star range radio is changed", () => {
    const onFilterChange = jest.fn();
    render(<FilterSidebar {...sidebarProps} onFilterChange={onFilterChange} />);
    // scope to starRange radios by name attribute to avoid conflict with contributorRange
    const starRadios = screen
      .getAllByRole("radio", { name: /10\+/ })
      .filter((el) => el.getAttribute("name") === "starRange");
    fireEvent.click(starRadios[0]);
    expect(onFilterChange).toHaveBeenCalledWith({ starRange: "10+" });
  });

  it("calls onFilterChange when sort option is changed", () => {
    const onFilterChange = jest.fn();
    render(<FilterSidebar {...sidebarProps} onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByDisplayValue("name"));
    expect(onFilterChange).toHaveBeenCalledWith({ sortBy: "name" });
  });

  it("renders all star range options", () => {
    render(<FilterSidebar {...sidebarProps} />);
    const starRadios = screen
      .getAllByRole("radio")
      .filter((el) => el.getAttribute("name") === "starRange");
    const starValues = starRadios.map((el) => el.getAttribute("value"));
    STAR_RANGES.forEach((range) => {
      expect(starValues).toContain(range);
    });
  });

  it("renders all contributor count range options", () => {
    render(<FilterSidebar {...sidebarProps} />);
    const contributorRadios = screen
      .getAllByRole("radio")
      .filter((el) => el.getAttribute("name") === "contributorRange");
    const contributorValues = contributorRadios.map((el) =>
      el.getAttribute("value")
    );
    CONTRIBUTOR_RANGES.forEach((range) => {
      expect(contributorValues).toContain(range);
    });
  });
});

// ── 6. useProjectFilters hook — via renderHook ─────────────────────────────

import { renderHook, act } from "@testing-library/react";

describe("useProjectFilters hook", () => {
  const hookArgs: Parameters<typeof useProjectFilters> = [
    mockProjects as Project[],
    mockUpcomingProjects as Project[],
    mockContributors as ContributorProject[],
    mockContributorMapping as ContributorMap,
    mockLeaderboard as TopScorer[],
  ];

  it("returns all current projects by default", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    expect(result.current.sortedCurrentProjects).toHaveLength(
      mockProjects.length
    );
  });

  it("returns all upcoming projects by default", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    expect(result.current.sortedUpcomingProjects).toHaveLength(
      mockUpcomingProjects.length
    );
  });

  it("sorts current projects by stars descending by default", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    const stars = result.current.sortedCurrentProjects.map((p) => p.stars ?? 0);
    expect(stars[0]).toBeGreaterThanOrEqual(stars[1]);
  });

  it("filters projects by search query", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.setSearchQuery("canvas");
    });
    expect(result.current.sortedCurrentProjects).toHaveLength(1);
    expect(result.current.sortedCurrentProjects[0].title).toBe("Canvas Editor");
  });

  it("returns empty list when search matches nothing", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.setSearchQuery("zzznomatch");
    });
    expect(result.current.sortedCurrentProjects).toHaveLength(0);
  });

  it("filters by tag", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.handleFilterChange({ tags: ["bitcoin"] });
    });
    expect(
      result.current.sortedCurrentProjects.every(
        (p) => p.tags?.some((t) => t.toLowerCase() === "bitcoin")
      )
    ).toBe(true);
  });

  it("filters by star range", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.handleFilterChange({ starRange: "15+" });
    });
    expect(
      result.current.sortedCurrentProjects.every((p) => (p.stars ?? 0) >= 15)
    ).toBe(true);
  });

  it("filters by technology", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.handleFilterChange({ technologies: ["typescript"] });
    });
    expect(
      result.current.sortedCurrentProjects.every(
        (p) => p.tags?.some((t) => t.toLowerCase() === "typescript")
      )
    ).toBe(true);
  });

  it("filters by contributor", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.handleFilterChange({
        selectedContributor: ["ParasMindfire"],
      });
    });
    // ParasMindfire is mapped to ids [3, 4]
    result.current.sortedCurrentProjects.forEach((p) => {
      expect([3, 4]).toContain(p.id);
    });
  });

  it("sorts by name alphabetically", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.handleFilterChange({ sortBy: "name" });
    });
    const titles = result.current.sortedCurrentProjects.map((p) => p.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  it("resets all filters correctly", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    act(() => {
      result.current.handleFilterChange({
        starRange: "15+",
        tags: ["bitcoin"],
      });
      result.current.setSearchQuery("canvas");
    });
    act(() => {
      result.current.handleResetFilters();
    });
    expect(result.current.sortedCurrentProjects).toHaveLength(
      mockProjects.length
    );
    expect(result.current.searchQuery).toBe("");
  });

  it("enriches contributors with total_score from leaderboard", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    const anand = result.current.enrichedContributors.find(
      (c) => c.login === "anandmindfire"
    );
    expect(anand?.total_score).toBe(3787);
  });

  it("sorts enriched contributors by total_score descending", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    const scores = result.current.enrichedContributors.map(
      (c) => c.total_score ?? 0
    );
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
  });

  it("extracts allTags excluding technology keywords", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    // "typescript" is a technology keyword, should not appear in allTags
    expect(result.current.allTags).not.toContain("typescript");
    // "bitcoin" and "blockchain" are regular tags
    expect(result.current.allTags).toContain("bitcoin");
    expect(result.current.allTags).toContain("blockchain");
  });

  it("extracts allTechnologies from technology keywords", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    expect(result.current.allTechnologies).toContain("typescript");
  });

  it("toggles mobile filter open state", () => {
    const { result } = renderHook(() => useProjectFilters(...hookArgs));
    expect(result.current.isMobileFilterOpen).toBe(false);
    act(() => {
      result.current.setIsMobileFilterOpen(true);
    });
    expect(result.current.isMobileFilterOpen).toBe(true);
  });
});
