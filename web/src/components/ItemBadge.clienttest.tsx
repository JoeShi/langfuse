/**
 * Tests for ItemBadge component
 *
 * Run with: pnpm test-client --testPathPattern="ItemBadge"
 */

import { render, screen } from "@testing-library/react";
import { ItemBadge, type LangfuseItemType } from "./ItemBadge";

// Mock the Badge component
jest.mock("@/src/components/ui/badge", () => ({
  Badge: ({ children, title, className, variant }: any) => (
    <div
      data-testid="badge"
      title={title}
      className={className}
      data-variant={variant}
    >
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  CircleDot: ({ className }: any) => (
    <svg data-testid="icon-CircleDot" className={className} />
  ),
  ClipboardPen: ({ className }: any) => (
    <svg data-testid="icon-ClipboardPen" className={className} />
  ),
  Database: ({ className }: any) => (
    <svg data-testid="icon-Database" className={className} />
  ),
  Fan: ({ className }: any) => <svg data-testid="icon-Fan" className={className} />,
  ListTree: ({ className }: any) => (
    <svg data-testid="icon-ListTree" className={className} />
  ),
  MoveHorizontal: ({ className }: any) => (
    <svg data-testid="icon-MoveHorizontal" className={className} />
  ),
  User: ({ className }: any) => (
    <svg data-testid="icon-User" className={className} />
  ),
  FileText: ({ className }: any) => (
    <svg data-testid="icon-FileText" className={className} />
  ),
  FlaskConical: ({ className }: any) => (
    <svg data-testid="icon-FlaskConical" className={className} />
  ),
  ListTodo: ({ className }: any) => (
    <svg data-testid="icon-ListTodo" className={className} />
  ),
  WandSparkles: ({ className }: any) => (
    <svg data-testid="icon-WandSparkles" className={className} />
  ),
  TestTubeDiagonal: ({ className }: any) => (
    <svg data-testid="icon-TestTubeDiagonal" className={className} />
  ),
  Clock: ({ className }: any) => (
    <svg data-testid="icon-Clock" className={className} />
  ),
  Bot: ({ className }: any) => <svg data-testid="icon-Bot" className={className} />,
  Wrench: ({ className }: any) => (
    <svg data-testid="icon-Wrench" className={className} />
  ),
  Link: ({ className }: any) => (
    <svg data-testid="icon-Link" className={className} />
  ),
  Search: ({ className }: any) => (
    <svg data-testid="icon-Search" className={className} />
  ),
  Layers3: ({ className }: any) => (
    <svg data-testid="icon-Layers3" className={className} />
  ),
  ShieldCheck: ({ className }: any) => (
    <svg data-testid="icon-ShieldCheck" className={className} />
  ),
}));

describe("ItemBadge", () => {
  it("renders with TRACE type", () => {
    render(<ItemBadge type="TRACE" />);
    expect(screen.getByTestId("icon-ListTree")).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toHaveAttribute("title", "Trace");
  });

  it("renders with GENERATION type", () => {
    render(<ItemBadge type="GENERATION" />);
    expect(screen.getByTestId("icon-Fan")).toBeInTheDocument();
  });

  it("renders with EVENT type", () => {
    render(<ItemBadge type="EVENT" />);
    expect(screen.getByTestId("icon-CircleDot")).toBeInTheDocument();
  });

  it("renders with SPAN type", () => {
    render(<ItemBadge type="SPAN" />);
    expect(screen.getByTestId("icon-MoveHorizontal")).toBeInTheDocument();
  });

  it("renders with AGENT type", () => {
    render(<ItemBadge type="AGENT" />);
    expect(screen.getByTestId("icon-Bot")).toBeInTheDocument();
  });

  it("renders with TOOL type", () => {
    render(<ItemBadge type="TOOL" />);
    expect(screen.getByTestId("icon-Wrench")).toBeInTheDocument();
  });

  it("renders with SESSION type", () => {
    render(<ItemBadge type="SESSION" />);
    expect(screen.getByTestId("icon-Clock")).toBeInTheDocument();
  });

  it("renders with USER type", () => {
    render(<ItemBadge type="USER" />);
    expect(screen.getByTestId("icon-User")).toBeInTheDocument();
  });

  it("renders with DATASET type", () => {
    render(<ItemBadge type="DATASET" />);
    expect(screen.getByTestId("icon-Database")).toBeInTheDocument();
  });

  it("renders with PROMPT type", () => {
    render(<ItemBadge type="PROMPT" />);
    expect(screen.getByTestId("icon-FileText")).toBeInTheDocument();
  });

  it("does not show label by default", () => {
    render(<ItemBadge type="TRACE" />);
    expect(screen.queryByText("Trace")).not.toBeInTheDocument();
  });

  it("shows label when showLabel is true", () => {
    render(<ItemBadge type="TRACE" showLabel={true} />);
    expect(screen.getByText("Trace")).toBeInTheDocument();
  });

  it("formats label correctly for multi-word types", () => {
    render(<ItemBadge type="DATASET_RUN" showLabel={true} />);
    expect(screen.getByText("Dataset run")).toBeInTheDocument();
  });

  it("applies small size when isSmall is true", () => {
    const { container } = render(<ItemBadge type="TRACE" isSmall={true} />);
    const icon = screen.getByTestId("icon-ListTree");
    expect(icon).toHaveClass("h-3", "w-3");
  });

  it("applies default size when isSmall is false", () => {
    const { container } = render(<ItemBadge type="TRACE" isSmall={false} />);
    const icon = screen.getByTestId("icon-ListTree");
    expect(icon).toHaveClass("h-4", "w-4");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ItemBadge type="TRACE" className="custom-class" />,
    );
    const icon = screen.getByTestId("icon-ListTree");
    expect(icon).toHaveClass("custom-class");
  });

  it("renders Badge with outline variant", () => {
    render(<ItemBadge type="TRACE" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("data-variant", "outline");
  });

  it("formats label with correct capitalization", () => {
    render(<ItemBadge type="GENERATION" showLabel={true} />);
    expect(screen.getByText("Generation")).toBeInTheDocument();
  });

  it("renders all available types without error", () => {
    const types: LangfuseItemType[] = [
      "TRACE",
      "GENERATION",
      "EVENT",
      "SPAN",
      "AGENT",
      "TOOL",
      "CHAIN",
      "RETRIEVER",
      "EMBEDDING",
      "GUARDRAIL",
      "SESSION",
      "USER",
      "QUEUE_ITEM",
      "DATASET",
      "DATASET_RUN",
      "DATASET_ITEM",
      "ANNOTATION_QUEUE",
      "PROMPT",
      "EVALUATOR",
      "RUNNING_EVALUATOR",
    ];

    types.forEach((type) => {
      const { unmount } = render(<ItemBadge type={type} />);
      expect(screen.getByTestId("badge")).toBeInTheDocument();
      unmount();
    });
  });

  it("shows label with underscores replaced by spaces", () => {
    render(<ItemBadge type="DATASET_RUN" showLabel={true} />);
    const labelElement = screen.getByText("Dataset run");
    expect(labelElement).toHaveAttribute("title", "Dataset run");
  });
});
