"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, ChevronRight } from "lucide-react";

interface ChildTopicCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  lessonCount: number;
  image: string;
  isLocked: boolean;
  progressPercent: number;
  completedCount: number;
}

export default function ChildTopicCard({
  title,
  description,
  icon,
  link,
  lessonCount,
  image,
  isLocked,
  progressPercent,
  completedCount,
}: ChildTopicCardProps) {
  return (
    <Link href={link} className="block group">
      <div
        className={`relative rounded-[20px] border-2 overflow-hidden transition-all duration-200 ${
          isLocked
            ? "border-gray-200 bg-gray-50"
            : "border-[#E5E5E5] bg-white hover:border-[#58CC02]"
        }`}
      >
        {/* Card content */}
        <div className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div
            className={`relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border ${
              isLocked
                ? "border-gray-200 bg-gray-100"
                : "border-[#58CC02] bg-white"
            }`}
          >
            <Image
              src={icon}
              alt={title}
              width={28}
              height={28}
              className={isLocked ? "opacity-40 grayscale" : ""}
            />
            {isLocked && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <Lock size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-extrabold text-base font-nunito truncate ${
                isLocked ? "text-gray-400" : "text-[#333333]"
              }`}
            >
              {title}
            </h3>
            <p
              className={`text-xs font-medium mt-0.5 truncate ${
                isLocked ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {lessonCount} хичээл
            </p>

            {/* Progress bar or locked text */}
            {isLocked ? (
              <p className="text-xs font-bold text-gray-400 mt-2">
                Түгжээтэй
              </p>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {completedCount}/{lessonCount}
                  </span>
                  <span className="text-[10px] font-black text-[#58CC02]">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isLocked
                ? "bg-gray-200 text-gray-400"
                : "bg-[#58CC02] text-white shadow-[0_3px_0_#46A302] group-active:shadow-none group-active:translate-y-[3px]"
            }`}
          >
            <ChevronRight size={20} strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
}
