"use client";

import { Play, Lock, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { showCharacterToastWithPurchase } from "@/src/components/ui/CharacterToast";

export type RoadmapItem = {
  id: string;
  title: string;
};

interface VerticalRoadmapProps {
  items: RoadmapItem[];
  topicKey: string;
  completedIds: string[];
  headerTitle?: string;
  isPaid?: boolean;
  onShowPaywall?: () => void;
}

export default function VerticalRoadmap({
  items,
  topicKey,
  completedIds,
  headerTitle,
  isPaid = true,
  onShowPaywall,
}: VerticalRoadmapProps) {
  const router = useRouter();

  const canEnter = (index: number) => {
    if (index === 0) return true;
    const prevId = items[index - 1]?.id;
    return completedIds.includes(prevId);
  };

  const handleLessonClick = (item: RoadmapItem, unlocked: boolean) => {
    if (!isPaid) {
      showCharacterToastWithPurchase(
        "Та эхлээд хичээлийг худалдаж авах ёстой.",
        () => onShowPaywall?.()
      );
      return;
    }
    if (unlocked) {
      router.push(`/topic/${topicKey}/${item.id}`);
    }
  };

  return (
    <div className="relative  flex flex-col items-center pt-10">
      {/* Header with title and purchase button */}
      <div className="mb-9 flex items-center gap-3">
        <div className="inline-block px-12 py-4 bg-white border border-b-4 border-[#46A302] text-[#333333] font-semibold rounded-[16px] shadow-sm">
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
                <div
                  onClick={() => handleLessonClick(item, unlocked)}
                  className={`flex items-center gap-4 ${
                    unlocked ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  {/* Node icon */}
                  <div
                    className={`duo-button w-14 h-14 rounded-2xl flex items-center justify-center ${
                      done
                        ? "duo-button-green"
                        : isCurrent
                        ? "duo-button-green"
                        : "duo-button-gray"
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
                </div>

                {/* Dotted line connector */}
                {!isLast && (
                  <div className="w-0.5 h-16 border-l-2 border-dashed border-gray-300 my-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
