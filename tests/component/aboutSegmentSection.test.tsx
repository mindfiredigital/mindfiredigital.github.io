import React from "react";
import { render, screen } from "@testing-library/react";
import AboutSegmentSection from "@/app/about/components/AboutSegmentSection";

const mockData = [
  { title: "Item One", description: "Description one" },
  { title: "Item Two", description: "Description two" },
];

describe("AboutSegmentSection", () => {
  it("renders the section title", () => {
    render(<AboutSegmentSection title='Test Title' description='Test Desc' />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders the section description", () => {
    render(<AboutSegmentSection title='Title' description='My Description' />);
    expect(screen.getByText("My Description")).toBeInTheDocument();
  });

  it("renders data items when provided", () => {
    render(
      <AboutSegmentSection title='Title' description='Desc' data={mockData} />
    );
    expect(screen.getByText("Item One")).toBeInTheDocument();
    expect(screen.getByText("Description one")).toBeInTheDocument();
    expect(screen.getByText("Item Two")).toBeInTheDocument();
    expect(screen.getByText("Description two")).toBeInTheDocument();
  });

  it("renders nothing in the grid when data is empty", () => {
    render(<AboutSegmentSection title='Title' description='Desc' data={[]} />);
    expect(screen.queryByRole("heading", { level: 4 })).not.toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <AboutSegmentSection title='Title' description='Desc'>
        <button>Click Me</button>
      </AboutSegmentSection>
    );
    expect(
      screen.getByRole("button", { name: "Click Me" })
    ).toBeInTheDocument();
  });

  it("does not render children slot when children is absent", () => {
    const { container } = render(
      <AboutSegmentSection title='Title' description='Desc' />
    );
    // The children wrapper div should not exist
    expect(container.querySelectorAll("div > div").length).toBe(0);
  });

  it("applies custom className to the section", () => {
    const { container } = render(
      <AboutSegmentSection title='T' description='D' className='mt-28' />
    );
    expect(container.querySelector("section")).toHaveClass("mt-28");
  });
});
