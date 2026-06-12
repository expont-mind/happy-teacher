import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  // Clamp pagination: positive integers, limit in [1, 200], offset >= 0.
  const limit = Math.min(
    Math.max(Math.trunc(Number(searchParams.get("limit")) || 50), 1),
    200
  );
  const offset = Math.max(
    Math.trunc(Number(searchParams.get("offset")) || 0),
    0
  );

  const supabase = createAdminClient();

  const { data: logs, error } = await supabase
    .from("lesson_logs")
    .select("*")
    .eq("child_id", id)
    // finished_at is nullable; add a stable id tiebreaker so pagination is
    // deterministic and nulls don't shuffle between pages.
    .order("finished_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Totals across ALL logs for this child, computed in the DB (avoids the
  // 1000-row PostgREST select cap that would silently undercount).
  const { data: totalsRows, error: totalsError } = await supabase.rpc(
    "child_log_totals",
    { p_child_id: id }
  );

  if (totalsError) {
    return NextResponse.json({ error: totalsError.message }, { status: 500 });
  }

  const row = Array.isArray(totalsRows) ? totalsRows[0] : totalsRows;
  const totals = {
    lessons: Number(row?.lessons || 0),
    seconds: Number(row?.seconds || 0),
    mistakes: Number(row?.mistakes || 0),
    xp: Number(row?.xp || 0),
  };

  return NextResponse.json({ logs: logs || [], totals });
}
