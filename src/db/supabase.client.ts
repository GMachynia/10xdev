import type { AstroCookies } from "astro";
import { createServerClient, createBrowserClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

// Helper function to get Supabase URL
function getSupabaseUrl(): string {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing SUPABASE_URL or PUBLIC_SUPABASE_URL environment variable. Please set it in your .env file."
    );
  }
  return url;
}

// Helper function to get Supabase anon key
function getSupabaseAnonKey(): string {
  const key = import.meta.env.PUBLIC_SUPABASE_KEY || import.meta.env.SUPABASE_KEY;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_KEY or PUBLIC_SUPABASE_KEY environment variable. Please set it in your .env file."
    );
  }
  return key;
}

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  httpOnly: false, // Must be false for client-side JavaScript to read cookies
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

// Client-side instance using createBrowserClient for proper cookie handling
// Note: This should only be used in client-side code
// For SSR, use createSupabaseServerInstance instead
let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient(): ReturnType<typeof createBrowserClient<Database>> {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseClient() can only be used in browser environment. Use createSupabaseServerInstance() for server-side code."
    );
  }

  if (!supabaseClientInstance) {
    // createBrowserClient automatically handles cookies in the browser
    // It uses document.cookie to read/write cookies automatically
    supabaseClientInstance = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return supabaseClientInstance;
}

/**
 * Type alias for SupabaseClient with Database type.
 * Use this type instead of importing directly from @supabase/supabase-js.
 */
export type SupabaseClient = SupabaseClientType<Database>;
