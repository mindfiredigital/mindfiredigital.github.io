import { render, screen } from "@testing-library/react";
import TermOfUsePage from "@/app/terms-of-use/page";
import { TERMS_INTRO_PARAGRAPHS, termsData } from "@/constants";

describe("TermOfUsePage", () => {
  beforeEach(() => {
    render(<TermOfUsePage />);
  });

  it("renders all introductory paragraphs", () => {
    TERMS_INTRO_PARAGRAPHS.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("renders the correct number of intro paragraphs", () => {
    // Each intro paragraph is a <p> inside the intro div
    const introParagraphs = screen
      .getAllByText(/.+/)
      .filter((el) => el.tagName === "P")
      .slice(0, TERMS_INTRO_PARAGRAPHS.length);
    expect(introParagraphs).toHaveLength(TERMS_INTRO_PARAGRAPHS.length);
  });

  it("renders all terms section titles", () => {
    termsData.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders all terms section descriptions", () => {
    termsData.forEach(({ description }) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it("renders correct number of terms sections", () => {
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(termsData.length);
  });
});
