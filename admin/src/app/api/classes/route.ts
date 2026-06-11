import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach child counts (one grouped query, mapped in memory).
  const { data: children } = await supabase
    .from("children")
    .select("class_id")
    .not("class_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of children || []) {
    counts.set(row.class_id, (counts.get(row.class_id) || 0) + 1);
  }

  const withCounts = (classes || []).map((c) => ({
    ...c,
    child_count: counts.get(c.id) || 0,
  }));

  return NextResponse.json({ classes: withCounts });
}

export async function POST(request: NextRequest) {
  let name = "";
  let description: string | null = null;
  try {
    const body = await request.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    description =
      typeof body.description === "string" ? body.description.trim() : null;
  } catch {
    // fall through to validation
  }

  if (!name) {
    return NextResponse.json({ error: "Нэр шаардлагатай" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({ name, description })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ class: data });
}
