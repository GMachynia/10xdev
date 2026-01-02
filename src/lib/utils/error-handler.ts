import type { ErrorCode, ErrorResponse, ErrorDetails } from "../../types.ts";

/**
 * Creates a standardized error response for API endpoints.
 *
 * Maps error codes to appropriate HTTP status codes and formats
 * the response according to the ErrorResponse type.
 *
 * @param code - Error code from ErrorCode enum
 * @param message - Human-readable error message
 * @param details - Optional error details object for validation errors
 * @returns Response object with JSON error payload and appropriate status code
 *
 * @example
 * ```typescript
 * // Validation error
 * return createErrorResponse(
 *   'VALIDATION_ERROR',
 *   'Invalid UUID format for flashcard ID',
 *   { parameter: 'id', provided_value: id }
 * );
 *
 * // Unauthorized error
 * return createErrorResponse(
 *   'UNAUTHORIZED',
 *   'Authentication required. Please provide a valid JWT token.'
 * );
 * ```
 */
export function createErrorResponse(code: ErrorCode, message: string, details?: ErrorDetails): Response {
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  const statusCode = getStatusCodeForError(code);
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Maps error codes to HTTP status codes.
 *
 * @param code - Error code from ErrorCode enum
 * @returns HTTP status code (400, 401, 404, or 500)
 */
function getStatusCodeForError(code: ErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "NOT_FOUND":
      return 404;
    case "INTERNAL_SERVER_ERROR":
    case "DATABASE_ERROR":
      return 500;
    default:
      return 500;
  }
}
