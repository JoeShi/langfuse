import { expect, describe, it } from "vitest";
import { removeEmptyEnvVariables } from "../environment";

describe("removeEmptyEnvVariables", () => {
  it("should remove empty string values", () => {
    const env = {
      KEY1: "value1",
      KEY2: "",
      KEY3: "value3",
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY3: "value3",
    });
    expect(result.KEY2).toBeUndefined();
  });

  it("should keep non-empty string values", () => {
    const env = {
      KEY1: "value1",
      KEY2: "value2",
      KEY3: "value3",
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY2: "value2",
      KEY3: "value3",
    });
  });

  it("should handle empty object", () => {
    const env = {};
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({});
  });

  it("should handle object with only empty strings", () => {
    const env = {
      KEY1: "",
      KEY2: "",
      KEY3: "",
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({});
  });

  it("should preserve numeric values", () => {
    const env = {
      KEY1: "value1",
      KEY2: 0,
      KEY3: 123,
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY2: 0,
      KEY3: 123,
    });
  });

  it("should preserve boolean values", () => {
    const env = {
      KEY1: "value1",
      KEY2: false,
      KEY3: true,
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY2: false,
      KEY3: true,
    });
  });

  it("should preserve null and undefined values", () => {
    const env = {
      KEY1: "value1",
      KEY2: null,
      KEY3: undefined,
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY2: null,
      KEY3: undefined,
    });
  });

  it("should handle nested objects", () => {
    const env = {
      KEY1: "value1",
      KEY2: "",
      KEY3: { nested: "value" },
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY3: { nested: "value" },
    });
  });

  it("should mutate the original object", () => {
    const env = {
      KEY1: "value1",
      KEY2: "",
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toBe(env);
    expect(env.KEY2).toBeUndefined();
  });

  it("should handle whitespace-only strings", () => {
    const env = {
      KEY1: "value1",
      KEY2: " ",
      KEY3: "  ",
    };
    const result = removeEmptyEnvVariables(env);
    expect(result).toEqual({
      KEY1: "value1",
      KEY2: " ",
      KEY3: "  ",
    });
  });
});
