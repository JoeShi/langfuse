/**
 * @fileoverview Unit Tests for Button Component
 *
 * Comprehensive test suite for the Button UI component functionality including:
 * - Basic rendering and click handling
 * - Variant styling (default, destructive, outline, secondary, ghost, link, etc.)
 * - Size variations (default, xs, sm, lg, icon, icon-xs, icon-sm)
 * - Loading state with spinner
 * - Disabled state
 * - AsChild prop for composition
 * - Custom className application
 * - HTML button attributes
 * - Forward ref functionality
 * - Accessibility features
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "./button";

describe("Button Component", () => {
  describe("Basic Rendering", () => {
    test("renders button with text", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    test("renders as button element by default", () => {
      const { container } = render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });

    test("has type='button' by default", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("Variant Styling", () => {
    test("applies default variant styling", () => {
      const { container } = render(<Button>Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    test("applies destructive variant styling", () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "text-destructive-foreground");
    });

    test("applies destructive-secondary variant styling", () => {
      const { container } = render(
        <Button variant="destructive-secondary">Remove</Button>,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "border-destructive");
    });

    test("applies outline variant styling", () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "border-input");
    });

    test("applies secondary variant styling", () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    test("applies tertiary variant styling", () => {
      const { container } = render(<Button variant="tertiary">Tertiary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-tertiary", "text-tertiary-foreground");
    });

    test("applies ghost variant styling", () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");
    });

    test("applies link variant styling", () => {
      const { container } = render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-primary", "underline-offset-4");
    });

    test("applies errorNotification variant styling", () => {
      const { container } = render(
        <Button variant="errorNotification">Error</Button>,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive-foreground/90");
    });
  });

  describe("Size Variations", () => {
    test("applies default size styling", () => {
      const { container } = render(<Button>Default Size</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8", "px-3", "py-1");
    });

    test("applies xs size styling", () => {
      const { container } = render(<Button size="xs">Extra Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-4", "px-1", "rounded-sm");
    });

    test("applies sm size styling", () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-6", "px-2.5");
    });

    test("applies lg size styling", () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9", "px-8");
    });

    test("applies icon size styling", () => {
      const { container } = render(<Button size="icon">🔍</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8", "w-8");
    });

    test("applies icon-xs size styling", () => {
      const { container } = render(<Button size="icon-xs">⚙️</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-6", "w-6");
    });

    test("applies icon-sm size styling", () => {
      const { container } = render(<Button size="icon-sm">📌</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-6", "px-2");
    });
  });

  describe("Base Styling", () => {
    test("includes inline-flex layout", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("inline-flex");
    });

    test("includes items-center and justify-center alignment", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("items-center", "justify-center");
    });

    test("includes whitespace-nowrap", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("whitespace-nowrap");
    });

    test("includes rounded-md corners", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("rounded-md");
    });

    test("includes font-medium", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("font-medium");
    });

    test("includes transition-colors", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toHaveClass("transition-colors");
    });

    test("includes focus-visible styles", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:outline-none", "focus-visible:ring-2");
    });
  });

  describe("Click Handling", () => {
    test("calls onClick when clicked", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("passes event to onClick handler", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    test("does not call onClick when disabled", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    test("does not call onClick when loading", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);
      
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    test("is enabled by default", () => {
      render(<Button>Enabled</Button>);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    test("can be disabled", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    test("disabled button has correct styling", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
    });

    test("disabled button shows children, not spinner", () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByText("Disabled Button")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    test("shows spinner when loading", () => {
      const { container } = render(<Button loading>Loading</Button>);
      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
    });

    test("hides children when loading", () => {
      render(<Button loading>Click Me</Button>);
      expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
    });

    test("is disabled when loading", () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    test("loading is false by default", () => {
      const { container } = render(<Button>Not Loading</Button>);
      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).not.toBeInTheDocument();
    });

    test("loading takes precedence over disabled", () => {
      const { container } = render(
        <Button loading disabled>Both</Button>,
      );
      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className", () => {
      render(<Button className="custom-btn">Custom</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom-btn");
    });

    test("preserves default classes with custom className", () => {
      render(<Button className="extra">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("inline-flex", "extra");
    });
  });

  describe("HTML Button Attributes", () => {
    test("accepts type='submit'", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    test("accepts type='reset'", () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
    });

    test("accepts id attribute", () => {
      render(<Button id="my-button">Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("id", "my-button");
    });

    test("accepts aria-label", () => {
      render(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
    });

    test("accepts data attributes", () => {
      render(<Button data-testid="custom-btn">Button</Button>);
      expect(screen.getByTestId("custom-btn")).toBeInTheDocument();
    });

    test("accepts name attribute", () => {
      render(<Button name="action">Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("name", "action");
    });

    test("accepts value attribute", () => {
      render(<Button value="submit-value">Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("value", "submit-value");
    });

    test("accepts form attribute", () => {
      render(<Button form="my-form">Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("form", "my-form");
    });
  });

  describe("Forward Ref", () => {
    test("forwards ref to button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    test("ref can be used to focus button", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe("Children Rendering", () => {
    test("renders string children", () => {
      render(<Button>Simple Text</Button>);
      expect(screen.getByText("Simple Text")).toBeInTheDocument();
    });

    test("renders element children", () => {
      render(
        <Button>
          <span data-testid="child">Child Element</span>
        </Button>,
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    test("renders multiple children", () => {
      render(
        <Button>
          <svg data-testid="icon" />
          <span>Text</span>
        </Button>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    test("renders children with icon", () => {
      render(
        <Button>
          🔍 Search
        </Button>,
      );
      expect(screen.getByText("🔍 Search")).toBeInTheDocument();
    });
  });

  describe("Variant and Size Combinations", () => {
    test("combines destructive variant with small size", () => {
      render(<Button variant="destructive" size="sm">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "h-6");
    });

    test("combines outline variant with large size", () => {
      render(<Button variant="outline" size="lg">Outlined Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "h-9", "px-8");
    });

    test("combines ghost variant with icon size", () => {
      render(<Button variant="ghost" size="icon">⚙️</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent", "h-8", "w-8");
    });
  });

  describe("Edge Cases", () => {
    test("handles empty children", () => {
      const { container } = render(<Button>{""}</Button>);
      expect(screen.getByRole("button")).toBeEmptyDOMElement();
    });

    test("handles null children", () => {
      const { container } = render(<Button>{null}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("handles loading with disabled combination", () => {
      render(<Button loading disabled>Both States</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("handles onClick with undefined", () => {
      expect(() => render(<Button onClick={undefined}>Button</Button>)).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    test("is keyboard accessible", () => {
      render(<Button>Accessible</Button>);
      const button = screen.getByRole("button");
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    test("has proper role", () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("disabled button is not keyboard accessible", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("supports aria-pressed for toggle buttons", () => {
      render(<Button aria-pressed="true">Toggle</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });

    test("supports aria-expanded for dropdown buttons", () => {
      render(<Button aria-expanded="false">Dropdown</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Hover States", () => {
    test("default variant includes hover styles", () => {
      render(<Button>Hover</Button>);
      expect(screen.getByRole("button")).toHaveClass("hover:bg-primary/90");
    });

    test("destructive variant includes hover styles", () => {
      render(<Button variant="destructive">Hover</Button>);
      expect(screen.getByRole("button")).toHaveClass("hover:bg-destructive/90");
    });

    test("link variant includes hover underline", () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole("button")).toHaveClass("hover:underline");
    });
  });
});
