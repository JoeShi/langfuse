/**
 * Tests for ErrorPage components
 *
 * Run with: pnpm test-client --testPathPattern="error-page"
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorPage, ErrorPageWithSentry } from "./error-page";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { captureException } from "@sentry/nextjs";

// Mock dependencies
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next/link", () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("lucide-react", () => ({
  AlertCircle: ({ className }: any) => (
    <svg data-testid="alert-circle" className={className} />
  ),
}));

jest.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick, variant, asChild }: any) => {
    if (asChild) {
      return <div data-variant={variant}>{children}</div>;
    }
    return (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    );
  },
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

jest.mock("@/src/utils/redirect", () => ({
  stripBasePath: (path: string) => path,
}));

describe("ErrorPage", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    asPath: "/some/path",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
  });

  it("renders with default title", () => {
    render(<ErrorPage message="Something went wrong" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<ErrorPage title="Custom Error" message="Something went wrong" />);
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
  });

  it("renders the error message", () => {
    render(<ErrorPage message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders alert icon", () => {
    render(<ErrorPage message="Error occurred" />);
    expect(screen.getByTestId("alert-circle")).toBeInTheDocument();
  });

  it("shows Sign In button when unauthenticated", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
    render(<ErrorPage message="Error" />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("does not show Sign In button when authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
    render(<ErrorPage message="Error" />);
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("navigates to sign-in on Sign In button click", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
    mockRouter.asPath = "/protected/page";
    render(<ErrorPage message="Error" />);
    
    const signInButton = screen.getByText("Sign In");
    fireEvent.click(signInButton);
    
    expect(mockPush).toHaveBeenCalledWith(
      "/auth/sign-in?targetPath=%2Fprotected%2Fpage",
    );
  });

  it("navigates to sign-in without targetPath for root", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
    mockRouter.asPath = "/";
    render(<ErrorPage message="Error" />);
    
    const signInButton = screen.getByText("Sign In");
    fireEvent.click(signInButton);
    
    expect(mockPush).toHaveBeenCalledWith("/auth/sign-in");
  });

  it("renders additional button with onClick", () => {
    const handleClick = jest.fn();
    render(
      <ErrorPage
        message="Error"
        additionalButton={{ label: "Retry", onClick: handleClick }}
      />,
    );
    
    const button = screen.getByText("Retry");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it("renders additional button with href", () => {
    render(
      <ErrorPage
        message="Error"
        additionalButton={{ label: "Go Home", href: "/" }}
      />,
    );
    
    const link = screen.getByText("Go Home");
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  it("does not render additional button when not provided", () => {
    render(<ErrorPage message="Error" />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("applies secondary variant to additional button", () => {
    render(
      <ErrorPage
        message="Error"
        additionalButton={{ label: "Retry", onClick: jest.fn() }}
      />,
    );
    
    const button = screen.getByText("Retry");
    expect(button).toHaveAttribute("data-variant", "secondary");
  });

  it("renders both Sign In and additional button when unauthenticated", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
    render(
      <ErrorPage
        message="Error"
        additionalButton={{ label: "Retry", onClick: jest.fn() }}
      />,
    );
    
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("handles loading session status", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "loading" });
    render(<ErrorPage message="Error" />);
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("centers content properly", () => {
    const { container } = render(<ErrorPage message="Error" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "h-full", "flex-col", "items-center", "justify-center");
  });
});

describe("ErrorPageWithSentry", () => {
  const mockRouter = {
    push: jest.fn(),
    asPath: "/some/path",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated" });
    (captureException as jest.Mock).mockClear();
  });

  it("renders ErrorPage component", () => {
    render(<ErrorPageWithSentry message="Something went wrong" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("captures exception with Sentry on mount", () => {
    render(<ErrorPageWithSentry message="Test error" />);
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "ErrorPageWithSentry rendered: Error, Test error",
      }),
    );
  });

  it("captures exception with custom title", () => {
    render(<ErrorPageWithSentry title="Custom Error" message="Test error" />);
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "ErrorPageWithSentry rendered: Custom Error, Test error",
      }),
    );
  });

  it("only captures exception once on mount", () => {
    const { rerender } = render(<ErrorPageWithSentry message="Error 1" />);
    expect(captureException).toHaveBeenCalledTimes(1);
    
    // Rerender with different props
    rerender(<ErrorPageWithSentry message="Error 1" />);
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it("captures new exception when title or message changes", () => {
    const { rerender } = render(<ErrorPageWithSentry message="Error 1" />);
    expect(captureException).toHaveBeenCalledTimes(1);
    
    rerender(<ErrorPageWithSentry message="Error 2" />);
    expect(captureException).toHaveBeenCalledTimes(2);
  });

  it("passes through additional button with onClick", () => {
    const handleClick = jest.fn();
    render(
      <ErrorPageWithSentry
        message="Error"
        additionalButton={{ label: "Retry", onClick: handleClick }}
      />,
    );
    
    const button = screen.getByText("Retry");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it("passes through additional button with href", () => {
    render(
      <ErrorPageWithSentry
        message="Error"
        additionalButton={{ label: "Go Home", href: "/" }}
      />,
    );
    
    const link = screen.getByText("Go Home");
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  it("shows Sign In button when unauthenticated", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });
    render(<ErrorPageWithSentry message="Error" />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
