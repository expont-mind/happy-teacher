import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser/client-side operations
 * Uses the public anon key for authenticated user operations
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
