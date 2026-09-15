import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

console.log("SUPABASE URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);