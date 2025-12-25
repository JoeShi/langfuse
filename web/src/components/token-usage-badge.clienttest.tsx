/**
 * @fileoverview Unit Tests for TokenUsageBadge Components
 *
 * Comprehensive test suite for TokenUsageBadge and AggUsageBadge components including:
 * - Badge rendering with usage statistics
 * - Token count formatting
 * - Zero usage handling
 * - Inline vs badge display modes
 * - Variant styling
 * - Right icon rendering
 * - Observation and direct usage props
 *
 * Uses Jest and React Testing Library for component testing.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TokenUsageBadge, AggUsageBadge } from "./token-usage-badge";

// Mock the numberFormatter utility
jest.mock("@/src/utils/numbers", () => ({
  numberFormatter: (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },
}));

describe("TokenUsageBadge Component", () => {
  describe("Basic Rendering with Direct Usage", () => {
    test("renders badge with usage statistics", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={200} totalUsage={300} />,
      );
      expect(screen.getByText(/100.*200.*300/)).toBeInTheDocument();
    });

    test("displays arrow between input and output", () => {
      render(
        <TokenUsageBadge inputUsage={50} outputUsage={75} totalUsage={125} />,
      );
      expect(screen.getByText(/→/)).toBeInTheDocument();
    });

    test("displays sum symbol for total usage", () => {
      render(
        <TokenUsageBadge inputUsage={50} outputUsage={75} totalUsage={125} />,
      );
      expect(screen.getByText(/∑/)).toBeInTheDocument();
    });

    test("formats badge content correctly", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={200} totalUsage={300} />,
      );
      expect(screen.getByText("100 → 200 (∑ 300)")).toBeInTheDocument();
    });
  });

  describe("Rendering with Observation Object", () => {
    test("renders badge from observation object", () => {
      const observation = {
        id: "test-1",
        inputUsage: 150,
        outputUsage: 250,
        totalUsage: 400,
      } as any;

      render(<TokenUsageBadge observation={observation} />);
      expect(screen.getByText("150 → 250 (∑ 400)")).toBeInTheDocument();
    });

    test("handles observation with zero usage", () => {
      const observation = {
        id: "test-2",
        inputUsage: 0,
        outputUsage: 0,
        totalUsage: 0,
      } as any;

      const { container } = render(<TokenUsageBadge observation={observation} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe("Zero Usage Handling", () => {
    test("returns empty fragment when all usage is zero", () => {
      const { container } = render(
        <TokenUsageBadge inputUsage={0} outputUsage={0} totalUsage={0} />,
      );
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    test("renders when only input usage is non-zero", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={0} totalUsage={100} />,
      );
      expect(screen.getByText("100 → 0 (∑ 100)")).toBeInTheDocument();
    });

    test("renders when only output usage is non-zero", () => {
      render(
        <TokenUsageBadge inputUsage={0} outputUsage={50} totalUsage={50} />,
      );
      expect(screen.getByText("0 → 50 (∑ 50)")).toBeInTheDocument();
    });
  });

  describe("Inline Mode", () => {
    test("renders as span when inline is true", () => {
      const { container } = render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          inline={true}
        />,
      );
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent("100 → 200 (∑ 300)");
    });

    test("does not render Badge component when inline", () => {
      const { container } = render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          inline={true}
        />,
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).not.toBeInTheDocument();
    });

    test("inline mode includes right icon", () => {
      const icon = <span data-testid="test-icon">🔥</span>;
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          inline={true}
          rightIcon={icon}
        />,
      );
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });
  });

  describe("Badge Mode", () => {
    test("renders as Badge by default", () => {
      const { container } = render(
        <TokenUsageBadge inputUsage={100} outputUsage={200} totalUsage={300} />,
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });

    test("badge mode includes right icon", () => {
      const icon = <span data-testid="test-icon">✨</span>;
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          rightIcon={icon}
        />,
      );
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });
  });

  describe("Variant Styling", () => {
    test("applies default variant when not specified", () => {
      const { container } = render(
        <TokenUsageBadge inputUsage={100} outputUsage={200} totalUsage={300} />,
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });

    test("applies outline variant", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          variant="outline"
        />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    test("applies secondary variant", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          variant="secondary"
        />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    test("applies destructive variant", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          variant="destructive"
        />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    test("applies tertiary variant", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          variant="tertiary"
        />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Large Numbers Formatting", () => {
    test("formats thousands correctly", () => {
      render(
        <TokenUsageBadge
          inputUsage={1500}
          outputUsage={2500}
          totalUsage={4000}
        />,
      );
      expect(screen.getByText("1.5K → 2.5K (∑ 4.0K)")).toBeInTheDocument();
    });

    test("formats millions correctly", () => {
      render(
        <TokenUsageBadge
          inputUsage={1500000}
          outputUsage={2500000}
          totalUsage={4000000}
        />,
      );
      expect(screen.getByText("1.5M → 2.5M (∑ 4.0M)")).toBeInTheDocument();
    });
  });

  describe("Right Icon", () => {
    test("renders right icon when provided", () => {
      const icon = <span data-testid="custom-icon">➡️</span>;
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={200}
          totalUsage={300}
          rightIcon={icon}
        />,
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    test("renders without right icon when not provided", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={200} totalUsage={300} />,
      );
      expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    });
  });
});

describe("AggUsageBadge Component", () => {
  describe("Basic Rendering", () => {
    test("renders aggregated usage from multiple observations", () => {
      const observations = [
        { id: "1", inputUsage: 100, outputUsage: 150, totalUsage: 250 },
        { id: "2", inputUsage: 200, outputUsage: 250, totalUsage: 450 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      // Total: input=300, output=400, total=700
      expect(screen.getByText("300 → 400 (∑ 700)")).toBeInTheDocument();
    });

    test("handles single observation", () => {
      const observations = [
        { id: "1", inputUsage: 50, outputUsage: 75, totalUsage: 125 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      expect(screen.getByText("50 → 75 (∑ 125)")).toBeInTheDocument();
    });

    test("handles empty observations array", () => {
      const { container } = render(<AggUsageBadge observations={[]} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe("Aggregation Logic", () => {
    test("sums input usage correctly", () => {
      const observations = [
        { id: "1", inputUsage: 100, outputUsage: 0, totalUsage: 100 },
        { id: "2", inputUsage: 200, outputUsage: 0, totalUsage: 200 },
        { id: "3", inputUsage: 300, outputUsage: 0, totalUsage: 300 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      expect(screen.getByText(/600 →/)).toBeInTheDocument();
    });

    test("sums output usage correctly", () => {
      const observations = [
        { id: "1", inputUsage: 0, outputUsage: 150, totalUsage: 150 },
        { id: "2", inputUsage: 0, outputUsage: 250, totalUsage: 250 },
        { id: "3", inputUsage: 0, outputUsage: 350, totalUsage: 350 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      expect(screen.getByText(/→ 750/)).toBeInTheDocument();
    });

    test("sums total usage correctly", () => {
      const observations = [
        { id: "1", inputUsage: 100, outputUsage: 100, totalUsage: 200 },
        { id: "2", inputUsage: 200, outputUsage: 200, totalUsage: 400 },
        { id: "3", inputUsage: 300, outputUsage: 300, totalUsage: 600 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      expect(screen.getByText(/∑ 1.2K/)).toBeInTheDocument();
    });
  });

  describe("Variant and Icon Props", () => {
    test("passes variant to TokenUsageBadge", () => {
      const observations = [
        { id: "1", inputUsage: 100, outputUsage: 200, totalUsage: 300 },
      ] as any[];

      render(<AggUsageBadge observations={observations} variant="secondary" />);
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });

    test("passes rightIcon to TokenUsageBadge", () => {
      const observations = [
        { id: "1", inputUsage: 100, outputUsage: 200, totalUsage: 300 },
      ] as any[];
      const icon = <span data-testid="agg-icon">🎯</span>;

      render(<AggUsageBadge observations={observations} rightIcon={icon} />);
      expect(screen.getByTestId("agg-icon")).toBeInTheDocument();
    });
  });

  describe("Zero Usage in Aggregation", () => {
    test("returns empty when all observations have zero usage", () => {
      const observations = [
        { id: "1", inputUsage: 0, outputUsage: 0, totalUsage: 0 },
        { id: "2", inputUsage: 0, outputUsage: 0, totalUsage: 0 },
      ] as any[];

      const { container } = render(<AggUsageBadge observations={observations} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    test("handles mixed zero and non-zero observations", () => {
      const observations = [
        { id: "1", inputUsage: 0, outputUsage: 0, totalUsage: 0 },
        { id: "2", inputUsage: 100, outputUsage: 200, totalUsage: 300 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      expect(screen.getByText("100 → 200 (∑ 300)")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles very large aggregated numbers", () => {
      const observations = [
        { id: "1", inputUsage: 1000000, outputUsage: 2000000, totalUsage: 3000000 },
        { id: "2", inputUsage: 1500000, outputUsage: 2500000, totalUsage: 4000000 },
      ] as any[];

      render(<AggUsageBadge observations={observations} />);
      expect(screen.getByText("2.5M → 4.5M (∑ 7.0M)")).toBeInTheDocument();
    });

    test("handles observations with missing fields gracefully", () => {
      const observations = [
        { id: "1", inputUsage: undefined, outputUsage: 100, totalUsage: 100 },
      ] as any[];

      // Should not throw, NaN + number = NaN, but we test it doesn't crash
      expect(() => render(<AggUsageBadge observations={observations} />)).not.toThrow();
    });
  });
});
