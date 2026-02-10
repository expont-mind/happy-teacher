
"use client";

import { useState } from "react";
import { Flame, BookOpen, Calendar, Star, Copy, Check } from "lucide-react";
import Image from "next/image";
import { RecentActivity } from "./RecentActivity";

interface ChildData {
  id: string;
  name: string;
  pin_code: string;
  streak_count: number;
  total_lessons: number;
  xp: number;
  level: number;
  avatar: string;
  last_active_at: string | null;
  recent_activity: {
    topic_key: string;
    lesson_id: string;
    completed_at: string;
  }[];
}

interface ChildCardProps {
  child: ChildData;
}

export const ChildCard = ({ child }: ChildCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPin = () => {
    if (!child.pin_code) return;
    navigator.clipboard.writeText(child.pin_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#0C0A0126] w-full bg-white rounded-[16px] p-6 flex flex-col gap-6">
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 rounded-[18px] border-2 border-[#58CC02] overflow-hidden bg-[#58CC02]/10 flex items-center justify-center">
          {child.avatar ? (
            <Image
              src={child.avatar}
              alt={child.name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <span className="text-2xl">👶</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-[#333333] font-nunito leading-tight">
            {child.name}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#FFD700]/20 px-2 py-0.5 rounded-md">
              <Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" />
              <span className="text-xs font-bold text-[#D97706] font-nunito">
                {child.xp} XP
              </span>
            </div>
            {child.pin_code && (
              <button
                onClick={handleCopyPin}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Код хуулах"
              >
                <span className="text-xs font-bold text-gray-500 font-nunito tracking-widest">
                  {child.pin_code}
                </span>
                {copied ? (
                  <Check size={12} className="text-[#58CC02]" strokeWidth={3} />
                ) : (
                  <Copy size={12} className="text-gray-400" strokeWidth={2.5} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F9F9F9] border border-gray-100">
          <div className="flex items-center gap-2 text-gray-400">
            <Flame size={16} className="text-[#FF4B4B]" fill="#FF4B4B" />
            <span className="text-xs font-bold font-nunito uppercase">
              Streak
            </span>
          </div>
          <p className="text-base font-extrabold text-[#333333] font-nunito">
            {child.streak_count} өдөр
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F9F9F9] border border-gray-100">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen size={16} className="text-[#58CC02]" />
            <span className="text-xs font-bold font-nunito uppercase">
              Хичээл
            </span>
          </div>
          <p className="text-base font-extrabold text-[#333333] font-nunito">
            {child.total_lessons}
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#F9F9F9] border border-gray-100">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={16} className="text-[#A855F7]" />
            <span className="text-xs font-bold font-nunito uppercase">
              Сүүлд
            </span>
          </div>
          <p className="text-sm font-extrabold text-[#333333] font-nunito truncate">
            {child.last_active_at
              ? new Date(child.last_active_at).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>

      <RecentActivity activities={child.recent_activity} />
    </div>
  );
};
