import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/src/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Support both childIds (string list) and childId (single string)
    const { userId, topicKey, invoiceId, childId, childIds } = body;

    if (!userId || !topicKey) {
      return NextResponse.json(
        { success: false, error: "userId and topicKey are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS (needed for child code login)
    const supabase = createServiceRoleClient();

    let rowsToInsert = [];
    if (childIds) {
      const ids = childIds
        .split(",")
        .filter((id: string) => id.trim().length > 0);
      rowsToInsert = ids.map((cid: string) => ({
        user_id: userId,
        topic_key: topicKey,
        child_id: cid,
      }));
    } else if (childId) {
      rowsToInsert.push({
        user_id: userId,
        topic_key: topicKey,
        child_id: childId,
      });
    } else {
      // No child selected - this is now an error
      return NextResponse.json(
        { success: false, error: "At least one child must be selected" },
        { status: 400 }
      );
    }

    // Purchase хадгалах - insert ашиглана (upsert биш)
    const { data: insertedData, error } = await supabase
      .from("purchases")
      .insert(rowsToInsert)
      .select();

    if (error) {
      console.error(
        "Database error saving purchase:",
        error.code,
        error.message
      );

      // 23505 = duplicate key (аль хэдийн худалдаж авсан)
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Already purchased",
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving purchase:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
