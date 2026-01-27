/**
 * localStorage utility for saving/loading lesson completion times.
 * Used by the timed review system to track how long a student takes
 * to complete a lesson, and to set countdown timers for review lessons.
 */

const KEY_PREFIX = "lesson_time:";

export function saveLessonTime(
  topicKey: string,
  lessonId: string,
  seconds: number,
): void {
  try {
    localStorage.setItem(
      `${KEY_PREFIX}${topicKey}:${lessonId}`,
      String(Math.round(seconds)),
    );
  } catch {
    console.warn("Failed to save lesson time to localStorage");
  }
}

export function getLessonTime(
  topicKey: string,
  lessonId: string,
): number | null {
  try {
    const val = localStorage.getItem(
      `${KEY_PREFIX}${topicKey}:${lessonId}`,
    );
    if (val === null) return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}
