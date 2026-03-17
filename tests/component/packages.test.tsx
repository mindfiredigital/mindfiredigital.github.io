import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Stats from "../../src/app/packages/page";
import PackageCard from "../../src/app/packages/components/Packagecard";
import PackageFilterToggle from "../../src/app/packages/components/Packagefiltertoggle";
import PackageCount from "../../src/app/packages/components/PackageCount";
import TotalDownloads from "../../src/app/packages/components/Totaldownloads";
import PackageStatsModal from "../../src/app/packages/components/Packagestatsmodal";
import MonorepoPackagesModal from "../../src/app/packages/components/Monorepopackagesmodal";
import {
  STATS_HERO,
  PACKAGE_CARD_LABELS,
  FILTER_OPTIONS,
  GITHUB_BASE_URL,
  DATE_PICKER_LABELS,
} from "../../src/constants";
import { GroupedPackage } from "../../src/types";

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
    title,
  }: {
    href: string;
    children: React.ReactNode;
    title?: string;
  }) => (
    <a href={href} title={title}>
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
jest.mock("../../src/app/utils", () => ({
  getFrameworkName: (title: string) => `Framework:${title}`,
}));
jest.mock("../../src/hooks/usePackageStats", () => ({
  usePackageStats: () => ({
    startDate: "",
    endDate: "",
    openModal: jest.fn(),
    closeModal: jest.fn(),
    setStartDate: jest.fn(),
    setEndDate: jest.fn(),
    loading: false,
    count: 1000,
    isOpen: false,
    handleChange: jest.fn(),
    packages: [],
    selectedPackage: null,
    setSelectedPackage: jest.fn(),
    selectedRange: false,
  }),
}));
jest.mock("../../src/asset/projects_grouped.json", () => [], { virtual: true });

// ── Shared fixtures ────────────────────────────────────────────────────────

const singleGroup: GroupedPackage = {
  id: "pkg-1",
  baseTitle: "My Package",
  isMonorepo: false,
  totalDownloads: 5000,
  githubRepo: "my-repo",
  type: "npm",
  packages: [
    {
      url: "https://npmjs.com/package/my-pkg",
      type: "npm",
      name: "my-pkg",
      title: "My Package",
      total: 5000,
      status: "published",
    },
  ],
};

const monorepoGroup: GroupedPackage = {
  id: "mono-1",
  baseTitle: "My Monorepo",
  isMonorepo: true,
  totalDownloads: 12000,
  githubRepo: "my-monorepo",
  type: "npm",
  packages: [
    {
      name: "pkg-a",
      title: "Pkg A",
      type: "npm",
      total: 6000,
      url: "https://npmjs.com/package/pkg-a",
      status: "published",
    },
    {
      name: "pkg-b",
      title: "Pkg B",
      type: "pypi",
      total: 6000,
      url: "https://pypi.org/project/pkg-b",
      status: "published",
    },
  ],
};

const modalBaseProps = {
  isOpen: true,
  onClose: jest.fn(),
  selectedPackage: {
    title: "test-pkg",
    type: "npm" as const,
    total: 1000,
    month: 100,
    day: 10,
    week: 50,
    name: "test-pkg",
    url: "",
    status: "published",
  },
  selectedRange: false,
  loading: false,
  count: 1234,
  startDate: "",
  endDate: "",
  onStartDateChange: jest.fn(),
  onEndDateChange: jest.fn(),
  onRangeChange: jest.fn(),
};

// ── Stats page ─────────────────────────────────────────────────────────────

jest.mock("../../src/app/packages/components/PackageFilterToggle", () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <div data-testid='filter-toggle'>
      <button onClick={() => onChange("npm")}>npm</button>
      <button onClick={() => onChange("all")}>all</button>
    </div>
  ),
}));
jest.mock("../../src/app/packages/components/PackageCard", () => ({
  __esModule: true,
  default: ({ group }: { group: { baseTitle: string } }) => (
    <div data-testid='package-card'>{group.baseTitle}</div>
  ),
}));
jest.mock("../../src/app/packages/components/PackageStatsModal", () => ({
  __esModule: true,
  default: () => <div data-testid='package-stats-modal' />,
}));
jest.mock("../../src/app/packages/components/MonorepoPackagesModal", () => ({
  __esModule: true,
  default: () => <div data-testid='monorepo-modal' />,
}));

describe("Stats page", () => {
  beforeEach(() => {
    render(<Stats />);
  });

  it("renders the hero heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      STATS_HERO.heading
    );
  });
  it("renders the hero subheading", () => {
    expect(screen.getByText(STATS_HERO.subheading)).toBeInTheDocument();
  });
  it("renders PackageCount badge", () => {
    expect(screen.getByAltText("total_packages")).toBeInTheDocument();
  });
  it("renders TotalDownloads badge", () => {
    expect(screen.getByAltText("total_downloads")).toBeInTheDocument();
  });
  it("renders filter toggle with All/NPM/PyPI buttons", () => {
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("NPM")).toBeInTheDocument();
    expect(screen.getByText("PyPI")).toBeInTheDocument();
  });
  it("shows no package cards when packages list is empty", () => {
    expect(screen.queryAllByTestId("package-card")).toHaveLength(0);
  });
});

// ── PackageCard ────────────────────────────────────────────────────────────

describe("PackageCard — single package", () => {
  it("renders the package title", () => {
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(screen.getByText("My Package")).toBeInTheDocument();
  });
  it("renders formatted total downloads", () => {
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(screen.getByText("5,000")).toBeInTheDocument();
  });
  it("renders Total Downloads label", () => {
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.totalDownloads)
    ).toBeInTheDocument();
  });
  it("does not show Monorepo badge", () => {
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(
      screen.queryByText(PACKAGE_CARD_LABELS.monorepoLabel)
    ).not.toBeInTheDocument();
  });
  it("calls onFilterClick when filter button clicked", () => {
    const onFilterClick = jest.fn();
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={onFilterClick}
        onViewAllClick={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTitle(PACKAGE_CARD_LABELS.filterTitle));
    expect(onFilterClick).toHaveBeenCalledTimes(1);
  });
  it("renders GitHub link with correct href", () => {
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(screen.getByTitle(PACKAGE_CARD_LABELS.githubTitle)).toHaveAttribute(
      "href",
      `${GITHUB_BASE_URL}/my-repo`
    );
  });
  it("renders package registry link", () => {
    render(
      <PackageCard
        group={singleGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(
      screen.getByTitle(PACKAGE_CARD_LABELS.viewPackageTitle)
    ).toBeInTheDocument();
  });
});

describe("PackageCard — monorepo", () => {
  it("renders the monorepo title", () => {
    render(
      <PackageCard
        group={monorepoGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(screen.getByText("My Monorepo")).toBeInTheDocument();
  });
  it("shows the Monorepo badge", () => {
    render(
      <PackageCard
        group={monorepoGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.monorepoLabel)
    ).toBeInTheDocument();
  });
  it("shows View All Packages button", () => {
    render(
      <PackageCard
        group={monorepoGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.viewAllPackages)
    ).toBeInTheDocument();
  });
  it("calls onViewAllClick when View All clicked", () => {
    const onViewAllClick = jest.fn();
    render(
      <PackageCard
        group={monorepoGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={onViewAllClick}
      />
    );
    fireEvent.click(screen.getByText(PACKAGE_CARD_LABELS.viewAllPackages));
    expect(onViewAllClick).toHaveBeenCalledTimes(1);
  });
  it("does not show filter button for monorepo", () => {
    render(
      <PackageCard
        group={monorepoGroup}
        onFilterClick={jest.fn()}
        onViewAllClick={jest.fn()}
      />
    );
    expect(
      screen.queryByTitle(PACKAGE_CARD_LABELS.filterTitle)
    ).not.toBeInTheDocument();
  });
});

// ── PackageFilterToggle ────────────────────────────────────────────────────

describe("PackageFilterToggle", () => {
  it("renders all filter options", () => {
    render(<PackageFilterToggle activeFilter='all' onChange={jest.fn()} />);
    FILTER_OPTIONS.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
  it("calls onChange with correct value when a filter is clicked", () => {
    const onChange = jest.fn();
    render(<PackageFilterToggle activeFilter='all' onChange={onChange} />);
    fireEvent.click(screen.getByText("NPM"));
    expect(onChange).toHaveBeenCalledWith("npm");
  });
  it("applies active styling to the selected filter", () => {
    render(<PackageFilterToggle activeFilter='npm' onChange={jest.fn()} />);
    expect(screen.getByText("NPM").className).toContain("bg-gradient-to-r");
  });
  it("does not apply active styling to inactive filters", () => {
    render(<PackageFilterToggle activeFilter='npm' onChange={jest.fn()} />);
    expect(screen.getByText("All").className).not.toContain("bg-gradient-to-r");
  });
});

// ── PackageCount ───────────────────────────────────────────────────────────

describe("PackageCount", () => {
  it("renders the total package count", () => {
    render(<PackageCount totalPackages={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
  it("renders the package icon", () => {
    render(<PackageCount totalPackages={10} />);
    expect(screen.getByAltText("total_packages")).toBeInTheDocument();
  });
  it("renders BorderBeam decoration", () => {
    render(<PackageCount totalPackages={10} />);
    expect(screen.getByTestId("border-beam")).toBeInTheDocument();
  });
  it("renders 0 when totalPackages is 0", () => {
    render(<PackageCount totalPackages={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

// ── TotalDownloads ─────────────────────────────────────────────────────────

describe("TotalDownloads", () => {
  it("renders compact formatted count", () => {
    render(<TotalDownloads totalDownloads={1200} />);
    expect(screen.getByText("1.2K")).toBeInTheDocument();
  });
  it("renders Total Downloads label", () => {
    render(<TotalDownloads totalDownloads={1000} />);
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.totalDownloads)
    ).toBeInTheDocument();
  });
  it("renders the download icon", () => {
    render(<TotalDownloads totalDownloads={500} />);
    expect(screen.getByAltText("total_downloads")).toBeInTheDocument();
  });
  it("renders BorderBeam decoration", () => {
    render(<TotalDownloads totalDownloads={100} />);
    expect(screen.getByTestId("border-beam")).toBeInTheDocument();
  });
  it("renders 0 when totalDownloads is 0", () => {
    render(<TotalDownloads totalDownloads={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
  it("renders compact format for large numbers", () => {
    render(<TotalDownloads totalDownloads={1500000} />);
    expect(screen.getByText("1.5M")).toBeInTheDocument();
  });
});

// ── PackageStatsModal ──────────────────────────────────────────────────────

describe("PackageStatsModal", () => {
  it("renders the package title", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} />);
    });
    expect(screen.getByText("test-pkg")).toBeInTheDocument();
  });
  it("renders the select label", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} />);
    });
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.selectLabel)
    ).toBeInTheDocument();
  });
  it("renders formatted download count when not loading", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} />);
    });
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });
  it("hides count and shows spinner when loading", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} loading={true} />);
    });
    expect(screen.queryByText("1,234")).not.toBeInTheDocument();
  });
  it("renders downloads label", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} />);
    });
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.downloadsLabel)
    ).toBeInTheDocument();
  });
  it("does not show date pickers when selectedRange is false", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} selectedRange={false} />);
    });
    expect(
      screen.queryByLabelText(DATE_PICKER_LABELS.startDate)
    ).not.toBeInTheDocument();
  });
  it("shows date pickers when selectedRange is true and type is npm", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} selectedRange={true} />);
    });
    expect(
      screen.getByLabelText(DATE_PICKER_LABELS.startDate)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(DATE_PICKER_LABELS.endDate)
    ).toBeInTheDocument();
  });
  it("does not render when isOpen is false", () => {
    act(() => {
      render(<PackageStatsModal {...modalBaseProps} isOpen={false} />);
    });
    expect(screen.queryByText("test-pkg")).not.toBeInTheDocument();
  });
});

// ── MonorepoPackagesModal ──────────────────────────────────────────────────

describe("MonorepoPackagesModal", () => {
  const monoProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedGroup: monorepoGroup,
    onPackageFilterClick: jest.fn(),
  };

  it("renders the monorepo title", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} />);
    });
    expect(screen.getByText("My Monorepo")).toBeInTheDocument();
  });
  it("renders Available Packages heading", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} />);
    });
    expect(
      screen.getByText(PACKAGE_CARD_LABELS.availablePackages)
    ).toBeInTheDocument();
  });
  it("renders all package titles", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} />);
    });
    expect(screen.getByText("Pkg A")).toBeInTheDocument();
    expect(screen.getByText("Pkg B")).toBeInTheDocument();
  });
  it("renders framework labels for each package", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} />);
    });
    expect(screen.getByText("Framework:Pkg A")).toBeInTheDocument();
    expect(screen.getByText("Framework:Pkg B")).toBeInTheDocument();
  });
  it("renders download counts for each package", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} />);
    });
    expect(screen.getAllByText("6,000")).toHaveLength(2);
  });
  it("calls onPackageFilterClick with correct pkg", () => {
    const onPackageFilterClick = jest.fn();
    act(() => {
      render(
        <MonorepoPackagesModal
          {...monoProps}
          onPackageFilterClick={onPackageFilterClick}
        />
      );
    });
    fireEvent.click(screen.getAllByTitle(PACKAGE_CARD_LABELS.filterTitle)[0]);
    expect(onPackageFilterClick).toHaveBeenCalledWith(
      monorepoGroup.packages[0]
    );
  });
  it("renders GitHub links with correct href", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} />);
    });
    screen.getAllByTitle(PACKAGE_CARD_LABELS.githubTitle).forEach((link) => {
      expect(link).toHaveAttribute("href", `${GITHUB_BASE_URL}/my-monorepo`);
    });
  });
  it("does not render when isOpen is false", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} isOpen={false} />);
    });
    expect(screen.queryByText("My Monorepo")).not.toBeInTheDocument();
  });
  it("does not render content when selectedGroup is null", () => {
    act(() => {
      render(<MonorepoPackagesModal {...monoProps} selectedGroup={null} />);
    });
    expect(
      screen.queryByText(PACKAGE_CARD_LABELS.availablePackages)
    ).not.toBeInTheDocument();
  });
});
