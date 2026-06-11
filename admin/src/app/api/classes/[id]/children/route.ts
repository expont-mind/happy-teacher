import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateUniquePin } from "@/lib/pin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: children, error } = await supabase
    .from("children")
    .select("id, name, pin_code, avatar, age, class, xp, level, last_active_at, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Lessons-done count per child (one query, grouped in memory).
  const ids = (children || []).map((c) => c.id);
  const lessonCounts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: progress } = await supabase
      .from("child_progress")
      .select("child_id")
      .in("child_id", ids);
    for (const row of progress || []) {
      lessonCounts.set(row.child_id, (lessonCounts.get(row.child_id) || 0) + 1);
    }
  }

  const withCounts = (children || []).map((c) => ({
    ...c,
    lessons_done: lessonCounts.get(c.id) || 0,
  }));

  return NextResponse.json({ children: withCounts });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let name = "";
  let avatar: string | null = null;
  let age: number | null = null;
  let grade: number | null = null;
  try {
    const body = await request.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    avatar = typeof body.avatar === "string" ? body.avatar : null;
    age = typeof body.age === "number" ? body.age : null;
    // `class` here is the child's GRADE level (integer), not class_id.
    grade = typeof body.class === "number" ? body.class : null;
  } catch {
    // fall through
  }

  if (!name) {
    return NextResponse.json({ error: "Нэр шаардлагатай" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let pin: string;
  try {
    pin = await generateUniquePin(supabase);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PIN алдаа" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("children")
    .insert({
      name,
      pin_code: pin,
      avatar,
      age,
      class: grade,
      class_id: id,
      parent_id: null,
    })
    .select("id, name, pin_code, avatar, age, class")
    .single();

  if (error) {
    // 23505 = unique violation (PIN race) — surface a retryable message.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "PIN давхцал гарлаа, дахин оролдоно уу" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ child: data });
}
