import React from "react";
import { render, screen } from "@testing-library/react";
import ProjectsPage from "@/app/upcoming-projects/page";
import { PROJECTS_HERO, UPCOMING_PROJECTS } from "@/constants";

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
jest.mock("@/app/projects/components/ProjectGrid", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid='project-grid'>{title}</div>
  ),
}));

describe("Upcoming Projects page", () => {
  beforeEach(() => {
    render(<ProjectsPage />);
  });

  it("renders the hero heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      PROJECTS_HERO.heading
    );
  });

  it("renders the hero subheading", () => {
    expect(screen.getByText(PROJECTS_HERO.subheading)).toBeInTheDocument();
  });

  it("renders CTA link pointing to upcoming projects section", () => {
    const link = screen.getByRole("link", { name: PROJECTS_HERO.ctaLabel });
    expect(link).toHaveAttribute("href", "#upcoming-projects");
  });

  it("renders the hero image", () => {
    expect(
      screen.getByAltText("group-of-people-gathered-around-wooden-table")
    ).toBeInTheDocument();
  });

  it("renders the project grid with correct title", () => {
    expect(screen.getByTestId("project-grid")).toHaveTextContent(
      UPCOMING_PROJECTS.heading
    );
  });
});
