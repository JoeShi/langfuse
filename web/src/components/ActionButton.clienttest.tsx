/**
 * @fileoverview Unit Tests for ActionButton Component
 *
 * Comprehensive test suite for the ActionButton component functionality including:
 * - Basic button rendering
 * - Access control (hasAccess prop)
 * - Entitlement control (hasEntitlement prop)
 * - Limit reached functionality
 * - Loading state
 * - Icon rendering
 * - Link behavior (internal and external)
 * - Hover card messages for disabled states
 * - Event tracking
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ActionButton } from "./ActionButton";

// Mock the PostHog hook
jest.mock("@/src/features/posthog-analytics/usePostHogClientCapture", () => ({
  usePostHogClientCapture: () => jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("ActionButton Component", () => {
  describe("Basic Rendering", () => {
    test("renders button with children", () => {
      render(<ActionButton>Click Me</ActionButton>);
      expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    test("renders with custom icon", () => {
      const icon = <span data-testid="custom-icon">🚀</span>;
      render(<ActionButton icon={icon}>Button</ActionButton>);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    test("renders without icon when not provided", () => {
      render(<ActionButton>No Icon</ActionButton>);
      expect(screen.getByRole("button", { name: "No Icon" })).toBeInTheDocument();
    });
  });

  describe("Access Control", () => {
    test("is enabled when hasAccess is true", () => {
      render(<ActionButton hasAccess={true}>Accessible</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    test("is disabled when hasAccess is false", () => {
      render(<ActionButton hasAccess={false}>No Access</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("shows Lock icon when hasAccess is false", () => {
      const { container } = render(
        <ActionButton hasAccess={false}>No Access</ActionButton>,
      );
      const lockIcon = container.querySelector('[class*="lucide-lock"]');
      expect(lockIcon).toBeInTheDocument();
    });

    test("shows no access message on hover when disabled", () => {
      render(<ActionButton hasAccess={false}>No Access</ActionButton>);
      // The hover card content should be in the document
      expect(
        screen.getByText(/You do not have access to this resource/),
      ).toBeInTheDocument();
    });
  });

  describe("Entitlement Control", () => {
    test("is enabled when hasEntitlement is true", () => {
      render(<ActionButton hasEntitlement={true}>Entitled</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    test("is disabled when hasEntitlement is false", () => {
      render(<ActionButton hasEntitlement={false}>Not Entitled</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("shows AlertCircle icon when hasEntitlement is false", () => {
      const { container } = render(
        <ActionButton hasEntitlement={false}>Not Entitled</ActionButton>,
      );
      const alertIcon = container.querySelector('[class*="lucide-alert-circle"]');
      expect(alertIcon).toBeInTheDocument();
    });

    test("shows entitlement message on hover when disabled", () => {
      render(<ActionButton hasEntitlement={false}>Not Entitled</ActionButton>);
      expect(
        screen.getByText(/This feature is not available in your current plan/),
      ).toBeInTheDocument();
    });
  });

  describe("Limit Functionality", () => {
    test("is enabled when limit is not reached", () => {
      render(
        <ActionButton limit={10} limitValue={5}>
          Under Limit
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    test("is disabled when limit is reached", () => {
      render(
        <ActionButton limit={10} limitValue={10}>
          At Limit
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("is disabled when limit is exceeded", () => {
      render(
        <ActionButton limit={10} limitValue={15}>
          Over Limit
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("shows Sparkle icon when limit is reached", () => {
      const { container } = render(
        <ActionButton limit={10} limitValue={10}>
          At Limit
        </ActionButton>,
      );
      const sparkleIcon = container.querySelector('[class*="lucide-sparkle"]');
      expect(sparkleIcon).toBeInTheDocument();
    });

    test("shows limit reached message with current and max values", () => {
      render(
        <ActionButton limit={10} limitValue={10}>
          At Limit
        </ActionButton>,
      );
      expect(
        screen.getByText(/You have reached the limit \(10\/10\)/),
      ).toBeInTheDocument();
    });

    test("handles limit as false (no limit)", () => {
      render(
        <ActionButton limit={false} limitValue={100}>
          No Limit
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Loading State", () => {
    test("shows loading state when loading is true", () => {
      render(<ActionButton loading={true}>Loading</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("is not loading by default", () => {
      render(<ActionButton>Not Loading</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Disabled Prop", () => {
    test("respects explicit disabled prop", () => {
      render(<ActionButton disabled={true}>Disabled</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("is enabled when disabled is false and other conditions met", () => {
      render(<ActionButton disabled={false}>Enabled</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Link Behavior", () => {
    test("renders as link when href is provided and enabled", () => {
      render(<ActionButton href="/dashboard">Go to Dashboard</ActionButton>);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    test("does not render as link when disabled", () => {
      render(
        <ActionButton href="/dashboard" disabled={true}>
          Disabled Link
        </ActionButton>,
      );
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });

    test("opens external links in new tab", () => {
      render(
        <ActionButton href="https://example.com">External Link</ActionButton>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("internal links do not open in new tab", () => {
      render(<ActionButton href="/internal">Internal Link</ActionButton>);
      const link = screen.getByRole("link");
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });

    test("protocol-relative URLs are treated as external", () => {
      render(
        <ActionButton href="//example.com">Protocol Relative</ActionButton>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className to button", () => {
      render(<ActionButton className="custom-btn-class">Custom</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-btn-class");
    });
  });

  describe("Combined States", () => {
    test("prioritizes hasAccess over other disabled states", () => {
      render(
        <ActionButton hasAccess={false} hasEntitlement={false}>
          Multiple Issues
        </ActionButton>,
      );
      // Should show the no access message (first check)
      expect(
        screen.getByText(/You do not have access to this resource/),
      ).toBeInTheDocument();
    });

    test("shows entitlement message when access granted but no entitlement", () => {
      render(
        <ActionButton hasAccess={true} hasEntitlement={false}>
          No Entitlement
        </ActionButton>,
      );
      expect(
        screen.getByText(/This feature is not available in your current plan/),
      ).toBeInTheDocument();
    });

    test("handles all props enabled", () => {
      render(
        <ActionButton
          hasAccess={true}
          hasEntitlement={true}
          limit={false}
          disabled={false}
          loading={false}
        >
          All Good
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("HoverCard Display", () => {
    test("wraps button in HoverCard when disabled with message", () => {
      const { container } = render(
        <ActionButton hasAccess={false}>Hover Me</ActionButton>,
      );
      // Check that span wrapper exists (HoverCardTrigger renders as span)
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
    });

    test("does not wrap in HoverCard when enabled", () => {
      render(<ActionButton hasAccess={true}>No Hover</ActionButton>);
      const button = screen.getByRole("button");
      expect(button.parentElement?.tagName).not.toBe("SPAN");
    });

    test("displays message in HoverCardContent", () => {
      render(<ActionButton hasAccess={false}>Message Test</ActionButton>);
      const message = screen.getByText(/You do not have access/);
      expect(message).toHaveClass("text-sm");
    });
  });

  describe("Icon Priority", () => {
    test("shows Lock icon over custom icon when no access", () => {
      const customIcon = <span data-testid="custom">⭐</span>;
      const { container } = render(
        <ActionButton icon={customIcon} hasAccess={false}>
          Priority Test
        </ActionButton>,
      );
      const lockIcon = container.querySelector('[class*="lucide-lock"]');
      expect(lockIcon).toBeInTheDocument();
      expect(screen.queryByTestId("custom")).not.toBeInTheDocument();
    });

    test("shows AlertCircle over custom icon when no entitlement", () => {
      const customIcon = <span data-testid="custom">⭐</span>;
      const { container } = render(
        <ActionButton
          icon={customIcon}
          hasAccess={true}
          hasEntitlement={false}
        >
          Priority Test
        </ActionButton>,
      );
      const alertIcon = container.querySelector('[class*="lucide-alert-circle"]');
      expect(alertIcon).toBeInTheDocument();
      expect(screen.queryByTestId("custom")).not.toBeInTheDocument();
    });

    test("shows custom icon when all access granted", () => {
      const customIcon = <span data-testid="custom">⭐</span>;
      render(
        <ActionButton
          icon={customIcon}
          hasAccess={true}
          hasEntitlement={true}
        >
          Show Custom
        </ActionButton>,
      );
      expect(screen.getByTestId("custom")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles undefined limit gracefully", () => {
      render(<ActionButton limit={undefined}>Undefined Limit</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    test("handles undefined limitValue gracefully", () => {
      render(
        <ActionButton limit={10} limitValue={undefined}>
          Undefined Value
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    test("handles limit = 0 correctly", () => {
      render(
        <ActionButton limit={0} limitValue={0}>
          Zero Limit
        </ActionButton>,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("handles empty string children", () => {
      render(<ActionButton>{""}</ActionButton>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Forward Ref", () => {
    test("forwards ref to button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<ActionButton ref={ref}>Ref Test</ActionButton>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
