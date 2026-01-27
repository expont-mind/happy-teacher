"use client";

import { useEffect, useRef, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimerDisplayProps {
  /** Time limit in seconds for countdown (review lessons). null = stopwatch mode (new lessons). */
  timeLimit: number | null;
  /** Called when countdown reaches 0 */
  onTimeUp?: () => void;
  /** Whether the timer is running */
  isRunning: boolean;
  /** Reports elapsed seconds every tick (used by new lessons to track time) */
  onElapsedChange?: (seconds: number) => void;
  /** If true, the timer is visible (review lessons). If false, runs silently (new lessons). */
  visible: boolean;
  /** Change this value to reset the timer's internal elapsed counter */
  resetKey?: number;
}

export default function TimerDisplay({
  timeLimit,
  onTimeUp,
  isRunning,
  onElapsedChange,
  visible,
  resetKey = 0,
}: TimerDisplayProps) {
  const elapsedRef = useRef(0);
  const hasCalledTimeUp = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const formatTime = useCallback((totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  const getRemaining = useCallback((): number => {
    if (timeLimit === null) return Infinity;
    return Math.max(0, timeLimit - elapsedRef.current);
  }, [timeLimit]);

  // Update display without re-rendering
  const updateDisplay = useCallback(() => {
    if (!displayRef.current || !visible) return;
    const remaining = getRemaining();
    const timeText = displayRef.current.querySelector("[data-time]");
    if (timeText) {
      timeText.textContent = formatTime(
        remaining === Infinity ? elapsedRef.current : remaining,
      );
    }

    // Update color classes
    if (timeLimit !== null) {
      const ratio = remaining / timeLimit;
      const badge = displayRef.current;
      badge.classList.remove(
        "bg-green-100",
        "text-green-700",
        "border-green-300",
        "bg-yellow-100",
        "text-yellow-700",
        "border-yellow-300",
        "bg-red-100",
        "text-red-700",
        "border-red-300",
        "animate-pulse",
      );
      if (ratio > 0.3) {
        badge.classList.add(
          "bg-green-100",
          "text-green-700",
          "border-green-300",
        );
      } else if (ratio > 0.1) {
        badge.classList.add(
          "bg-yellow-100",
          "text-yellow-700",
          "border-yellow-300",
        );
      } else {
        badge.classList.add(
          "bg-red-100",
          "text-red-700",
          "border-red-300",
          "animate-pulse",
        );
      }
    }
  }, [visible, getRemaining, formatTime, timeLimit]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      onElapsedChange?.(elapsedRef.current);

      if (visible) {
        updateDisplay();
      }

      // Check if time is up
      if (
        timeLimit !== null &&
        elapsedRef.current >= timeLimit &&
        !hasCalledTimeUp.current
      ) {
        hasCalledTimeUp.current = true;
        onTimeUp?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLimit, onTimeUp, onElapsedChange, visible, updateDisplay]);

  // Reset when resetKey or timeLimit changes
  useEffect(() => {
    elapsedRef.current = 0;
    hasCalledTimeUp.current = false;
    // Also update display immediately on reset
    if (visible && displayRef.current) {
      const timeText = displayRef.current.querySelector("[data-time]");
      if (timeText) {
        timeText.textContent = formatTime(timeLimit ?? 0);
      }
      // Reset color to green
      if (timeLimit !== null) {
        const badge = displayRef.current;
        badge.classList.remove(
          "bg-yellow-100",
          "text-yellow-700",
          "border-yellow-300",
          "bg-red-100",
          "text-red-700",
          "border-red-300",
          "animate-pulse",
        );
        badge.classList.add(
          "bg-green-100",
          "text-green-700",
          "border-green-300",
        );
      }
    }
  }, [resetKey, timeLimit, visible, formatTime]);

  if (!visible) return null;

  // Initial color
  const initialColorClass = "bg-green-100 text-green-700 border-green-300";

  return (
    <div
      ref={displayRef}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-sm shadow-sm ${initialColorClass}`}
    >
      <Clock size={16} />
      <span data-time>{formatTime(timeLimit ?? 0)}</span>
    </div>
  );
}
