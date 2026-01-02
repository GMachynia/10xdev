import type { SupabaseClient } from "../../db/supabase.client.ts";
import type { FlashcardDTO, ListFlashcardsQuery, UpdateFlashcardCommand } from "../../types.ts";

/**
 * Retrieves all flashcards for a specific user with optional ordering and pagination.
 *
 * Uses Row Level Security (RLS) to ensure the user can only access their own flashcards.
 * The query automatically filters by user_id through RLS policies.
 *
 * @param supabase - Supabase client instance from context.locals
 * @param userId - UUID of the authenticated user (for additional validation)
 * @param query - Optional query parameters for ordering and pagination
 * @returns Object containing array of flashcard DTOs and count, or error if occurred
 *
 * @example
 * ```typescript
 * const { data, count, error } = await listFlashcards(supabase, userId, { order: 'id' });
 * if (error) {
 *   // Handle error
 * }
 * ```
 */
export async function listFlashcards(
  supabase: SupabaseClient,
  userId: string,
  query?: ListFlashcardsQuery
): Promise<{ data: FlashcardDTO[] | null; count: number; error: Error | null }> {
  // Early return for invalid input
  if (!userId) {
    return { data: null, count: 0, error: new Error("userId is required") };
  }

  try {
    let queryBuilder = supabase.from("flashcards").select("id, source_text, translation", { count: "exact" });

    // Apply ordering
    if (query?.order === "id") {
      queryBuilder = queryBuilder.order("id", { ascending: true });
    } else {
      // Random ordering - fetch all and shuffle in memory
      // Note: Supabase doesn't support true random ordering efficiently,
      // so we'll fetch all and shuffle client-side for small datasets
      queryBuilder = queryBuilder.order("id", { ascending: true });
    }

    // Apply pagination
    if (query?.limit !== undefined) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    if (query?.offset !== undefined) {
      queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 1000) - 1);
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      return { data: null, count: 0, error: new Error(error.message) };
    }

    if (!data) {
      return { data: [], count: 0, error: null };
    }

    // Map to DTOs
    const dtos: FlashcardDTO[] = data.map((item) => ({
      id: item.id,
      source_text: item.source_text,
      translation: item.translation,
    }));

    // Shuffle for random order if requested
    if (query?.order === "random" || !query?.order) {
      // Fisher-Yates shuffle algorithm
      for (let i = dtos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dtos[i], dtos[j]] = [dtos[j], dtos[i]];
      }
    }

    return { data: dtos, count: count || 0, error: null };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { data: null, count: 0, error: new Error(errorMessage) };
  }
}

/**
 * Retrieves a single flashcard by ID for a specific user.
 *
 * Uses Row Level Security (RLS) to ensure the user can only access their own flashcards.
 * The query automatically filters by user_id through RLS policies.
 *
 * @param supabase - Supabase client instance from context.locals
 * @param id - UUID of the flashcard to retrieve
 * @param userId - UUID of the authenticated user (for additional validation)
 * @returns Object containing the flashcard DTO or null, and an error if occurred
 *
 * @example
 * ```typescript
 * const { data: flashcard, error } = await getFlashcardById(supabase, flashcardId, userId);
 * if (error) {
 *   // Handle error
 * }
 * if (!flashcard) {
 *   // Flashcard not found or user doesn't have access
 * }
 * ```
 */
export async function getFlashcardById(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<{ data: FlashcardDTO | null; error: Error | null }> {
  // Early return for invalid input
  if (!id || !userId) {
    return { data: null, error: new Error("ID and userId are required") };
  }

  try {
    const { data, error } = await supabase
      .from("flashcards")
      .select("id, source_text, translation")
      .eq("id", id)
      .single();

    if (error) {
      // RLS will automatically filter by user_id, so if we get an error,
      // it's either not found or access denied
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    // Map to DTO (already selecting only needed fields, but ensuring type safety)
    const dto: FlashcardDTO = {
      id: data.id,
      source_text: data.source_text,
      translation: data.translation,
    };

    return { data: dto, error: null };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { data: null, error: new Error(errorMessage) };
  }
}

/**
 * Updates an existing flashcard for a specific user.
 *
 * Uses Row Level Security (RLS) to ensure the user can only update their own flashcards.
 * Only source_text and translation can be updated.
 *
 * @param supabase - Supabase client instance from context.locals
 * @param id - UUID of the flashcard to update
 * @param userId - UUID of the authenticated user (for additional validation)
 * @param command - Update command with optional source_text and translation
 * @returns Object containing the updated flashcard DTO or null, and an error if occurred
 *
 * @example
 * ```typescript
 * const { data: flashcard, error } = await updateFlashcard(supabase, flashcardId, userId, {
 *   source_text: "New text",
 *   translation: "New translation"
 * });
 * if (error) {
 *   // Handle error
 * }
 * ```
 */
export async function updateFlashcard(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  command: UpdateFlashcardCommand
): Promise<{ data: FlashcardDTO | null; error: Error | null }> {
  // Early return for invalid input
  if (!id || !userId) {
    return { data: null, error: new Error("ID and userId are required") };
  }

  // Validate source_text length if provided
  if (command.source_text !== undefined && command.source_text.length > 200) {
    return {
      data: null,
      error: new Error("Source text exceeds maximum length of 200 characters"),
    };
  }

  try {
    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (command.source_text !== undefined) {
      updateData.source_text = command.source_text.trim();
    }
    if (command.translation !== undefined) {
      updateData.translation =
        command.translation === null || command.translation === "" ? null : command.translation.trim();
    }

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return { data: null, error: new Error("No fields to update") };
    }

    const { data, error } = await supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", id)
      .select("id, source_text, translation")
      .single();

    if (error) {
      // Check if it's a "not found" error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("not found") || errorMessage.includes("pgrst116")) {
        return { data: null, error: new Error("Flashcard not found") };
      }
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    // Map to DTO
    const dto: FlashcardDTO = {
      id: data.id,
      source_text: data.source_text,
      translation: data.translation,
    };

    return { data: dto, error: null };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { data: null, error: new Error(errorMessage) };
  }
}

/**
 * Deletes a flashcard for a specific user.
 *
 * Uses Row Level Security (RLS) to ensure the user can only delete their own flashcards.
 *
 * @param supabase - Supabase client instance from context.locals
 * @param id - UUID of the flashcard to delete
 * @param userId - UUID of the authenticated user (for additional validation)
 * @returns Object containing success status and an error if occurred
 *
 * @example
 * ```typescript
 * const { error } = await deleteFlashcard(supabase, flashcardId, userId);
 * if (error) {
 *   // Handle error
 * }
 * ```
 */
export async function deleteFlashcard(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<{ error: Error | null }> {
  // Early return for invalid input
  if (!id || !userId) {
    return { error: new Error("ID and userId are required") };
  }

  try {
    const { error } = await supabase.from("flashcards").delete().eq("id", id);

    if (error) {
      // Check if it's a "not found" error
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("not found") || errorMessage.includes("pgrst116")) {
        return { error: new Error("Flashcard not found") };
      }
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { error: new Error(errorMessage) };
  }
}
