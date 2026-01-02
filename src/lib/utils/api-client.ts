import { supabaseClient } from "../../db/supabase.client.ts";
import type {
  ListFlashcardsResponse,
  GetFlashcardResponse,
  CreateFlashcardResponse,
  UpdateFlashcardResponse,
  DeleteFlashcardResponse,
  ListFlashcardsQuery,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  ErrorResponse,
} from "../../types.ts";

/**
 * Gets the current session token from Supabase.
 * Returns null if user is not authenticated.
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    
    if (error) {
      console.error("[getAuthToken] Error getting session:", error);
      return null;
    }
    
    return session?.access_token || null;
  } catch (error) {
    console.error("[getAuthToken] Exception getting session:", error);
    return null;
  }
}

/**
 * Makes an authenticated API request.
 * Automatically includes the Authorization header with the Supabase JWT token.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: ErrorResponse | null }> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        data: null,
        error: {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please log in.",
          },
        },
      };
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: json as ErrorResponse,
      };
    }

    return {
      data: json as T,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      data: null,
      error: {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        },
      },
    };
  }
}

/**
 * Fetches all flashcards for the authenticated user.
 *
 * @param query - Optional query parameters for ordering and pagination
 * @returns Promise with flashcards data and count, or error
 */
export async function fetchFlashcards(
  query?: ListFlashcardsQuery
): Promise<{ data: ListFlashcardsResponse | null; error: ErrorResponse | null }> {
  const params = new URLSearchParams();
  if (query?.order) {
    params.append("order", query.order);
  }
  if (query?.limit !== undefined) {
    params.append("limit", query.limit.toString());
  }
  if (query?.offset !== undefined) {
    params.append("offset", query.offset.toString());
  }

  const endpoint = `/api/flashcards${params.toString() ? `?${params.toString()}` : ""}`;
  return apiRequest<ListFlashcardsResponse>(endpoint);
}

/**
 * Fetches a single flashcard by ID.
 *
 * @param id - UUID of the flashcard
 * @returns Promise with flashcard data or error
 */
export async function fetchFlashcardById(
  id: string
): Promise<{ data: GetFlashcardResponse | null; error: ErrorResponse | null }> {
  return apiRequest<GetFlashcardResponse>(`/api/flashcards/${id}`);
}

/**
 * Creates a new flashcard.
 *
 * @param command - Flashcard data to create
 * @returns Promise with created flashcard data or error
 */
export async function createFlashcard(
  command: CreateFlashcardCommand
): Promise<{ data: CreateFlashcardResponse | null; error: ErrorResponse | null }> {
  return apiRequest<CreateFlashcardResponse>("/api/flashcards", {
    method: "POST",
    body: JSON.stringify(command),
  });
}

/**
 * Updates an existing flashcard.
 *
 * @param id - UUID of the flashcard to update
 * @param command - Flashcard data to update
 * @returns Promise with updated flashcard data or error
 */
export async function updateFlashcard(
  id: string,
  command: UpdateFlashcardCommand
): Promise<{ data: UpdateFlashcardResponse | null; error: ErrorResponse | null }> {
  return apiRequest<UpdateFlashcardResponse>(`/api/flashcards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(command),
  });
}

/**
 * Deletes a flashcard.
 *
 * @param id - UUID of the flashcard to delete
 * @returns Promise with delete response or error
 */
export async function deleteFlashcard(
  id: string
): Promise<{ data: DeleteFlashcardResponse | null; error: ErrorResponse | null }> {
  return apiRequest<DeleteFlashcardResponse>(`/api/flashcards/${id}`, {
    method: "DELETE",
  });
}
