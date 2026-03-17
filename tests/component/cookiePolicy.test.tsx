import React from "react";
import { render, screen } from "@testing-library/react";
import CookiePolicyPage from "@/app/cookie-policy/page";
import { cookieData } from "@/constants";

describe("CookiePolicyPage", () => {
  beforeEach(() => {
    render(<CookiePolicyPage />);
  });

  it("renders the introductory paragraph", () => {
    expect(
      screen.getByText((content) =>
        content.includes("Cookies are small pieces of text")
      )
    ).toBeInTheDocument();
  });

  it("renders all cookie section titles", () => {
    cookieData.forEach(({ title }) => {
      if (!title) return; // skip empty entries
      const matches = screen.getAllByText(title);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("renders all cookie section descriptions", () => {
    cookieData.forEach(({ description }) => {
      if (!description) return; // skip empty entries
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
});
