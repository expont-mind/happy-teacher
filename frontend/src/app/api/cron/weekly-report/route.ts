import { createClient } from "@/src/utils/supabase/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET(request: Request) {
  const supabase = await createClient();

  // Get all parents
  const { data: parentsData } = await supabase.auth.admin.listUsers();

  const logs: string[] = [];

  if (parentsData?.users) {
    for (const parent of parentsData.users) {
      const settings = parent.user_metadata?.notification_settings || {
        weeklyReport: true,
      };

      if (!settings.weeklyReport || !parent.email) {
        logs.push(
          `Skipped ${parent.email || parent.id} (Settings OFF or No Email)`
        );
        continue;
      }

      // Get parent's children
      const { data: children } = await supabase
        .from("children")
        .select("id, name")
        .eq("parent_id", parent.id);

      if (!children || children.length === 0) {
        logs.push(`Skipped ${parent.email} (No children)`);
        continue;
      }

      // Calculate weekly progress for each child
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      let reportHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #58CC02;">7 хоногийн тайлан 📊</h2>
          <p style="font-size: 16px;">Сайн байна уу! Энэ 7 хоногт таны хүүхдүүдийн явц:</p>
      `;

      let totalLessons = 0;

      for (const child of children) {
        // Get completed lessons count
        const { count } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("child_id", child.id)
          .gte("completed_at", oneWeekAgo.toISOString());

        const lessonsCount = count || 0;
        totalLessons += lessonsCount;

        reportHtml += `
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${child.name}</h3>
            <p style="margin: 5px 0; font-size: 16px;">
              ✅ Дууссан хичээл: <strong>${lessonsCount}</strong>
            </p>
          </div>
        `;
      }

      reportHtml += `
          <div style="margin: 30px 0; padding: 20px; background: #58CC02; color: white; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Нийт дууссан хичээл</h3>
            <p style="margin: 0; font-size: 32px; font-weight: bold;">${totalLessons}</p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Гайхалтай ахиц гаргаж байна! Үргэлжлүүлээрэй! 🎉
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Happy Academy Team</p>
        </div>
      `;

      // Send email
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          await transporter.sendMail({
            from: "Happy Academy <noreply@happyteacher.mn>",
            to: parent.email,
            subject: "7 хоногийн тайлан - Happy Academy",
            html: reportHtml,
          });
          logs.push(`✅ Email sent to ${parent.email}`);
        } catch (error: any) {
          logs.push(`❌ Error sending to ${parent.email}: ${error.message}`);
        }
      } else {
        logs.push(`📧 Mock email to ${parent.email}`);
      }

      // Insert notification to database
      await supabase.from("notifications").insert({
        user_id: parent.id,
        type: "weekly_report",
        title: "7 хоногийн тайлан",
        message: `Энэ 7 хоногт нийт ${totalLessons} хичээл дууссан байна.`,
      });
    }
  }

  return NextResponse.json({
    success: true,
    processed: logs.length,
    logs,
  });
}
