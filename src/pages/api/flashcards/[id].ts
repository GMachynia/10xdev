import type { APIRoute } from "astro";
import { getFlashcardById, updateFlashcard, deleteFlashcard } from "../../../lib/services/flashcards.service.ts";
import { isValidUUID } from "../../../lib/utils/validation.ts";
import { createErrorResponse } from "../../../lib/utils/error-handler.ts";
import type {
  GetFlashcardResponse,
  UpdateFlashcardResponse,
  DeleteFlashcardResponse,
  UpdateFlashcardCommand,
} from "../../../types.ts";

/**
 * Disable prerendering for this API route.
 * API routes must be server-rendered to handle authentication and database queries.
 */
export const prerender = false;

/**
 * GET /api/flashcards/:id
 *
 * Retrieves a single flashcard by ID for the authenticated user.
 *
 * Requires:
 * - Valid JWT token in Authorization header
 * - Valid UUID format for :id parameter
 *
 * Returns:
 * - 200 OK: Flashcard data in GetFlashcardResponse format
 * - 400 Bad Request: Invalid UUID format
 * - 401 Unauthorized: Missing or invalid authentication token
 * - 404 Not Found: Flashcard not found or user doesn't have permission
 * - 500 Internal Server Error: Unexpected server error
 *
 * @param context - Astro API context containing params, locals, etc.
 * @returns Response with flashcard data or error message
 */
export const GET: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    // Validate UUID format
    if (!id || !isValidUUID(id)) {
      return createErrorResponse("VALIDATION_ERROR", "Invalid UUID format for flashcard ID", {
        parameter: "id",
        provided_value: id || "undefined",
      });
    }

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      // eslint-disable-next-line no-console
      console.info("[GET /api/flashcards/:id] 401 - UNAUTHORIZED", { id });
      return createErrorResponse("UNAUTHORIZED", "Authentication required. Please provide a valid JWT token.");
    }

    // Retrieve flashcard
    const { data: flashcard, error: serviceError } = await getFlashcardById(context.locals.supabase, id, user.id);

    // Handle service errors
    if (serviceError) {
      // Check if it's a "not found" error (PGRST116 code from Supabase)
      const errorMessage = serviceError.message.toLowerCase();
      if (errorMessage.includes("not found") || errorMessage.includes("pgrst116")) {
        // eslint-disable-next-line no-console
        console.info("[GET /api/flashcards/:id] 404 - NOT_FOUND", { id, userId: user.id });
        return createErrorResponse("NOT_FOUND", "Flashcard not found or you do not have permission to access it");
      }

      // Other database errors
      // eslint-disable-next-line no-console
      console.error("[GET /api/flashcards/:id] 500 - DATABASE_ERROR", {
        error: serviceError,
        id,
        userId: user.id,
      });
      return createErrorResponse("DATABASE_ERROR", "Database operation failed. Please try again later.");
    }

    // Handle case when flashcard is null (not found)
    if (!flashcard) {
      // eslint-disable-next-line no-console
      console.info("[GET /api/flashcards/:id] 404 - NOT_FOUND", { id, userId: user.id });
      return createErrorResponse("NOT_FOUND", "Flashcard not found or you do not have permission to access it");
    }

    // Success response
    const response: GetFlashcardResponse = { data: flashcard };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    const errorId = context.params.id || "unknown";
    // eslint-disable-next-line no-console
    console.error("[GET /api/flashcards/:id] 500 - INTERNAL_SERVER_ERROR", {
      error,
      id: errorId,
    });
    return createErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.");
  }
};

/**
 * PATCH /api/flashcards/:id
 *
 * Updates an existing flashcard for the authenticated user.
 * Only source_text and translation can be updated.
 *
 * Requires:
 * - Valid JWT token in Authorization header
 * - Valid UUID format for :id parameter
 * - Valid JSON body with optional source_text and/or translation
 *
 * Returns:
 * - 200 OK: Updated flashcard data in UpdateFlashcardResponse format
 * - 400 Bad Request: Invalid UUID format or validation error
 * - 401 Unauthorized: Missing or invalid authentication token
 * - 404 Not Found: Flashcard not found or user doesn't have permission
 * - 500 Internal Server Error: Unexpected server error
 *
 * @param context - Astro API context containing params, locals, etc.
 * @returns Response with updated flashcard data or error message
 */
export const PATCH: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    // Validate UUID format
    if (!id || !isValidUUID(id)) {
      return createErrorResponse("VALIDATION_ERROR", "Invalid UUID format for flashcard ID", {
        parameter: "id",
        provided_value: id || "undefined",
      });
    }

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      // eslint-disable-next-line no-console
      console.info("[PATCH /api/flashcards/:id] 401 - UNAUTHORIZED", { id });
      return createErrorResponse("UNAUTHORIZED", "Authentication required. Please provide a valid JWT token.");
    }

    // Parse request body
    let command: UpdateFlashcardCommand;
    try {
      command = await context.request.json();
    } catch {
      return createErrorResponse("VALIDATION_ERROR", "Invalid JSON in request body");
    }

    // Validate source_text length if provided
    if (command.source_text !== undefined) {
      if (typeof command.source_text !== "string") {
        return createErrorResponse("VALIDATION_ERROR", "source_text must be a string", {
          field: "source_text",
        });
      }
      if (command.source_text.length > 200) {
        return createErrorResponse("VALIDATION_ERROR", "Source text exceeds maximum length of 200 characters", {
          field: "source_text",
          max_length: 200,
          actual_length: command.source_text.length,
        });
      }
    }

    // Validate translation if provided
    if (command.translation !== undefined && command.translation !== null && typeof command.translation !== "string") {
      return createErrorResponse("VALIDATION_ERROR", "translation must be a string or null", {
        field: "translation",
      });
    }

    // Update flashcard
    const { data: flashcard, error: serviceError } = await updateFlashcard(
      context.locals.supabase,
      id,
      user.id,
      command
    );

    // Handle service errors
    if (serviceError) {
      const errorMessage = serviceError.message.toLowerCase();
      if (errorMessage.includes("not found") || errorMessage.includes("pgrst116")) {
        // eslint-disable-next-line no-console
        console.info("[PATCH /api/flashcards/:id] 404 - NOT_FOUND", { id, userId: user.id });
        return createErrorResponse("NOT_FOUND", "Flashcard not found or you do not have permission to update it");
      }

      if (errorMessage.includes("exceeds maximum length")) {
        return createErrorResponse("VALIDATION_ERROR", serviceError.message, {
          field: "source_text",
          max_length: 200,
        });
      }

      // Other database errors
      // eslint-disable-next-line no-console
      console.error("[PATCH /api/flashcards/:id] 500 - DATABASE_ERROR", {
        error: serviceError,
        id,
        userId: user.id,
      });
      return createErrorResponse("DATABASE_ERROR", "Database operation failed. Please try again later.");
    }

    // Handle case when flashcard is null (not found)
    if (!flashcard) {
      // eslint-disable-next-line no-console
      console.info("[PATCH /api/flashcards/:id] 404 - NOT_FOUND", { id, userId: user.id });
      return createErrorResponse("NOT_FOUND", "Flashcard not found or you do not have permission to update it");
    }

    // Success response
    const response: UpdateFlashcardResponse = { data: flashcard };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    const errorId = context.params.id || "unknown";
    // eslint-disable-next-line no-console
    console.error("[PATCH /api/flashcards/:id] 500 - INTERNAL_SERVER_ERROR", {
      error,
      id: errorId,
    });
    return createErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.");
  }
};

/**
 * DELETE /api/flashcards/:id
 *
 * Deletes a flashcard for the authenticated user.
 *
 * Requires:
 * - Valid JWT token in Authorization header
 * - Valid UUID format for :id parameter
 *
 * Returns:
 * - 200 OK: Success message in DeleteFlashcardResponse format
 * - 400 Bad Request: Invalid UUID format
 * - 401 Unauthorized: Missing or invalid authentication token
 * - 404 Not Found: Flashcard not found or user doesn't have permission
 * - 500 Internal Server Error: Unexpected server error
 *
 * @param context - Astro API context containing params, locals, etc.
 * @returns Response with success message or error message
 */
export const DELETE: APIRoute = async (context) => {
  try {
    const { id } = context.params;

    // Validate UUID format
    if (!id || !isValidUUID(id)) {
      return createErrorResponse("VALIDATION_ERROR", "Invalid UUID format for flashcard ID", {
        parameter: "id",
        provided_value: id || "undefined",
      });
    }

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      // eslint-disable-next-line no-console
      console.info("[DELETE /api/flashcards/:id] 401 - UNAUTHORIZED", { id });
      return createErrorResponse("UNAUTHORIZED", "Authentication required. Please provide a valid JWT token.");
    }

    // Delete flashcard
    const { error: serviceError } = await deleteFlashcard(context.locals.supabase, id, user.id);

    // Handle service errors
    if (serviceError) {
      const errorMessage = serviceError.message.toLowerCase();
      if (errorMessage.includes("not found") || errorMessage.includes("pgrst116")) {
        // eslint-disable-next-line no-console
        console.info("[DELETE /api/flashcards/:id] 404 - NOT_FOUND", { id, userId: user.id });
        return createErrorResponse("NOT_FOUND", "Flashcard not found or you do not have permission to delete it");
      }

      // Other database errors
      // eslint-disable-next-line no-console
      console.error("[DELETE /api/flashcards/:id] 500 - DATABASE_ERROR", {
        error: serviceError,
        id,
        userId: user.id,
      });
      return createErrorResponse("DATABASE_ERROR", "Database operation failed. Please try again later.");
    }

    // Success response
    const response: DeleteFlashcardResponse = {
      message: "Flashcard deleted successfully",
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unexpected errors
    const errorId = context.params.id || "unknown";
    // eslint-disable-next-line no-console
    console.error("[DELETE /api/flashcards/:id] 500 - INTERNAL_SERVER_ERROR", {
      error,
      id: errorId,
    });
    return createErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again later.");
  }
};
