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
      // Adult only / No child selected
      rowsToInsert.push({
        user_id: userId,
        topic_key: topicKey,
        child_id: null,
      });
    }

    // Purchase хадгалах (Use upsert to handle potential duplicates safely)
    const { error } = await supabase.from("purchases").upsert(rowsToInsert, {
      onConflict: "user_id, topic_key, child_id",
      ignoreDuplicates: true,
    });

    if (error) {
      if (error.code === "23505") {
        console.log("Purchase already exists");
        return NextResponse.json({
          success: true,
          message: "Already purchased",
        });
      }

      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
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
