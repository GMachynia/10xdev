import { describe, it, expect } from "vitest";
import { createErrorResponse } from "../error-handler";
import type { ErrorCode } from "../../../types";

describe("Error Handler", () => {
  describe("createErrorResponse", () => {
    it("should create error response with VALIDATION_ERROR code", async () => {
      const response = createErrorResponse("VALIDATION_ERROR", "Invalid input");

      expect(response.status).toBe(400);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
        },
      });
    });

    it("should create error response with UNAUTHORIZED code", async () => {
      const response = createErrorResponse("UNAUTHORIZED", "Authentication required");

      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    });

    it("should create error response with NOT_FOUND code", async () => {
      const response = createErrorResponse("NOT_FOUND", "Resource not found");

      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
        },
      });
    });

    it("should create error response with INTERNAL_SERVER_ERROR code", async () => {
      const response = createErrorResponse("INTERNAL_SERVER_ERROR", "Server error occurred");

      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Server error occurred",
        },
      });
    });

    it("should create error response with DATABASE_ERROR code", async () => {
      const response = createErrorResponse("DATABASE_ERROR", "Database connection failed");

      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "DATABASE_ERROR",
          message: "Database connection failed",
        },
      });
    });

    it("should include error details when provided", async () => {
      const details = {
        field: "source_text",
        max_length: 200,
        actual_length: 250,
      };

      const response = createErrorResponse("VALIDATION_ERROR", "Source text exceeds maximum length", details);

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Source text exceeds maximum length",
          details,
        },
      });
    });

    it("should include parameter validation details", async () => {
      const details = {
        parameter: "order",
        provided_value: "invalid",
        valid_values: ["id", "random"],
      };

      const response = createErrorResponse("VALIDATION_ERROR", "Invalid order parameter", details);

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid order parameter",
          details,
        },
      });
    });

    it("should handle custom error details", async () => {
      const details = {
        custom_field: "custom_value",
        another_field: 123,
      };

      const response = createErrorResponse("VALIDATION_ERROR", "Custom validation error", details);

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.details).toEqual(details);
    });

    it("should not include details field when details is undefined", async () => {
      const response = createErrorResponse("NOT_FOUND", "Flashcard not found");

      const body = await response.json();
      expect(body.error).not.toHaveProperty("details");
      expect(body.error).toEqual({
        code: "NOT_FOUND",
        message: "Flashcard not found",
      });
    });

    it("should map all error codes to correct HTTP status codes", async () => {
      const testCases: { code: ErrorCode; expectedStatus: number }[] = [
        { code: "VALIDATION_ERROR", expectedStatus: 400 },
        { code: "UNAUTHORIZED", expectedStatus: 401 },
        { code: "NOT_FOUND", expectedStatus: 404 },
        { code: "INTERNAL_SERVER_ERROR", expectedStatus: 500 },
        { code: "DATABASE_ERROR", expectedStatus: 500 },
      ];

      for (const { code, expectedStatus } of testCases) {
        const response = createErrorResponse(code, `Test ${code}`);
        expect(response.status).toBe(expectedStatus);
      }
    });

    it("should always return Content-Type application/json", async () => {
      const codes: ErrorCode[] = [
        "VALIDATION_ERROR",
        "UNAUTHORIZED",
        "NOT_FOUND",
        "INTERNAL_SERVER_ERROR",
        "DATABASE_ERROR",
      ];

      for (const code of codes) {
        const response = createErrorResponse(code, `Test ${code}`);
        expect(response.headers.get("Content-Type")).toBe("application/json");
      }
    });
  });
});
