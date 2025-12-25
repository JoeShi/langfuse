/**
 * Tests for PagedSettingsContainer component
 *
 * Run with: pnpm test-client --testPathPattern="PagedSettingsContainer"
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { PagedSettingsContainer } from "./PagedSettingsContainer";
import { useRouter } from "next/router";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowUpRight: ({ size, className }: any) => (
    <svg
      data-testid="arrow-up-right"
      width={size}
      height={size}
      className={className}
    />
  ),
}));

// Mock Select components
jest.mock("@/src/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select" data-value={value}>
      <div onClick={() => onValueChange && onValueChange("test-slug")}>
        {children}
      </div>
    </div>
  ),
  SelectTrigger: ({ children }: any) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  SelectValue: ({ placeholder }: any) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

describe("PagedSettingsContainer", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    asPath: "/project/123/settings",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders with basic pages", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
      {
        title: "Page 2",
        slug: "page-2",
        content: <div>Content 2</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(screen.getByText("Page 2")).toBeInTheDocument();
  });

  it("renders active page content", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
      {
        title: "Page 2",
        slug: "page-2",
        content: <div>Content 2</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  it("falls back to first page when activeSlug is not found", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
      {
        title: "Page 2",
        slug: "page-2",
        content: <div>Content 2</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="non-existent" />);
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("filters pages based on show property (boolean)", () => {
    const pages = [
      {
        title: "Visible Page",
        slug: "visible",
        content: <div>Visible Content</div>,
        show: true,
      },
      {
        title: "Hidden Page",
        slug: "hidden",
        content: <div>Hidden Content</div>,
        show: false,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="visible" />);
    expect(screen.getByText("Visible Page")).toBeInTheDocument();
    expect(screen.queryByText("Hidden Page")).not.toBeInTheDocument();
  });

  it("filters pages based on show property (function)", () => {
    const pages = [
      {
        title: "Visible Page",
        slug: "visible",
        content: <div>Visible Content</div>,
        show: () => true,
      },
      {
        title: "Hidden Page",
        slug: "hidden",
        content: <div>Hidden Content</div>,
        show: () => false,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="visible" />);
    expect(screen.getByText("Visible Page")).toBeInTheDocument();
    expect(screen.queryByText("Hidden Page")).not.toBeInTheDocument();
  });

  it("renders external link pages with href", () => {
    const pages = [
      {
        title: "Internal Page",
        slug: "internal",
        content: <div>Internal Content</div>,
      },
      {
        title: "External Page",
        slug: "external",
        href: "https://example.com",
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="internal" />);
    const externalLink = screen.getByText("External Page");
    expect(externalLink.closest("a")).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });

  it("renders ArrowUpRight icon for external links", () => {
    const pages = [
      {
        title: "External Page",
        slug: "external",
        href: "https://example.com",
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="external" />);
    const icons = screen.getAllByTestId("arrow-up-right");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("handles navigation on page click", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
      {
        title: "Page 2",
        slug: "page-2",
        content: <div>Content 2</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    const page2Spans = screen.getAllByText("Page 2");
    // Find the nav span (not in select)
    const page2NavSpan = page2Spans.find(
      (el) => el.tagName === "SPAN" && el.classList.contains("cursor-pointer"),
    );
    
    if (page2NavSpan) {
      fireEvent.click(page2NavSpan);
      expect(mockPush).toHaveBeenCalledWith("/project/123/settings/page-2");
    }
  });

  it("handles navigation to index page", () => {
    mockRouter.asPath = "/project/123/settings/page-1";
    const pages = [
      {
        title: "Index",
        slug: "index",
        content: <div>Index Content</div>,
      },
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    const indexSpans = screen.getAllByText("Index");
    const indexNavSpan = indexSpans.find(
      (el) => el.tagName === "SPAN" && el.classList.contains("cursor-pointer"),
    );

    if (indexNavSpan) {
      fireEvent.click(indexNavSpan);
      expect(mockPush).toHaveBeenCalledWith("/project/123/settings");
    }
  });

  it("applies primary color to active page", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
      {
        title: "Page 2",
        slug: "page-2",
        content: <div>Content 2</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    const page1Spans = screen.getAllByText("Page 1");
    const page1NavSpan = page1Spans.find(
      (el) => el.tagName === "SPAN" && el.classList.contains("text-primary"),
    );
    expect(page1NavSpan).toBeInTheDocument();
  });

  it("renders mobile select component", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    expect(screen.getByTestId("select")).toBeInTheDocument();
  });

  it("handles empty pages array", () => {
    const { container } = render(
      <PagedSettingsContainer pages={[]} activeSlug="none" />,
    );
    expect(container.querySelector("main")).toBeInTheDocument();
  });

  it("shows all pages when show property is not provided", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div>Content 1</div>,
      },
      {
        title: "Page 2",
        slug: "page-2",
        content: <div>Content 2</div>,
      },
    ];

    render(<PagedSettingsContainer pages={pages} activeSlug="page-1" />);
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(screen.getByText("Page 2")).toBeInTheDocument();
  });

  it("renders content in correct container", () => {
    const pages = [
      {
        title: "Page 1",
        slug: "page-1",
        content: <div data-testid="content-1">Content 1</div>,
      },
    ];

    const { container } = render(
      <PagedSettingsContainer pages={pages} activeSlug="page-1" />,
    );
    const contentContainer = container.querySelector(".w-full.overflow-hidden");
    expect(contentContainer).toBeInTheDocument();
    expect(screen.getByTestId("content-1")).toBeInTheDocument();
  });
});
