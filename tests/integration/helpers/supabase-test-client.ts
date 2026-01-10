import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/db/database.types";

export type TestSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a Supabase client for integration tests
 */
export function createTestSupabaseClient(): TestSupabaseClient {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Creates a test user and returns auth credentials
 */
export async function createTestUser(supabase: TestSupabaseClient) {
  const timestamp = Date.now();
  const email = `test-user-${timestamp}@example.com`;
  const password = "test-password-123";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("No user returned from signUp");
  }

  return {
    email,
    password,
    userId: data.user.id,
    session: data.session,
  };
}

/**
 * Signs in a test user
 */
export async function signInTestUser(
  supabase: TestSupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in test user: ${error.message}`);
  }

  if (!data.session) {
    throw new Error("No session returned from signIn");
  }

  return {
    session: data.session,
    user: data.user,
  };
}

/**
 * Cleans up test data for a user
 */
export async function cleanupTestData(
  supabase: TestSupabaseClient,
  userId: string
) {
  // Delete flashcards
  await supabase.from("flashcards").delete().eq("user_id", userId);

  // Delete user (requires service_role key in production)
  // For local development, this should work
  await supabase.auth.admin.deleteUser(userId);
}

/**
 * Creates test flashcards for a user
 */
export async function createTestFlashcards(
  supabase: TestSupabaseClient,
  count: number = 3
) {
  const flashcards = Array.from({ length: count }, (_, i) => ({
    source_text: `Test ${i + 1}`,
    translation: `Translation ${i + 1}`,
  }));

  const { data, error } = await supabase
    .from("flashcards")
    .insert(flashcards)
    .select();

  if (error) {
    throw new Error(`Failed to create test flashcards: ${error.message}`);
  }

  return data;
}

