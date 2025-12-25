/**
 * Tests for token-usage-badge components
 *
 * Run with: pnpm test-client --testPathPattern="token-usage-badge"
 */

import { render, screen } from "@testing-library/react";
import { AggUsageBadge, TokenUsageBadge } from "./token-usage-badge";

// Mock dependencies
jest.mock("@/src/components/ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <div data-testid="badge" data-variant={variant}>
      {children}
    </div>
  ),
}));

jest.mock("@/src/utils/numbers", () => ({
  numberFormatter: (num: number, decimals: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}k`;
    return num.toString();
  },
}));

describe("TokenUsageBadge", () => {
  describe("with observation prop", () => {
    it("renders token usage from observation", () => {
      const observation: any = {
        inputUsage: 100,
        outputUsage: 50,
        totalUsage: 150,
      };
      render(<TokenUsageBadge observation={observation} />);
      expect(screen.getByText(/100 → 50 \(∑ 150\)/)).toBeInTheDocument();
    });

    it("renders empty when all usage values are zero", () => {
      const observation: any = {
        inputUsage: 0,
        outputUsage: 0,
        totalUsage: 0,
      };
      const { container } = render(<TokenUsageBadge observation={observation} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it("renders with large numbers formatted", () => {
      const observation: any = {
        inputUsage: 1500,
        outputUsage: 2500,
        totalUsage: 4000,
      };
      render(<TokenUsageBadge observation={observation} />);
      expect(screen.getByText(/2k → 2k \(∑ 4k\)/)).toBeInTheDocument();
    });
  });

  describe("with individual usage props", () => {
    it("renders token usage from individual props", () => {
      render(
        <TokenUsageBadge inputUsage={200} outputUsage={100} totalUsage={300} />,
      );
      expect(screen.getByText(/200 → 100 \(∑ 300\)/)).toBeInTheDocument();
    });

    it("renders empty when all usage values are zero", () => {
      const { container } = render(
        <TokenUsageBadge inputUsage={0} outputUsage={0} totalUsage={0} />,
      );
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it("renders with zero input but non-zero output", () => {
      render(
        <TokenUsageBadge inputUsage={0} outputUsage={100} totalUsage={100} />,
      );
      expect(screen.getByText(/0 → 100 \(∑ 100\)/)).toBeInTheDocument();
    });

    it("renders with non-zero input but zero output", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={0} totalUsage={100} />,
      );
      expect(screen.getByText(/100 → 0 \(∑ 100\)/)).toBeInTheDocument();
    });
  });

  describe("inline mode", () => {
    it("renders as span when inline is true", () => {
      const { container } = render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          inline={true}
        />,
      );
      expect(container.querySelector("span")).toBeInTheDocument();
      expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
    });

    it("renders as Badge when inline is false", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          inline={false}
        />,
      );
      expect(screen.getByTestId("badge")).toBeInTheDocument();
    });

    it("renders as Badge by default (inline undefined)", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={50} totalUsage={150} />,
      );
      expect(screen.getByTestId("badge")).toBeInTheDocument();
    });
  });

  describe("rightIcon prop", () => {
    it("renders rightIcon when provided", () => {
      const icon = <span data-testid="custom-icon">★</span>;
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          rightIcon={icon}
        />,
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("renders rightIcon in inline mode", () => {
      const icon = <span data-testid="custom-icon">★</span>;
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          inline={true}
          rightIcon={icon}
        />,
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("does not render rightIcon when not provided", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={50} totalUsage={150} />,
      );
      expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    });
  });

  describe("variant prop", () => {
    it("uses default variant when not specified", () => {
      render(
        <TokenUsageBadge inputUsage={100} outputUsage={50} totalUsage={150} />,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-variant", "outline");
    });

    it("applies secondary variant", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          variant="secondary"
        />,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-variant", "secondary");
    });

    it("applies destructive variant", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          variant="destructive"
        />,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-variant", "destructive");
    });

    it("applies outline variant explicitly", () => {
      render(
        <TokenUsageBadge
          inputUsage={100}
          outputUsage={50}
          totalUsage={150}
          variant="outline"
        />,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-variant", "outline");
    });
  });

  describe("number formatting", () => {
    it("formats millions correctly", () => {
      render(
        <TokenUsageBadge
          inputUsage={1000000}
          outputUsage={500000}
          totalUsage={1500000}
        />,
      );
      expect(screen.getByText(/1M → 1M \(∑ 2M\)/)).toBeInTheDocument();
    });

    it("formats thousands correctly", () => {
      render(
        <TokenUsageBadge
          inputUsage={5000}
          outputUsage={3000}
          totalUsage={8000}
        />,
      );
      expect(screen.getByText(/5k → 3k \(∑ 8k\)/)).toBeInTheDocument();
    });

    it("formats small numbers without suffix", () => {
      render(
        <TokenUsageBadge inputUsage={500} outputUsage={300} totalUsage={800} />,
      );
      expect(screen.getByText(/500 → 300 \(∑ 800\)/)).toBeInTheDocument();
    });
  });
});

describe("AggUsageBadge", () => {
  it("aggregates input usage from multiple observations", () => {
    const observations: any[] = [
      { inputUsage: 100, outputUsage: 50, totalUsage: 150 },
      { inputUsage: 200, outputUsage: 100, totalUsage: 300 },
      { inputUsage: 300, outputUsage: 150, totalUsage: 450 },
    ];
    render(<AggUsageBadge observations={observations} />);
    expect(screen.getByText(/600 → 300 \(∑ 900\)/)).toBeInTheDocument();
  });

  it("handles empty observations array", () => {
    const { container } = render(<AggUsageBadge observations={[]} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("handles single observation", () => {
    const observations: any[] = [
      { inputUsage: 100, outputUsage: 50, totalUsage: 150 },
    ];
    render(<AggUsageBadge observations={observations} />);
    expect(screen.getByText(/100 → 50 \(∑ 150\)/)).toBeInTheDocument();
  });

  it("handles observations with zero usage", () => {
    const observations: any[] = [
      { inputUsage: 0, outputUsage: 0, totalUsage: 0 },
      { inputUsage: 0, outputUsage: 0, totalUsage: 0 },
    ];
    const { container } = render(<AggUsageBadge observations={observations} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("passes rightIcon to TokenUsageBadge", () => {
    const icon = <span data-testid="custom-icon">★</span>;
    const observations: any[] = [
      { inputUsage: 100, outputUsage: 50, totalUsage: 150 },
    ];
    render(<AggUsageBadge observations={observations} rightIcon={icon} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("passes variant to TokenUsageBadge", () => {
    const observations: any[] = [
      { inputUsage: 100, outputUsage: 50, totalUsage: 150 },
    ];
    render(<AggUsageBadge observations={observations} variant="secondary" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "secondary");
  });

  it("aggregates large numbers correctly", () => {
    const observations: any[] = [
      { inputUsage: 10000, outputUsage: 5000, totalUsage: 15000 },
      { inputUsage: 20000, outputUsage: 10000, totalUsage: 30000 },
      { inputUsage: 30000, outputUsage: 15000, totalUsage: 45000 },
    ];
    render(<AggUsageBadge observations={observations} />);
    expect(screen.getByText(/60k → 30k \(∑ 90k\)/)).toBeInTheDocument();
  });

  it("handles mixed zero and non-zero observations", () => {
    const observations: any[] = [
      { inputUsage: 0, outputUsage: 0, totalUsage: 0 },
      { inputUsage: 100, outputUsage: 50, totalUsage: 150 },
      { inputUsage: 0, outputUsage: 0, totalUsage: 0 },
    ];
    render(<AggUsageBadge observations={observations} />);
    expect(screen.getByText(/100 → 50 \(∑ 150\)/)).toBeInTheDocument();
  });
});
