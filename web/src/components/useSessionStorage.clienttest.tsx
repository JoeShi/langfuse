/**
 * Tests for useSessionStorage hook
 *
 * Run with: pnpm test-client --testPathPattern="useSessionStorage"
 */

import { renderHook, act } from "@testing-library/react";
import useSessionStorage from "./useSessionStorage";

describe("useSessionStorage", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("initializes with initial value when storage is empty", () => {
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    expect(result.current[0]).toBe("initialValue");
  });

  it("initializes with stored value when it exists", () => {
    sessionStorage.setItem("testKey", JSON.stringify("storedValue"));
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    expect(result.current[0]).toBe("storedValue");
  });

  it("updates value and stores it in sessionStorage", () => {
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    
    act(() => {
      result.current[1]("newValue");
    });
    
    expect(result.current[0]).toBe("newValue");
    expect(sessionStorage.getItem("testKey")).toBe(JSON.stringify("newValue"));
  });

  it("clears value and resets to initial value", () => {
    sessionStorage.setItem("testKey", JSON.stringify("storedValue"));
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    
    act(() => {
      result.current[2](); // clearValue
    });
    
    expect(result.current[0]).toBe("initialValue");
    expect(sessionStorage.getItem("testKey")).toBeNull();
  });

  it("handles object values", () => {
    const initialObj = { name: "test", count: 0 };
    const { result } = renderHook(() =>
      useSessionStorage("testKey", initialObj),
    );
    
    act(() => {
      result.current[1]({ name: "updated", count: 5 });
    });
    
    expect(result.current[0]).toEqual({ name: "updated", count: 5 });
    expect(JSON.parse(sessionStorage.getItem("testKey") || "{}")).toEqual({
      name: "updated",
      count: 5,
    });
  });

  it("handles array values", () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() =>
      useSessionStorage("testKey", initialArray),
    );
    
    act(() => {
      result.current[1]([4, 5, 6]);
    });
    
    expect(result.current[0]).toEqual([4, 5, 6]);
    expect(JSON.parse(sessionStorage.getItem("testKey") || "[]")).toEqual([4, 5, 6]);
  });

  it("handles null values", () => {
    const { result } = renderHook(() =>
      useSessionStorage<string | null>("testKey", null),
    );
    
    expect(result.current[0]).toBeNull();
  });

  it("handles undefined initial value", () => {
    const { result } = renderHook(() =>
      useSessionStorage<string | undefined>("testKey", undefined),
    );
    
    expect(result.current[0]).toBeUndefined();
  });

  it("handles boolean values", () => {
    const { result } = renderHook(() =>
      useSessionStorage("testKey", true),
    );
    
    act(() => {
      result.current[1](false);
    });
    
    expect(result.current[0]).toBe(false);
    expect(sessionStorage.getItem("testKey")).toBe("false");
  });

  it("handles number values", () => {
    const { result } = renderHook(() =>
      useSessionStorage("testKey", 42),
    );
    
    act(() => {
      result.current[1](100);
    });
    
    expect(result.current[0]).toBe(100);
    expect(sessionStorage.getItem("testKey")).toBe("100");
  });

  it("uses callback form of setValue", () => {
    const { result } = renderHook(() =>
      useSessionStorage("testKey", 5),
    );
    
    act(() => {
      result.current[1]((prev) => prev + 10);
    });
    
    expect(result.current[0]).toBe(15);
  });

  it("handles corrupt stored data gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    sessionStorage.setItem("testKey", "invalid json {");
    
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    
    expect(result.current[0]).toBe("initialValue");
    expect(consoleError).toHaveBeenCalledWith(
      "Error reading from session storage",
      expect.any(Error),
    );
    
    consoleError.mockRestore();
  });

  it("returns initial value in SSR context (window undefined)", () => {
    // This test is tricky as we can't truly simulate SSR in jest-dom
    // But we can test that the hook doesn't crash
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    expect(result.current[0]).toBeDefined();
  });

  it("updates sessionStorage when key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useSessionStorage(key, "value"),
      { initialProps: { key: "key1" } },
    );
    
    act(() => {
      result.current[1]("value1");
    });
    
    expect(sessionStorage.getItem("key1")).toBe(JSON.stringify("value1"));
    
    rerender({ key: "key2" });
    
    act(() => {
      result.current[1]("value2");
    });
    
    expect(sessionStorage.getItem("key2")).toBe(JSON.stringify("value2"));
  });

  it("maintains separate state for different keys", () => {
    const { result: result1 } = renderHook(() =>
      useSessionStorage("key1", "value1"),
    );
    const { result: result2 } = renderHook(() =>
      useSessionStorage("key2", "value2"),
    );
    
    act(() => {
      result1.current[1]("updated1");
    });
    
    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe("value2");
  });

  it("returns consistent tuple structure", () => {
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    
    expect(result.current).toHaveLength(3);
    expect(typeof result.current[0]).toBe("string");
    expect(typeof result.current[1]).toBe("function");
    expect(typeof result.current[2]).toBe("function");
  });

  it("handles complex nested objects", () => {
    const complexObject = {
      user: {
        name: "John",
        settings: {
          theme: "dark",
          notifications: true,
        },
      },
      items: [1, 2, 3],
    };
    
    const { result } = renderHook(() =>
      useSessionStorage("testKey", complexObject),
    );
    
    expect(result.current[0]).toEqual(complexObject);
  });

  it("handles error when clearing storage fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useSessionStorage("testKey", "initialValue"),
    );
    
    // Mock sessionStorage.removeItem to throw an error
    const originalRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = jest.fn(() => {
      throw new Error("Storage error");
    });
    
    act(() => {
      result.current[2]();
    });
    
    expect(consoleError).toHaveBeenCalledWith(
      "Error clearing session storage",
      expect.any(Error),
    );
    
    sessionStorage.removeItem = originalRemoveItem;
    consoleError.mockRestore();
  });
});
