"use client";

import { Check, Lock, Star, Sparkles } from "lucide-react";
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
      const patterns = [50, 30, 50, 70, 50, 30, 50, 70]; // Repeating pattern
      const x = patterns[idx % patterns.length];

      // Calculate Y position (downward flow)
      const rowHeight = 200;
      const y = 100 + idx * rowHeight;

      return { x, y };
    });
  }, [items]);

  // Calculate total height for container
  const containerHeight = useMemo(() => {
    if (items.length === 0) return 500;
    return items.length * 200 + 200;
  }, [items.length]);

  return (
    <div className="space-y-6">
      {/* Progress Bar - Duolingo Style */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300 shadow-inner">
        <div
          className="h-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-600 transition-all duration-700 flex items-center justify-end pr-3 shadow-lg"
          style={{ width: `${progressPercent}%` }}
        >
          <span className="text-xs font-extrabold text-white drop-shadow-md">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Duolingo Style Roadmap */}
      <div
        className="relative bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 md:p-10 border-4 border-indigo-200 shadow-2xl overflow-hidden"
        style={{ minHeight: `${containerHeight}px` }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #9333ea 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Path SVG - Smooth Curved Paths */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="pathUnlocked" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {items.map((_, idx) => {
            if (idx === 0) return null;
            const current = cardPositions[idx];
            const prev = cardPositions[idx - 1];

            const isUnlocked = canEnter(idx);
            const prevCompleted = completedIds.includes(items[idx - 1]?.id);

            // Create smooth S-curve between points
            const midY = (prev.y + current.y) / 2;
            const controlPoint1X = prev.x;
            const controlPoint1Y = prev.y + (current.y - prev.y) * 0.3;
            const controlPoint2X = current.x;
            const controlPoint2Y = current.y - (current.y - prev.y) * 0.3;

            return (
              <g key={`path-${idx}`}>
                {/* Path shadow for depth */}
                <path
                  d={`M ${prev.x}% ${prev.y} C ${controlPoint1X}% ${controlPoint1Y}, ${controlPoint2X}% ${controlPoint2Y}, ${current.x}% ${current.y}`}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.4}
                />
                {/* Main curved path */}
                <path
                  d={`M ${prev.x}% ${prev.y} C ${controlPoint1X}% ${controlPoint1Y}, ${controlPoint2X}% ${controlPoint2Y}, ${current.x}% ${current.y}`}
                  stroke={
                    prevCompleted
                      ? "url(#pathGradient)"
                      : isUnlocked
                      ? "url(#pathUnlocked)"
                      : "#d1d5db"
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  opacity={prevCompleted ? 1 : isUnlocked ? 0.7 : 0.3}
                  className="transition-all duration-500"
                  filter={prevCompleted ? "url(#glow)" : undefined}
                />
              </g>
            );
          })}
        </svg>

        {/* Lessons - Positioned absolutely for zigzag effect */}
        <div className="relative" style={{ zIndex: 1 }}>
          {items.map((item, idx) => {
            const unlocked = canEnter(idx);
            const done = completedIds.includes(item.id);
            const isFirst = idx === 0;
            const position = cardPositions[idx];

            // Card colors based on state
            const cardColors = done
              ? {
                  bg: "from-emerald-400 via-green-500 to-teal-600",
                  border: "border-emerald-500",
                  shadow: "shadow-emerald-400/50",
                  glow: "shadow-[0_0_20px_rgba(16,185,129,0.6)]",
                }
              : unlocked
              ? {
                  bg: "from-blue-400 via-indigo-500 to-purple-600",
                  border: "border-indigo-400",
                  shadow: "shadow-indigo-300/50",
                  glow: "shadow-[0_0_15px_rgba(99,102,241,0.4)]",
                }
              : {
                  bg: "from-gray-300 to-gray-400",
                  border: "border-gray-400",
                  shadow: "shadow-gray-300/30",
                  glow: "",
                };

            return (
              <div
                key={item.id}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}px`,
                }}
              >
                {/* Lesson Card */}
                <div
                  className={`relative w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 ${
                    cardColors.border
                  } ${
                    cardColors.shadow
                  } transition-all duration-500 transform hover:scale-110 hover:rotate-2 cursor-pointer ${
                    done
                      ? `bg-linear-to-br ${cardColors.bg} ${cardColors.glow} animate-pulse`
                      : unlocked
                      ? `bg-linear-to-br ${cardColors.bg} ${cardColors.glow}`
                      : `bg-linear-to-br ${cardColors.bg} opacity-50 grayscale`
                  }`}
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/30 via-transparent to-transparent pointer-events-none" />

                  {/* Lesson Number Badge */}
                  <div
                    className={`absolute -top-3 -left-3 w-10 h-10 md:w-12 md:h-12 rounded-full border-3 md:border-4 flex items-center justify-center font-extrabold text-base md:text-lg shadow-xl z-10 ${
                      done
                        ? "bg-emerald-500 border-emerald-600 text-white"
                        : unlocked
                        ? "bg-indigo-500 border-indigo-600 text-white"
                        : "bg-gray-400 border-gray-500 text-gray-700"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Lock Overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl backdrop-blur-sm">
                      <Lock
                        size={28}
                        className="text-white drop-shadow-2xl animate-pulse"
                      />
                    </div>
                  )}

                  {/* Completion Check */}
                  {done && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl z-20 animate-bounce">
                      <Check size={20} className="text-white font-bold" />
                    </div>
                  )}

                  {/* Sparkle for first lesson */}
                  {isFirst && unlocked && !done && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-2xl z-20 animate-pulse">
                      <Sparkles
                        size={18}
                        className="text-yellow-800 fill-yellow-800"
                      />
                    </div>
                  )}

                  {/* Star for next available */}
                  {!isFirst &&
                    unlocked &&
                    !done &&
                    idx > 0 &&
                    completedIds.includes(items[idx - 1]?.id) && (
                      <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-2xl z-20 animate-pulse">
                        <Star
                          size={18}
                          className="text-yellow-800 fill-yellow-800"
                        />
                      </div>
                    )}

                  {/* Lesson Content */}
                  <div className="h-full flex flex-col items-center justify-center p-2 md:p-3 text-center">
                    <div
                      className={`text-[9px] md:text-xs font-bold mb-1 ${
                        done
                          ? "text-emerald-50"
                          : unlocked
                          ? "text-indigo-50"
                          : "text-gray-500"
                      }`}
                    >
                      Урок {idx + 1}
                    </div>
                    <div
                      className={`text-[10px] md:text-sm font-extrabold leading-tight px-1 ${
                        done
                          ? "text-white drop-shadow-md"
                          : unlocked
                          ? "text-white drop-shadow-md"
                          : "text-gray-600"
                      }`}
                    >
                      {item.title.length > 12
                        ? `${item.title.substring(0, 12)}...`
                        : item.title}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {unlocked ? (
                    <a
                      href={`/topic/${topicKey}/${item.id}`}
                      className={`cursor-pointer inline-block px-4 py-2 rounded-full text-white font-extrabold text-xs md:text-sm shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 ${
                        done
                          ? "bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                          : "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      }`}
                    >
                      {done ? "Дахин" : "Эхлэх"}
                    </a>
                  ) : (
                    <div className="px-4 py-2 rounded-full bg-gray-400 text-gray-700 font-semibold text-xs md:text-sm inline-block shadow-lg">
                      <Lock size={12} className="inline mr-1" />
                      Цоожтой
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
