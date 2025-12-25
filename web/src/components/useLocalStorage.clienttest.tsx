/**
 * Tests for useLocalStorage hook
 *
 * Run with: pnpm test-client --testPathPattern="useLocalStorage"
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import useLocalStorage from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes with initial value when storage is empty", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    expect(result.current[0]).toBe("initialValue");
  });

  it("initializes with stored value when it exists", () => {
    localStorage.setItem("testKey", JSON.stringify("storedValue"));
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    expect(result.current[0]).toBe("storedValue");
  });

  it("updates value and stores it in localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    act(() => {
      result.current[1]("newValue");
    });
    
    expect(result.current[0]).toBe("newValue");
    expect(localStorage.getItem("testKey")).toBe(JSON.stringify("newValue"));
  });

  it("clears value and resets to initial value", () => {
    localStorage.setItem("testKey", JSON.stringify("storedValue"));
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    act(() => {
      result.current[2](); // clearValue
    });
    
    expect(result.current[0]).toBe("initialValue");
    expect(localStorage.getItem("testKey")).toBeNull();
  });

  it("handles object values", () => {
    const initialObj = { name: "test", count: 0 };
    const { result } = renderHook(() =>
      useLocalStorage("testKey", initialObj),
    );
    
    act(() => {
      result.current[1]({ name: "updated", count: 5 });
    });
    
    expect(result.current[0]).toEqual({ name: "updated", count: 5 });
    expect(JSON.parse(localStorage.getItem("testKey") || "{}")).toEqual({
      name: "updated",
      count: 5,
    });
  });

  it("handles array values", () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() =>
      useLocalStorage("testKey", initialArray),
    );
    
    act(() => {
      result.current[1]([4, 5, 6]);
    });
    
    expect(result.current[0]).toEqual([4, 5, 6]);
    expect(JSON.parse(localStorage.getItem("testKey") || "[]")).toEqual([4, 5, 6]);
  });

  it("handles null values", () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | null>("testKey", null),
    );
    
    expect(result.current[0]).toBeNull();
  });

  it("handles undefined initial value", () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | undefined>("testKey", undefined),
    );
    
    expect(result.current[0]).toBeUndefined();
  });

  it("handles boolean values", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", true),
    );
    
    act(() => {
      result.current[1](false);
    });
    
    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem("testKey")).toBe("false");
  });

  it("handles number values", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", 42),
    );
    
    act(() => {
      result.current[1](100);
    });
    
    expect(result.current[0]).toBe(100);
    expect(localStorage.getItem("testKey")).toBe("100");
  });

  it("uses callback form of setValue", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", 5),
    );
    
    act(() => {
      result.current[1]((prev) => prev + 10);
    });
    
    expect(result.current[0]).toBe(15);
  });

  it("handles corrupt stored data gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    localStorage.setItem("testKey", "invalid json {");
    
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    expect(result.current[0]).toBe("initialValue");
    expect(consoleError).toHaveBeenCalledWith(
      "Error reading from local storage",
      expect.any(Error),
    );
    
    consoleError.mockRestore();
  });

  it("dispatches custom event when value is updated", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    const eventListener = jest.fn();
    window.addEventListener("localStorageChange", eventListener);
    
    act(() => {
      result.current[1]("newValue");
    });
    
    expect(eventListener).toHaveBeenCalled();
    window.removeEventListener("localStorageChange", eventListener);
  });

  it("listens to storage events from other tabs", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "testKey",
        newValue: JSON.stringify("valueFromOtherTab"),
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current[0]).toBe("valueFromOtherTab");
  });

  it("listens to custom events within same tab", () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    act(() => {
      result1.current[1]("syncedValue");
    });
    
    // Both hooks should have the same value
    expect(result1.current[0]).toBe("syncedValue");
    expect(result2.current[0]).toBe("syncedValue");
  });

  it("ignores storage events for different keys", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "differentKey",
        newValue: JSON.stringify("otherValue"),
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current[0]).toBe("initialValue");
  });

  it("updates localStorage when key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, "value"),
      { initialProps: { key: "key1" } },
    );
    
    act(() => {
      result.current[1]("value1");
    });
    
    expect(localStorage.getItem("key1")).toBe(JSON.stringify("value1"));
    
    rerender({ key: "key2" });
    
    act(() => {
      result.current[1]("value2");
    });
    
    expect(localStorage.getItem("key2")).toBe(JSON.stringify("value2"));
  });

  it("maintains separate state for different keys", () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage("key1", "value1"),
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("key2", "value2"),
    );
    
    act(() => {
      result1.current[1]("updated1");
    });
    
    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe("value2");
  });

  it("returns consistent tuple structure", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
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
      useLocalStorage("testKey", complexObject),
    );
    
    expect(result.current[0]).toEqual(complexObject);
  });

  it("handles error when clearing storage fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = jest.fn(() => {
      throw new Error("Storage error");
    });
    
    act(() => {
      result.current[2]();
    });
    
    expect(consoleError).toHaveBeenCalledWith(
      "Error clearing local storage",
      expect.any(Error),
    );
    
    localStorage.removeItem = originalRemoveItem;
    consoleError.mockRestore();
  });

  it("handles error when setting value fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error("Storage error");
    });
    
    act(() => {
      result.current[1]("newValue");
    });
    
    expect(consoleError).toHaveBeenCalledWith(
      "Error writing to local storage",
      expect.any(Error),
    );
    
    localStorage.setItem = originalSetItem;
    consoleError.mockRestore();
  });

  it("resets to initial value when storage event has null newValue", () => {
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    act(() => {
      result.current[1]("changedValue");
    });
    
    expect(result.current[0]).toBe("changedValue");
    
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "testKey",
        newValue: null,
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current[0]).toBe("initialValue");
  });

  it("handles parse error in storage event gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useLocalStorage("testKey", "initialValue"),
    );
    
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "testKey",
        newValue: "invalid json {",
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });
    
    expect(consoleError).toHaveBeenCalledWith(
      "Error parsing storage change",
      expect.any(Error),
    );
    
    consoleError.mockRestore();
  });
});
