import { describe, it, expect } from "vitest";
import { isPresent, stringDateTime } from "../typeChecks";

describe("typeChecks", () => {
  describe("isPresent", () => {
    describe("null/undefined checks", () => {
      it("should return false for null", () => {
        // Arrange
        const value = null;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(false);
      });

      it("should return false for undefined", () => {
        // Arrange
        const value = undefined;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(false);
      });

      it("should return false for explicitly undefined variable", () => {
        // Arrange
        let value: string | undefined = undefined;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("empty string checks", () => {
      it("should return false for empty string", () => {
        // Arrange
        const value = "";

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(false);
      });

      it("should return true for whitespace-only string", () => {
        // Arrange
        const value = " ";

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for string with content", () => {
        // Arrange
        const value = "hello";

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe("type guard functionality", () => {
      it("should narrow type from T | null | undefined to T", () => {
        // Arrange
        const value: string | null | undefined = "hello";

        // Act
        if (isPresent(value)) {
          // Assert - TypeScript should know value is string here
          const length: number = value.length;
          expect(length).toBe(5);
        }
      });

      it("should work with string type", () => {
        // Arrange
        const value: string | null = "test";

        // Act & Assert
        if (isPresent(value)) {
          expect(value.toUpperCase()).toBe("TEST");
        }
      });

      it("should work with number type", () => {
        // Arrange
        const value: number | null | undefined = 42;

        // Act & Assert
        if (isPresent(value)) {
          expect(value * 2).toBe(84);
        }
      });

      it("should work with boolean type", () => {
        // Arrange
        const value: boolean | null = true;

        // Act & Assert
        if (isPresent(value)) {
          expect(value).toBe(true);
        }
      });

      it("should work with object type", () => {
        // Arrange
        const value: { name: string } | null = { name: "John" };

        // Act & Assert
        if (isPresent(value)) {
          expect(value.name).toBe("John");
        }
      });

      it("should work with array type", () => {
        // Arrange
        const value: number[] | null | undefined = [1, 2, 3];

        // Act & Assert
        if (isPresent(value)) {
          expect(value.length).toBe(3);
        }
      });
    });

    describe("truthy/falsy values", () => {
      it("should return true for number 0", () => {
        // Arrange
        const value = 0;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for negative numbers", () => {
        // Arrange
        const value = -1;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for false boolean", () => {
        // Arrange
        const value = false;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for true boolean", () => {
        // Arrange
        const value = true;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for NaN", () => {
        // Arrange
        const value = NaN;

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for empty array", () => {
        // Arrange
        const value: unknown[] = [];

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should return true for empty object", () => {
        // Arrange
        const value = {};

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle optional chaining with null", () => {
        // Arrange
        const obj: { value?: string } | null = null;

        // Act
        const result = isPresent(obj?.value);

        // Assert
        expect(result).toBe(false);
      });

      it("should handle optional chaining with undefined property", () => {
        // Arrange
        const obj: { value?: string } = {};

        // Act
        const result = isPresent(obj.value);

        // Assert
        expect(result).toBe(false);
      });

      it("should handle optional chaining with defined property", () => {
        // Arrange
        const obj: { value?: string } = { value: "test" };

        // Act
        const result = isPresent(obj.value);

        // Assert
        expect(result).toBe(true);
      });

      it("should work in filter operations", () => {
        // Arrange
        const array: (string | null | undefined)[] = [
          "a",
          null,
          "b",
          undefined,
          "",
          "c",
        ];

        // Act
        const filtered = array.filter(isPresent);

        // Assert
        expect(filtered).toEqual(["a", "b", "c"]);
        expect(filtered.length).toBe(3);
      });

      it("should handle Date objects", () => {
        // Arrange
        const value = new Date();

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle functions", () => {
        // Arrange
        const value = () => "test";

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });

      it("should handle symbols", () => {
        // Arrange
        const value = Symbol("test");

        // Act
        const result = isPresent(value);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe("complex types", () => {
      it("should work with union types", () => {
        // Arrange
        const value: string | number | null = "test";

        // Act & Assert
        if (isPresent(value)) {
          expect(typeof value === "string" || typeof value === "number").toBe(
            true,
          );
        }
      });

      it("should work with nested optional types", () => {
        // Arrange
        interface User {
          name?: string | null;
        }
        const user: User = { name: "John" };

        // Act & Assert
        if (isPresent(user.name)) {
          expect(user.name.toUpperCase()).toBe("JOHN");
        }
      });

      it("should work with generic types", () => {
        // Arrange
        function getValue<T>(value: T | null | undefined): T | undefined {
          return isPresent(value) ? value : undefined;
        }

        // Act & Assert
        expect(getValue("test")).toBe("test");
        expect(getValue(null)).toBeUndefined();
        expect(getValue(undefined)).toBeUndefined();
      });
    });

    describe("real-world usage patterns", () => {
      it("should filter out null/undefined from arrays", () => {
        // Arrange
        const data = [1, null, 2, undefined, 3, "", 4];

        // Act
        const cleaned = data.filter(isPresent);

        // Assert
        expect(cleaned).toEqual([1, 2, 3, 4]);
      });

      it("should validate optional form fields", () => {
        // Arrange
        interface FormData {
          email?: string | null;
          phone?: string | null;
        }
        const form: FormData = { email: "test@example.com", phone: null };

        // Act & Assert
        expect(isPresent(form.email)).toBe(true);
        expect(isPresent(form.phone)).toBe(false);
      });

      it("should check API response data", () => {
        // Arrange
        interface ApiResponse {
          data?: { id: string } | null;
        }
        const response: ApiResponse = { data: { id: "123" } };

        // Act & Assert
        if (isPresent(response.data)) {
          expect(response.data.id).toBe("123");
        }
      });

      it("should validate query parameters", () => {
        // Arrange
        const params: Record<string, string | undefined> = {
          page: "1",
          limit: "10",
          filter: undefined,
          search: "",
        };

        // Act
        const validParams = Object.entries(params)
          .filter(([_, value]) => isPresent(value))
          .reduce(
            (acc, [key, value]) => ({ ...acc, [key]: value }),
            {} as Record<string, string>,
          );

        // Assert
        expect(validParams).toEqual({ page: "1", limit: "10" });
      });
    });
  });

  describe("stringDateTime", () => {
    describe("valid datetime strings", () => {
      it("should validate ISO 8601 datetime with UTC offset", () => {
        // Arrange
        const value = "2024-01-15T10:30:00Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      });

      it("should validate datetime with positive timezone offset", () => {
        // Arrange
        const value = "2024-01-15T10:30:00+05:30";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate datetime with negative timezone offset", () => {
        // Arrange
        const value = "2024-01-15T10:30:00-08:00";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate datetime with milliseconds", () => {
        // Arrange
        const value = "2024-01-15T10:30:00.123Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate datetime with microseconds", () => {
        // Arrange
        const value = "2024-01-15T10:30:00.123456Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("invalid datetime strings", () => {
      it("should reject datetime without timezone offset", () => {
        // Arrange
        const value = "2024-01-15T10:30:00";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(false);
      });

      it("should reject invalid date format", () => {
        // Arrange
        const value = "15-01-2024 10:30:00Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(false);
      });

      it("should reject non-datetime string", () => {
        // Arrange
        const value = "not a datetime";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(false);
      });

      it("should reject number", () => {
        // Arrange
        const value = 1234567890;

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(false);
      });

      it("should reject empty string", () => {
        // Arrange
        const value = "";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(false);
      });
    });

    describe("nullish values", () => {
      it("should accept null", () => {
        // Arrange
        const value = null;

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeNull();
        }
      });

      it("should accept undefined", () => {
        // Arrange
        const value = undefined;

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeUndefined();
        }
      });

      it("should accept missing value", () => {
        // Arrange & Act
        const result = stringDateTime.safeParse(undefined);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should validate leap year date", () => {
        // Arrange
        const value = "2024-02-29T00:00:00Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate end of year datetime", () => {
        // Arrange
        const value = "2024-12-31T23:59:59Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate start of year datetime", () => {
        // Arrange
        const value = "2024-01-01T00:00:00Z";

        // Act
        const result = stringDateTime.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should handle various timezone formats", () => {
        // Arrange
        const values = [
          "2024-01-15T10:30:00Z",
          "2024-01-15T10:30:00+00:00",
          "2024-01-15T10:30:00-00:00",
        ];

        // Act & Assert
        values.forEach((value) => {
          const result = stringDateTime.safeParse(value);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("schema usage in objects", () => {
      it("should work in object schema", () => {
        // Arrange
        const schema = stringDateTime;
        const value = "2024-01-15T10:30:00Z";

        // Act
        const result = schema.safeParse(value);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should work with parse method", () => {
        // Arrange
        const value = "2024-01-15T10:30:00Z";

        // Act & Assert
        expect(() => stringDateTime.parse(value)).not.toThrow();
        const parsed = stringDateTime.parse(value);
        expect(parsed).toBe(value);
      });

      it("should throw on invalid parse", () => {
        // Arrange
        const value = "invalid";

        // Act & Assert
        expect(() => stringDateTime.parse(value)).toThrow();
      });
    });

    describe("real-world scenarios", () => {
      it("should validate API timestamp", () => {
        // Arrange
        const timestamp = new Date().toISOString();

        // Act
        const result = stringDateTime.safeParse(timestamp);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate database timestamp", () => {
        // Arrange
        const timestamp = "2024-01-15T10:30:00.000Z";

        // Act
        const result = stringDateTime.safeParse(timestamp);

        // Assert
        expect(result.success).toBe(true);
      });

      it("should validate optional timestamp field", () => {
        // Arrange
        interface Event {
          createdAt: string | null | undefined;
        }
        const event1: Event = { createdAt: "2024-01-15T10:30:00Z" };
        const event2: Event = { createdAt: null };
        const event3: Event = { createdAt: undefined };

        // Act & Assert
        expect(stringDateTime.safeParse(event1.createdAt).success).toBe(true);
        expect(stringDateTime.safeParse(event2.createdAt).success).toBe(true);
        expect(stringDateTime.safeParse(event3.createdAt).success).toBe(true);
      });
    });
  });
});
