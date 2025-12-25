/**
 * @fileoverview Unit Tests for LocalIsoDate Component
 *
 * Comprehensive test suite for the LocalIsoDate component and formatLocalIsoDate utility including:
 * - Component rendering with various date accuracies
 * - Date formatting in local and UTC time
 * - Invalid date handling
 * - Tooltip content verification
 * - Custom className application
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LocalIsoDate, formatLocalIsoDate } from "./LocalIsoDate";

describe("formatLocalIsoDate Function", () => {
  const testDate = new Date("2024-01-15T14:30:45.123Z");

  describe("Day Accuracy", () => {
    test("formats date with day accuracy", () => {
      const result = formatLocalIsoDate(testDate, false, "day");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test("formats UTC date with day accuracy", () => {
      const result = formatLocalIsoDate(testDate, true, "day");
      expect(result).toBe("2024-01-15");
    });
  });

  describe("Hour Accuracy", () => {
    test("formats date with hour accuracy", () => {
      const result = formatLocalIsoDate(testDate, false, "hour");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}$/);
    });

    test("formats UTC date with hour accuracy", () => {
      const result = formatLocalIsoDate(testDate, true, "hour");
      expect(result).toBe("2024-01-15 14");
    });
  });

  describe("Minute Accuracy", () => {
    test("formats date with minute accuracy", () => {
      const result = formatLocalIsoDate(testDate, false, "minute");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    });

    test("formats UTC date with minute accuracy", () => {
      const result = formatLocalIsoDate(testDate, true, "minute");
      expect(result).toBe("2024-01-15 14:30");
    });
  });

  describe("Second Accuracy", () => {
    test("formats date with second accuracy", () => {
      const result = formatLocalIsoDate(testDate, false, "second");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test("formats UTC date with second accuracy", () => {
      const result = formatLocalIsoDate(testDate, true, "second");
      expect(result).toBe("2024-01-15 14:30:45");
    });
  });

  describe("Millisecond Accuracy", () => {
    test("formats date with millisecond accuracy", () => {
      const result = formatLocalIsoDate(testDate, false, "millisecond");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
    });

    test("formats UTC date with millisecond accuracy", () => {
      const result = formatLocalIsoDate(testDate, true, "millisecond");
      expect(result).toBe("2024-01-15 14:30:45.123");
    });
  });

  describe("Zero Padding", () => {
    test("pads single-digit month with zero", () => {
      const date = new Date("2024-03-05T10:05:02.003Z");
      const result = formatLocalIsoDate(date, true, "millisecond");
      expect(result).toBe("2024-03-05 10:05:02.003");
    });

    test("pads single-digit day with zero", () => {
      const date = new Date("2024-12-08T10:05:02.003Z");
      const result = formatLocalIsoDate(date, true, "millisecond");
      expect(result).toBe("2024-12-08 10:05:02.003");
    });

    test("pads single-digit hour with zero", () => {
      const date = new Date("2024-01-15T05:30:45.123Z");
      const result = formatLocalIsoDate(date, true, "hour");
      expect(result).toBe("2024-01-15 05");
    });

    test("pads single-digit minute with zero", () => {
      const date = new Date("2024-01-15T14:05:45.123Z");
      const result = formatLocalIsoDate(date, true, "minute");
      expect(result).toBe("2024-01-15 14:05");
    });

    test("pads single-digit second with zero", () => {
      const date = new Date("2024-01-15T14:30:05.123Z");
      const result = formatLocalIsoDate(date, true, "second");
      expect(result).toBe("2024-01-15 14:30:05");
    });

    test("pads milliseconds to three digits", () => {
      const date1 = new Date("2024-01-15T14:30:45.001Z");
      expect(formatLocalIsoDate(date1, true, "millisecond")).toBe(
        "2024-01-15 14:30:45.001",
      );

      const date2 = new Date("2024-01-15T14:30:45.010Z");
      expect(formatLocalIsoDate(date2, true, "millisecond")).toBe(
        "2024-01-15 14:30:45.010",
      );

      const date3 = new Date("2024-01-15T14:30:45.100Z");
      expect(formatLocalIsoDate(date3, true, "millisecond")).toBe(
        "2024-01-15 14:30:45.100",
      );
    });
  });
});

describe("LocalIsoDate Component", () => {
  const testDate = new Date("2024-01-15T14:30:45.123Z");

  describe("Basic Rendering", () => {
    test("renders date with default accuracy (second)", () => {
      render(<LocalIsoDate date={testDate} />);
      const element = screen.getByText(/2024-01-15 \d{2}:\d{2}:\d{2}/);
      expect(element).toBeInTheDocument();
    });

    test("renders with span element", () => {
      const { container } = render(<LocalIsoDate date={testDate} />);
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
    });
  });

  describe("Accuracy Prop", () => {
    test("renders with day accuracy", () => {
      render(<LocalIsoDate date={testDate} accuracy="day" />);
      const element = screen.getByText(/^\d{4}-\d{2}-\d{2}$/);
      expect(element).toBeInTheDocument();
    });

    test("renders with hour accuracy", () => {
      render(<LocalIsoDate date={testDate} accuracy="hour" />);
      const element = screen.getByText(/^\d{4}-\d{2}-\d{2} \d{2}$/);
      expect(element).toBeInTheDocument();
    });

    test("renders with minute accuracy", () => {
      render(<LocalIsoDate date={testDate} accuracy="minute" />);
      const element = screen.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(element).toBeInTheDocument();
    });

    test("renders with second accuracy", () => {
      render(<LocalIsoDate date={testDate} accuracy="second" />);
      const element = screen.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(element).toBeInTheDocument();
    });

    test("renders with millisecond accuracy", () => {
      render(<LocalIsoDate date={testDate} accuracy="millisecond" />);
      const element = screen.getByText(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/,
      );
      expect(element).toBeInTheDocument();
    });
  });

  describe("Tooltip Content", () => {
    test("includes UTC time in title attribute", () => {
      const { container } = render(<LocalIsoDate date={testDate} />);
      const span = container.querySelector("span");
      expect(span).toHaveAttribute("title");
      const title = span?.getAttribute("title");
      expect(title).toContain("UTC:");
      expect(title).toContain("2024-01-15 14:30:45.123");
    });

    test("UTC tooltip always uses millisecond accuracy", () => {
      const { container } = render(
        <LocalIsoDate date={testDate} accuracy="day" />,
      );
      const span = container.querySelector("span");
      const title = span?.getAttribute("title");
      expect(title).toMatch(/UTC: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/);
    });
  });

  describe("Custom ClassName", () => {
    test("applies custom className to span", () => {
      const { container } = render(
        <LocalIsoDate date={testDate} className="custom-date-class" />,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("custom-date-class");
    });

    test("renders without className when not provided", () => {
      const { container } = render(<LocalIsoDate date={testDate} />);
      const span = container.querySelector("span");
      expect(span).not.toHaveClass();
    });
  });

  describe("Invalid Date Handling", () => {
    test("returns null for invalid date", () => {
      const { container } = render(<LocalIsoDate date={new Date("invalid")} />);
      expect(container.firstChild).toBeNull();
    });

    test("returns null for NaN date", () => {
      const invalidDate = new Date(NaN);
      const { container } = render(<LocalIsoDate date={invalidDate} />);
      expect(container.firstChild).toBeNull();
    });

    test("handles valid date without errors", () => {
      expect(() => render(<LocalIsoDate date={testDate} />)).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    test("handles leap year dates", () => {
      const leapDate = new Date("2024-02-29T12:00:00.000Z");
      render(<LocalIsoDate date={leapDate} accuracy="day" />);
      expect(screen.getByText(/2024-02-29/)).toBeInTheDocument();
    });

    test("handles year boundaries", () => {
      const newYear = new Date("2024-01-01T00:00:00.000Z");
      render(<LocalIsoDate date={newYear} accuracy="second" />);
      expect(screen.getByText(/2024-01-01 00:00:00/)).toBeInTheDocument();
    });

    test("handles midnight time", () => {
      const midnight = new Date("2024-01-15T00:00:00.000Z");
      render(<LocalIsoDate date={midnight} accuracy="second" />);
      const element = screen.getByText(/2024-01-15 00:00:00/);
      expect(element).toBeInTheDocument();
    });

    test("handles end of day", () => {
      const endOfDay = new Date("2024-01-15T23:59:59.999Z");
      render(<LocalIsoDate date={endOfDay} accuracy="millisecond" />);
      expect(screen.getByText(/23:59:59.999/)).toBeInTheDocument();
    });
  });

  describe("Different Date Objects", () => {
    test("handles Date created from timestamp", () => {
      const timestampDate = new Date(1705329045123);
      render(<LocalIsoDate date={timestampDate} />);
      const { container } = render(<LocalIsoDate date={timestampDate} />);
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
    });

    test("handles Date created from string", () => {
      const stringDate = new Date("2024-01-15");
      render(<LocalIsoDate date={stringDate} accuracy="day" />);
      expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
    });

    test("handles current date", () => {
      const now = new Date();
      render(<LocalIsoDate date={now} />);
      const { container } = render(<LocalIsoDate date={now} />);
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
    });
  });
});
