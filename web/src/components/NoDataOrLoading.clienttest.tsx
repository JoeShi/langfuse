/**
 * Tests for NoDataOrLoading component
 *
 * Run with: pnpm test-client --testPathPattern="NoDataOrLoading"
 */

import { render, screen } from "@testing-library/react";
import { NoDataOrLoading } from "./NoDataOrLoading";

// Mock the dependencies
jest.mock("@/src/components/layouts/doc-popup", () => {
  return function DocPopup({ description, href }: { description?: string; href?: string }) {
    return (
      <div data-testid="doc-popup">
        {description && <span>{description}</span>}
        {href && <a href={href}>Link</a>}
      </div>
    );
  };
});

jest.mock("@/src/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("NoDataOrLoading", () => {
  it("renders skeleton when isLoading is true", () => {
    render(<NoDataOrLoading isLoading={true} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders no data message when isLoading is false", () => {
    render(<NoDataOrLoading isLoading={false} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("applies custom className when loading", () => {
    const { container } = render(
      <NoDataOrLoading isLoading={true} className="custom-class" />,
    );
    const wrapper = container.querySelector(".custom-class");
    expect(wrapper).toBeInTheDocument();
  });

  it("applies custom className when not loading", () => {
    const { container } = render(
      <NoDataOrLoading isLoading={false} className="custom-class" />,
    );
    const wrapper = container.querySelector(".custom-class");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders DocPopup with description when provided", () => {
    render(
      <NoDataOrLoading
        isLoading={false}
        description="Test description"
        href="https://example.com"
      />,
    );
    expect(screen.getByTestId("doc-popup")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("does not render DocPopup when description is not provided", () => {
    render(<NoDataOrLoading isLoading={false} />);
    expect(screen.queryByTestId("doc-popup")).not.toBeInTheDocument();
  });

  it("skeleton has correct className", () => {
    render(<NoDataOrLoading isLoading={true} />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-full", "w-full");
  });

  it("renders with href when provided", () => {
    render(
      <NoDataOrLoading
        isLoading={false}
        description="Test"
        href="https://example.com"
      />,
    );
    const link = screen.getByText("Link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });
});
