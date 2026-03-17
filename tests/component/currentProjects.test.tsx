import React from "react";
import { render, screen } from "@testing-library/react";
import ProjectsPage from "@/app/current-projects/page";
import { PROJECTS_HERO } from "@/constants";

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

describe("Current Projects page", () => {
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

  it("renders the hero image", () => {
    expect(
      screen.getByAltText("group-of-people-gathered-around-wooden-table")
    ).toBeInTheDocument();
  });
});
