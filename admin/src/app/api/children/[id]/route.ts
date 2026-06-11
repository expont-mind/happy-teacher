import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Guard: only class children (class_id not null) may be edited/deleted here.
// Parent-owned children are out of scope and must never be touched.
async function assertClassChild(
  supabase: ReturnType<typeof createAdminClient>,
  id: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { data, error } = await supabase
    .from("children")
    .select("id, class_id")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, status: 500, error: error.message };
  if (!data) return { ok: false, status: 404, error: "Хүүхэд олдсонгүй" };
  if (!data.class_id)
    return { ok: false, status: 403, error: "Энэ хүүхэд ангид харьяалагдахгүй" };
  return { ok: true };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const guard = await assertClassChild(supabase, id);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (typeof body.avatar === "string") update.avatar = body.avatar;
  if (typeof body.age === "number") update.age = body.age;
  if (typeof body.class === "number") update.class = body.class;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Өөрчлөх утга алга" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("children")
    .update(update)
    .eq("id", id)
    .select("id, name, pin_code, avatar, age, class")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ child: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const guard = await assertClassChild(supabase, id);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
