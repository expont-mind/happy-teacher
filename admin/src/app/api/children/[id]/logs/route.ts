import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;

  const supabase = createAdminClient();

  const { data: logs, error } = await supabase
    .from("lesson_logs")
    .select("*")
    .eq("child_id", id)
    .order("finished_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Totals across ALL logs for this child (not just the page).
  const { data: allForTotals, error: totalsError } = await supabase
    .from("lesson_logs")
    .select("duration_seconds, mistake_count, xp_earned")
    .eq("child_id", id);

  if (totalsError) {
    return NextResponse.json({ error: totalsError.message }, { status: 500 });
  }

  const totals = (allForTotals || []).reduce(
    (acc, row) => ({
      lessons: acc.lessons + 1,
      seconds: acc.seconds + (row.duration_seconds || 0),
      mistakes: acc.mistakes + (row.mistake_count || 0),
      xp: acc.xp + (row.xp_earned || 0),
    }),
    { lessons: 0, seconds: 0, mistakes: 0, xp: 0 }
  );

  return NextResponse.json({ logs: logs || [], totals });
}
