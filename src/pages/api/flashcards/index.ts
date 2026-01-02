import type { APIRoute } from "astro";
import { listFlashcards, createFlashcard } from "../../../lib/services/flashcards.service.ts";
import { createErrorResponse } from "../../../lib/utils/error-handler.ts";
import type {
  ListFlashcardsResponse,
  ListFlashcardsQuery,
  CreateFlashcardResponse,
  CreateFlashcardCommand,
} from "../../../types.ts";

/**
 * Disable prerendering for this API route.
 * API routes must be server-rendered to handle authentication and database queries.
 */
export const prerender = false;

/**
 * GET /api/flashcards
 *
 * Retrieves all flashcards for the authenticated user.
 * Supports ordering (random or by ID) and pagination.
 *
 * Requires:
 * - Valid JWT token in Authorization header
 *
 * Query Parameters:
 * - order (optional): 'random' (default) or 'id' (ascending by ID)
 * - limit (optional): Maximum number of flashcards to return (1-1000)
 * - offset (optional): Number of flashcards to skip (default: 0)
 *
 * Returns:
 * - 200 OK: List of flashcards in ListFlashcardsResponse format
 * - 401 Unauthorized: Missing or invalid authentication token
 * - 500 Internal Server Error: Unexpected server error
 *
 * @param context - Astro API context containing params, locals, etc.
 * @returns Response with flashcards data or error message
 */
export const GET: APIRoute = async (context) => {
  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      // eslint-disable-next-line no-console
      console.info("[GET /api/flashcards] 401 - UNAUTHORIZED");
      return createErrorResponse("UNAUTHORIZED", "Authentication required. Please provide a valid JWT token.");
    }

    // Parse query parameters
    const url = new URL(context.request.url);
    const orderParam = url.searchParams.get("order");
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    // Validate and build query object
    const query: ListFlashcardsQuery = {};

    if (orderParam) {
      if (orderParam !== "random" && orderParam !== "id") {
        return createErrorResponse("VALIDATION_ERROR", "Invalid order parameter. Must be 'random' or 'id'.", {
          parameter: "order",
          provided_value: orderParam,
          valid_values: ["random", "id"],
        });
      }
      query.order = orderParam;
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1 || limit > 1000) {
        return createErrorResponse(
          "VALIDATION_ERROR",
          "Invalid limit parameter. Must be a number between 1 and 1000.",
          {
            parameter: "limit",
            provided_value: limitParam,
          }
        );
      }
      query.limit = limit;
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam, 10);
      if (isNaN(offset) || offset < 0) {
        return createErrorResponse("VALIDATION_ERROR", "Invalid offset parameter. Must be a non-negative number.", {
          parameter: "offset",
          provided_value: offsetParam,
        });
      }
      query.offset = offset;
    }

    // Retrieve flashcards
    const {
      data: flashcards,
      count,
      error: serviceError,
    } = await listFlashcards(context.locals.supabase, user.id, query);

    // Handle service errors
    if (serviceError) {
      // eslint-disable-next-line no-console
      console.error("[GET /api/flashcards] 500 - DATABASE_ERROR", {
        error: serviceError,
        userId: user.id,
      });
      return createErrorResponse("DATABASE_ERROR", "Database operation failed. Please try again later.");
    }

    // Success response
    const response: ListFlashcardsResponse = {
      data: flashcards || [],
      count: count || 0,
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("[GET /api/flashcards] 500 - INTERNAL_SERVER_ERROR", { error });
    return createErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.");
  }
};

/**
 * POST /api/flashcards
 *
 * Creates a new flashcard for the authenticated user.
 *
 * Requires:
 * - Valid JWT token in Authorization header
 *
 * Request Body:
 * - source_text (required): Source text of the flashcard (max 200 characters)
 * - translation (optional): Translation text of the flashcard
 *
 * Returns:
 * - 201 Created: Created flashcard in CreateFlashcardResponse format
 * - 400 Bad Request: Validation error (missing or invalid fields)
 * - 401 Unauthorized: Missing or invalid authentication token
 * - 500 Internal Server Error: Unexpected server error
 *
 * @param context - Astro API context containing params, locals, etc.
 * @returns Response with created flashcard data or error message
 */
export const POST: APIRoute = async (context) => {
  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      // eslint-disable-next-line no-console
      console.info("[POST /api/flashcards] 401 - UNAUTHORIZED");
      return createErrorResponse("UNAUTHORIZED", "Authentication required. Please provide a valid JWT token.");
    }

    // Parse request body
    let command: CreateFlashcardCommand;
    try {
      command = await context.request.json();
    } catch {
      return createErrorResponse("VALIDATION_ERROR", "Invalid request body. Expected JSON.", {
        field: "body",
      });
    }

    // Validate required fields
    if (!command.source_text) {
      return createErrorResponse("VALIDATION_ERROR", "Source text is required.", {
        field: "source_text",
      });
    }

    if (typeof command.source_text !== "string") {
      return createErrorResponse("VALIDATION_ERROR", "Source text must be a string.", {
        field: "source_text",
        provided_value: typeof command.source_text,
      });
    }

    // Validate source_text length
    const trimmedSourceText = command.source_text.trim();
    if (trimmedSourceText.length === 0) {
      return createErrorResponse("VALIDATION_ERROR", "Source text cannot be empty.", {
        field: "source_text",
      });
    }

    if (trimmedSourceText.length > 200) {
      return createErrorResponse("VALIDATION_ERROR", "Source text exceeds maximum length of 200 characters.", {
        field: "source_text",
        max_length: 200,
        actual_length: trimmedSourceText.length,
      });
    }

    // Validate translation if provided
    if (command.translation !== undefined && command.translation !== null && typeof command.translation !== "string") {
      return createErrorResponse("VALIDATION_ERROR", "Translation must be a string or null.", {
        field: "translation",
        provided_value: typeof command.translation,
      });
    }

    // Create flashcard
    const { data: flashcard, error: serviceError } = await createFlashcard(context.locals.supabase, user.id, {
      source_text: trimmedSourceText,
      translation: command.translation?.trim() || null,
    });

    // Handle service errors
    if (serviceError) {
      // eslint-disable-next-line no-console
      console.error("[POST /api/flashcards] 500 - DATABASE_ERROR", {
        error: serviceError,
        userId: user.id,
      });
      return createErrorResponse("DATABASE_ERROR", "Database operation failed. Please try again later.");
    }

    if (!flashcard) {
      // eslint-disable-next-line no-console
      console.error("[POST /api/flashcards] 500 - DATABASE_ERROR", {
        error: "Flashcard creation returned null",
        userId: user.id,
      });
      return createErrorResponse("DATABASE_ERROR", "Failed to create flashcard. Please try again later.");
    }

    // Success response
    const response: CreateFlashcardResponse = {
      data: flashcard,
    };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("[POST /api/flashcards] 500 - INTERNAL_SERVER_ERROR", { error });
    return createErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.");
  }
};
