import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Base profile (the home list comes from this table).
  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, created_at")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  if (!profileRow) {
    return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
  }

  // Enrich with auth metadata (phone, authoritative email) — best effort.
  let phone: string | null = null;
  let email = profileRow.email as string | null;
  let fullName = profileRow.full_name as string | null;
  try {
    const { data: authData } = await supabase.auth.admin.getUserById(id);
    const meta = authData?.user?.user_metadata as
      | Record<string, unknown>
      | undefined;
    if (meta) {
      if (typeof meta.phone === "string" && meta.phone) phone = meta.phone;
      if (!fullName && typeof meta.full_name === "string")
        fullName = meta.full_name;
    }
    if (authData?.user?.email) email = authData.user.email;
  } catch {
    // auth admin unavailable — keep profiles-table values, phone stays null.
  }

  const profile = {
    id: profileRow.id,
    full_name: fullName,
    email,
    phone,
    avatar_url: profileRow.avatar_url,
    created_at: profileRow.created_at,
  };

  // Purchases (topics) for this user, newest first.
  const { data: purchaseRows, error: purchaseError } = await supabase
    .from("purchases")
    .select("id, topic_key, child_id, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (purchaseError) {
    return NextResponse.json({ error: purchaseError.message }, { status: 500 });
  }

  // Resolve child names in one batched query.
  const childIds = [
    ...new Set((purchaseRows || []).map((p) => p.child_id).filter(Boolean)),
  ] as string[];
  const childNames = new Map<string, string>();
  if (childIds.length > 0) {
    const { data: kids } = await supabase
      .from("children")
      .select("id, name")
      .in("id", childIds);
    for (const k of kids || []) childNames.set(k.id, k.name);
  }

  const purchases = (purchaseRows || []).map((p) => ({
    id: p.id,
    topic_key: p.topic_key,
    child_name: p.child_id ? childNames.get(p.child_id) || null : null,
    created_at: p.created_at,
  }));

  // Payment invoices — the table may be absent in some environments.
  let invoices: Array<{
    id: string;
    amount: number | null;
    topic_key: string | null;
    status: string | null;
    created_at: string | null;
  }> = [];
  const { data: invoiceRows, error: invoiceError } = await supabase
    .from("pending_invoices")
    .select("id, amount, topic_key, status, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (invoiceError) {
    const code = (invoiceError as { code?: string }).code;
    const missing =
      code === "42P01" ||
      invoiceError.message?.includes("does not exist") ||
      invoiceError.message?.includes("schema cache");
    if (!missing) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }
  } else {
    invoices = invoiceRows || [];
  }

  const totalPaid = invoices
    .filter((i) => i.status === "paid" || i.status === "completed")
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const summary = {
    topics_purchased: purchases.length,
    total_paid: totalPaid,
  };

  return NextResponse.json({ profile, purchases, invoices, summary });
}
