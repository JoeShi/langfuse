import { describe, it, expect } from "vitest";
import {
  BaseError,
  ApiError,
  LangfuseNotFoundError,
  InvalidRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  NotImplementedError,
  MethodNotAllowedError,
  ServiceUnavailableError,
} from "../errors";

describe("error classes", () => {
  describe("BaseError", () => {
    it("should create an error with all properties", () => {
      const error = new BaseError(
        "TestError",
        400,
        "Test description",
        true,
      );
      expect(error.name).toBe("TestError");
      expect(error.httpCode).toBe(400);
      expect(error.message).toBe("Test description");
      expect(error.isOperational).toBe(true);
    });

    it("should be an instance of Error", () => {
      const error = new BaseError("TestError", 400, "Test", true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
    });

    it("should have a stack trace", () => {
      const error = new BaseError("TestError", 400, "Test", true);
      expect(error.stack).toBeDefined();
    });

    it("should handle non-operational errors", () => {
      const error = new BaseError("CriticalError", 500, "Critical", false);
      expect(error.isOperational).toBe(false);
    });

    it("should be throwable", () => {
      expect(() => {
        throw new BaseError("TestError", 400, "Test", true);
      }).toThrow(BaseError);
    });

    it("should preserve error message", () => {
      const message = "Custom error message";
      const error = new BaseError("TestError", 400, message, true);
      expect(error.message).toBe(message);
    });
  });

  describe("ApiError", () => {
    it("should create an ApiError with default values", () => {
      const error = new ApiError();
      expect(error.name).toBe("ApiError");
      expect(error.httpCode).toBe(500);
      expect(error.message).toBe("Api call failed");
      expect(error.isOperational).toBe(true);
    });

    it("should create an ApiError with custom description", () => {
      const error = new ApiError("Custom API error");
      expect(error.message).toBe("Custom API error");
      expect(error.httpCode).toBe(500);
    });

    it("should create an ApiError with custom status", () => {
      const error = new ApiError("Error", 502);
      expect(error.httpCode).toBe(502);
      expect(error.message).toBe("Error");
    });

    it("should be an instance of BaseError", () => {
      const error = new ApiError();
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("LangfuseNotFoundError", () => {
    it("should create a NotFoundError with default message", () => {
      const error = new LangfuseNotFoundError();
      expect(error.name).toBe("LangfuseNotFoundError");
      expect(error.httpCode).toBe(404);
      expect(error.message).toBe("Not Found");
      expect(error.isOperational).toBe(true);
    });

    it("should create a NotFoundError with custom message", () => {
      const error = new LangfuseNotFoundError("Resource not found");
      expect(error.message).toBe("Resource not found");
      expect(error.httpCode).toBe(404);
    });

    it("should be an instance of BaseError", () => {
      const error = new LangfuseNotFoundError();
      expect(error).toBeInstanceOf(BaseError);
    });
  });

  describe("InvalidRequestError", () => {
    it("should create an InvalidRequestError with default message", () => {
      const error = new InvalidRequestError();
      expect(error.httpCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it("should create an InvalidRequestError with custom message", () => {
      const error = new InvalidRequestError("Invalid input data");
      expect(error.message).toBe("Invalid input data");
    });
  });

  describe("UnauthorizedError", () => {
    it("should create an UnauthorizedError with default message", () => {
      const error = new UnauthorizedError();
      expect(error.httpCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it("should create an UnauthorizedError with custom message", () => {
      const error = new UnauthorizedError("Invalid credentials");
      expect(error.message).toBe("Invalid credentials");
    });
  });

  describe("ForbiddenError", () => {
    it("should create a ForbiddenError with default message", () => {
      const error = new ForbiddenError();
      expect(error.httpCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it("should create a ForbiddenError with custom message", () => {
      const error = new ForbiddenError("Access denied");
      expect(error.message).toBe("Access denied");
    });
  });

  describe("ConflictError", () => {
    it("should create a ConflictError with default message", () => {
      const error = new ConflictError();
      expect(error.httpCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });

    it("should create a ConflictError with custom message", () => {
      const error = new ConflictError("Resource already exists");
      expect(error.message).toBe("Resource already exists");
    });
  });

  describe("InternalServerError", () => {
    it("should create an InternalServerError with default message", () => {
      const error = new InternalServerError();
      expect(error.httpCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it("should create an InternalServerError with custom message", () => {
      const error = new InternalServerError("Server crashed");
      expect(error.message).toBe("Server crashed");
    });
  });

  describe("NotImplementedError", () => {
    it("should create a NotImplementedError with default message", () => {
      const error = new NotImplementedError();
      expect(error.httpCode).toBe(501);
      expect(error.isOperational).toBe(true);
    });

    it("should create a NotImplementedError with custom message", () => {
      const error = new NotImplementedError("Feature not available");
      expect(error.message).toBe("Feature not available");
    });
  });

  describe("MethodNotAllowedError", () => {
    it("should create a MethodNotAllowedError with default message", () => {
      const error = new MethodNotAllowedError();
      expect(error.httpCode).toBe(405);
      expect(error.isOperational).toBe(true);
    });

    it("should create a MethodNotAllowedError with custom message", () => {
      const error = new MethodNotAllowedError("POST not allowed");
      expect(error.message).toBe("POST not allowed");
    });
  });

  describe("ServiceUnavailableError", () => {
    it("should create a ServiceUnavailableError with default message", () => {
      const error = new ServiceUnavailableError();
      expect(error.httpCode).toBe(503);
      expect(error.isOperational).toBe(true);
    });

    it("should create a ServiceUnavailableError with custom message", () => {
      const error = new ServiceUnavailableError("Database unavailable");
      expect(error.message).toBe("Database unavailable");
    });
  });

  describe("error inheritance", () => {
    it("should allow catching all errors as BaseError", () => {
      const errors = [
        new ApiError(),
        new LangfuseNotFoundError(),
        new InvalidRequestError(),
        new UnauthorizedError(),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error.isOperational).toBe(true);
      }
    });

    it("should preserve specific error types", () => {
      const error = new LangfuseNotFoundError();
      expect(error).toBeInstanceOf(LangfuseNotFoundError);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("error http codes", () => {
    it("should have correct HTTP status codes", () => {
      expect(new InvalidRequestError().httpCode).toBe(400);
      expect(new UnauthorizedError().httpCode).toBe(401);
      expect(new ForbiddenError().httpCode).toBe(403);
      expect(new LangfuseNotFoundError().httpCode).toBe(404);
      expect(new MethodNotAllowedError().httpCode).toBe(405);
      expect(new ConflictError().httpCode).toBe(409);
      expect(new InternalServerError().httpCode).toBe(500);
      expect(new NotImplementedError().httpCode).toBe(501);
      expect(new ServiceUnavailableError().httpCode).toBe(503);
    });
  });

  describe("error throwing and catching", () => {
    it("should be catchable with try-catch", () => {
      try {
        throw new LangfuseNotFoundError("Test not found");
      } catch (error) {
        expect(error).toBeInstanceOf(LangfuseNotFoundError);
        if (error instanceof LangfuseNotFoundError) {
          expect(error.message).toBe("Test not found");
          expect(error.httpCode).toBe(404);
        }
      }
    });

    it("should distinguish between error types", () => {
      const throwError = (type: string) => {
        switch (type) {
          case "notfound":
            throw new LangfuseNotFoundError();
          case "unauthorized":
            throw new UnauthorizedError();
          case "invalid":
            throw new InvalidRequestError();
        }
      };

      expect(() => throwError("notfound")).toThrow(LangfuseNotFoundError);
      expect(() => throwError("unauthorized")).toThrow(UnauthorizedError);
      expect(() => throwError("invalid")).toThrow(InvalidRequestError);
    });
  });
});
