/**
 * Tests for TruncatedLabels component
 *
 * Run with: pnpm test-client --testPathPattern="TruncatedLabels"
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TruncatedLabels } from "./TruncatedLabels";
import { PRODUCTION_LABEL, LATEST_PROMPT_LABEL } from "@langfuse/shared";

// Mock the UI components
jest.mock("@/src/components/ui/button", () => ({
  Button: ({ children, className, onClick, ...props }: any) => (
    <button className={className} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/src/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <div data-testid="hover-card">{children}</div>,
  HoverCardContent: ({ children, className }: any) => (
    <div data-testid="hover-card-content" className={className}>
      {children}
    </div>
  ),
  HoverCardTrigger: ({ children, asChild }: any) => (
    <div data-testid="hover-card-trigger">{children}</div>
  ),
}));

jest.mock("@/src/components/layouts/status-badge", () => ({
  StatusBadge: ({ type, className, isLive }: any) => (
    <div
      data-testid={`status-badge-${type}`}
      className={className}
      data-is-live={isLive}
    >
      {type}
    </div>
  ),
}));

describe("TruncatedLabels", () => {
  it("returns null when labels array is empty", () => {
    const { container } = render(<TruncatedLabels labels={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all labels when count is less than maxVisibleLabels", () => {
    render(<TruncatedLabels labels={["label1", "label2", "label3"]} />);
    expect(screen.getByTestId("status-badge-label1")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-label2")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-label3")).toBeInTheDocument();
  });

  it("truncates labels when count exceeds maxVisibleLabels", () => {
    render(
      <TruncatedLabels
        labels={["label1", "label2", "label3", "label4", "label5", "label6"]}
        maxVisibleLabels={3}
      />,
    );
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  it("uses default maxVisibleLabels of 5", () => {
    render(
      <TruncatedLabels
        labels={[
          "label1",
          "label2",
          "label3",
          "label4",
          "label5",
          "label6",
          "label7",
        ]}
      />,
    );
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("prioritizes production label first", () => {
    render(
      <TruncatedLabels
        labels={["label1", PRODUCTION_LABEL, "label2"]}
        maxVisibleLabels={2}
      />,
    );
    // Production label should be visible even if it wasn't first in array
    expect(screen.getByTestId(`status-badge-${PRODUCTION_LABEL}`)).toBeInTheDocument();
  });

  it("prioritizes latest label second after production", () => {
    render(
      <TruncatedLabels
        labels={["label1", LATEST_PROMPT_LABEL, PRODUCTION_LABEL, "label2"]}
        maxVisibleLabels={3}
      />,
    );
    expect(screen.getByTestId(`status-badge-${PRODUCTION_LABEL}`)).toBeInTheDocument();
    expect(screen.getByTestId(`status-badge-${LATEST_PROMPT_LABEL}`)).toBeInTheDocument();
  });

  it("sorts remaining labels alphabetically", () => {
    const { container } = render(
      <TruncatedLabels labels={["zebra", "alpha", "beta"]} />,
    );
    const badges = container.querySelectorAll("[data-testid^='status-badge-']");
    expect(badges[0]).toHaveAttribute("data-testid", "status-badge-alpha");
    expect(badges[1]).toHaveAttribute("data-testid", "status-badge-beta");
    expect(badges[2]).toHaveAttribute("data-testid", "status-badge-zebra");
  });

  it("applies custom className", () => {
    const { container } = render(
      <TruncatedLabels labels={["label1"]} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies badgeClassName to badges", () => {
    render(
      <TruncatedLabels
        labels={["label1"]}
        badgeClassName="custom-badge-class"
      />,
    );
    const badge = screen.getByTestId("status-badge-label1");
    expect(badge).toHaveClass("custom-badge-class");
  });

  it("shows simple badges when showSimpleBadges is true", () => {
    const { container } = render(
      <TruncatedLabels labels={["label1", "label2"]} showSimpleBadges={true} />,
    );
    expect(screen.queryByTestId("status-badge-label1")).not.toBeInTheDocument();
    expect(screen.getByText("label1")).toBeInTheDocument();
    expect(screen.getByText("label2")).toBeInTheDocument();
  });

  it("renders StatusBadge by default", () => {
    render(<TruncatedLabels labels={["label1"]} />);
    expect(screen.getByTestId("status-badge-label1")).toBeInTheDocument();
  });

  it("marks production label as live", () => {
    render(<TruncatedLabels labels={[PRODUCTION_LABEL, "label1"]} />);
    const badge = screen.getByTestId(`status-badge-${PRODUCTION_LABEL}`);
    expect(badge).toHaveAttribute("data-is-live", "true");
  });

  it("does not mark non-production labels as live", () => {
    render(<TruncatedLabels labels={["label1"]} />);
    const badge = screen.getByTestId("status-badge-label1");
    expect(badge).toHaveAttribute("data-is-live", "false");
  });

  it("shows hover card with all labels when truncated", () => {
    render(
      <TruncatedLabels
        labels={["label1", "label2", "label3", "label4", "label5", "label6"]}
        maxVisibleLabels={3}
      />,
    );
    expect(screen.getByTestId("hover-card")).toBeInTheDocument();
    expect(screen.getByTestId("hover-card-trigger")).toBeInTheDocument();
  });

  it("does not show hover card when all labels are visible", () => {
    render(
      <TruncatedLabels labels={["label1", "label2"]} maxVisibleLabels={5} />,
    );
    expect(screen.queryByTestId("hover-card")).not.toBeInTheDocument();
  });

  it("shows correct count of hidden labels", () => {
    render(
      <TruncatedLabels
        labels={["label1", "label2", "label3", "label4", "label5", "label6", "label7"]}
        maxVisibleLabels={2}
      />,
    );
    expect(screen.getByText("+5 more")).toBeInTheDocument();
  });

  it("renders all labels in hover card content", () => {
    render(
      <TruncatedLabels
        labels={["label1", "label2", "label3", "label4"]}
        maxVisibleLabels={2}
      />,
    );
    // All labels should be rendered somewhere in the component (visible + hover content)
    const allBadges = screen.getAllByTestId(/status-badge-/);
    // We expect 2 sets of badges: visible (2) + all in hover card (4) = 6 total
    expect(allBadges.length).toBe(6);
  });

  it("applies simple badges styling in hover card when showSimpleBadges is true", () => {
    const { container } = render(
      <TruncatedLabels
        labels={["label1", "label2", "label3", "label4"]}
        maxVisibleLabels={2}
        showSimpleBadges={true}
      />,
    );
    // Should render simple divs instead of StatusBadge
    const labels = screen.getAllByText(/label/);
    expect(labels.length).toBeGreaterThan(0);
  });
});
