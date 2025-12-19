import { createClient } from "@/src/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { userId, type, message, title } = body;

  if (!userId || !type) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // 1. Fetch User Settings (from Authenticated User)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = {
    lessonProgress: true,
    inactivityReminder: true,
    weeklyReport: true,
  };

  if (user.user_metadata?.notification_settings) {
    settings = user.user_metadata.notification_settings;
  }

  // 2. Logic to Send
  const results = {
    emailSent: false,
    log: [] as string[],
  };

  if (type === "lesson_progress") {
    if (settings.lessonProgress && user.email) {
      if (process.env.RESEND_API_KEY) {
        try {
          const { error } = await resend.emails.send({
            from: "Happy Teacher <noreply@happyteacher.mn>",
            to: user.email,
            subject: title,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #58CC02;">${title}</h2>
                <p style="font-size: 16px;">${message}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Happy Teacher Team</p>
              </div>
            `,
          });

          if (error) {
            console.error("Resend Error:", error);
            results.log.push(`Email failed: ${error.message}`);
          } else {
            results.emailSent = true;
            results.log.push("Email sent via Resend");
          }
        } catch (e: any) {
          console.error("Email Error:", e);
          results.log.push(`Email error: ${e.message}`);
        }
      } else {
        console.log(
          `[Email Service] Mock Sending 'Lesson Progress Report' to ${user.email}: ${title}`
        );
        results.emailSent = true;
        results.log.push("Email sent via Mock Service (No API Key)");
      }
    } else {
      results.log.push("Email skipped (Settings OFF or No Email)");
    }
  }

  if (type === "inactivity_reminder") {
    if (settings.inactivityReminder && user.email) {
      if (process.env.RESEND_API_KEY) {
        try {
          const { error } = await resend.emails.send({
            from: "Happy Teacher <noreply@happyteacher.mn>",
            to: user.email,
            subject: title || "Хичээлээ санаж байна уу?",
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #58CC02;">${
                  title || "Хичээлээ санаж байна уу?"
                }</h2>
                <p style="font-size: 16px;">${message}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Happy Teacher Team</p>
              </div>
            `,
          });

          if (error) {
            console.error("Resend Error:", error);
            results.log.push(`Email failed: ${error.message}`);
          } else {
            results.emailSent = true;
            results.log.push("Email sent via Resend");
          }
        } catch (e: any) {
          console.error("Email Error:", e);
          results.log.push(`Email error: ${e.message}`);
        }
      } else {
        console.log(
          `[Email Service] Mock Sending 'Inactivity Reminder' to ${user.email}: ${message}`
        );
        results.emailSent = true;
        results.log.push("Email sent via Mock Service (No API Key)");
      }
    } else {
      results.log.push("Email skipped (Settings OFF or No Email)");
    }
  }

  if (type === "weekly_report") {
    if (settings.weeklyReport && user.email) {
      if (process.env.RESEND_API_KEY) {
        try {
          const { error } = await resend.emails.send({
            from: "Happy Teacher <noreply@happyteacher.mn>",
            to: user.email,
            subject: title || "7 хоногийн тайлан",
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #58CC02;">${title || "7 хоногийн тайлан"}</h2>
                <p style="font-size: 16px;">${message}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Happy Teacher Team</p>
              </div>
            `,
          });

          if (error) {
            console.error("Resend Error:", error);
            results.log.push(`Email failed: ${error.message}`);
          } else {
            results.emailSent = true;
            results.log.push("Email sent via Resend");
          }
        } catch (e: any) {
          console.error("Email Error:", e);
          results.log.push(`Email error: ${e.message}`);
        }
      } else {
        console.log(
          `[Email Service] Mock Sending 'Weekly Report' to ${user.email}: ${message}`
        );
        results.emailSent = true;
        results.log.push("Email sent via Mock Service (No API Key)");
      }
    } else {
      results.log.push("Email skipped (Settings OFF or No Email)");
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    debug: {
      hasKey: !!process.env.RESEND_API_KEY,
      userEmail: user?.email,
      settingsState: settings,
    },
  });
}
