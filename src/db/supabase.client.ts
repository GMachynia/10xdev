import { createClient, type SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

// For server-side: use SUPABASE_URL and SUPABASE_KEY
// For client-side: use PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL or PUBLIC_SUPABASE_URL environment variable. Please set it in your .env file.");
}

if (!supabaseAnonKey) {
  throw new Error("Missing SUPABASE_KEY or PUBLIC_SUPABASE_KEY environment variable. Please set it in your .env file.");
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Type alias for SupabaseClient with Database type.
 * Use this type instead of importing directly from @supabase/supabase-js.
 */
export type SupabaseClient = SupabaseClientType<Database>;
