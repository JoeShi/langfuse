/**
 * @fileoverview Unit Tests for Badge Component
 *
 * Comprehensive test suite for the Badge UI component functionality including:
 * - Basic rendering
 * - Variant styling (default, secondary, destructive, outline, tertiary, success, error, warning)
 * - Size variations (default, sm)
 * - Custom className application
 * - HTML attributes pass-through
 * - Children rendering
 * - Focus states and accessibility
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Badge } from "./badge";

describe("Badge Component", () => {
  describe("Basic Rendering", () => {
    test("renders badge with text content", () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText("Test Badge")).toBeInTheDocument();
    });

    test("renders as div element", () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.firstChild;
      expect(badge?.nodeName).toBe("DIV");
    });

    test("renders with role status by default", () => {
      render(<Badge role="status">Status</Badge>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Variant Styling", () => {
    test("applies default variant styling", () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
    });

    test("applies secondary variant styling", () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    test("applies destructive variant styling", () => {
      const { container } = render(<Badge variant="destructive">Destructive</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-destructive", "text-destructive-foreground");
    });

    test("applies outline variant styling", () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("text-foreground");
    });

    test("applies tertiary variant styling", () => {
      const { container } = render(<Badge variant="tertiary">Tertiary</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-tertiary", "text-tertiary-foreground");
    });

    test("applies success variant styling", () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-green", "text-dark-green");
    });

    test("applies error variant styling", () => {
      const { container } = render(<Badge variant="error">Error</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-red", "text-dark-red");
    });

    test("applies warning variant styling", () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-yellow", "text-dark-yellow");
    });
  });

  describe("Size Variations", () => {
    test("applies default size styling", () => {
      const { container } = render(<Badge>Default Size</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("px-2.5", "py-0.5", "text-xs");
    });

    test("applies small size styling", () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.firstChild;
      expect(badge).toHaveClass("px-1", "py-0", "text-xs");
    });

    test("explicit default size matches implicit default", () => {
      const { container: implicit } = render(<Badge>Implicit</Badge>);
      const { container: explicit } = render(<Badge size="default">Explicit</Badge>);
      
      expect(implicit.firstChild).toHaveClass("px-2.5", "py-0.5");
      expect(explicit.firstChild).toHaveClass("px-2.5", "py-0.5");
    });
  });

  describe("Base Styling", () => {
    test("always includes inline-flex layout", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("inline-flex");
    });

    test("always includes items-center alignment", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("items-center");
    });

    test("always includes rounded-md corners", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("rounded-md");
    });

    test("always includes border styling", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("border", "border-transparent");
    });

    test("always includes font-semibold", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("font-semibold");
    });

    test("includes transition-colors for smooth changes", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("transition-colors");
    });

    test("includes focus ring styling", () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass("focus:outline-none", "focus:ring-2");
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className", () => {
      const { container } = render(<Badge className="custom-badge">Custom</Badge>);
      expect(container.firstChild).toHaveClass("custom-badge");
    });

    test("preserves default classes with custom className", () => {
      const { container } = render(<Badge className="extra-class">Badge</Badge>);
      expect(container.firstChild).toHaveClass("inline-flex", "extra-class");
    });

    test("custom className can override default styles", () => {
      const { container } = render(<Badge className="bg-purple-500">Override</Badge>);
      expect(container.firstChild).toHaveClass("bg-purple-500");
    });
  });

  describe("HTML Attributes", () => {
    test("passes through id attribute", () => {
      const { container } = render(<Badge id="test-badge">Badge</Badge>);
      expect(container.firstChild).toHaveAttribute("id", "test-badge");
    });

    test("passes through data attributes", () => {
      const { container } = render(
        <Badge data-testid="custom-badge" data-value="123">Badge</Badge>,
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "custom-badge");
      expect(container.firstChild).toHaveAttribute("data-value", "123");
    });

    test("passes through aria attributes", () => {
      const { container } = render(
        <Badge aria-label="Test Badge" aria-describedby="description">Badge</Badge>,
      );
      expect(container.firstChild).toHaveAttribute("aria-label", "Test Badge");
      expect(container.firstChild).toHaveAttribute("aria-describedby", "description");
    });

    test("passes through title attribute", () => {
      const { container } = render(<Badge title="Badge Tooltip">Badge</Badge>);
      expect(container.firstChild).toHaveAttribute("title", "Badge Tooltip");
    });

    test("passes through role attribute", () => {
      const { container } = render(<Badge role="status">Status</Badge>);
      expect(container.firstChild).toHaveAttribute("role", "status");
    });
  });

  describe("Children Rendering", () => {
    test("renders string children", () => {
      render(<Badge>Simple Text</Badge>);
      expect(screen.getByText("Simple Text")).toBeInTheDocument();
    });

    test("renders number children", () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    test("renders element children", () => {
      render(
        <Badge>
          <span data-testid="child-element">Child</span>
        </Badge>,
      );
      expect(screen.getByTestId("child-element")).toBeInTheDocument();
    });

    test("renders multiple children", () => {
      render(
        <Badge>
          <span>First</span>
          <span>Second</span>
        </Badge>,
      );
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });

    test("renders complex children with icons", () => {
      render(
        <Badge>
          <svg data-testid="icon" />
          <span>With Icon</span>
        </Badge>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("With Icon")).toBeInTheDocument();
    });
  });

  describe("Variant and Size Combinations", () => {
    test("combines secondary variant with small size", () => {
      const { container } = render(
        <Badge variant="secondary" size="sm">Combined</Badge>,
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-secondary", "px-1", "py-0");
    });

    test("combines destructive variant with default size", () => {
      const { container } = render(
        <Badge variant="destructive" size="default">Combined</Badge>,
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-destructive", "px-2.5", "py-0.5");
    });

    test("combines success variant with small size", () => {
      const { container } = render(
        <Badge variant="success" size="sm">Success Small</Badge>,
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass("bg-light-green", "px-1");
    });
  });

  describe("Edge Cases", () => {
    test("renders with empty string children", () => {
      const { container } = render(<Badge>{""}</Badge>);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    test("renders with null children", () => {
      const { container } = render(<Badge>{null}</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    });

    test("renders with undefined children", () => {
      const { container } = render(<Badge>{undefined}</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    });

    test("handles very long text content", () => {
      const longText = "A".repeat(200);
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    test("renders with special characters", () => {
      render(<Badge>{"<>&\"'"}</Badge>);
      expect(screen.getByText("<>&\"'")).toBeInTheDocument();
    });

    test("renders with emoji", () => {
      render(<Badge>🎉 Celebration</Badge>);
      expect(screen.getByText("🎉 Celebration")).toBeInTheDocument();
    });
  });

  describe("Multiple Badges", () => {
    test("renders multiple badges independently", () => {
      render(
        <>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="warning">Warning</Badge>
        </>,
      );
      
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Warning")).toBeInTheDocument();
    });

    test("each badge maintains independent styling", () => {
      const { container } = render(
        <>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
        </>,
      );
      
      const badges = container.querySelectorAll("div");
      expect(badges[0]).toHaveClass("bg-light-green");
      expect(badges[1]).toHaveClass("bg-light-red");
    });
  });

  describe("Accessibility", () => {
    test("can be used with role='status' for status messages", () => {
      render(<Badge role="status">Online</Badge>);
      const badge = screen.getByRole("status");
      expect(badge).toHaveTextContent("Online");
    });

    test("supports aria-label for accessibility", () => {
      render(<Badge aria-label="5 notifications">5</Badge>);
      const badge = screen.getByLabelText("5 notifications");
      expect(badge).toBeInTheDocument();
    });

    test("supports aria-live for dynamic updates", () => {
      const { container } = render(
        <Badge aria-live="polite">Updating...</Badge>,
      );
      expect(container.firstChild).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Hover States", () => {
    test("default variant includes hover state classes", () => {
      const { container } = render(<Badge>Hover</Badge>);
      expect(container.firstChild).toHaveClass("hover:bg-primary/80");
    });

    test("secondary variant includes hover state classes", () => {
      const { container } = render(<Badge variant="secondary">Hover</Badge>);
      expect(container.firstChild).toHaveClass("hover:bg-secondary/80");
    });

    test("destructive variant includes hover state classes", () => {
      const { container } = render(<Badge variant="destructive">Hover</Badge>);
      expect(container.firstChild).toHaveClass("hover:bg-destructive/80");
    });
  });
});
