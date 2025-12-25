/**
 * Tests for createEmptyMessage utility
 *
 * Run with: pnpm test-client --testPathPattern="createEmptyMessage"
 */

import { createEmptyMessage } from "./createEmptyMessage";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

describe("createEmptyMessage", () => {
  it("creates a message with id", () => {
    const message: any = {
      role: "user",
      content: "Hello",
    };
    
    const result = createEmptyMessage(message);
    
    expect(result).toHaveProperty("id");
    expect(result.id).toBe("test-uuid-1234");
  });

  it("preserves all message properties", () => {
    const message: any = {
      role: "assistant",
      content: "Hi there",
      name: "Assistant",
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.role).toBe("assistant");
    expect(result.content).toBe("Hi there");
    expect(result.name).toBe("Assistant");
  });

  it("sets empty string when content is undefined", () => {
    const message: any = {
      role: "user",
      content: undefined,
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.content).toBe("");
  });

  it("sets empty string when content is null", () => {
    const message: any = {
      role: "user",
      content: null,
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.content).toBe("");
  });

  it("preserves non-empty content", () => {
    const message: any = {
      role: "user",
      content: "Test message",
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.content).toBe("Test message");
  });

  it("handles messages with tool_calls", () => {
    const message: any = {
      role: "assistant",
      content: "Using tool",
      tool_calls: [
        {
          id: "call_123",
          type: "function",
          function: {
            name: "get_weather",
            arguments: '{"location": "NYC"}',
          },
        },
      ],
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.tool_calls).toEqual(message.tool_calls);
  });

  it("handles system role messages", () => {
    const message: any = {
      role: "system",
      content: "You are a helpful assistant",
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.role).toBe("system");
    expect(result.content).toBe("You are a helpful assistant");
  });

  it("handles tool role messages", () => {
    const message: any = {
      role: "tool",
      content: "Tool result",
      tool_call_id: "call_123",
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.role).toBe("tool");
    expect(result.tool_call_id).toBe("call_123");
  });

  it("preserves function_call property", () => {
    const message: any = {
      role: "assistant",
      content: "",
      function_call: {
        name: "get_weather",
        arguments: '{"location": "NYC"}',
      },
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.function_call).toEqual(message.function_call);
  });

  it("handles empty content string", () => {
    const message: any = {
      role: "user",
      content: "",
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.content).toBe("");
  });

  it("generates unique id for each call", () => {
    const mockUuid = require("uuid");
    mockUuid.v4
      .mockReturnValueOnce("uuid-1")
      .mockReturnValueOnce("uuid-2");
    
    const message1: any = { role: "user", content: "Message 1" };
    const message2: any = { role: "user", content: "Message 2" };
    
    const result1 = createEmptyMessage(message1);
    const result2 = createEmptyMessage(message2);
    
    expect(result1.id).toBe("uuid-1");
    expect(result2.id).toBe("uuid-2");
  });

  it("handles messages with additional properties", () => {
    const message: any = {
      role: "user",
      content: "Hello",
      customProp: "custom value",
      metadata: { key: "value" },
    };
    
    const result = createEmptyMessage(message);
    
    expect(result.customProp).toBe("custom value");
    expect(result.metadata).toEqual({ key: "value" });
  });
});
