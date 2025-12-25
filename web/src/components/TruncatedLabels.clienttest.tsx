/**
 * @fileoverview Unit Tests for TruncatedLabels Component
 *
 * Comprehensive test suite for the TruncatedLabels component functionality including:
 * - Label rendering and display
 * - Label truncation with maxVisibleLabels
 * - Priority sorting (production, latest, alphabetical)
 * - HoverCard for hidden labels
 * - Simple badges vs StatusBadge mode
 * - Empty labels handling
 * - Custom className application
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TruncatedLabels } from "./TruncatedLabels";

// Mock the StatusBadge component
jest.mock("@/src/components/layouts/status-badge", () => ({
  StatusBadge: ({
    type,
    className,
    isLive,
  }: {
    type: string;
    className?: string;
    isLive?: boolean;
  }) => (
    <div className={className} data-testid={`status-badge-${type}`} data-live={isLive}>
      {type}
    </div>
  ),
}));

// Mock constants
jest.mock("@langfuse/shared", () => ({
  PRODUCTION_LABEL: "production",
  LATEST_PROMPT_LABEL: "latest",
}));

describe("TruncatedLabels Component", () => {
  describe("Basic Rendering", () => {
    test("renders labels with StatusBadge by default", () => {
      render(<TruncatedLabels labels={["test", "demo"]} />);
      expect(screen.getByTestId("status-badge-test")).toBeInTheDocument();
      expect(screen.getByTestId("status-badge-demo")).toBeInTheDocument();
    });

    test("returns null for empty labels array", () => {
      const { container } = render(<TruncatedLabels labels={[]} />);
      expect(container.firstChild).toBeNull();
    });

    test("renders single label", () => {
      render(<TruncatedLabels labels={["single"]} />);
      expect(screen.getByTestId("status-badge-single")).toBeInTheDocument();
    });
  });

  describe("Label Truncation", () => {
    test("shows all labels when count is below maxVisibleLabels", () => {
      const labels = ["label1", "label2", "label3"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={5} />);
      
      labels.forEach((label) => {
        expect(screen.getByTestId(`status-badge-${label}`)).toBeInTheDocument();
      });
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    test("truncates labels when count exceeds maxVisibleLabels", () => {
      const labels = ["a", "b", "c", "d", "e", "f"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={3} />);
      
      // First 3 should be visible
      expect(screen.getByTestId("status-badge-a")).toBeInTheDocument();
      expect(screen.getByTestId("status-badge-b")).toBeInTheDocument();
      expect(screen.getByTestId("status-badge-c")).toBeInTheDocument();
      
      // Should show "+3 more" button
      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });

    test("uses default maxVisibleLabels of 5", () => {
      const labels = ["1", "2", "3", "4", "5", "6"];
      render(<TruncatedLabels labels={labels} />);
      
      // First 5 visible
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`status-badge-${i}`)).toBeInTheDocument();
      }
      
      expect(screen.getByText("+1 more")).toBeInTheDocument();
    });

    test("calculates hidden count correctly", () => {
      const labels = Array.from({ length: 10 }, (_, i) => `label${i}`);
      render(<TruncatedLabels labels={labels} maxVisibleLabels={3} />);
      
      expect(screen.getByText("+7 more")).toBeInTheDocument();
    });
  });

  describe("Label Sorting Priority", () => {
    test("prioritizes production label first", () => {
      const labels = ["zebra", "production", "alpha"];
      const { container } = render(<TruncatedLabels labels={labels} />);
      
      const badges = container.querySelectorAll('[data-testid^="status-badge-"]');
      expect(badges[0]).toHaveAttribute("data-testid", "status-badge-production");
    });

    test("prioritizes latest label second after production", () => {
      const labels = ["zebra", "latest", "alpha", "production"];
      const { container } = render(<TruncatedLabels labels={labels} />);
      
      const badges = container.querySelectorAll('[data-testid^="status-badge-"]');
      expect(badges[0]).toHaveAttribute("data-testid", "status-badge-production");
      expect(badges[1]).toHaveAttribute("data-testid", "status-badge-latest");
    });

    test("sorts remaining labels alphabetically", () => {
      const labels = ["delta", "beta", "charlie", "alpha"];
      const { container } = render(<TruncatedLabels labels={labels} />);
      
      const badges = container.querySelectorAll('[data-testid^="status-badge-"]');
      expect(badges[0]).toHaveAttribute("data-testid", "status-badge-alpha");
      expect(badges[1]).toHaveAttribute("data-testid", "status-badge-beta");
      expect(badges[2]).toHaveAttribute("data-testid", "status-badge-charlie");
      expect(badges[3]).toHaveAttribute("data-testid", "status-badge-delta");
    });

    test("combines all sorting rules correctly", () => {
      const labels = ["zebra", "latest", "alpha", "production", "beta"];
      const { container } = render(<TruncatedLabels labels={labels} maxVisibleLabels={5} />);
      
      const badges = container.querySelectorAll('[data-testid^="status-badge-"]');
      expect(badges[0]).toHaveAttribute("data-testid", "status-badge-production");
      expect(badges[1]).toHaveAttribute("data-testid", "status-badge-latest");
      expect(badges[2]).toHaveAttribute("data-testid", "status-badge-alpha");
      expect(badges[3]).toHaveAttribute("data-testid", "status-badge-beta");
      expect(badges[4]).toHaveAttribute("data-testid", "status-badge-zebra");
    });
  });

  describe("Production Label Live Status", () => {
    test("sets isLive true for production label", () => {
      render(<TruncatedLabels labels={["production", "test"]} />);
      const productionBadge = screen.getByTestId("status-badge-production");
      expect(productionBadge).toHaveAttribute("data-live", "true");
    });

    test("sets isLive false for non-production labels", () => {
      render(<TruncatedLabels labels={["test", "demo"]} />);
      const testBadge = screen.getByTestId("status-badge-test");
      expect(testBadge).toHaveAttribute("data-live", "false");
    });
  });

  describe("Simple Badges Mode", () => {
    test("renders simple div badges when showSimpleBadges is true", () => {
      render(<TruncatedLabels labels={["test", "demo"]} showSimpleBadges />);
      
      expect(screen.getByText("test")).toBeInTheDocument();
      expect(screen.getByText("demo")).toBeInTheDocument();
      expect(screen.queryByTestId("status-badge-test")).not.toBeInTheDocument();
    });

    test("simple badges have correct styling", () => {
      const { container } = render(
        <TruncatedLabels labels={["test"]} showSimpleBadges />,
      );
      
      const badge = screen.getByText("test");
      expect(badge).toHaveClass("rounded-sm", "bg-secondary", "text-xs", "font-semibold");
    });

    test("applies badgeClassName to simple badges", () => {
      const { container } = render(
        <TruncatedLabels
          labels={["test"]}
          showSimpleBadges
          badgeClassName="custom-badge"
        />,
      );
      
      const badge = screen.getByText("test");
      expect(badge).toHaveClass("custom-badge");
    });
  });

  describe("HoverCard for Hidden Labels", () => {
    test("shows hover card trigger when labels are hidden", () => {
      const labels = ["a", "b", "c", "d", "e", "f"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={3} />);
      
      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });

    test("hover card trigger is a button", () => {
      const labels = ["a", "b", "c", "d"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={2} />);
      
      const button = screen.getByRole("button", { name: "+2 more" });
      expect(button).toBeInTheDocument();
    });

    test("does not show hover card when all labels are visible", () => {
      const labels = ["a", "b", "c"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={5} />);
      
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className to container", () => {
      const { container } = render(
        <TruncatedLabels labels={["test"]} className="custom-container" />,
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-container");
    });

    test("preserves default flex classes with custom className", () => {
      const { container } = render(
        <TruncatedLabels labels={["test"]} className="extra-class" />,
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "flex-wrap", "gap-1", "extra-class");
    });

    test("applies badgeClassName to StatusBadge", () => {
      render(
        <TruncatedLabels labels={["test"]} badgeClassName="custom-badge" />,
      );
      
      const badge = screen.getByTestId("status-badge-test");
      expect(badge).toHaveClass("custom-badge");
    });
  });

  describe("Edge Cases", () => {
    test("handles maxVisibleLabels of 0", () => {
      const labels = ["a", "b", "c"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={0} />);
      
      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });

    test("handles maxVisibleLabels of 1", () => {
      const labels = ["a", "b"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={1} />);
      
      expect(screen.getByTestId("status-badge-a")).toBeInTheDocument();
      expect(screen.getByText("+1 more")).toBeInTheDocument();
    });

    test("handles very large maxVisibleLabels", () => {
      const labels = ["a", "b", "c"];
      render(<TruncatedLabels labels={labels} maxVisibleLabels={1000} />);
      
      labels.forEach((label) => {
        expect(screen.getByTestId(`status-badge-${label}`)).toBeInTheDocument();
      });
      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });

    test("handles labels with special characters", () => {
      const labels = ["test-label", "test_label", "test.label"];
      render(<TruncatedLabels labels={labels} />);
      
      labels.forEach((label) => {
        expect(screen.getByTestId(`status-badge-${label}`)).toBeInTheDocument();
      });
    });

    test("handles duplicate labels", () => {
      const labels = ["duplicate", "duplicate", "unique"];
      render(<TruncatedLabels labels={labels} />);
      
      // React keys should handle duplicates, component should render
      expect(screen.getAllByTestId("status-badge-duplicate")).toHaveLength(2);
    });
  });

  describe("Layout", () => {
    test("uses flex layout with wrap", () => {
      const { container } = render(<TruncatedLabels labels={["test"]} />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "flex-wrap");
    });

    test("has gap between items", () => {
      const { container } = render(<TruncatedLabels labels={["test"]} />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("gap-1");
    });
  });

  describe("Props Combination", () => {
    test("handles all props together", () => {
      const labels = ["production", "latest", "a", "b", "c", "d"];
      const { container } = render(
        <TruncatedLabels
          labels={labels}
          maxVisibleLabels={3}
          className="custom-container"
          badgeClassName="custom-badge"
          showSimpleBadges={false}
        />,
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-container");
      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });

    test("handles simple badges with truncation", () => {
      const labels = ["a", "b", "c", "d", "e"];
      render(
        <TruncatedLabels
          labels={labels}
          maxVisibleLabels={2}
          showSimpleBadges
        />,
      );
      
      expect(screen.getByText("a")).toBeInTheDocument();
      expect(screen.getByText("b")).toBeInTheDocument();
      expect(screen.getByText("+3 more")).toBeInTheDocument();
    });
  });
});
