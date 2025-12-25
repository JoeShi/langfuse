/**
 * Tests for Spinner component
 *
 * Run with: pnpm test-client --testPathPattern="spinner"
 */

import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

// Mock LangfuseIcon
jest.mock("@/src/components/LangfuseLogo", () => ({
  LangfuseIcon: ({ className, size }: any) => (
    <div
      data-testid="langfuse-icon"
      className={className}
      data-size={size}
    />
  ),
}));

describe("Spinner", () => {
  it("renders with message", () => {
    render(<Spinner message="Loading" />);
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  it("renders LangfuseIcon", () => {
    render(<Spinner message="Loading" />);
    expect(screen.getByTestId("langfuse-icon")).toBeInTheDocument();
  });

  it("applies spin animation to icon", () => {
    render(<Spinner message="Loading" />);
    const icon = screen.getByTestId("langfuse-icon");
    expect(icon).toHaveClass("motion-safe:animate-spin");
  });

  it("sets icon size to 42", () => {
    render(<Spinner message="Loading" />);
    const icon = screen.getByTestId("langfuse-icon");
    expect(icon).toHaveAttribute("data-size", "42");
  });

  it("renders with different messages", () => {
    const { rerender } = render(<Spinner message="Processing" />);
    expect(screen.getByText("Processing ...")).toBeInTheDocument();
    
    rerender(<Spinner message="Saving" />);
    expect(screen.getByText("Saving ...")).toBeInTheDocument();
  });

  it("adds ellipsis to message", () => {
    render(<Spinner message="Please wait" />);
    expect(screen.getByText("Please wait ...")).toBeInTheDocument();
  });

  it("handles empty message", () => {
    render(<Spinner message="" />);
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("handles long message", () => {
    const longMessage = "This is a very long loading message that should still render correctly";
    render(<Spinner message={longMessage} />);
    expect(screen.getByText(`${longMessage} ...`)).toBeInTheDocument();
  });

  it("applies correct heading styles", () => {
    render(<Spinner message="Loading" />);
    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass(
      "mt-5",
      "text-center",
      "text-2xl",
      "font-bold",
      "leading-9",
      "tracking-tight",
      "text-primary"
    );
  });

  it("centers icon horizontally", () => {
    render(<Spinner message="Loading" />);
    const icon = screen.getByTestId("langfuse-icon");
    expect(icon).toHaveClass("mx-auto");
  });

  it("applies flex layout to container", () => {
    const { container } = render(<Spinner message="Loading" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "min-h-full", "flex-1", "flex-col", "justify-center");
  });

  it("applies responsive padding", () => {
    const { container } = render(<Spinner message="Loading" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("py-12", "sm:px-6", "lg:px-8");
  });

  it("applies responsive width constraints to inner container", () => {
    const { container } = render(<Spinner message="Loading" />);
    const innerContainer = container.querySelector(".sm\\:mx-auto");
    expect(innerContainer).toHaveClass("sm:mx-auto", "sm:w-full", "sm:max-w-md");
  });
});
