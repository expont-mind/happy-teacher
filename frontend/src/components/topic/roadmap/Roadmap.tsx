"use client";

import { Check, Lock, Star, BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";

export type RoadmapItem = {
  id: string;
  title: string;
};

interface RoadmapProps {
  topicKey: string;
  items: RoadmapItem[];
}

export default function Roadmap({ topicKey, items }: RoadmapProps) {
  const { getCompletedLessons } = useAuth();
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCompletedLessons = async () => {
      const completed = await getCompletedLessons(topicKey);
      setCompletedIds(completed);
    };
    loadCompletedLessons();
  }, [topicKey, getCompletedLessons]);

  const canEnter = (index: number) => {
    if (index === 0) return true;
    const prevId = items[index - 1]?.id;
    return completedIds.includes(prevId);
  };

  const progressPercent = useMemo(() => {
    if (items.length === 0) return 0;
    const done = items.filter((i) => completedIds.includes(i.id)).length;
    return Math.round((done / items.length) * 100);
  }, [completedIds, items]);

  // Calculate card positions - Zigzag downward flow like Duolingo
  const cardPositions = useMemo(() => {
    return items.map((_, idx) => {
      // Alternate between left (30%), center (50%), and right (70%)
      const patterns = [50, 30, 50, 70, 50, 30, 50, 70];
      const x = patterns[idx % patterns.length];

      // Calculate Y position (downward flow)
      const rowHeight = 180;
      const y = 80 + idx * rowHeight;

      return { x, y };
    });
  }, [items]);

  // Calculate total height for container
  const containerHeight = useMemo(() => {
    if (items.length === 0) return 500;
    return items.length * 180 + 150;
  }, [items.length]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar - Duolingo Style */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-600">Таны явц</span>
          <span
            className="text-sm font-black"
            style={{ color: "var(--duo-green)" }}
          >
            {progressPercent}%
          </span>
        </div>
        <div className="duo-progress">
          <div
            className="duo-progress-fill"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-white">
              {progressPercent > 10 && `${progressPercent}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Roadmap Container */}
      <div
        className="relative bg-white rounded-3xl p-6 md:p-10 border-2 border-gray-200 shadow-lg overflow-hidden"
        style={{ minHeight: `${containerHeight}px` }}
      >
        {/* Path SVG - Smooth Curved Paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--duo-green)" />
              <stop offset="100%" stopColor="var(--duo-green-dark)" />
            </linearGradient>
            <linearGradient id="pathGray" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E5E5E5" />
              <stop offset="100%" stopColor="#CECECE" />
            </linearGradient>
          </defs>
          {items.map((_, idx) => {
            if (idx === 0) return null;
            const current = cardPositions[idx];
            const prev = cardPositions[idx - 1];

            const prevCompleted = completedIds.includes(items[idx - 1]?.id);

            // Create smooth S-curve between points
            const controlPoint1X = prev.x;
            const controlPoint1Y = prev.y + (current.y - prev.y) * 0.3;
            const controlPoint2X = current.x;
            const controlPoint2Y = current.y - (current.y - prev.y) * 0.3;

            return (
              <g key={`path-${idx}`}>
                {/* Path shadow */}
                <path
                  d={`M ${prev.x}% ${prev.y} C ${controlPoint1X}% ${controlPoint1Y}, ${controlPoint2X}% ${controlPoint2Y}, ${current.x}% ${current.y}`}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Main path */}
                <path
                  d={`M ${prev.x}% ${prev.y} C ${controlPoint1X}% ${controlPoint1Y}, ${controlPoint2X}% ${controlPoint2Y}, ${current.x}% ${current.y}`}
                  stroke={
                    prevCompleted ? "url(#pathGradient)" : "url(#pathGray)"
                  }
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500"
                />
              </g>
            );
          })}
        </svg>

        {/* Lessons */}
        <div className="relative" style={{ zIndex: 1 }}>
          {items.map((item, idx) => {
            const unlocked = canEnter(idx);
            const done = completedIds.includes(item.id);
            const position = cardPositions[idx];

            return (
              <div
                key={item.id}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}px`,
                }}
              >
                {/* Lesson Circle */}
                <div
                  className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 transition-all duration-300 cursor-pointer ${
                    done
                      ? "bg-[var(--duo-green)] border-[var(--duo-green-dark)] shadow-lg hover:scale-110"
                      : unlocked
                      ? "bg-white border-gray-300 shadow-md hover:scale-110 hover:border-[var(--duo-blue)]"
                      : "bg-gray-200 border-gray-300 opacity-60"
                  }`}
                >
                  {/* Lock Overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-400/30 rounded-full backdrop-blur-sm">
                      <Lock
                        size={24}
                        className="text-gray-600"
                        strokeWidth={2.5}
                      />
                    </div>
                  )}

                  {/* Completion Check */}
                  {done && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Check
                          size={32}
                          className="text-[var(--duo-green)]"
                          strokeWidth={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Star for next available */}
                  {!done &&
                    unlocked &&
                    idx > 0 &&
                    completedIds.includes(items[idx - 1]?.id) && (
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-[var(--duo-yellow)] rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-pulse">
                        <Star
                          size={16}
                          className="text-white fill-white"
                          strokeWidth={2.5}
                        />
                      </div>
                    )}

                  {/* Lesson Icon & Number */}
                  {!done && unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen
                          size={32}
                          className="text-[var(--duo-blue)] mx-auto mb-1"
                          strokeWidth={2.5}
                        />
                        <div className="text-xs font-bold text-gray-600">
                          {idx + 1}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Title */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={`text-sm font-bold ${
                      done
                        ? "text-[var(--duo-green)]"
                        : unlocked
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-2">
                  {unlocked ? (
                    <a
                      href={`/topic/${topicKey}/${item.id}`}
                      className="cursor-pointer"
                    >
                      <button
                        className={`duo-button px-6 py-2 text-xs ${
                          done ? "duo-button-gray" : "duo-button-green"
                        }`}
                      >
                        {done ? "Дахин" : "Эхлэх"}
                      </button>
                    </a>
                  ) : (
                    <div className="px-6 py-2 rounded-xl bg-gray-200 text-gray-500 font-bold text-xs flex items-center gap-1">
                      <Lock size={12} strokeWidth={2.5} />
                      <span>Цоожтой</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
