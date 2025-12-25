/**
 * Tests for ActionButton component
 *
 * Run with: pnpm test-client --testPathPattern="ActionButton"
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ActionButton } from "./ActionButton";

// Mock dependencies
jest.mock("@/src/components/ui/button", () => ({
  Button: React.forwardRef(({ children, disabled, loading, className, asChild, ...props }: any, ref: any) => (
    <button
      ref={ref}
      disabled={disabled}
      data-loading={loading}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
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

jest.mock("@radix-ui/react-hover-card", () => ({
  HoverCardPortal: ({ children }: any) => (
    <div data-testid="hover-card-portal">{children}</div>
  ),
}));

jest.mock("next/link", () => {
  return function Link({ children, href, target, rel, onClick }: any) {
    return (
      <a href={href} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    );
  };
});

jest.mock("lucide-react", () => ({
  Lock: ({ className }: any) => <svg data-testid="lock-icon" className={className} />,
  AlertCircle: ({ className }: any) => <svg data-testid="alert-icon" className={className} />,
  Sparkle: ({ className }: any) => <svg data-testid="sparkle-icon" className={className} />,
}));

jest.mock("@/src/features/posthog-analytics/usePostHogClientCapture", () => ({
  usePostHogClientCapture: () => jest.fn(),
}));

describe("ActionButton", () => {
  it("renders basic button", () => {
    render(<ActionButton>Click me</ActionButton>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders with custom icon", () => {
    const icon = <span data-testid="custom-icon">★</span>;
    render(<ActionButton icon={icon}>Button</ActionButton>);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("is disabled when hasAccess is false", () => {
    render(<ActionButton hasAccess={false}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows lock icon when hasAccess is false", () => {
    render(<ActionButton hasAccess={false}>Button</ActionButton>);
    expect(screen.getByTestId("lock-icon")).toBeInTheDocument();
  });

  it("shows no access message when hasAccess is false", () => {
    render(<ActionButton hasAccess={false}>Button</ActionButton>);
    expect(screen.getByText(/You do not have access/)).toBeInTheDocument();
  });

  it("is disabled when hasEntitlement is false", () => {
    render(<ActionButton hasEntitlement={false}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows alert icon when hasEntitlement is false", () => {
    render(<ActionButton hasEntitlement={false}>Button</ActionButton>);
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("shows entitlement message when hasEntitlement is false", () => {
    render(<ActionButton hasEntitlement={false}>Button</ActionButton>);
    expect(
      screen.getByText(/This feature is not available in your current plan/)
    ).toBeInTheDocument();
  });

  it("is disabled when limit is reached", () => {
    render(<ActionButton limitValue={10} limit={10}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows sparkle icon when limit is reached", () => {
    render(<ActionButton limitValue={10} limit={10}>Button</ActionButton>);
    expect(screen.getByTestId("sparkle-icon")).toBeInTheDocument();
  });

  it("shows limit reached message", () => {
    render(<ActionButton limitValue={10} limit={10}>Button</ActionButton>);
    expect(screen.getByText(/You have reached the limit \(10\/10\)/)).toBeInTheDocument();
  });

  it("is not disabled when below limit", () => {
    render(<ActionButton limitValue={5} limit={10}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("is disabled when explicitly disabled", () => {
    render(<ActionButton disabled={true}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<ActionButton loading={true}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-loading", "true");
  });

  it("applies custom className", () => {
    render(<ActionButton className="custom-class">Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("renders as link when href is provided", () => {
    render(<ActionButton href="/page">Button</ActionButton>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/page");
  });

  it("opens external links in new tab", () => {
    render(<ActionButton href="https://example.com">Button</ActionButton>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not open internal links in new tab", () => {
    render(<ActionButton href="/page">Button</ActionButton>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
  });

  it("treats // protocol-relative URLs as external", () => {
    render(<ActionButton href="//example.com">Button</ActionButton>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not render as link when disabled", () => {
    render(
      <ActionButton href="/page" disabled={true}>
        Button
      </ActionButton>
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render as link when hasAccess is false", () => {
    render(
      <ActionButton href="/page" hasAccess={false}>
        Button
      </ActionButton>
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("wraps disabled button in hover card", () => {
    render(<ActionButton hasAccess={false}>Button</ActionButton>);
    expect(screen.getByTestId("hover-card")).toBeInTheDocument();
    expect(screen.getByTestId("hover-card-trigger")).toBeInTheDocument();
  });

  it("does not wrap enabled button in hover card", () => {
    render(<ActionButton>Button</ActionButton>);
    expect(screen.queryByTestId("hover-card")).not.toBeInTheDocument();
  });

  it("passes button props through", () => {
    const onClick = jest.fn();
    render(<ActionButton onClick={onClick}>Button</ActionButton>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it("supports ref forwarding", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<ActionButton ref={ref}>Button</ActionButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("prioritizes no access message over entitlement message", () => {
    render(
      <ActionButton hasAccess={false} hasEntitlement={false}>
        Button
      </ActionButton>
    );
    expect(screen.getByText(/You do not have access/)).toBeInTheDocument();
    expect(
      screen.queryByText(/This feature is not available/)
    ).not.toBeInTheDocument();
  });

  it("prioritizes entitlement message over limit message", () => {
    render(
      <ActionButton hasEntitlement={false} limitValue={10} limit={10}>
        Button
      </ActionButton>
    );
    expect(
      screen.getByText(/This feature is not available/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/You have reached the limit/)).not.toBeInTheDocument();
  });

  it("handles limit=false correctly", () => {
    render(<ActionButton limitValue={100} limit={false}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("handles undefined limitValue", () => {
    render(<ActionButton limit={10}>Button</ActionButton>);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("renders children correctly", () => {
    render(
      <ActionButton>
        <span>Complex</span> <strong>Children</strong>
      </ActionButton>
    );
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Children")).toBeInTheDocument();
  });
});
