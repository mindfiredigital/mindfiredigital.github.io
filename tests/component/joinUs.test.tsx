import React from "react";
import { render, screen } from "@testing-library/react";
import JoinUs from "@/app/join-us/page";
import JoinUsSegmentSection from "@/app/join-us/components/JoinUsSegmentSection";
import {
  JOIN_US_HERO,
  JOIN_US_GETTING_STARTED,
  joinUsGetStartSectionData,
} from "@/constants";

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

// ── JoinUs page (JoinUsSegmentSection mocked to isolate page rendering) ──────

jest.mock("@/app/join-us/components/JoinUsSegmentSection", () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description: string }) => (
    <section>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  ),
}));

describe("JoinUs page", () => {
  beforeEach(() => {
    render(<JoinUs />);
  });

  it("renders the hero heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      JOIN_US_HERO.heading
    );
  });

  it("renders the hero subheading", () => {
    expect(screen.getByText(JOIN_US_HERO.subheading)).toBeInTheDocument();
  });

  it("renders the CTA link with correct href", () => {
    const link = screen.getByRole("link", { name: JOIN_US_HERO.ctaLabel });
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("renders the hero image with correct alt text", () => {
    expect(screen.getByAltText(JOIN_US_HERO.imageAlt)).toBeInTheDocument();
  });

  it("renders the getting started section title via mock", () => {
    expect(screen.getByText(JOIN_US_GETTING_STARTED.title)).toBeInTheDocument();
  });

  it("renders the getting started section description via mock", () => {
    expect(
      screen.getByText(JOIN_US_GETTING_STARTED.description)
    ).toBeInTheDocument();
  });
});

// ── JoinUsSegmentSection (tested directly with real component, no mock) ──────

jest.unmock("@/app/join-us/components/JoinUsSegmentSection");

describe("JoinUsSegmentSection", () => {
  it("renders numbered steps from data", () => {
    const { container } = render(
      <JoinUsSegmentSection
        title='Test'
        description='Desc'
        data={joinUsGetStartSectionData}
      />
    );
    joinUsGetStartSectionData.forEach((_, i) => {
      expect(container).toHaveTextContent(String(i + 1));
    });
  });

  it("renders step titles and descriptions", () => {
    render(
      <JoinUsSegmentSection
        title='Test'
        description='Desc'
        data={joinUsGetStartSectionData}
      />
    );
    joinUsGetStartSectionData.forEach(({ title, description }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(
        screen.getByText((content) =>
          content
            .replace(/\s+/g, " ")
            .trim()
            .includes(description.replace(/\s+/g, " ").trim().slice(0, 60))
        )
      ).toBeInTheDocument();
    });
  });

  it("renders the section title and description", () => {
    render(
      <JoinUsSegmentSection title='My Title' description='My Desc' data={[]} />
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("My Desc")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <JoinUsSegmentSection title='T' description='D' data={[]}>
        <button>Click</button>
      </JoinUsSegmentSection>
    );
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });
});
