import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";

export async function POST(request: NextRequest) {
  console.log("=== SAVE PURCHASE START ===");

  try {
    const body = await request.json();
    // Support both childIds (string list) and childId (single string)
    const { userId, topicKey, invoiceId, childId, childIds } = body;

    console.log("Request:", { userId, topicKey, invoiceId, childId, childIds });

    if (!userId || !topicKey) {
      return NextResponse.json(
        { success: false, error: "userId and topicKey are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

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

    console.log("Rows to insert:", JSON.stringify(rowsToInsert, null, 2));

    // Purchase хадгалах - insert ашиглана (upsert биш)
    const { data: insertedData, error } = await supabase
      .from("purchases")
      .insert(rowsToInsert)
      .select();

    console.log("Insert result:", { insertedData, error });

    if (error) {
      console.error("=== DATABASE ERROR ===");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);

      // 23505 = duplicate key (аль хэдийн худалдаж авсан)
      if (error.code === "23505") {
        console.log("Purchase already exists - treating as success");
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

    console.log("=== SAVE PURCHASE SUCCESS ===");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("=== SAVE PURCHASE ERROR ===");
    console.error("Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
