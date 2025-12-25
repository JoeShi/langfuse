/**
 * @fileoverview Unit Tests for Spinner Component
 *
 * Comprehensive test suite for the Spinner component functionality including:
 * - Basic rendering
 * - Message display
 * - Animation classes
 * - Layout styling
 * - Accessibility considerations
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Spinner } from "./spinner";

// Mock the LangfuseIcon
jest.mock("@/src/components/LangfuseLogo", () => ({
  LangfuseIcon: ({ className, size }: { className?: string; size?: number }) => (
    <svg
      data-testid="langfuse-icon"
      className={className}
      width={size}
      height={size}
    >
      <title>Langfuse Icon</title>
    </svg>
  ),
}));

describe("Spinner Component", () => {
  describe("Basic Rendering", () => {
    test("renders spinner with message", () => {
      render(<Spinner message="Loading" />);
      expect(screen.getByText("Loading ...")).toBeInTheDocument();
    });

    test("renders LangfuseIcon", () => {
      render(<Spinner message="Please wait" />);
      expect(screen.getByTestId("langfuse-icon")).toBeInTheDocument();
    });

    test("appends ellipsis to message", () => {
      render(<Spinner message="Processing" />);
      const message = screen.getByText("Processing ...");
      expect(message).toBeInTheDocument();
      expect(message.textContent).toContain("...");
    });
  });

  describe("Message Display", () => {
    test("displays short message correctly", () => {
      render(<Spinner message="Wait" />);
      expect(screen.getByText("Wait ...")).toBeInTheDocument();
    });

    test("displays long message correctly", () => {
      const longMessage = "Loading your data from the server";
      render(<Spinner message={longMessage} />);
      expect(screen.getByText(`${longMessage} ...`)).toBeInTheDocument();
    });

    test("displays message with special characters", () => {
      render(<Spinner message="Loading 50% complete!" />);
      expect(screen.getByText("Loading 50% complete! ...")).toBeInTheDocument();
    });

    test("displays empty message with ellipsis", () => {
      render(<Spinner message="" />);
      expect(screen.getByText(" ...")).toBeInTheDocument();
    });
  });

  describe("Icon Properties", () => {
    test("icon has spin animation class", () => {
      render(<Spinner message="Loading" />);
      const icon = screen.getByTestId("langfuse-icon");
      expect(icon).toHaveClass("motion-safe:animate-spin");
    });

    test("icon has center alignment class", () => {
      render(<Spinner message="Loading" />);
      const icon = screen.getByTestId("langfuse-icon");
      expect(icon).toHaveClass("mx-auto");
    });

    test("icon has correct size", () => {
      render(<Spinner message="Loading" />);
      const icon = screen.getByTestId("langfuse-icon");
      expect(icon).toHaveAttribute("width", "42");
      expect(icon).toHaveAttribute("height", "42");
    });
  });

  describe("Layout and Styling", () => {
    test("has centered layout container", () => {
      const { container } = render(<Spinner message="Loading" />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex", "flex-col", "justify-center");
    });

    test("has minimum height styling", () => {
      const { container } = render(<Spinner message="Loading" />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("min-h-full");
    });

    test("has responsive padding", () => {
      const { container } = render(<Spinner message="Loading" />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("py-12");
    });

    test("inner container has max-width constraint", () => {
      const { container } = render(<Spinner message="Loading" />);
      const innerDiv = container.querySelector(".sm\\:max-w-md");
      expect(innerDiv).toBeInTheDocument();
    });

    test("inner container is centered horizontally", () => {
      const { container } = render(<Spinner message="Loading" />);
      const innerDiv = container.querySelector(".sm\\:mx-auto");
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe("Message Text Styling", () => {
    test("message has large text size", () => {
      render(<Spinner message="Loading" />);
      const message = screen.getByText("Loading ...");
      expect(message).toHaveClass("text-2xl");
    });

    test("message has bold font weight", () => {
      render(<Spinner message="Loading" />);
      const message = screen.getByText("Loading ...");
      expect(message).toHaveClass("font-bold");
    });

    test("message has center alignment", () => {
      render(<Spinner message="Loading" />);
      const message = screen.getByText("Loading ...");
      expect(message).toHaveClass("text-center");
    });

    test("message has primary text color", () => {
      render(<Spinner message="Loading" />);
      const message = screen.getByText("Loading ...");
      expect(message).toHaveClass("text-primary");
    });

    test("message has top margin", () => {
      render(<Spinner message="Loading" />);
      const message = screen.getByText("Loading ...");
      expect(message).toHaveClass("mt-5");
    });
  });

  describe("Semantic HTML", () => {
    test("message is wrapped in h2 heading", () => {
      render(<Spinner message="Loading" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Loading ...");
    });

    test("uses semantic heading for accessibility", () => {
      render(<Spinner message="Please wait" />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });
  });

  describe("Multiple Instances", () => {
    test("renders multiple spinners with different messages", () => {
      const { container } = render(
        <>
          <Spinner message="Loading users" />
          <Spinner message="Loading projects" />
        </>,
      );

      expect(screen.getByText("Loading users ...")).toBeInTheDocument();
      expect(screen.getByText("Loading projects ...")).toBeInTheDocument();
      expect(container.querySelectorAll('[data-testid="langfuse-icon"]')).toHaveLength(2);
    });
  });

  describe("Props Variations", () => {
    test("handles numeric-like message", () => {
      render(<Spinner message="Loading 123" />);
      expect(screen.getByText("Loading 123 ...")).toBeInTheDocument();
    });

    test("handles message with line breaks", () => {
      render(<Spinner message="Loading\ndata" />);
      // Text content will have the line break
      const message = screen.getByText(/Loading.*data/);
      expect(message).toBeInTheDocument();
    });

    test("handles message with only spaces", () => {
      render(<Spinner message="   " />);
      expect(screen.getByText("   ...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("provides meaningful heading for screen readers", () => {
      render(<Spinner message="Fetching your data" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveAccessibleName("Fetching your data ...");
    });

    test("icon has title for accessibility", () => {
      render(<Spinner message="Loading" />);
      expect(screen.getByTitle("Langfuse Icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles very long message", () => {
      const veryLongMessage = "A".repeat(200);
      render(<Spinner message={veryLongMessage} />);
      expect(screen.getByText(`${veryLongMessage} ...`)).toBeInTheDocument();
    });

    test("handles message with HTML entities", () => {
      render(<Spinner message="Loading &amp; processing" />);
      // React automatically escapes HTML entities
      expect(screen.getByText("Loading &amp; processing ...")).toBeInTheDocument();
    });

    test("handles message with unicode characters", () => {
      render(<Spinner message="Loading 📊 data" />);
      expect(screen.getByText("Loading 📊 data ...")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    test("has correct DOM hierarchy", () => {
      const { container } = render(<Spinner message="Loading" />);
      const mainDiv = container.firstChild;
      const innerDiv = mainDiv?.firstChild;
      
      expect(mainDiv?.nodeName).toBe("DIV");
      expect(innerDiv?.nodeName).toBe("DIV");
    });

    test("icon is rendered before message", () => {
      const { container } = render(<Spinner message="Loading" />);
      const innerDiv = container.querySelector(".sm\\:max-w-md");
      const children = innerDiv?.children;
      
      expect(children?.[0]).toHaveAttribute("data-testid", "langfuse-icon");
      expect(children?.[1]?.tagName).toBe("H2");
    });
  });
});
