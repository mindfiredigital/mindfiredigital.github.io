import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";

// ── Shared mocks ────────────────────────────────────────────────────────────
// IMPORTANT: jest.mock() is hoisted to the top of the file by Jest's babel
// transform, so NO variables defined outside can be referenced inside the
// factory callbacks.  All fixture data must be inlined here.

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    target,
    title,
  }: {
    href: string;
    children: React.ReactNode;
    target?: string;
    title?: string;
  }) => (
    <a href={href} target={target} title={title}>
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

// Headless UI: render children directly, gated on the `show` prop.
// Types and named-type aliases cannot be declared inside jest.mock() factories
// (Babel's hoisting check forbids out-of-scope references).  We use
// eslint-disable comments for the unavoidable `any` props instead.
/* eslint-disable @typescript-eslint/no-explicit-any, react/display-name */
jest.mock("@headlessui/react", () => {
  const MockDialog = ({ children, as: As = "div", className }: any) => (
    <As className={className}>{children}</As>
  );
  MockDialog.displayName = "MockDialog";

  const MockPanel = ({ children, className }: any) => (
    <div className={className}>{children}</div>
  );
  MockPanel.displayName = "MockDialog.Panel";

  const MockTitle = ({ children, as: As = "h1", className }: any) => (
    <As className={className}>{children}</As>
  );
  MockTitle.displayName = "MockDialog.Title";

  MockDialog.Panel = MockPanel;
  MockDialog.Title = MockTitle;

  const MockTransition = ({ children, show }: any) =>
    show !== false ? <>{children}</> : null;
  MockTransition.displayName = "MockTransition";

  const MockTransitionChild = ({ children }: any) => <>{children}</>;
  MockTransitionChild.displayName = "MockTransition.Child";

  MockTransition.Child = MockTransitionChild;

  return { Dialog: MockDialog, Transition: MockTransition };
});
/* eslint-enable @typescript-eslint/no-explicit-any, react/display-name */

// ── Asset mocks — ALL data inlined to avoid jest hoisting issues ────────────

jest.mock(
  "../../src/asset/packages.json",
  () => [
    {
      name: "canvas-editor",
      title: "canvas-editor",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/canvas-editor",
      projectTitle: "Canvas Editor",
      status: "published",
    },
    {
      name: "Extension Methods",
      title: "Extension Methods",
      type: "nuget",
      url: "https://www.nuget.org/packages/Extension.Methods",
      projectTitle: "Extension Methods",
      status: "draft",
    },
    {
      name: "Angular Canvas Editor",
      title: "Angular Canvas Editor",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/angular-canvas-editor",
      projectTitle: "Angular Canvas Editor",
      status: "published",
    },
    {
      name: "neo-pusher",
      title: "neo-pusher",
      type: "PyPi",
      url: "https://pypi.org/project/neo-pusher/",
      projectTitle: "neo-pusher",
      status: "published",
    },
    {
      name: "eslint-plugin-hub",
      title: "eslint-plugin-hub",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/eslint-plugin-hub",
      projectTitle: "ESLint Plugin Hub",
      status: "published",
    },
    {
      name: "page-builder-react",
      title: "page-builder-react",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/page-builder-react",
      projectTitle: "Page Builder React",
      status: "published",
    },
  ],
  { virtual: true }
);

jest.mock(
  "../../src/asset/stats.json",
  () => [
    {
      name: "eslint-plugin-hub",
      type: "npm",
      day: 38,
      week: 119,
      year: 47642,
      total: 110032,
      title: "eslint-plugin-hub",
    },
    {
      name: "neo-pusher",
      type: "pypi",
      day: 19,
      week: 21,
      month: 47,
      year: 0,
      total: 21000,
      title: "neo-pusher",
    },
    {
      name: "canvas-editor",
      type: "npm",
      day: 5,
      week: 30,
      month: 120,
      year: 1440,
      total: 5000,
      title: "canvas-editor",
    },
    {
      name: "page-builder-react",
      type: "npm",
      day: 0,
      week: 1,
      year: 3421,
      total: 4055,
      title: "page-builder-react",
    },
    {
      name: "Angular Canvas Editor",
      type: "npm",
      day: 2,
      week: 10,
      month: 40,
      year: 480,
      total: 2000,
      title: "Angular Canvas Editor",
    },
  ],
  { virtual: true }
);

jest.mock(
  "../../src/asset/projects_grouped.json",
  () => [
    {
      id: "2",
      title: "Canvas Editor",
      isMonoRepo: false,
      repoUrl: "canvas-editor",
      packages: [
        {
          name: "canvas-editor",
          type: "npm",
          url: "https://www.npmjs.com/package/@mindfiredigital/canvas-editor",
          status: "published",
        },
      ],
    },
    {
      id: "3",
      title: "NFT Marketplace",
      isMonoRepo: false,
      packages: [],
    },
    {
      id: "4",
      title: "ESLint Plugin Hub",
      isMonoRepo: false,
      repoUrl: "eslint-plugin-hub",
      packages: [
        {
          name: "eslint-plugin-hub",
          type: "npm",
          url: "https://www.npmjs.com/package/@mindfiredigital/eslint-plugin-hub",
          status: "published",
        },
      ],
    },
    {
      id: "5",
      title: "Neo Pusher",
      isMonoRepo: false,
      repoUrl: "neo-pusher",
      packages: [
        {
          name: "neo-pusher",
          type: "PyPi",
          url: "https://pypi.org/project/neo-pusher/",
          status: "published",
        },
      ],
    },
    {
      id: "6",
      title: "Angular Canvas Editor",
      isMonoRepo: true,
      repoUrl: "canvas-editor",
      packages: [
        {
          name: "canvas-editor",
          type: "npm",
          url: "https://www.npmjs.com/package/@mindfiredigital/canvas-editor",
          status: "published",
        },
        {
          name: "Angular Canvas Editor",
          title: "Angular Canvas Editor",
          type: "npm",
          url: "https://www.npmjs.com/package/@mindfiredigital/angular-canvas-editor",
          status: "published",
        },
      ],
    },
    {
      id: "7",
      title: "Page Builder",
      isMonoRepo: false,
      repoUrl: "page-builder",
      packages: [
        {
          name: "page-builder-react",
          type: "npm",
          url: "https://www.npmjs.com/package/@mindfiredigital/page-builder-react",
          status: "published",
        },
      ],
    },
  ],
  { virtual: true }
);

// ── Global fetch mock ───────────────────────────────────────────────────────

global.fetch = jest.fn();

const mockFetchSuccess = (totalDownloads = 500) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({
      downloads: [
        { downloads: Math.floor(totalDownloads / 2), day: "2025-01-01" },
        { downloads: Math.ceil(totalDownloads / 2), day: "2025-01-02" },
      ],
    }),
  });
};

const mockFetchFailure = () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    statusText: "Not Found",
  });
};

// ── Component & hook imports — must come AFTER all jest.mock() calls ────────

import Stats from "../../src/app/packages/page";
import PackageCard from "../../src/app/packages/components/PackageCard";
import PackageStatsModal from "../../src/app/packages/components/PackageStatsModal";
import MonorepoPackagesModal from "../../src/app/packages/components/MonorepoPackagesModal";
import PackageFilterToggle from "../../src/app/packages/components/PackageFilterToggle";
import PackageCount from "../../src/app/packages/components/PackageCount";
import TotalDownloads from "../../src/app/packages/components/TotalDownloads";
import { usePackageStats } from "../../src/hooks/usePackageStats";

import {
  STATS_HERO,
  PACKAGE_CARD_LABELS,
  FILTER_OPTIONS,
  NPM_RANGE_OPTIONS,
  PYPI_RANGE_OPTIONS,
  DATE_PICKER_LABELS,
  GITHUB_BASE_URL,
} from "../../src/constants";
import { GroupedPackage, Package } from "../../src/types";

// ── Test fixtures — safe to declare here; only used inside test bodies ──────

const mockNpmPackage: Package = {
  name: "canvas-editor",
  title: "canvas-editor",
  type: "npm",
  url: "https://www.npmjs.com/package/@mindfiredigital/canvas-editor",
  total: 5000,
  day: 5,
  week: 30,
  month: 120,
  year: 1440,
  status: "published",
};

const mockPypiPackage: Package = {
  name: "neo-pusher",
  title: "neo-pusher",
  type: "pypi",
  url: "https://pypi.org/project/neo-pusher/",
  total: 21000,
  day: 19,
  week: 21,
  month: 47,
  year: 0,
  status: "published",
};

const mockSingleGroup: GroupedPackage = {
  id: "eslint-plugin-hub",
  baseTitle: "ESLint Plugin Hub",
  isMonorepo: false,
  githubRepo: "eslint-plugin-hub",
  packages: [
    {
      name: "eslint-plugin-hub",
      title: "eslint-plugin-hub",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/eslint-plugin-hub",
      total: 110032,
      status: "published",
    },
  ],
  totalDownloads: 110032,
  type: "npm",
};

const mockMonorepoGroup: GroupedPackage = {
  id: "canvas-editor-mono",
  baseTitle: "Canvas Editor",
  isMonorepo: true,
  githubRepo: "canvas-editor",
  packages: [
    {
      name: "canvas-editor",
      title: "canvas-editor",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/canvas-editor",
      total: 5000,
      status: "published",
    },
    {
      name: "Angular Canvas Editor",
      title: "Angular Canvas Editor",
      type: "npm",
      url: "https://www.npmjs.com/package/@mindfiredigital/angular-canvas-editor",
      total: 2000,
      status: "published",
    },
  ],
  totalDownloads: 7000,
  type: "npm",
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. Stats Page — hero & structure
// ═══════════════════════════════════════════════════════════════════════════

describe("Stats Page — hero and structure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Stats />);
  });

  it("renders the hero heading", () => {
    expect(
      screen.getByRole("heading", { name: STATS_HERO.heading })
    ).toBeInTheDocument();
  });

  it("renders the hero subheading", () => {
    expect(screen.getByText(STATS_HERO.subheading)).toBeInTheDocument();
  });

  it("renders the TotalDownloads label", () => {
    expect(
      screen.getAllByText(PACKAGE_CARD_LABELS.totalDownloads).length
    ).toBeGreaterThan(0);
  });

  it("renders all filter toggle buttons", () => {
    FILTER_OPTIONS.forEach((opt) => {
      expect(
        screen.getByRole("button", { name: opt.label })
      ).toBeInTheDocument();
    });
  });

  it("renders at least one package card", () => {
    expect(screen.getByText("ESLint Plugin Hub")).toBeInTheDocument();
  });

  it("does not show PackageStatsModal dropdown on initial render", () => {
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("renders the PackageCount badge image", () => {
    expect(screen.getByAltText("total_packages")).toBeInTheDocument();
  });

  it("renders the TotalDownloads icon", () => {
    expect(screen.getByAltText("total_downloads")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Stats Page — filter integration
// ═══════════════════════════════════════════════════════════════════════════

describe("Stats Page — filter integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Stats />);
  });

  it("All filter button is visually active on initial render", () => {
    expect(screen.getByRole("button", { name: "All" })).toHaveClass(
      "bg-gradient-to-r"
    );
  });

  it("clicking NPM filter removes pypi-only packages from view", async () => {
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    await waitFor(() => {
      expect(screen.queryByText("Neo Pusher")).not.toBeInTheDocument();
    });
  });

  it("clicking PyPI filter removes npm-only packages from view", async () => {
    fireEvent.click(screen.getByRole("button", { name: "PyPI" }));
    await waitFor(() => {
      expect(screen.queryByText("ESLint Plugin Hub")).not.toBeInTheDocument();
    });
  });

  it("clicking PyPI filter keeps pypi packages visible", async () => {
    fireEvent.click(screen.getByRole("button", { name: "PyPI" }));
    await waitFor(() => {
      expect(screen.getByText("Neo Pusher")).toBeInTheDocument();
    });
  });

  it("switching back to All restores all packages", async () => {
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    await waitFor(() => {
      expect(screen.getByText("Neo Pusher")).toBeInTheDocument();
      expect(screen.getByText("ESLint Plugin Hub")).toBeInTheDocument();
    });
  });

  it("TotalDownloads badge remains visible after filter change", async () => {
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    await waitFor(() => {
      expect(
        screen.getAllByText(PACKAGE_CARD_LABELS.totalDownloads).length
      ).toBeGreaterThan(0);
    });
  });

  it("NPM button receives active styling after being clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    expect(screen.getByRole("button", { name: "NPM" })).toHaveClass(
      "bg-gradient-to-r"
    );
  });

  it("All button loses active styling after another filter is selected", () => {
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    expect(screen.getByRole("button", { name: "All" })).not.toHaveClass(
      "bg-gradient-to-r"
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Stats Page — PackageStatsModal open / close user journey
// ═══════════════════════════════════════════════════════════════════════════

describe("Stats Page — PackageStatsModal open/close user journey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSuccess(500);
  });

  it("opens PackageStatsModal when filter icon is clicked on a single-package card", async () => {
    render(<Stats />);
    const filterBtns = screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle);
    fireEvent.click(filterBtns[0]);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  it("modal renders at least one heading after opening", async () => {
    render(<Stats />);
    const filterBtns = screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle);
    fireEvent.click(filterBtns[0]);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });

  it("closes PackageStatsModal when close button is clicked", async () => {
    render(<Stats />);
    const filterBtns = screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle);
    fireEvent.click(filterBtns[0]);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // The modal close button is inside the Dialog.Panel and has the
    // text-gray-500 class. It is the only button inside the modal panel
    // that also contains an SVG path for the X icon (M6 18L18 6M6 6l12 12).
    // We find it by looking for a button whose SVG stroke path matches the X icon.
    const allButtons = screen.getAllByRole("button");
    const closeBtn = allButtons.find((btn) => {
      const path = btn.querySelector("path");
      return path?.getAttribute("d") === "M6 18L18 6M6 6l12 12";
    });

    expect(closeBtn).toBeDefined();
    act(() => {
      fireEvent.click(closeBtn!);
    });

    await waitFor(() => {
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Stats Page — MonorepoPackagesModal user journey
// ═══════════════════════════════════════════════════════════════════════════

describe("Stats Page — MonorepoPackagesModal user journey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens MonorepoPackagesModal when 'View All Packages' is clicked", async () => {
    render(<Stats />);
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(PACKAGE_CARD_LABELS.viewAllPackages, "i"),
      })
    );
    await waitFor(() => {
      expect(
        screen.getByText(PACKAGE_CARD_LABELS.availablePackages)
      ).toBeInTheDocument();
    });
  });

  it("shows all packages belonging to the monorepo group", async () => {
    render(<Stats />);
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(PACKAGE_CARD_LABELS.viewAllPackages, "i"),
      })
    );
    await waitFor(() => {
      expect(
        screen.getByText(PACKAGE_CARD_LABELS.availablePackages)
      ).toBeInTheDocument();
    });
    // "canvas-editor" only appears inside the modal
    expect(screen.getByText("canvas-editor")).toBeInTheDocument();
    // "Angular Canvas Editor" appears both as a page card title AND inside
    // the modal, so we assert at least one instance is present
    expect(
      screen.getAllByText("Angular Canvas Editor").length
    ).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. PackageCard component
// ═══════════════════════════════════════════════════════════════════════════

describe("PackageCard", () => {
  const onFilterClick = jest.fn();
  const onViewAllClick = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it("renders base title for a single-package group", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(screen.getByText("ESLint Plugin Hub")).toBeInTheDocument();
  });

  it("renders total downloads formatted with commas", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(screen.getByText("110,032")).toBeInTheDocument();
  });

  it("renders 'Total Downloads' label", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.totalDownloads)
    ).toBeInTheDocument();
  });

  it("renders filter button for non-monorepo group", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.getByTitle(PACKAGE_CARD_LABELS.filterTitle)
    ).toBeInTheDocument();
  });

  it("calls onFilterClick when filter button is clicked", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    fireEvent.click(screen.getByTitle(PACKAGE_CARD_LABELS.filterTitle));
    expect(onFilterClick).toHaveBeenCalledTimes(1);
  });

  it("renders GitHub link with correct href", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(screen.getByTitle(PACKAGE_CARD_LABELS.githubTitle)).toHaveAttribute(
      "href",
      `${GITHUB_BASE_URL}/eslint-plugin-hub`
    );
  });

  it("renders npm registry link for npm package", () => {
    render(
      <PackageCard
        group={mockSingleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.getByTitle(PACKAGE_CARD_LABELS.viewPackageTitle)
    ).toHaveAttribute(
      "href",
      "https://www.npmjs.com/package/@mindfiredigital/eslint-plugin-hub"
    );
  });

  it("renders Monorepo badge for monorepo group", () => {
    render(
      <PackageCard
        group={mockMonorepoGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.monorepoLabel)
    ).toBeInTheDocument();
  });

  it("renders 'View All Packages' button for monorepo", () => {
    render(
      <PackageCard
        group={mockMonorepoGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.getByRole("button", {
        name: new RegExp(PACKAGE_CARD_LABELS.viewAllPackages, "i"),
      })
    ).toBeInTheDocument();
  });

  it("calls onViewAllClick when 'View All Packages' is clicked", () => {
    render(
      <PackageCard
        group={mockMonorepoGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(PACKAGE_CARD_LABELS.viewAllPackages, "i"),
      })
    );
    expect(onViewAllClick).toHaveBeenCalledTimes(1);
  });

  it("does not render filter button for monorepo group", () => {
    render(
      <PackageCard
        group={mockMonorepoGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.queryByTitle(PACKAGE_CARD_LABELS.filterTitle)
    ).not.toBeInTheDocument();
  });

  it("does not render registry link for monorepo group", () => {
    render(
      <PackageCard
        group={mockMonorepoGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(
      screen.queryByTitle(PACKAGE_CARD_LABELS.viewPackageTitle)
    ).not.toBeInTheDocument();
  });

  it("renders zero downloads correctly", () => {
    const zeroGroup = { ...mockSingleGroup, totalDownloads: 0 };
    render(
      <PackageCard
        group={zeroGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders very large download counts formatted with commas", () => {
    const largeGroup = { ...mockSingleGroup, totalDownloads: 1234567 };
    render(
      <PackageCard
        group={largeGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={onViewAllClick}
      />
    );
    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. PackageStatsModal component
// ═══════════════════════════════════════════════════════════════════════════

describe("PackageStatsModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedPackage: mockNpmPackage,
    selectedRange: false,
    loading: false,
    count: 5000,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    onStartDateChange: jest.fn(),
    onEndDateChange: jest.fn(),
    onRangeChange: jest.fn(),
  };

  afterEach(() => jest.clearAllMocks());

  it("renders modal content when isOpen is true", () => {
    render(<PackageStatsModal {...baseProps} />);
    expect(screen.getByText("canvas-editor")).toBeInTheDocument();
  });

  it("does not render modal content when isOpen is false", () => {
    render(<PackageStatsModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText("canvas-editor")).not.toBeInTheDocument();
  });

  it("renders the formatted download count", () => {
    render(<PackageStatsModal {...baseProps} />);
    expect(screen.getByText("5,000")).toBeInTheDocument();
  });

  it("renders the downloads label", () => {
    render(<PackageStatsModal {...baseProps} />);
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.downloadsLabel)
    ).toBeInTheDocument();
  });

  it("hides count and shows spinner when loading is true", () => {
    render(<PackageStatsModal {...baseProps} loading={true} />);
    expect(screen.queryByText("5,000")).not.toBeInTheDocument();
  });

  it("renders npm range options for an npm package", () => {
    render(<PackageStatsModal {...baseProps} />);
    NPM_RANGE_OPTIONS.forEach((opt) => {
      expect(
        screen.getByRole("option", { name: opt.label })
      ).toBeInTheDocument();
    });
  });

  it("renders pypi range options for a pypi package", () => {
    render(
      <PackageStatsModal
        {...baseProps}
        selectedPackage={mockPypiPackage}
        count={21000}
      />
    );
    PYPI_RANGE_OPTIONS.forEach((opt) => {
      expect(
        screen.getByRole("option", { name: opt.label })
      ).toBeInTheDocument();
    });
  });

  it("does not render npm-only 'Custom Range' option for pypi package", () => {
    render(
      <PackageStatsModal
        {...baseProps}
        selectedPackage={mockPypiPackage}
        count={21000}
      />
    );
    expect(
      screen.queryByRole("option", { name: "Custom Range" })
    ).not.toBeInTheDocument();
  });

  it("shows date pickers when selectedRange is true and package is npm", () => {
    render(<PackageStatsModal {...baseProps} selectedRange={true} />);
    expect(
      screen.getByLabelText(DATE_PICKER_LABELS.startDate)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(DATE_PICKER_LABELS.endDate)
    ).toBeInTheDocument();
  });

  it("hides date pickers when selectedRange is false", () => {
    render(<PackageStatsModal {...baseProps} selectedRange={false} />);
    expect(
      screen.queryByLabelText(DATE_PICKER_LABELS.startDate)
    ).not.toBeInTheDocument();
  });

  it("hides date pickers for pypi packages even when selectedRange is true", () => {
    render(
      <PackageStatsModal
        {...baseProps}
        selectedPackage={mockPypiPackage}
        selectedRange={true}
      />
    );
    expect(
      screen.queryByLabelText(DATE_PICKER_LABELS.startDate)
    ).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<PackageStatsModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onStartDateChange with the new value on input change", () => {
    const onStartDateChange = jest.fn();
    render(
      <PackageStatsModal
        {...baseProps}
        selectedRange={true}
        onStartDateChange={onStartDateChange}
      />
    );
    fireEvent.change(screen.getByLabelText(DATE_PICKER_LABELS.startDate), {
      target: { value: "2025-02-01" },
    });
    expect(onStartDateChange).toHaveBeenCalledWith("2025-02-01");
  });

  it("calls onEndDateChange with the new value on input change", () => {
    const onEndDateChange = jest.fn();
    render(
      <PackageStatsModal
        {...baseProps}
        selectedRange={true}
        onEndDateChange={onEndDateChange}
      />
    );
    fireEvent.change(screen.getByLabelText(DATE_PICKER_LABELS.endDate), {
      target: { value: "2025-02-28" },
    });
    expect(onEndDateChange).toHaveBeenCalledWith("2025-02-28");
  });

  it("calls onRangeChange when dropdown selection changes", () => {
    const onRangeChange = jest.fn();
    render(<PackageStatsModal {...baseProps} onRangeChange={onRangeChange} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Today" },
    });
    expect(onRangeChange).toHaveBeenCalledTimes(1);
  });

  it("renders package title as modal heading", () => {
    render(<PackageStatsModal {...baseProps} />);
    expect(
      screen.getByRole("heading", { name: "canvas-editor" })
    ).toBeInTheDocument();
  });

  it("renders 0 correctly when count prop is 0", () => {
    render(<PackageStatsModal {...baseProps} count={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders the 'Select' label next to the range dropdown", () => {
    render(<PackageStatsModal {...baseProps} />);
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.selectLabel)
    ).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. MonorepoPackagesModal component
// ═══════════════════════════════════════════════════════════════════════════

describe("MonorepoPackagesModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedGroup: mockMonorepoGroup,
    onPackageFilterClick: jest.fn(),
  };

  afterEach(() => jest.clearAllMocks());

  it("renders modal content when isOpen is true", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    expect(screen.getByText("Canvas Editor")).toBeInTheDocument();
  });

  it("does not render modal content when isOpen is false", () => {
    render(<MonorepoPackagesModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText("Canvas Editor")).not.toBeInTheDocument();
  });

  it("renders 'Available Packages' section heading", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.availablePackages)
    ).toBeInTheDocument();
  });

  it("renders all packages in the selected monorepo group", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    expect(screen.getByText("canvas-editor")).toBeInTheDocument();
    expect(screen.getByText("Angular Canvas Editor")).toBeInTheDocument();
  });

  it("renders download counts for each package", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("2,000")).toBeInTheDocument();
  });

  it("renders the downloads label once per package", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    const labels = screen.getAllByText(PACKAGE_CARD_LABELS.downloadsLabel);
    expect(labels).toHaveLength(mockMonorepoGroup.packages.length);
  });

  it("renders a filter button for each package", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    const filterBtns = screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle);
    expect(filterBtns).toHaveLength(mockMonorepoGroup.packages.length);
  });

  it("calls onPackageFilterClick with the correct package on filter click", () => {
    const onPackageFilterClick = jest.fn();
    render(
      <MonorepoPackagesModal
        {...baseProps}
        onPackageFilterClick={onPackageFilterClick}
      />
    );
    const filterBtns = screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle);
    fireEvent.click(filterBtns[0]);
    expect(onPackageFilterClick).toHaveBeenCalledTimes(1);
    expect(onPackageFilterClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "canvas-editor" })
    );
  });

  it("renders GitHub links pointing to the group repo for every package", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    screen.getAllByTitle(PACKAGE_CARD_LABELS.githubTitle).forEach((link) => {
      expect(link).toHaveAttribute("href", `${GITHUB_BASE_URL}/canvas-editor`);
    });
  });

  it("renders npm registry links for npm packages in the modal", () => {
    render(<MonorepoPackagesModal {...baseProps} />);
    expect(
      screen.getAllByTitle(PACKAGE_CARD_LABELS.viewPackageTitle).length
    ).toBeGreaterThan(0);
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = jest.fn();
    render(<MonorepoPackagesModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing for package content when selectedGroup is null", () => {
    render(<MonorepoPackagesModal {...baseProps} selectedGroup={null} />);
    expect(
      screen.queryByText(PACKAGE_CARD_LABELS.availablePackages)
    ).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. PackageFilterToggle component
// ═══════════════════════════════════════════════════════════════════════════

describe("PackageFilterToggle", () => {
  const onChange = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it("renders all filter option buttons", () => {
    render(<PackageFilterToggle activeFilter='all' onChange={onChange} />);
    FILTER_OPTIONS.forEach((opt) => {
      expect(
        screen.getByRole("button", { name: opt.label })
      ).toBeInTheDocument();
    });
  });

  it("applies active gradient styling to the active filter button", () => {
    render(<PackageFilterToggle activeFilter='npm' onChange={onChange} />);
    expect(screen.getByRole("button", { name: "NPM" })).toHaveClass(
      "bg-gradient-to-r"
    );
  });

  it("does not apply active styling to inactive filter buttons", () => {
    render(<PackageFilterToggle activeFilter='npm' onChange={onChange} />);
    expect(screen.getByRole("button", { name: "All" })).not.toHaveClass(
      "bg-gradient-to-r"
    );
    expect(screen.getByRole("button", { name: "PyPI" })).not.toHaveClass(
      "bg-gradient-to-r"
    );
  });

  it("calls onChange with 'npm' when NPM is clicked", () => {
    render(<PackageFilterToggle activeFilter='all' onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    expect(onChange).toHaveBeenCalledWith("npm");
  });

  it("calls onChange with 'pypi' when PyPI is clicked", () => {
    render(<PackageFilterToggle activeFilter='all' onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "PyPI" }));
    expect(onChange).toHaveBeenCalledWith("pypi");
  });

  it("calls onChange with 'all' when All is clicked", () => {
    render(<PackageFilterToggle activeFilter='npm' onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("calls onChange exactly once per click", () => {
    render(<PackageFilterToggle activeFilter='all' onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. PackageCount component
// ═══════════════════════════════════════════════════════════════════════════

describe("PackageCount", () => {
  it("renders the total package count", () => {
    render(<PackageCount totalPackages={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders 0 when totalPackages is 0", () => {
    render(<PackageCount totalPackages={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders the package icon image", () => {
    render(<PackageCount totalPackages={10} />);
    expect(screen.getByAltText("total_packages")).toBeInTheDocument();
  });

  it("renders the BorderBeam decoration", () => {
    render(<PackageCount totalPackages={10} />);
    expect(screen.getByTestId("border-beam")).toBeInTheDocument();
  });

  it("renders large package counts correctly", () => {
    render(<PackageCount totalPackages={999} />);
    expect(screen.getByText("999")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. TotalDownloads component
// ═══════════════════════════════════════════════════════════════════════════

describe("TotalDownloads", () => {
  it("renders the download icon image", () => {
    render(<TotalDownloads totalDownloads={10000} />);
    expect(screen.getByAltText("total_downloads")).toBeInTheDocument();
  });

  it("renders compact formatted count — 10K", () => {
    render(<TotalDownloads totalDownloads={10000} />);
    expect(screen.getByText("10K")).toBeInTheDocument();
  });

  it("renders compact formatted count — 1.2M", () => {
    render(<TotalDownloads totalDownloads={1200000} />);
    expect(screen.getByText("1.2M")).toBeInTheDocument();
  });

  it("renders 0 when totalDownloads is 0", () => {
    render(<TotalDownloads totalDownloads={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders the total downloads label", () => {
    render(<TotalDownloads totalDownloads={5000} />);
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.totalDownloads)
    ).toBeInTheDocument();
  });

  it("renders the BorderBeam decoration", () => {
    render(<TotalDownloads totalDownloads={5000} />);
    expect(screen.getByTestId("border-beam")).toBeInTheDocument();
  });

  it("formats 110032 as 110K", () => {
    render(<TotalDownloads totalDownloads={110032} />);
    expect(screen.getByText("110K")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. usePackageStats hook
// ═══════════════════════════════════════════════════════════════════════════

describe("usePackageStats hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSuccess(500);
  });

  it("returns a non-empty packages list merged from packages.json + stats.json", () => {
    const { result } = renderHook(() => usePackageStats());
    expect(result.current.packages.length).toBeGreaterThan(0);
  });

  it("merges stats correctly — canvas-editor total equals 5000", () => {
    const { result } = renderHook(() => usePackageStats());
    const pkg = result.current.packages.find((p) => p.name === "canvas-editor");
    expect(pkg?.total).toBe(5000);
  });

  it("merges stats correctly — neo-pusher total equals 21000", () => {
    const { result } = renderHook(() => usePackageStats());
    const pkg = result.current.packages.find((p) => p.name === "neo-pusher");
    expect(pkg?.total).toBe(21000);
  });

  it("packages with no matching stats entry have total defaulting to 0", () => {
    const { result } = renderHook(() => usePackageStats());
    const pkg = result.current.packages.find(
      (p) => p.name === "Extension Methods"
    );
    if (pkg) expect(pkg.total).toBe(0);
  });

  it("modal is closed (isOpen = false) by default", () => {
    const { result } = renderHook(() => usePackageStats());
    expect(result.current.isOpen).toBe(false);
  });

  it("isOpen becomes true after calling openModal", () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.openModal();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("isOpen becomes false after calling closeModal", () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.openModal();
    });
    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("selectedRange resets to false when closeModal is called", () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.openModal();
    });
    act(() => {
      result.current.closeModal();
    });
    expect(result.current.selectedRange).toBe(false);
  });

  it("count equals selectedPackage.total immediately after openModal", () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setSelectedPackage(mockNpmPackage);
    });
    act(() => {
      result.current.openModal();
    });
    expect(result.current.count).toBe(5000);
  });

  it("count updates reactively when setSelectedPackage is called", async () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setSelectedPackage(mockPypiPackage);
    });
    await waitFor(() => {
      expect(result.current.count).toBe(21000);
    });
  });

  it("setStartDate updates the startDate value", () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setStartDate("2025-03-01");
    });
    expect(result.current.startDate).toBe("2025-03-01");
  });

  it("setEndDate updates the endDate value", () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setEndDate("2025-03-31");
    });
    expect(result.current.endDate).toBe("2025-03-31");
  });

  it("selectedRange is false by default", () => {
    const { result } = renderHook(() => usePackageStats());
    expect(result.current.selectedRange).toBe(false);
  });

  it("handleChange sets selectedRange to true when 'custom' is selected for npm package", async () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setSelectedPackage(mockNpmPackage);
    });
    act(() => {
      result.current.handleChange({
        target: { value: "custom" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    await waitFor(() => {
      expect(result.current.selectedRange).toBe(true);
    });
  });

  it("handleChange triggers a fetch call for non-custom npm ranges", async () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setSelectedPackage(mockNpmPackage);
    });
    act(() => {
      result.current.handleChange({
        target: { value: "Today" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handleChange sets count from a numeric value for pypi packages", async () => {
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setSelectedPackage(mockPypiPackage);
    });
    act(() => {
      result.current.handleChange({
        target: { value: "47" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    await waitFor(() => {
      expect(result.current.count).toBe(47);
    });
  });

  it("count is set to 0 when the npm fetch call fails", async () => {
    mockFetchFailure();
    const { result } = renderHook(() => usePackageStats());
    act(() => {
      result.current.setSelectedPackage(mockNpmPackage);
    });
    act(() => {
      result.current.handleChange({
        target: { value: "Today" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    await waitFor(() => {
      expect(result.current.count).toBe(0);
    });
  });

  it("loading is false by default", () => {
    const { result } = renderHook(() => usePackageStats());
    expect(result.current.loading).toBe(false);
  });

  it("merges day and week stats correctly for canvas-editor", () => {
    const { result } = renderHook(() => usePackageStats());
    const pkg = result.current.packages.find((p) => p.name === "canvas-editor");
    expect(pkg?.day).toBe(5);
    expect(pkg?.week).toBe(30);
  });

  it("eslint-plugin-hub has the correct total from stats.json", () => {
    const { result } = renderHook(() => usePackageStats());
    const pkg = result.current.packages.find(
      (p) => p.name === "eslint-plugin-hub"
    );
    expect(pkg?.total).toBe(110032);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. Full user journeys
// ═══════════════════════════════════════════════════════════════════════════

describe("Full user journey — filter → open stats modal → change range → close", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSuccess(250);
  });

  it("completes the single-package journey: filter → open modal → change range → fetch fires", async () => {
    render(<Stats />);

    // Step 1: Apply NPM filter
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    await waitFor(() => {
      expect(screen.queryByText("Neo Pusher")).not.toBeInTheDocument();
    });

    // Step 2: Open PackageStatsModal via a filter icon
    const filterBtns = screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle);
    expect(filterBtns.length).toBeGreaterThan(0);
    fireEvent.click(filterBtns[0]);

    // Step 3: Modal is open
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // Step 4: Change range — fetch is triggered
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Today" },
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("filter cycling: NPM → PyPI → All restores all cards correctly", async () => {
    render(<Stats />);

    // NPM
    fireEvent.click(screen.getByRole("button", { name: "NPM" }));
    await waitFor(() => {
      expect(screen.queryByText("Neo Pusher")).not.toBeInTheDocument();
    });

    // PyPI
    fireEvent.click(screen.getByRole("button", { name: "PyPI" }));
    await waitFor(() => {
      expect(screen.getByText("Neo Pusher")).toBeInTheDocument();
      expect(screen.queryByText("ESLint Plugin Hub")).not.toBeInTheDocument();
    });

    // All
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    await waitFor(() => {
      expect(screen.getByText("Neo Pusher")).toBeInTheDocument();
      expect(screen.getByText("ESLint Plugin Hub")).toBeInTheDocument();
    });
  });
});
