/**
 * @fileoverview Unit Tests for ItemBadge Component
 *
 * Comprehensive test suite for the ItemBadge component functionality including:
 * - Component rendering with different item types
 * - Icon rendering for various observation types
 * - Label display and formatting
 * - Size variations
 * - Custom className application
 * - Accessibility features
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ItemBadge, type LangfuseItemType } from "./ItemBadge";

describe("ItemBadge Component", () => {
  describe("Basic Rendering", () => {
    test("renders badge with default icon", () => {
      render(<ItemBadge type="TRACE" />);
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("title", "Trace");
    });

    test("renders badge without label by default", () => {
      render(<ItemBadge type="GENERATION" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveTextContent("");
    });

    test("renders badge with label when showLabel is true", () => {
      render(<ItemBadge type="GENERATION" showLabel />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveTextContent("Generation");
    });
  });

  describe("Item Types", () => {
    const itemTypes: LangfuseItemType[] = [
      "TRACE",
      "GENERATION",
      "EVENT",
      "SPAN",
      "AGENT",
      "TOOL",
      "CHAIN",
      "RETRIEVER",
      "EMBEDDING",
      "GUARDRAIL",
      "SESSION",
      "USER",
      "QUEUE_ITEM",
      "DATASET",
      "DATASET_RUN",
      "DATASET_ITEM",
      "ANNOTATION_QUEUE",
      "PROMPT",
      "EVALUATOR",
      "RUNNING_EVALUATOR",
    ];

    itemTypes.forEach((type) => {
      test(`renders ${type} badge correctly`, () => {
        render(<ItemBadge type={type} showLabel />);
        const expectedLabel =
          type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        const badge = screen.getByRole("status");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute("title", expectedLabel);
      });
    });
  });

  describe("Label Formatting", () => {
    test("capitalizes first letter and lowercases rest", () => {
      render(<ItemBadge type="GENERATION" showLabel />);
      expect(screen.getByText("Generation")).toBeInTheDocument();
    });

    test("replaces underscores with spaces in label", () => {
      render(<ItemBadge type="DATASET_RUN" showLabel />);
      expect(screen.getByText("Dataset run")).toBeInTheDocument();
    });

    test("replaces underscores in title attribute", () => {
      render(<ItemBadge type="ANNOTATION_QUEUE" showLabel />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("title", "Annotation queue");
    });
  });

  describe("Size Variations", () => {
    test("renders with default size when isSmall is false", () => {
      const { container } = render(<ItemBadge type="TRACE" />);
      const badge = container.querySelector('[class*="h-4 w-4"]');
      expect(badge).toBeInTheDocument();
    });

    test("renders with small size when isSmall is true", () => {
      const { container } = render(<ItemBadge type="TRACE" isSmall />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("h-4");
    });

    test("applies small icon size when isSmall is true", () => {
      const { container } = render(<ItemBadge type="TRACE" isSmall />);
      const icon = container.querySelector('[class*="h-3 w-3"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    test("applies custom className", () => {
      const { container } = render(
        <ItemBadge type="TRACE" className="custom-class" />,
      );
      const icon = container.querySelector(".custom-class");
      expect(icon).toBeInTheDocument();
    });

    test("maintains default classes with custom className", () => {
      const { container } = render(
        <ItemBadge type="GENERATION" className="custom-color" />,
      );
      const icon = container.querySelector('[class*="custom-color"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("provides title attribute for accessibility", () => {
      render(<ItemBadge type="EVENT" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("title", "Event");
    });

    test("provides title for label spans", () => {
      render(<ItemBadge type="DATASET_ITEM" showLabel />);
      const label = screen.getByText("Dataset item");
      expect(label).toHaveAttribute("title", "Dataset item");
    });

    test("uses semantic badge component", () => {
      render(<ItemBadge type="TRACE" />);
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Icon Type Mapping", () => {
    test("renders specific icon for TRACE type", () => {
      const { container } = render(<ItemBadge type="TRACE" />);
      const badge = container.querySelector('[class*="text-dark-green"]');
      expect(badge).toBeInTheDocument();
    });

    test("renders specific icon for GENERATION type", () => {
      const { container } = render(<ItemBadge type="GENERATION" />);
      const badge = container.querySelector('[class*="text-muted-magenta"]');
      expect(badge).toBeInTheDocument();
    });

    test("renders specific icon for SPAN type", () => {
      const { container } = render(<ItemBadge type="SPAN" />);
      const badge = container.querySelector('[class*="text-muted-blue"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles showLabel false explicitly", () => {
      render(<ItemBadge type="TRACE" showLabel={false} />);
      const badge = screen.getByRole("status");
      expect(badge).not.toHaveTextContent("Trace");
    });

    test("handles isSmall false explicitly", () => {
      const { container } = render(<ItemBadge type="TRACE" isSmall={false} />);
      const badge = screen.getByRole("status");
      expect(badge).not.toHaveClass("h-4");
    });

    test("renders correctly with all props", () => {
      render(
        <ItemBadge
          type="GENERATION"
          showLabel
          isSmall
          className="custom-badge"
        />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Generation");
      expect(badge).toHaveClass("h-4");
    });
  });

  describe("Label Truncation", () => {
    test("applies truncate class to label span", () => {
      const { container } = render(<ItemBadge type="TRACE" showLabel />);
      const labelSpan = container.querySelector(".truncate");
      expect(labelSpan).toBeInTheDocument();
    });

    test("label has whitespace-nowrap in badge", () => {
      render(<ItemBadge type="TRACE" showLabel />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("whitespace-nowrap");
    });
  });
});
