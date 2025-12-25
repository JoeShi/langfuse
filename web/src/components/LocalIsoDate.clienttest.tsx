/**
 * Tests for LocalIsoDate component and formatLocalIsoDate utility
 *
 * Run with: pnpm test-client --testPathPattern="LocalIsoDate"
 */

import { render, screen } from "@testing-library/react";
import { formatLocalIsoDate, LocalIsoDate } from "./LocalIsoDate";

describe("formatLocalIsoDate", () => {
  const testDate = new Date("2023-12-25T13:45:30.123Z");

  describe("day accuracy", () => {
    it("formats date with day accuracy in local time", () => {
      const result = formatLocalIsoDate(testDate, false, "day");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("formats date with day accuracy in UTC", () => {
      const result = formatLocalIsoDate(testDate, true, "day");
      expect(result).toBe("2023-12-25");
    });
  });

  describe("hour accuracy", () => {
    it("formats date with hour accuracy in UTC", () => {
      const result = formatLocalIsoDate(testDate, true, "hour");
      expect(result).toBe("2023-12-25 13");
    });
  });

  describe("minute accuracy", () => {
    it("formats date with minute accuracy in UTC", () => {
      const result = formatLocalIsoDate(testDate, true, "minute");
      expect(result).toBe("2023-12-25 13:45");
    });
  });

  describe("second accuracy", () => {
    it("formats date with second accuracy in UTC", () => {
      const result = formatLocalIsoDate(testDate, true, "second");
      expect(result).toBe("2023-12-25 13:45:30");
    });
  });

  describe("millisecond accuracy", () => {
    it("formats date with millisecond accuracy in UTC", () => {
      const result = formatLocalIsoDate(testDate, true, "millisecond");
      expect(result).toBe("2023-12-25 13:45:30.123");
    });
  });

  describe("padding", () => {
    it("pads single digit months and days", () => {
      const date = new Date("2023-01-05T00:00:00.000Z");
      const result = formatLocalIsoDate(date, true, "day");
      expect(result).toBe("2023-01-05");
    });

    it("pads single digit hours, minutes, and seconds", () => {
      const date = new Date("2023-01-01T01:02:03.004Z");
      const result = formatLocalIsoDate(date, true, "millisecond");
      expect(result).toBe("2023-01-01 01:02:03.004");
    });
  });
});

describe("LocalIsoDate component", () => {
  const testDate = new Date("2023-12-25T13:45:30.123Z");

  it("renders date with default second accuracy", () => {
    render(<LocalIsoDate date={testDate} />);
    const element = screen.getByText(/2023-12-25/);
    expect(element).toBeInTheDocument();
  });

  it("renders date with custom accuracy", () => {
    render(<LocalIsoDate date={testDate} accuracy="day" />);
    const element = screen.getByText(/^\d{4}-\d{2}-\d{2}$/);
    expect(element).toBeInTheDocument();
  });

  it("includes UTC timestamp in title attribute", () => {
    render(<LocalIsoDate date={testDate} />);
    const element = screen.getByText(/2023-12-25/);
    expect(element).toHaveAttribute("title", "UTC: 2023-12-25 13:45:30.123");
  });

  it("applies custom className", () => {
    const { container } = render(
      <LocalIsoDate date={testDate} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("returns null for invalid date object", () => {
    const { container } = render(
      <LocalIsoDate date={new Date("invalid")} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null for NaN date", () => {
    const invalidDate = new Date(NaN);
    const { container } = render(<LocalIsoDate date={invalidDate} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with minute accuracy", () => {
    render(<LocalIsoDate date={testDate} accuracy="minute" />);
    const element = screen.getByText(/\d{2}:\d{2}$/);
    expect(element).toBeInTheDocument();
  });

  it("renders with millisecond accuracy", () => {
    render(<LocalIsoDate date={testDate} accuracy="millisecond" />);
    const element = screen.getByText(/\d{2}:\d{2}:\d{2}\.\d{3}$/);
    expect(element).toBeInTheDocument();
  });
});
