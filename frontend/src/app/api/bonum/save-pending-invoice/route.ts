import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/src/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, invoiceId, status } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // If status is provided, this is a status update
    if (status && status !== "pending") {
      const { error } = await supabase
        .from("pending_invoices")
        .update({ status })
        .eq("transaction_id", transactionId);

      if (error) {
        console.error("Error updating pending invoice status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Otherwise, create/upsert a new pending invoice
    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required for new invoices" },
        { status: 400 }
      );
    }

    const { qrCode, amount, userId, purchaseType, topicKey, childIds, couponId, phone } = body;

    const { error } = await supabase.from("pending_invoices").upsert(
      {
        transaction_id: transactionId,
        invoice_id: invoiceId,
        qr_code: qrCode,
        amount,
        user_id: userId || null,
        purchase_type: purchaseType || null,
        topic_key: topicKey || null,
        child_ids: childIds || null,
        coupon_id: couponId || null,
        phone: phone || null,
        status: "pending",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "transaction_id" }
    );

    if (error) {
      console.error("Error saving pending invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in save-pending-invoice:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
