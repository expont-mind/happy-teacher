"use client";

import { Play, Lock, Check } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export type RoadmapItem = {
  id: string;
  title: string;
};

interface VerticalRoadmapProps {
  items: RoadmapItem[];
  topicKey: string;
  completedIds: string[];
  headerTitle?: string;
}

export default function VerticalRoadmap({
  items,
  topicKey,
  completedIds,
  headerTitle,
}: VerticalRoadmapProps) {
  // Check if lesson can be entered (first one or previous completed)
  const canEnter = (index: number) => {
    if (index === 0) return true;
    const prevId = items[index - 1]?.id;
    return completedIds.includes(prevId);
  };

  // Find current lesson (first unlocked but not completed)
  const currentLesson = useMemo(() => {
    for (let i = 0; i < items.length; i++) {
      const unlocked = canEnter(i);
      const done = completedIds.includes(items[i].id);
      if (unlocked && !done) {
        return items[i];
      }
    }
    // All completed, return last one
    return items[items.length - 1];
  }, [items, completedIds]);

  return (
    <div className="relative  flex flex-col items-center pt-10">
      {/* Header button with first lesson */}
      <div className="mb-6">
        <div className="inline-block px-6 py-3 bg-white border-2 border-(--duo-green) text-gray-700 font-bold rounded-full shadow-sm">
          {headerTitle || items[0]?.title || "Хичээл"}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative w-full flex flex-col items-center">
        {/* Lesson nodes */}
        <div className="flex flex-col items-center">
          {items.map((item, idx) => {
            const unlocked = canEnter(idx);
            const done = completedIds.includes(item.id);
            const isCurrent = unlocked && !done;
            const isLast = idx === items.length - 1;

            return (
              <div key={item.id} className="flex flex-col items-center">
                {/* Node with label */}
                <Link
                  href={unlocked ? `/topic/${topicKey}/${item.id}` : "#"}
                  className={`flex items-center gap-4 ${
                    unlocked ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  {/* Node icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      done
                        ? "bg-(--duo-green)"
                        : isCurrent
                        ? "bg-(--duo-green)"
                        : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {done ? (
                      <Check size={24} className="text-white" strokeWidth={3} />
                    ) : isCurrent ? (
                      <Play
                        size={24}
                        className="text-white ml-1"
                        fill="white"
                      />
                    ) : (
                      <Lock size={20} className="text-gray-400" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`font-medium text-sm ${
                      done || isCurrent ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>

                {/* Dotted line connector */}
                {!isLast && (
                  <div className="w-0.5 h-16 border-l-2 border-dashed border-gray-300 my-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom floating card */}
      <div className="mt-8 bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">{currentLesson?.title}</h3>
        <Link
          href={`/topic/${topicKey}/${currentLesson?.id}`}
          className="block w-full py-3 bg-(--duo-green) hover:bg-(--duo-green-dark) text-white font-bold text-center rounded-xl transition-colors"
        >
          ЭХЛЭХ
        </Link>
      </div>
    </div>
  );
}
