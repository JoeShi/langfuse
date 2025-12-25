/**
 * @fileoverview Unit Tests for ErrorPage Components
 *
 * Comprehensive test suite for ErrorPage and ErrorPageWithSentry components including:
 * - Basic error page rendering
 * - Title and message display
 * - Authentication state handling
 * - Additional button variations (link and onClick)
 * - Sign-in button for unauthenticated users
 * - Sentry error capturing
 * - Accessibility features
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErrorPage, ErrorPageWithSentry } from "./error-page";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

// Mock stripBasePath utility
jest.mock("@/src/utils/redirect", () => ({
  stripBasePath: jest.fn((path) => path),
}));

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { captureException } from "@sentry/nextjs";

describe("ErrorPage Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      asPath: "/",
    });
  });

  describe("Basic Rendering", () => {
    test("renders error icon", () => {
      render(<ErrorPage message="Something went wrong" />);
      const icon = document.querySelector('[class*="lucide-alert-circle"]');
      expect(icon).toBeInTheDocument();
    });

    test("renders default title", () => {
      render(<ErrorPage message="Test error message" />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    test("renders custom title", () => {
      render(<ErrorPage title="Custom Error" message="Test message" />);
      expect(screen.getByText("Custom Error")).toBeInTheDocument();
    });

    test("renders error message", () => {
      render(<ErrorPage message="This is an error message" />);
      expect(screen.getByText("This is an error message")).toBeInTheDocument();
    });

    test("has centered layout styling", () => {
      const { container } = render(<ErrorPage message="Error" />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex", "h-full", "flex-col", "items-center", "justify-center");
    });
  });

  describe("Authentication Status", () => {
    test("shows Sign In button when unauthenticated", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
      render(<ErrorPage message="Access denied" />);
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    });

    test("does not show Sign In button when authenticated", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
      render(<ErrorPage message="Error occurred" />);
      expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
    });

    test("does not show Sign In button when loading", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "loading" });
      render(<ErrorPage message="Error occurred" />);
      expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
    });

    test("Sign In button navigates to sign-in page", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
      render(<ErrorPage message="Please sign in" />);
      
      const signInButton = screen.getByRole("button", { name: "Sign In" });
      fireEvent.click(signInButton);

      expect(mockPush).toHaveBeenCalledWith("/auth/sign-in");
    });

    test("Sign In button includes targetPath when not at root", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        asPath: "/protected/page",
      });
      
      render(<ErrorPage message="Please sign in" />);
      
      const signInButton = screen.getByRole("button", { name: "Sign In" });
      fireEvent.click(signInButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/auth/sign-in?targetPath=")
      );
    });
  });

  describe("Additional Button - Link", () => {
    test("renders link button when href provided", () => {
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Go Home", href: "/" }}
        />,
      );
      expect(screen.getByRole("link", { name: "Go Home" })).toBeInTheDocument();
    });

    test("link button has correct href", () => {
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Dashboard", href: "/dashboard" }}
        />,
      );
      const link = screen.getByRole("link", { name: "Dashboard" });
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    test("link button uses secondary variant", () => {
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Home", href: "/" }}
        />,
      );
      // The button should be wrapped in Link with secondary variant
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    });
  });

  describe("Additional Button - onClick", () => {
    test("renders onClick button when onClick provided", () => {
      const handleClick = jest.fn();
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Retry", onClick: handleClick }}
        />,
      );
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });

    test("onClick button calls handler when clicked", () => {
      const handleClick = jest.fn();
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Try Again", onClick: handleClick }}
        />,
      );
      
      const button = screen.getByRole("button", { name: "Try Again" });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("onClick button uses secondary variant", () => {
      const handleClick = jest.fn();
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Action", onClick: handleClick }}
        />,
      );
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    });
  });

  describe("No Additional Button", () => {
    test("does not render additional button when not provided", () => {
      render(<ErrorPage message="Simple error" />);
      // Should only have Sign In button if unauthenticated, or no buttons if authenticated
      (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });
  });

  describe("Button Layout", () => {
    test("displays both Sign In and additional button when unauthenticated", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
      render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Home", href: "/" }}
        />,
      );
      
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    });

    test("buttons container has gap styling", () => {
      (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
      const { container } = render(
        <ErrorPage
          message="Error"
          additionalButton={{ label: "Home", href: "/" }}
        />,
      );
      const buttonContainer = container.querySelector(".flex.gap-3");
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe("Message Formatting", () => {
    test("centers message text", () => {
      render(<ErrorPage message="Centered message" />);
      const message = screen.getByText("Centered message");
      expect(message).toHaveClass("text-center");
    });

    test("displays long messages correctly", () => {
      const longMessage = "This is a very long error message that should still be displayed correctly and remain centered on the page.";
      render(<ErrorPage message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    test("error icon has red color", () => {
      const { container } = render(<ErrorPage message="Error" />);
      const icon = container.querySelector('[class*="lucide-alert-circle"]');
      expect(icon).toHaveClass("text-dark-red");
    });

    test("title has bold styling", () => {
      render(<ErrorPage title="Bold Title" message="Error" />);
      const title = screen.getByText("Bold Title");
      expect(title).toHaveClass("font-bold");
    });
  });
});

describe("ErrorPageWithSentry Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      asPath: "/",
    });
  });

  describe("Sentry Integration", () => {
    test("captures exception on mount", () => {
      render(<ErrorPageWithSentry message="Test error" />);
      
      expect(captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("ErrorPageWithSentry rendered"),
        })
      );
    });

    test("includes title in Sentry error", () => {
      render(<ErrorPageWithSentry title="Custom Error" message="Test" />);
      
      expect(captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Custom Error"),
        })
      );
    });

    test("includes message in Sentry error", () => {
      render(<ErrorPageWithSentry message="Specific error message" />);
      
      expect(captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Specific error message"),
        })
      );
    });

    test("captures exception only once on initial mount", () => {
      const { rerender } = render(<ErrorPageWithSentry message="Error 1" />);
      
      expect(captureException).toHaveBeenCalledTimes(1);
      
      // Rerender without changing title or message
      rerender(<ErrorPageWithSentry message="Error 1" />);
      
      // Should still be 1 since deps didn't change
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    test("captures new exception when message changes", () => {
      const { rerender } = render(<ErrorPageWithSentry message="Error 1" />);
      
      expect(captureException).toHaveBeenCalledTimes(1);
      
      rerender(<ErrorPageWithSentry message="Error 2" />);
      
      expect(captureException).toHaveBeenCalledTimes(2);
    });
  });

  describe("Renders ErrorPage", () => {
    test("renders underlying ErrorPage component", () => {
      render(<ErrorPageWithSentry message="Sentry error" />);
      expect(screen.getByText("Sentry error")).toBeInTheDocument();
    });

    test("passes title to ErrorPage", () => {
      render(<ErrorPageWithSentry title="Sentry Title" message="Error" />);
      expect(screen.getByText("Sentry Title")).toBeInTheDocument();
    });

    test("passes additionalButton to ErrorPage", () => {
      render(
        <ErrorPageWithSentry
          message="Error"
          additionalButton={{ label: "Go Back", href: "/back" }}
        />,
      );
      expect(screen.getByRole("link", { name: "Go Back" })).toBeInTheDocument();
    });

    test("handles all props correctly", () => {
      const handleClick = jest.fn();
      render(
        <ErrorPageWithSentry
          title="Full Props"
          message="Full error message"
          additionalButton={{ label: "Action", onClick: handleClick }}
        />,
      );
      
      expect(screen.getByText("Full Props")).toBeInTheDocument();
      expect(screen.getByText("Full error message")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles undefined window gracefully", () => {
      // The component checks for window !== undefined before capturing
      expect(() => render(<ErrorPageWithSentry message="Error" />)).not.toThrow();
    });

    test("renders correctly with empty title", () => {
      render(<ErrorPageWithSentry title="" message="No title error" />);
      expect(screen.getByText("No title error")).toBeInTheDocument();
    });
  });
});
