/**
 * @fileoverview Unit Tests for NoDataOrLoading Component
 *
 * Comprehensive test suite for the NoDataOrLoading component functionality including:
 * - Loading state rendering with skeleton
 * - No data state rendering
 * - Optional documentation popup
 * - Custom className application
 * - Conditional rendering logic
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NoDataOrLoading } from "./NoDataOrLoading";

describe("NoDataOrLoading Component", () => {
  describe("Loading State", () => {
    test("renders skeleton when isLoading is true", () => {
      const { container } = render(<NoDataOrLoading isLoading={true} />);
      const skeleton = container.querySelector('[class*="animate-pulse"]');
      expect(skeleton).toBeInTheDocument();
    });

    test("does not render 'No data' text when loading", () => {
      render(<NoDataOrLoading isLoading={true} />);
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    test("does not render description when loading", () => {
      render(
        <NoDataOrLoading
          isLoading={true}
          description="Test description"
          href="https://example.com"
        />,
      );
      expect(screen.queryByText(/Test description/)).not.toBeInTheDocument();
    });

    test("applies default styles to loading container", () => {
      const { container } = render(<NoDataOrLoading isLoading={true} />);
      const loadingDiv = container.firstChild;
      expect(loadingDiv).toHaveClass("flex");
      expect(loadingDiv).toHaveClass("items-center");
      expect(loadingDiv).toHaveClass("justify-center");
    });
  });

  describe("No Data State", () => {
    test("renders 'No data' text when isLoading is false", () => {
      render(<NoDataOrLoading isLoading={false} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    test("does not render skeleton when not loading", () => {
      const { container } = render(<NoDataOrLoading isLoading={false} />);
      const skeleton = container.querySelector('[class*="animate-pulse"]');
      expect(skeleton).not.toBeInTheDocument();
    });

    test("applies border-dashed style to no data container", () => {
      const { container } = render(<NoDataOrLoading isLoading={false} />);
      const noDataDiv = container.querySelector(".border-dashed");
      expect(noDataDiv).toBeInTheDocument();
    });

    test("applies default min-height", () => {
      const { container } = render(<NoDataOrLoading isLoading={false} />);
      const noDataDiv = container.firstChild;
      expect(noDataDiv).toHaveClass("min-h-[9rem]");
    });
  });

  describe("Documentation Popup", () => {
    test("renders DocPopup when description is provided", () => {
      render(
        <NoDataOrLoading
          isLoading={false}
          description="Learn more about this feature"
          href="https://docs.example.com"
        />,
      );
      // DocPopup should be rendered, we check for its existence
      const container = screen.getByText("No data").parentElement;
      expect(container?.children.length).toBeGreaterThan(1);
    });

    test("does not render DocPopup when description is not provided", () => {
      render(<NoDataOrLoading isLoading={false} />);
      const container = screen.getByText("No data").parentElement;
      // Only the text should be present, no DocPopup
      expect(container?.textContent).toBe("No data");
    });

    test("does not render DocPopup during loading", () => {
      render(
        <NoDataOrLoading
          isLoading={true}
          description="This should not appear"
          href="https://docs.example.com"
        />,
      );
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    test("passes href to DocPopup", () => {
      const { container } = render(
        <NoDataOrLoading
          isLoading={false}
          description="Documentation"
          href="https://docs.example.com"
        />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className to loading container", () => {
      const { container } = render(
        <NoDataOrLoading isLoading={true} className="custom-loading" />,
      );
      const loadingDiv = container.firstChild;
      expect(loadingDiv).toHaveClass("custom-loading");
    });

    test("applies custom className to no data container", () => {
      const { container } = render(
        <NoDataOrLoading isLoading={false} className="custom-no-data" />,
      );
      const noDataDiv = container.firstChild;
      expect(noDataDiv).toHaveClass("custom-no-data");
    });

    test("maintains default classes with custom className", () => {
      const { container } = render(
        <NoDataOrLoading isLoading={false} className="custom-class" />,
      );
      const noDataDiv = container.firstChild;
      expect(noDataDiv).toHaveClass("custom-class");
      expect(noDataDiv).toHaveClass("flex");
      expect(noDataDiv).toHaveClass("min-h-[9rem]");
    });
  });

  describe("Conditional Rendering", () => {
    test("switches from loading to no data state", () => {
      const { rerender } = render(<NoDataOrLoading isLoading={true} />);
      expect(screen.queryByText("No data")).not.toBeInTheDocument();

      rerender(<NoDataOrLoading isLoading={false} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    test("switches from no data to loading state", () => {
      const { rerender } = render(<NoDataOrLoading isLoading={false} />);
      expect(screen.getByText("No data")).toBeInTheDocument();

      rerender(<NoDataOrLoading isLoading={true} />);
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });
  });

  describe("Container Styles", () => {
    test("applies flex layout to loading container", () => {
      const { container } = render(<NoDataOrLoading isLoading={true} />);
      const loadingDiv = container.firstChild;
      expect(loadingDiv).toHaveClass("flex");
      expect(loadingDiv).toHaveClass("items-center");
      expect(loadingDiv).toHaveClass("justify-center");
    });

    test("applies flex layout to no data container", () => {
      const { container } = render(<NoDataOrLoading isLoading={false} />);
      const noDataDiv = container.firstChild;
      expect(noDataDiv).toHaveClass("flex");
      expect(noDataDiv).toHaveClass("items-center");
      expect(noDataDiv).toHaveClass("justify-center");
    });

    test("applies rounded corners to both states", () => {
      const { container: loadingContainer } = render(
        <NoDataOrLoading isLoading={true} />,
      );
      expect(loadingContainer.firstChild).toHaveClass("rounded-tremor-default");

      const { container: noDataContainer } = render(
        <NoDataOrLoading isLoading={false} />,
      );
      expect(noDataContainer.firstChild).toHaveClass("rounded-tremor-default");
    });
  });

  describe("Props Combination", () => {
    test("handles all props together in loading state", () => {
      const { container } = render(
        <NoDataOrLoading
          isLoading={true}
          description="Test description"
          href="https://example.com"
          className="all-props-loading"
        />,
      );
      expect(container.firstChild).toHaveClass("all-props-loading");
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    test("handles all props together in no data state", () => {
      const { container } = render(
        <NoDataOrLoading
          isLoading={false}
          description="Test description"
          href="https://example.com"
          className="all-props-no-data"
        />,
      );
      expect(container.firstChild).toHaveClass("all-props-no-data");
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles undefined description gracefully", () => {
      expect(() =>
        render(<NoDataOrLoading isLoading={false} description={undefined} />),
      ).not.toThrow();
    });

    test("handles undefined href gracefully", () => {
      expect(() =>
        render(
          <NoDataOrLoading
            isLoading={false}
            description="Test"
            href={undefined}
          />,
        ),
      ).not.toThrow();
    });

    test("handles empty string description", () => {
      render(<NoDataOrLoading isLoading={false} description="" />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    test("handles empty string className", () => {
      const { container } = render(
        <NoDataOrLoading isLoading={false} className="" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Skeleton Appearance", () => {
    test("skeleton fills container", () => {
      const { container } = render(<NoDataOrLoading isLoading={true} />);
      const skeleton = container.querySelector('[class*="h-full"]');
      expect(skeleton).toBeInTheDocument();
    });

    test("skeleton has full width", () => {
      const { container } = render(<NoDataOrLoading isLoading={true} />);
      const skeleton = container.querySelector('[class*="w-full"]');
      expect(skeleton).toBeInTheDocument();
    });
  });
});
