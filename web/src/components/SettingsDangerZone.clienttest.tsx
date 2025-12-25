/**
 * Tests for SettingsDangerZone component
 *
 * Run with: pnpm test-client --testPathPattern="SettingsDangerZone"
 */

import { render, screen } from "@testing-library/react";
import { SettingsDangerZone } from "./SettingsDangerZone";

// Mock the Header component
jest.mock("@/src/components/layouts/header", () => {
  return function Header({ title }: { title: string }) {
    return <h2 data-testid="header">{title}</h2>;
  };
});

describe("SettingsDangerZone", () => {
  it("renders the Danger Zone header", () => {
    render(<SettingsDangerZone items={[]} />);
    expect(screen.getByTestId("header")).toHaveTextContent("Danger Zone");
  });

  it("renders empty when no items provided", () => {
    const { container } = render(<SettingsDangerZone items={[]} />);
    const itemsContainer = container.querySelector(".rounded-lg.border");
    expect(itemsContainer?.children.length).toBe(0);
  });

  it("renders single item", () => {
    const items = [
      {
        title: "Delete Item",
        description: "This action cannot be undone",
        button: <button>Delete</button>,
      },
    ];
    render(<SettingsDangerZone items={items} />);
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders multiple items", () => {
    const items = [
      {
        title: "Delete Item 1",
        description: "Description 1",
        button: <button>Delete 1</button>,
      },
      {
        title: "Delete Item 2",
        description: "Description 2",
        button: <button>Delete 2</button>,
      },
      {
        title: "Delete Item 3",
        description: "Description 3",
        button: <button>Delete 3</button>,
      },
    ];
    render(<SettingsDangerZone items={items} />);
    
    expect(screen.getByText("Delete Item 1")).toBeInTheDocument();
    expect(screen.getByText("Delete Item 2")).toBeInTheDocument();
    expect(screen.getByText("Delete Item 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete 3" })).toBeInTheDocument();
  });

  it("renders item titles with correct styling", () => {
    const items = [
      {
        title: "Test Title",
        description: "Test Description",
        button: <button>Action</button>,
      },
    ];
    const { container } = render(<SettingsDangerZone items={items} />);
    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("font-semibold");
    expect(title.tagName).toBe("H4");
  });

  it("renders item descriptions with correct styling", () => {
    const items = [
      {
        title: "Test Title",
        description: "Test Description",
        button: <button>Action</button>,
      },
    ];
    const { container } = render(<SettingsDangerZone items={items} />);
    const description = screen.getByText("Test Description");
    expect(description).toHaveClass("text-sm");
    expect(description.tagName).toBe("P");
  });

  it("renders buttons correctly", () => {
    const mockButton = <button data-testid="custom-button">Custom Action</button>;
    const items = [
      {
        title: "Test",
        description: "Test",
        button: mockButton,
      },
    ];
    render(<SettingsDangerZone items={items} />);
    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
  });

  it("applies border-b to all items except last", () => {
    const items = [
      {
        title: "Item 1",
        description: "Desc 1",
        button: <button>Button 1</button>,
      },
      {
        title: "Item 2",
        description: "Desc 2",
        button: <button>Button 2</button>,
      },
    ];
    const { container } = render(<SettingsDangerZone items={items} />);
    const itemContainers = container.querySelectorAll(".border-b");
    expect(itemContainers.length).toBeGreaterThan(0);
  });

  it("renders complex button components", () => {
    const ComplexButton = () => (
      <div>
        <button data-testid="complex-btn-1">Action 1</button>
        <button data-testid="complex-btn-2">Action 2</button>
      </div>
    );
    const items = [
      {
        title: "Complex Action",
        description: "Multiple buttons",
        button: <ComplexButton />,
      },
    ];
    render(<SettingsDangerZone items={items} />);
    expect(screen.getByTestId("complex-btn-1")).toBeInTheDocument();
    expect(screen.getByTestId("complex-btn-2")).toBeInTheDocument();
  });

  it("handles items with empty strings", () => {
    const items = [
      {
        title: "",
        description: "",
        button: <button>Delete</button>,
      },
    ];
    const { container } = render(<SettingsDangerZone items={items} />);
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders items with long descriptions", () => {
    const longDescription = "This is a very long description ".repeat(10);
    const items = [
      {
        title: "Long Description Item",
        description: longDescription,
        button: <button>Delete</button>,
      },
    ];
    render(<SettingsDangerZone items={items} />);
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it("uses correct key for each item", () => {
    const items = [
      {
        title: "Item 1",
        description: "Desc 1",
        button: <button>Button 1</button>,
      },
      {
        title: "Item 2",
        description: "Desc 2",
        button: <button>Button 2</button>,
      },
    ];
    const { container } = render(<SettingsDangerZone items={items} />);
    const itemDivs = container.querySelectorAll(".flex.items-center.justify-between");
    expect(itemDivs.length).toBe(2);
  });
});
