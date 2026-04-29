import { createClient } from "@supabase/supabase-js";

// Fallbacks prevent createClient from throwing during Next.js build-time module evaluation.
// At runtime the real env vars are always present.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(url, key);
