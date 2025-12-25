/**
 * Tests for Header components
 *
 * Run with: pnpm test-client --testPathPattern="header"
 */

import { render, screen } from "@testing-library/react";
import Header, { SubHeader, SubHeaderLabel } from "./header";

// Mock dependencies
jest.mock("next/link", () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/src/components/layouts/doc-popup", () => {
  return function DocPopup({ description, href, className }: any) {
    return (
      <div data-testid="doc-popup" className={className}>
        {description}
        {href && <a href={href}>Link</a>}
      </div>
    );
  };
});

jest.mock("./status-badge", () => ({
  StatusBadge: ({ type }: any) => (
    <div data-testid={`status-badge-${type}`}>{type}</div>
  ),
}));

describe("Header", () => {
  it("renders with title", () => {
    render(<Header title="Test Header" />);
    expect(screen.getByText("Test Header")).toBeInTheDocument();
  });

  it("renders as h3 element", () => {
    render(<Header title="Test Header" />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Header");
  });

  it("applies correct styles to h3", () => {
    render(<Header title="Test Header" />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveClass("text-xl", "font-bold", "leading-7");
  });

  it("renders status badge when provided", () => {
    render(<Header title="Test Header" status="beta" />);
    expect(screen.getByTestId("status-badge-beta")).toBeInTheDocument();
  });

  it("renders label with link when provided", () => {
    render(<Header title="Test Header" label={{ text: "v1.0", href: "/version" }} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/version");
    expect(screen.getByTestId("status-badge-v1.0")).toBeInTheDocument();
  });

  it("renders help popup when provided", () => {
    render(
      <Header
        title="Test Header"
        help={{ description: "Help text", href: "https://docs.example.com" }}
      />,
    );
    expect(screen.getByTestId("doc-popup")).toBeInTheDocument();
    expect(screen.getByText("Help text")).toBeInTheDocument();
  });

  it("renders action buttons when provided", () => {
    const actionButtons = <button>Action</button>;
    render(<Header title="Test Header" actionButtons={actionButtons} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Header title="Test Header" className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("applies mb-2 margin for h3 headers", () => {
    const { container } = render(<Header title="Test Header" />);
    const wrapper = container.querySelector(".mb-2");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders without status badge by default", () => {
    render(<Header title="Test Header" />);
    expect(screen.queryByTestId(/status-badge/)).not.toBeInTheDocument();
  });

  it("renders without label by default", () => {
    render(<Header title="Test Header" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders without help popup by default", () => {
    render(<Header title="Test Header" />);
    expect(screen.queryByTestId("doc-popup")).not.toBeInTheDocument();
  });

  it("renders without action buttons by default", () => {
    render(<Header title="Test Header" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("passes className to help popup", () => {
    render(
      <Header
        title="Test Header"
        help={{
          description: "Help",
          href: "/help",
          className: "help-custom-class",
        }}
      />,
    );
    const popup = screen.getByTestId("doc-popup");
    expect(popup).toHaveClass("help-custom-class");
  });

  it("renders all props together", () => {
    render(
      <Header
        title="Test Header"
        status="beta"
        label={{ text: "v1.0", href: "/version" }}
        help={{ description: "Help text" }}
        actionButtons={<button>Action</button>}
        className="custom-class"
      />,
    );
    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-beta")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge-v1.0")).toBeInTheDocument();
    expect(screen.getByTestId("doc-popup")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});

describe("SubHeader", () => {
  it("renders with title", () => {
    render(<SubHeader title="Sub Header" />);
    expect(screen.getByText("Sub Header")).toBeInTheDocument();
  });

  it("renders as h4 element", () => {
    render(<SubHeader title="Sub Header" />);
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Sub Header");
  });

  it("applies correct styles to h4", () => {
    render(<SubHeader title="Sub Header" />);
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toHaveClass("text-lg", "font-medium", "leading-6");
  });

  it("does not apply mb-2 margin", () => {
    const { container } = render(<SubHeader title="Sub Header" />);
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass("mb-2");
  });

  it("renders status badge", () => {
    render(<SubHeader title="Sub Header" status="beta" />);
    expect(screen.getByTestId("status-badge-beta")).toBeInTheDocument();
  });

  it("renders with all props", () => {
    render(
      <SubHeader
        title="Sub Header"
        status="beta"
        label={{ text: "v1.0", href: "/version" }}
        help={{ description: "Help text" }}
        actionButtons={<button>Action</button>}
        className="custom-class"
      />,
    );
    expect(screen.getByText("Sub Header")).toBeInTheDocument();
  });
});

describe("SubHeaderLabel", () => {
  it("renders with title", () => {
    render(<SubHeaderLabel title="Sub Label" />);
    expect(screen.getByText("Sub Label")).toBeInTheDocument();
  });

  it("renders as h5 element", () => {
    render(<SubHeaderLabel title="Sub Label" />);
    const heading = screen.getByRole("heading", { level: 5 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Sub Label");
  });

  it("applies correct styles to h5", () => {
    render(<SubHeaderLabel title="Sub Label" />);
    const heading = screen.getByRole("heading", { level: 5 });
    expect(heading).toHaveClass("text-base", "font-medium", "leading-6");
  });

  it("does not apply mb-2 margin", () => {
    const { container } = render(<SubHeaderLabel title="Sub Label" />);
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass("mb-2");
  });

  it("renders status badge", () => {
    render(<SubHeaderLabel title="Sub Label" status="beta" />);
    expect(screen.getByTestId("status-badge-beta")).toBeInTheDocument();
  });

  it("renders with all props", () => {
    render(
      <SubHeaderLabel
        title="Sub Label"
        status="beta"
        label={{ text: "v1.0", href: "/version" }}
        help={{ description: "Help text" }}
        actionButtons={<button>Action</button>}
        className="custom-class"
      />,
    );
    expect(screen.getByText("Sub Label")).toBeInTheDocument();
  });
});

describe("Header Variants Comparison", () => {
  it("Header has larger text than SubHeader", () => {
    const { rerender } = render(<Header title="Title" />);
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3).toHaveClass("text-xl");

    rerender(<SubHeader title="Title" />);
    const h4 = screen.getByRole("heading", { level: 4 });
    expect(h4).toHaveClass("text-lg");
  });

  it("Header has bold font, SubHeader has medium font", () => {
    const { rerender } = render(<Header title="Title" />);
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3).toHaveClass("font-bold");

    rerender(<SubHeader title="Title" />);
    const h4 = screen.getByRole("heading", { level: 4 });
    expect(h4).toHaveClass("font-medium");
  });

  it("only Header applies bottom margin", () => {
    const { rerender, container } = render(<Header title="Title" />);
    expect(container.querySelector(".mb-2")).toBeInTheDocument();

    rerender(<SubHeader title="Title" />);
    expect(container.querySelector(".mb-2")).not.toBeInTheDocument();

    rerender(<SubHeaderLabel title="Title" />);
    expect(container.querySelector(".mb-2")).not.toBeInTheDocument();
  });
});
