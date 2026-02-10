import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/src/utils/supabase/server";

interface PendingInvoice {
  id: string;
  transaction_id: string;
  invoice_id: string;
  qr_code: string;
  amount: number;
  user_id: string;
  purchase_type: string;
  topic_key: string | null;
  child_ids: string | null;
  coupon_id: string | null;
  phone: string | null;
  status: string;
  expires_at: string;
}

interface CompletedPurchase {
  transactionId: string;
  purchaseType: string;
  topicKey?: string;
  code?: string;
}

function generateCode(prefix: string) {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
}

async function checkBonumStatus(qrCode: string): Promise<{ isPaid: boolean; isExpired: boolean }> {
  const BONUM_BASE_URL = process.env.BONUM_BASE_URL;
  const BONUM_TOKEN_BASE_URL = process.env.BONUM_TOKEN_BASE_URL;
  const BONUM_APP_SECRET = process.env.BONUM_APP_SECRET;
  const BONUM_DEFAULT_TERMINAL_ID = process.env.BONUM_DEFAULT_TERMINAL_ID;

  if (!BONUM_BASE_URL || !BONUM_TOKEN_BASE_URL || !BONUM_APP_SECRET || !BONUM_DEFAULT_TERMINAL_ID) {
    return { isPaid: false, isExpired: false };
  }

  try {
    // Get access token
    const tokenResponse = await fetch(`${BONUM_BASE_URL}/ecommerce/auth/create`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `AppSecret ${BONUM_APP_SECRET}`,
        "X-TERMINAL-ID": BONUM_DEFAULT_TERMINAL_ID,
      },
    });

    if (!tokenResponse.ok) return { isPaid: false, isExpired: false };

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.accessToken;

    // Check invoice status
    const response = await fetch(`${BONUM_TOKEN_BASE_URL}/merchant/transaction/qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ qrCode }),
    });

    const data = await response.json();
    const invoiceStatus = data.data?.invoice?.status;
    const isPaid = invoiceStatus === "PAID" || invoiceStatus === "SUCCESS" || invoiceStatus === "COMPLETED";
    const isExpired = invoiceStatus === "EXPIRED";

    return { isPaid, isExpired };
  } catch (error) {
    console.error("Error checking Bonum status:", error);
    return { isPaid: false, isExpired: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch pending invoices for this user
    const { data: pendingInvoices, error: fetchError } = await supabase
      .from("pending_invoices")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching pending invoices:", fetchError);
      return NextResponse.json({ completedPurchases: [] });
    }

    if (!pendingInvoices || pendingInvoices.length === 0) {
      return NextResponse.json({ completedPurchases: [] });
    }

    const completedPurchases: CompletedPurchase[] = [];

    for (const invoice of pendingInvoices as PendingInvoice[]) {
      if (!invoice.qr_code) continue;

      const { isPaid, isExpired } = await checkBonumStatus(invoice.qr_code);

      if (isPaid) {
        // Complete the purchase based on type
        if (invoice.purchase_type === "topic" && invoice.topic_key && invoice.child_ids) {
          // Topic purchase — insert into purchases table
          const childIdList = invoice.child_ids
            .split(",")
            .filter((id: string) => id.trim().length > 0);

          const rowsToInsert = childIdList.map((childId: string) => ({
            user_id: invoice.user_id,
            topic_key: invoice.topic_key,
            child_id: childId.trim(),
          }));

          const { error: purchaseError } = await supabase
            .from("purchases")
            .insert(rowsToInsert);

          if (purchaseError && purchaseError.code !== "23505") {
            console.error("Error completing topic purchase:", purchaseError);
            continue;
          }

          completedPurchases.push({
            transactionId: invoice.transaction_id,
            purchaseType: "topic",
            topicKey: invoice.topic_key,
          });
        } else if (invoice.purchase_type === "product" && invoice.coupon_id) {
          // Product purchase — insert into child_coupons
          const { data: couponData } = await supabase
            .from("coupons")
            .select("code_prefix")
            .eq("id", invoice.coupon_id)
            .single();

          const code = generateCode(couponData?.code_prefix || "CODE");
          const childId = invoice.user_id;

          const { error: orderError } = await supabase
            .from("child_coupons")
            .insert({
              child_id: childId,
              coupon_id: invoice.coupon_id,
              code,
              is_used: false,
              delivery_status: "pending",
              phone: invoice.phone,
              purchase_type: "qpay",
            });

          if (orderError) {
            console.error("Error completing product purchase:", orderError);
            continue;
          }

          completedPurchases.push({
            transactionId: invoice.transaction_id,
            purchaseType: "product",
            code,
          });
        }

        // Mark as completed
        await supabase
          .from("pending_invoices")
          .update({ status: "completed" })
          .eq("id", invoice.id);
      } else if (isExpired) {
        // Mark as expired
        await supabase
          .from("pending_invoices")
          .update({ status: "expired" })
          .eq("id", invoice.id);
      }
    }

    return NextResponse.json({ completedPurchases });
  } catch (error) {
    console.error("Error in check-pending-payments:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", completedPurchases: [] },
      { status: 500 }
    );
  }
}
