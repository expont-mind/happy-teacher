import { createClient } from "@/src/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  // 1. Check Inactivity (Simulated Daily Check)
  // Find children inactive for > 2 days
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const { data: inactiveChildren } = await supabase
    .from("children")
    .select("id, name, parent_id, last_active_at")
    .lt("last_active_at", twoDaysAgo.toISOString());

  const logs = [];

  if (inactiveChildren && inactiveChildren.length > 0) {
    for (const child of inactiveChildren) {
      // Fetch Parent Settings
      // Note: In a real app we would join tables or batch fetch.
      const { data: parent } = await supabase.auth.admin.getUserById(
        child.parent_id
      );
      const settings = parent?.user?.user_metadata?.notification_settings || {
        sms: false,
      };

      if (settings.sms) {
        // Mock SMS
        console.log(
          `[SMS] Sending inactivity reminder for ${child.name} to parent ${child.parent_id}`
        );
        logs.push(`SMS sent to ${child.parent_id} for ${child.name}`);
      } else {
        logs.push(`SMS skipped for ${child.name} (Settings OFF)`);
      }

      // Always insert DB notification
      await supabase.from("notifications").insert({
        user_id: child.parent_id,
        type: "inactivity_reminder",
        title: "Хичээлээ санаж байна уу?",
        message: `${child.name} сүүлийн 2 өдөр хичээл хийсэнгүй.`,
      });
    }
  }

  // 2. Weekly Report (Simulated Monday Check)
  // For demo, we'll just check if query param ?type=weekly is present or just run it.
  // ... similar logic ...

  return NextResponse.json({
    success: true,
    processed: inactiveChildren?.length || 0,
    logs,
  });
}
