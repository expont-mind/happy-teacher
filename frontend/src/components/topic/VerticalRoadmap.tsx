"use client";

import { Play, Lock, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  showCharacterToastWithPurchase,
  showCharacterToast,
} from "@/src/components/ui/CharacterToast";
import Image from "next/image";
import { TOPICS_DATA } from "@/src/data/topics";

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
  isAdult?: boolean;
}

export default function VerticalRoadmap({
  items,
  topicKey,
  completedIds,
  headerTitle,
  isPaid = true,
  onShowPaywall,
  isAdult = false,
}: VerticalRoadmapProps) {
  const router = useRouter();
  const planetImage = TOPICS_DATA.find((t) =>
    t.link.includes(topicKey)
  )?.planet;

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

    if (isAdult) {
      showCharacterToast(
        "Та хичээл хийхийн тулд хүүхдийн профайлаар нэвтрэнэ үү.",
        "yellow"
      );
      return;
    }

    if (unlocked) {
      router.push(`/topic/${topicKey}/${item.id}`);
    }
  };

  // Calculate positions for curved path (Desktop only)
  const nodeSpacing = 100;
  const curveAmount = 80;

  return (
    <div className="flex flex-col items-center pt-10 w-full">
      {/* Header with title and purchase button */}
      <div className="mb-9 flex items-center gap-3">
        <div className="inline-block px-12 py-4 bg-white border border-b-4 border-[#46A302] text-[#333333] font-semibold rounded-[16px] shadow-sm">
          {headerTitle || items[0]?.title || "Хичээл"}
        </div>
      </div>

      {/* --- DESKTOP VIEW (Curved Roadmap) --- */}
      <div className="hidden md:block relative w-full max-w-sm mx-auto">
        <svg
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          width="400"
          height={items.length * nodeSpacing}
          style={{ overflow: "visible" }}
        >
          {items.map((_, idx) => {
            if (idx === items.length - 1) return null;

            const getPos = (i: number) => {
              const pattern = i % 4;
              if (pattern === 0) return 200;
              if (pattern === 1) return 200 + curveAmount;
              if (pattern === 2) return 200;
              return 200 - curveAmount;
            };

            const startX = getPos(idx);
            const endX = getPos(idx + 1);
            const startY = idx * nodeSpacing + 28;
            const endY = (idx + 1) * nodeSpacing + 28;

            const verticalDisplacement = (endY - startY) * 0.5;
            const control1X = startX;
            const control1Y = startY + verticalDisplacement;
            const control2X = endX;
            const control2Y = endY - verticalDisplacement;

            return (
              <path
                key={idx}
                d={`M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`}
                stroke="#D1D5DB"
                strokeWidth="4"
                strokeDasharray="12 12"
                fill="none"
                strokeLinecap="round"
                className="opacity-70"
              />
            );
          })}
        </svg>

        <div className="relative flex flex-col items-center">
          {items.map((item, idx) => {
            const unlocked = canEnter(idx);
            const done = completedIds.includes(item.id);
            const isCurrent = unlocked && !done;

            const pattern = idx % 4;
            let xOffset = 0;
            if (pattern === 1) xOffset = curveAmount;
            if (pattern === 3) xOffset = -curveAmount;

            const textOnRight = pattern === 1 || pattern === 2;

            return (
              <div
                key={item.id}
                className="flex items-center absolute"
                style={{
                  top: `${idx * nodeSpacing}px`,
                  left: "50%",
                  transform: `translateX(calc(-50% + ${xOffset}px))`,
                }}
              >
                {!textOnRight && (
                  <div className="absolute right-[calc(100%+16px)]">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                      <span
                        className={`font-bold text-sm whitespace-nowrap ${
                          done || isCurrent ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  onClick={() => handleLessonClick(item, unlocked)}
                  className={`nav-item-transition relative z-10 w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                    done
                      ? "bg-[#58CC02] border-[#46A302] cursor-pointer"
                      : isCurrent
                      ? "bg-[#58CC02] border-[#46A302] cursor-pointer"
                      : "bg-[#E5E5E5] border-[#CECECE] cursor-not-allowed"
                  }`}
                >
                  {done ? (
                    <Star
                      size={24}
                      className="text-white"
                      strokeWidth={3}
                      fill="white"
                    />
                  ) : isCurrent ? (
                    <Play
                      size={24}
                      className="text-white ml-0.5"
                      fill="white"
                    />
                  ) : (
                    <Lock size={20} className="text-[#AFAFAF]" />
                  )}

                  {isCurrent && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#58CC02] text-xs font-black px-2 py-1 rounded-lg border-2 border-[#58CC02] shadow-sm animate-bounce">
                      START
                    </div>
                  )}
                </div>

                {textOnRight && (
                  <div className="absolute left-[calc(100%+16px)]">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                      <span
                        className={`font-bold text-sm whitespace-nowrap ${
                          done || isCurrent ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ height: `${items.length * nodeSpacing}px` }} />
      </div>

      {/* --- MOBILE VIEW (Duolingo-style Snaking Roadmap) --- */}
      <div className="md:hidden relative w-full">
        {(() => {
          const mobileNodeSpacing = 110;
          const mobileCurve = 60;

          const getMobilePos = (i: number) => {
            const pattern = i % 4;
            if (pattern === 0) return 0;
            if (pattern === 1) return mobileCurve;
            if (pattern === 2) return 0;
            return -mobileCurve;
          };

          return (
            <div className="relative w-full max-w-[280px] mx-auto">
              {/* SVG connecting paths */}
              <svg
                className="absolute top-0 left-0 w-full pointer-events-none"
                style={{ height: `${items.length * mobileNodeSpacing}px`, overflow: "visible" }}
              >
                {items.map((_, idx) => {
                  if (idx === items.length - 1) return null;

                  const startX = 140 + getMobilePos(idx);
                  const endX = 140 + getMobilePos(idx + 1);
                  const startY = idx * mobileNodeSpacing + 32;
                  const endY = (idx + 1) * mobileNodeSpacing + 32;
                  const midY = (startY + endY) / 2;

                  return (
                    <path
                      key={idx}
                      d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                      stroke="#D1D5DB"
                      strokeWidth="4"
                      strokeDasharray="10 8"
                      fill="none"
                      strokeLinecap="round"
                      className="opacity-60"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              <div className="relative flex flex-col items-center">
                {items.map((item, idx) => {
                  const unlocked = canEnter(idx);
                  const done = completedIds.includes(item.id);
                  const isCurrent = unlocked && !done;
                  const xOffset = getMobilePos(idx);

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center"
                      style={{
                        height: `${mobileNodeSpacing}px`,
                        transform: `translateX(${xOffset}px)`,
                      }}
                    >
                      <div
                        onClick={() => handleLessonClick(item, unlocked)}
                        className={`relative z-10 ${unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
                      >
                        <div
                          className={`nav-item-transition w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                            done
                              ? "bg-[#58CC02] border-[#46A302]"
                              : isCurrent
                              ? "bg-[#58CC02] border-[#46A302] ring-4 ring-[#58CC02]/20"
                              : "bg-[#E5E5E5] border-[#CECECE]"
                          }`}
                        >
                          {done ? (
                            <Star size={28} className="text-white" strokeWidth={3} fill="white" />
                          ) : isCurrent ? (
                            <Play size={28} className="text-white ml-0.5" fill="white" />
                          ) : (
                            <Lock size={22} className="text-[#AFAFAF]" />
                          )}
                        </div>
                      </div>
                      {isCurrent ? (
                        <div className="mt-2 bg-white text-[#58CC02] text-xs font-black px-3 py-1 rounded-lg border-2 border-[#58CC02] shadow-sm animate-bounce whitespace-nowrap">
                          START
                        </div>
                      ) : (
                        <span
                          className={`mt-1.5 font-bold text-xs text-center max-w-[140px] leading-tight ${
                            done ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {item.title}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ height: `${items.length * mobileNodeSpacing}px` }} className="sr-only" />
            </div>
          );
        })()}
      </div>

      {planetImage && (
        <Image
          src={planetImage}
          alt="Topic End Image"
          width={200}
          height={200}
          className="object-center object-cover"
        />
      )}
    </div>
  );
}
