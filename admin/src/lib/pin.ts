import { randomInt } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

// Generate a 6-digit PIN unique against children.pin_code.
// Uses crypto.randomInt (not Math.random) since the PIN gates access to a
// child's learning profile. The children_pin_code_unique index is the
// authoritative dedupe (the caller maps its 23505 violation to a 409); this
// pre-check only reduces retries. Throws after 5 attempts.
export async function generateUniquePin(
  supabase: SupabaseClient
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const pin = String(randomInt(100000, 1000000));
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
