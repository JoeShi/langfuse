/**
 * @fileoverview Unit Tests for StatusBadge Component
 *
 * Comprehensive test suite for the StatusBadge component functionality including:
 * - Status type rendering with correct colors
 * - Live status dot animation
 * - Text capitalization
 * - Custom className application
 * - Children rendering
 * - ShowText toggle
 * - Different status categories (active, pending, error, completed, etc.)
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StatusBadge } from "./status-badge";

describe("StatusBadge Component", () => {
  describe("Basic Rendering", () => {
    test("renders status badge with text", () => {
      render(<StatusBadge type="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    test("capitalizes first letter of status text", () => {
      render(<StatusBadge type="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    test("renders badge as inline-flex container", () => {
      const { container } = render(<StatusBadge type="active" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("inline-flex");
    });
  });

  describe("Active Status", () => {
    const activeStatuses = ["production", "live", "active", "public"];

    activeStatuses.forEach((status) => {
      test(`renders ${status} status with green styling`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass("bg-light-green", "text-dark-green");
      });

      test(`shows animated dot for ${status} status when live`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const pingElement = container.querySelector(".animate-ping");
        expect(pingElement).toBeInTheDocument();
      });
    });

    test("handles case-insensitive active status", () => {
      const { container } = render(<StatusBadge type="PRODUCTION" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-green");
    });
  });

  describe("Pending Status", () => {
    const pendingStatuses = ["pending", "waiting", "queued"];

    pendingStatuses.forEach((status) => {
      test(`renders ${status} status with yellow styling`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass("bg-light-yellow", "text-dark-yellow");
      });

      test(`shows animated dot for ${status} status`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const pingElement = container.querySelector(".animate-ping");
        expect(pingElement).toBeInTheDocument();
      });
    });
  });

  describe("Delayed Status", () => {
    test("renders delayed status with blue styling", () => {
      const { container } = render(<StatusBadge type="delayed" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-blue", "text-dark-blue");
    });

    test("shows animated dot for delayed status", () => {
      const { container } = render(<StatusBadge type="delayed" />);
      const pingElement = container.querySelector(".animate-ping");
      expect(pingElement).toBeInTheDocument();
    });
  });

  describe("Inactive Status", () => {
    const inactiveStatuses = ["disabled", "inactive"];

    inactiveStatuses.forEach((status) => {
      test(`renders ${status} status with gray styling`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass("bg-muted-gray", "text-primary");
      });
    });
  });

  describe("Completed Status", () => {
    const completedStatuses = ["completed", "done", "finished"];

    completedStatuses.forEach((status) => {
      test(`renders ${status} status with green styling`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass("bg-light-green", "text-dark-green");
      });

      test(`does not show dot for ${status} status`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const dot = container.querySelector(".h-2.w-2");
        expect(dot).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Status", () => {
    const errorStatuses = ["error", "failed"];

    errorStatuses.forEach((status) => {
      test(`renders ${status} status with red styling`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass("bg-light-red", "text-dark-red");
      });

      test(`does not show dot for ${status} status`, () => {
        const { container } = render(<StatusBadge type={status} />);
        const dot = container.querySelector(".h-2.w-2");
        expect(dot).not.toBeInTheDocument();
      });
    });
  });

  describe("Partial Status", () => {
    test("renders partial status with yellow styling", () => {
      const { container } = render(<StatusBadge type="partial" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-yellow", "text-dark-yellow");
    });

    test("does not show dot for partial status", () => {
      const { container } = render(<StatusBadge type="partial" />);
      const dot = container.querySelector(".h-2.w-2");
      expect(dot).not.toBeInTheDocument();
    });
  });

  describe("Unknown Status", () => {
    test("renders unknown status with default gray styling", () => {
      const { container } = render(<StatusBadge type="unknown" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-muted-gray", "text-primary");
    });

    test("shows dot for unknown status when isLive is true", () => {
      const { container } = render(<StatusBadge type="custom-status" />);
      const dot = container.querySelector(".h-2.w-2");
      expect(dot).toBeInTheDocument();
    });

    test("capitalizes unknown status text", () => {
      render(<StatusBadge type="customstatus" />);
      expect(screen.getByText("Customstatus")).toBeInTheDocument();
    });
  });

  describe("IsLive Prop", () => {
    test("shows dot when isLive is true (default)", () => {
      const { container } = render(<StatusBadge type="active" />);
      const dot = container.querySelector(".h-2.w-2");
      expect(dot).toBeInTheDocument();
    });

    test("hides dot when isLive is false", () => {
      const { container } = render(<StatusBadge type="active" isLive={false} />);
      const dot = container.querySelector(".h-2.w-2");
      expect(dot).not.toBeInTheDocument();
    });

    test("isLive false works with any status type", () => {
      const { container } = render(<StatusBadge type="pending" isLive={false} />);
      const dot = container.querySelector(".h-2.w-2");
      expect(dot).not.toBeInTheDocument();
    });
  });

  describe("ShowText Prop", () => {
    test("shows text by default", () => {
      render(<StatusBadge type="active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    test("hides text when showText is false", () => {
      render(<StatusBadge type="active" showText={false} />);
      expect(screen.queryByText("Active")).not.toBeInTheDocument();
    });

    test("still renders dot when text is hidden", () => {
      const { container } = render(<StatusBadge type="active" showText={false} />);
      const dot = container.querySelector(".h-2.w-2");
      expect(dot).toBeInTheDocument();
    });

    test("badge still has styling when text is hidden", () => {
      const { container } = render(<StatusBadge type="active" showText={false} />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-green");
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className to badge", () => {
      const { container } = render(
        <StatusBadge type="active" className="custom-badge" />,
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass("custom-badge");
    });

    test("preserves default classes with custom className", () => {
      const { container } = render(
        <StatusBadge type="active" className="extra-class" />,
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass("inline-flex", "extra-class");
    });
  });

  describe("Children", () => {
    test("renders children alongside status text", () => {
      render(
        <StatusBadge type="active">
          <span data-testid="child">Extra Info</span>
        </StatusBadge>,
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    test("renders children without text when showText is false", () => {
      render(
        <StatusBadge type="active" showText={false}>
          <span data-testid="child">Child Content</span>
        </StatusBadge>,
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.queryByText("Active")).not.toBeInTheDocument();
    });

    test("renders multiple children", () => {
      render(
        <StatusBadge type="active">
          <span data-testid="child1">First</span>
          <span data-testid="child2">Second</span>
        </StatusBadge>,
      );
      expect(screen.getByTestId("child1")).toBeInTheDocument();
      expect(screen.getByTestId("child2")).toBeInTheDocument();
    });
  });

  describe("Dot Animation", () => {
    test("renders two dot spans for animation effect", () => {
      const { container } = render(<StatusBadge type="active" />);
      const dotContainer = container.querySelector(".relative.inline-flex.h-2.w-2");
      expect(dotContainer).toBeInTheDocument();
      const dotSpans = dotContainer?.querySelectorAll("span");
      expect(dotSpans).toHaveLength(2);
    });

    test("ping animation has correct classes", () => {
      const { container } = render(<StatusBadge type="active" />);
      const pingDot = container.querySelector(".animate-ping");
      expect(pingDot).toHaveClass("absolute", "inline-flex", "rounded-full", "opacity-75");
    });

    test("static dot has correct classes", () => {
      const { container } = render(<StatusBadge type="active" />);
      const dots = container.querySelectorAll(".rounded-full");
      const staticDot = Array.from(dots).find(
        (dot) => dot.classList.contains("relative"),
      );
      expect(staticDot).toHaveClass("h-2", "w-2");
    });
  });

  describe("Badge Styling", () => {
    test("has rounded corners", () => {
      const { container } = render(<StatusBadge type="active" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("rounded-md");
    });

    test("has correct padding", () => {
      const { container } = render(<StatusBadge type="active" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("px-2", "py-1");
    });

    test("has correct text size", () => {
      const { container } = render(<StatusBadge type="active" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("text-xs");
    });

    test("has gap between elements", () => {
      const { container } = render(<StatusBadge type="active" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("gap-2");
    });

    test("aligns items center", () => {
      const { container } = render(<StatusBadge type="active" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass("items-center");
    });
  });

  describe("Text Formatting", () => {
    test("preserves case of rest of text", () => {
      render(<StatusBadge type="activeEVENT" />);
      expect(screen.getByText("ActiveEVENT")).toBeInTheDocument();
    });

    test("handles single character status", () => {
      render(<StatusBadge type="x" />);
      expect(screen.getByText("X")).toBeInTheDocument();
    });

    test("handles status with numbers", () => {
      render(<StatusBadge type="status123" />);
      expect(screen.getByText("Status123")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles empty string status", () => {
      const { container } = render(<StatusBadge type="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test("handles status with spaces", () => {
      render(<StatusBadge type="test status" />);
      expect(screen.getByText("Test status")).toBeInTheDocument();
    });

    test("handles all props together", () => {
      const { container } = render(
        <StatusBadge
          type="active"
          isLive={true}
          showText={true}
          className="custom"
        >
          <span>Child</span>
        </StatusBadge>,
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass("custom");
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Child")).toBeInTheDocument();
    });

    test("handles combination: no text, no dot, with children", () => {
      render(
        <StatusBadge type="completed" showText={false}>
          <span data-testid="only-child">Only Child</span>
        </StatusBadge>,
      );
      expect(screen.queryByText("Completed")).not.toBeInTheDocument();
      expect(screen.getByTestId("only-child")).toBeInTheDocument();
    });
  });

  describe("Mixed Case Status Types", () => {
    test("handles mixed case 'ACTIVE'", () => {
      const { container } = render(<StatusBadge type="ACTIVE" />);
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-green");
    });

    test("handles mixed case 'PeNdInG'", () => {
      const { container } = render(<StatusBadge type="PeNdInG" />);
      expect(screen.getByText("PeNdInG")).toBeInTheDocument();
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-yellow");
    });
  });
});
