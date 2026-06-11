import { createClient } from "@/src/utils/supabase/client";

export interface LessonLogArgs {
  childId: string;
  topicKey: string;
  lessonId: string;
  startedAt: Date;
  durationSeconds: number;
  mistakeCount: number;
  xpEarned: number;
  isFirstCompletion: boolean;
}

// Fire-and-forget: never awaited by callers, never throws into the UI.
// One INSERT under the lesson_logs anon-insert RLS policy. A failure is
// swallowed with a warning so the reward modal / navigation are never blocked.
export function logLessonCompletion(args: LessonLogArgs): void {
  try {
    const supabase = createClient();
    supabase
      .from("lesson_logs")
      .insert({
        child_id: args.childId,
        topic_key: args.topicKey,
        lesson_id: args.lessonId,
        started_at: args.startedAt.toISOString(),
        finished_at: new Date().toISOString(),
        duration_seconds: args.durationSeconds,
        mistake_count: args.mistakeCount,
        xp_earned: args.xpEarned,
        is_first_completion: args.isFirstCompletion,
      })
      .then(({ error }) => {
        if (error) console.warn("lesson_logs insert failed:", error.message);
      });
  } catch (err) {
    console.warn("lesson_logs insert threw:", err);
  }
}
