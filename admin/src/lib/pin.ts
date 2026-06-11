import { SupabaseClient } from "@supabase/supabase-js";

// Generate a 6-digit PIN unique against children.pin_code.
// Relies on the children_pin_code_unique index to reject races on insert,
// but pre-checks to minimize retries. Throws after 5 attempts.
export async function generateUniquePin(
  supabase: SupabaseClient
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const pin = String(100000 + Math.floor(Math.random() * 900000));
    const { data, error } = await supabase
      .from("children")
      .select("id")
      .eq("pin_code", pin)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return pin;
  }
  throw new Error("PIN үүсгэж чадсангүй");
}
