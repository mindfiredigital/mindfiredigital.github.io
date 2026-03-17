import React from "react";
import { render, screen } from "@testing-library/react";
import About from "@/app/about/page";
import {
  ABOUT_HERO,
  ABOUT_MISSION,
  ABOUT_WHY_OPEN_SOURCE,
  ABOUT_CONTRIBUTIONS,
} from "@/constants";

// Mock Next.js Image and Link
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

// Mock child component
jest.mock("@/app/about/components/AboutSegmentSection", () => ({
  __esModule: true,
  default: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children?: React.ReactNode;
  }) => (
    <section>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </section>
  ),
}));

describe("About page", () => {
  beforeEach(() => {
    render(<About />);
  });

  it("renders the hero heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      ABOUT_HERO.heading
    );
  });

  it("renders the hero subheading", () => {
    expect(screen.getByText(ABOUT_HERO.subheading)).toBeInTheDocument();
  });

  it("renders explore projects CTA link", () => {
    const link = screen.getByRole("link", { name: ABOUT_HERO.exploreLabel });
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("renders contact us CTA link", () => {
    const link = screen.getByRole("link", { name: ABOUT_HERO.contactLabel });
    expect(link).toHaveAttribute("href", ABOUT_HERO.contactHref);
  });

  it("renders hero image with correct alt text", () => {
    expect(
      screen.getByAltText("women-standing-beside-corkboard")
    ).toBeInTheDocument();
  });

  it("renders mission section title", () => {
    expect(screen.getByText(ABOUT_MISSION.title)).toBeInTheDocument();
  });

  it("renders why open source section title", () => {
    expect(screen.getByText(ABOUT_WHY_OPEN_SOURCE.title)).toBeInTheDocument();
  });

  it("renders contributions section title", () => {
    expect(screen.getByText(ABOUT_CONTRIBUTIONS.title)).toBeInTheDocument();
  });

  it("renders explore projects link inside contributions section", () => {
    const link = screen.getByRole("link", {
      name: ABOUT_CONTRIBUTIONS.exploreLabel,
    });
    expect(link).toHaveAttribute("href", "/projects#all-projects");
  });
});
