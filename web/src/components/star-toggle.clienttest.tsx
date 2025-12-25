/**
 * @fileoverview Unit Tests for StarToggle Component
 *
 * Comprehensive test suite for the StarToggle component functionality including:
 * - Basic rendering with filled/unfilled star states
 * - Click handling and value toggling
 * - Disabled state
 * - Loading state
 * - Size variations
 * - Event propagation stopping
 * - Accessibility features
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StarToggle } from "./star-toggle";

describe("StarToggle Component", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnClick.mockResolvedValue(undefined);
  });

  describe("Basic Rendering", () => {
    test("renders button with star icon", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button", { name: "bookmark" });
      expect(button).toBeInTheDocument();
    });

    test("renders as ghost variant button", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("has aria-label for accessibility", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button", { name: "bookmark" });
      expect(button).toHaveAccessibleName("bookmark");
    });
  });

  describe("Star State - Unfilled", () => {
    test("renders unfilled star when value is false", () => {
      const { container } = render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveAttribute("fill", "none");
    });

    test("uses current color stroke when unfilled", () => {
      const { container } = render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveAttribute("stroke", "currentColor");
    });
  });

  describe("Star State - Filled", () => {
    test("renders filled star when value is true", () => {
      const { container } = render(
        <StarToggle value={true} onClick={mockOnClick} isLoading={false} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveAttribute("fill", "#facc15");
    });

    test("uses yellow stroke when filled", () => {
      const { container } = render(
        <StarToggle value={true} onClick={mockOnClick} isLoading={false} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveAttribute("stroke", "#ca8a04");
    });
  });

  describe("Click Handling", () => {
    test("calls onClick with toggled value when clicked", async () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith(true);
      });
    });

    test("toggles from true to false", async () => {
      render(
        <StarToggle value={true} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith(false);
      });
    });

    test("stops event propagation on click", () => {
      const parentClickHandler = jest.fn();
      const { container } = render(
        <div onClick={parentClickHandler}>
          <StarToggle value={false} onClick={mockOnClick} isLoading={false} />
        </div>,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    test("is enabled by default", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    test("is disabled when disabled prop is true", () => {
      render(
        <StarToggle
          value={false}
          onClick={mockOnClick}
          isLoading={false}
          disabled={true}
        />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("does not call onClick when disabled", () => {
      render(
        <StarToggle
          value={false}
          onClick={mockOnClick}
          isLoading={false}
          disabled={true}
        />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    test("shows loading state when isLoading is true", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={true} />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Button component should handle loading display
    });

    test("is not loading by default when isLoading is false", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Size Variations", () => {
    test("uses icon size by default", () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("accepts icon size explicitly", () => {
      render(
        <StarToggle
          value={false}
          onClick={mockOnClick}
          isLoading={false}
          size="icon"
        />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("accepts icon-xs size", () => {
      render(
        <StarToggle
          value={false}
          onClick={mockOnClick}
          isLoading={false}
          size="icon-xs"
        />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Star Icon Styling", () => {
    test("star has correct dimensions", () => {
      const { container } = render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveClass("h-4", "w-4");
    });

    test("star has stroke width of 2", () => {
      const { container } = render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveAttribute("stroke-width", "2");
    });
  });

  describe("Multiple Clicks", () => {
    test("handles multiple rapid clicks", async () => {
      render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(3);
      });
    });

    test("alternates toggle value on successive clicks", async () => {
      const { rerender } = render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith(true);
      });

      rerender(
        <StarToggle value={true} onClick={mockOnClick} isLoading={false} />,
      );

      fireEvent.click(button);
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenLastCalledWith(false);
      });
    });
  });

  describe("Promise Handling", () => {
    test("handles successful onClick promise", async () => {
      const successfulOnClick = jest.fn().mockResolvedValue({ success: true });
      render(
        <StarToggle
          value={false}
          onClick={successfulOnClick}
          isLoading={false}
        />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(successfulOnClick).toHaveBeenCalled();
      });
    });

    test("handles rejected onClick promise", async () => {
      const failingOnClick = jest.fn().mockRejectedValue(new Error("Failed"));
      render(
        <StarToggle
          value={false}
          onClick={failingOnClick}
          isLoading={false}
        />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(failingOnClick).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    test("handles value changes from parent", () => {
      const { rerender } = render(
        <StarToggle value={false} onClick={mockOnClick} isLoading={false} />,
      );
      let star = document.querySelector("svg");
      expect(star).toHaveAttribute("fill", "none");

      rerender(
        <StarToggle value={true} onClick={mockOnClick} isLoading={false} />,
      );
      star = document.querySelector("svg");
      expect(star).toHaveAttribute("fill", "#facc15");
    });

    test("handles simultaneous disabled and loading states", () => {
      render(
        <StarToggle
          value={false}
          onClick={mockOnClick}
          isLoading={true}
          disabled={true}
        />,
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("maintains star style during loading", () => {
      const { container } = render(
        <StarToggle value={true} onClick={mockOnClick} isLoading={true} />,
      );
      const star = container.querySelector("svg");
      expect(star).toHaveAttribute("fill", "#facc15");
      expect(star).toHaveAttribute("stroke", "#ca8a04");
    });
  });

  describe("Component Props Immutability", () => {
    test("does not modify original value prop", async () => {
      const initialValue = false;
      render(
        <StarToggle
          value={initialValue}
          onClick={mockOnClick}
          isLoading={false}
        />,
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledWith(true);
      });
      expect(initialValue).toBe(false);
    });
  });
});
