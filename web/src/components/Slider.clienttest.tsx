/**
 * Tests for Slider component
 *
 * Run with: pnpm test-client --testPathPattern="Slider"
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("renders with default props", () => {
    render(<Slider disabled={false} />);
    const slider = screen.getByRole("switch");
    expect(slider).toBeInTheDocument();
  });

  it("renders as unchecked when isChecked is false", () => {
    render(<Slider disabled={false} isChecked={false} />);
    const slider = screen.getByRole("switch");
    expect(slider).not.toBeChecked();
  });

  it("renders as checked when isChecked is true", () => {
    render(<Slider disabled={false} isChecked={true} />);
    const slider = screen.getByRole("switch");
    expect(slider).toBeChecked();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Slider disabled={true} />);
    const slider = screen.getByRole("switch");
    expect(slider).toBeDisabled();
  });

  it("is disabled when loading is true", () => {
    render(<Slider disabled={false} loading={true} />);
    const slider = screen.getByRole("switch");
    expect(slider).toBeDisabled();
  });

  it("is disabled when both disabled and loading are true", () => {
    render(<Slider disabled={true} loading={true} />);
    const slider = screen.getByRole("switch");
    expect(slider).toBeDisabled();
  });

  it("calls onChecked when clicked", () => {
    const onChecked = jest.fn();
    render(<Slider disabled={false} onChecked={onChecked} isChecked={false} />);
    const slider = screen.getByRole("switch");
    fireEvent.click(slider);
    expect(onChecked).toHaveBeenCalledWith(true);
  });

  it("does not call onChecked when disabled", () => {
    const onChecked = jest.fn();
    render(<Slider disabled={true} onChecked={onChecked} />);
    const slider = screen.getByRole("switch");
    fireEvent.click(slider);
    expect(onChecked).not.toHaveBeenCalled();
  });

  it("does not call onChecked when loading", () => {
    const onChecked = jest.fn();
    render(<Slider disabled={false} loading={true} onChecked={onChecked} />);
    const slider = screen.getByRole("switch");
    fireEvent.click(slider);
    expect(onChecked).not.toHaveBeenCalled();
  });

  it("toggles from checked to unchecked", () => {
    const onChecked = jest.fn();
    render(<Slider disabled={false} onChecked={onChecked} isChecked={true} />);
    const slider = screen.getByRole("switch");
    fireEvent.click(slider);
    expect(onChecked).toHaveBeenCalledWith(false);
  });

  it("renders screen reader text", () => {
    render(<Slider disabled={false} />);
    const srText = screen.getByText("Use setting");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");
  });

  it("applies correct background color when checked", () => {
    const { container } = render(<Slider disabled={false} isChecked={true} />);
    const slider = container.querySelector("button");
    expect(slider).toHaveClass("bg-background");
  });

  it("applies correct background color when unchecked", () => {
    const { container } = render(<Slider disabled={false} isChecked={false} />);
    const slider = container.querySelector("button");
    expect(slider).toHaveClass("bg-input");
  });
});
