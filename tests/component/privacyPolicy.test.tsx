import React from "react";
import { render, screen } from "@testing-library/react";
import PrivacyPolicy from "@/app/privacy-policy/page";
import { PRIVACY_POLICY_INTRO, privacyPolicyContentData } from "@/constants";

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

describe("PrivacyPolicy page", () => {
  beforeEach(() => {
    render(<PrivacyPolicy />);
  });

  it("renders the intro text", () => {
    // Intro paragraph spans multiple nodes so check partial text
    expect(
      screen.getByText((content) =>
        content.includes("This Privacy Policy governs")
      )
    ).toBeInTheDocument();
  });

  it("renders the intro link with correct href", () => {
    const link = screen.getByRole("link", {
      name: PRIVACY_POLICY_INTRO.linkLabel,
    });
    expect(link).toHaveAttribute("href", PRIVACY_POLICY_INTRO.linkHref);
  });

  it("renders all policy section titles", () => {
    privacyPolicyContentData.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders all policy section descriptions", () => {
    privacyPolicyContentData.forEach(({ description }) => {
      // Use partial match to handle whitespace differences between constant and rendered HTML
      const snippet = description.replace(/\s+/g, " ").trim().slice(0, 60);
      expect(
        screen.getByText((content) =>
          content.replace(/\s+/g, " ").trim().includes(snippet)
        )
      ).toBeInTheDocument();
    });
  });

  it("renders correct number of policy sections", () => {
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(privacyPolicyContentData.length);
  });
});
