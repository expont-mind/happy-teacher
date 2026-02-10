"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Dumbbell,
  Lock,
  ShoppingCart,
  Users,
} from "lucide-react";
import Image from "next/image";

interface TopicInfoCardProps {
  title: string;
  description: string;
  gradeText?: string;
  gradeRange?: string | null;
  childGrade?: number;
  childGrades?: number[];
  lessonCount: number;
  taskCount: number;
  progressPercent: number;
  icon: string;
  price?: number;
  isPaid?: boolean;
  onShowPaywall?: () => void;
  videoUrl?: string;
  isAdult?: boolean;
  isChild?: boolean;
  onSwitchProfile?: () => void;
  topicKey?: string;
}

export default function TopicInfoCard({
  title,
  description,
  gradeText,
  gradeRange,
  childGrade,
  childGrades,
  lessonCount,
  taskCount,
  progressPercent,
  icon,
  price,
  isPaid = true,
  onShowPaywall,
  videoUrl,
  isAdult = false,
  isChild = false,
  onSwitchProfile,
  topicKey,
}: TopicInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGradeDisplay = () => {
    if (!gradeText) return null;
    if (gradeRange) {
      return `${gradeText} - ${gradeRange}-р анги`;
    }
    if (childGrades && childGrades.length > 0) {
      const uniqueGrades = [...new Set(childGrades)].sort((a, b) => a - b);
      if (uniqueGrades.length === 1) {
        return `${gradeText} - ${uniqueGrades[0]}-р анги`;
      }
      const minGrade = Math.min(...uniqueGrades);
      const maxGrade = Math.max(...uniqueGrades);
      return `${gradeText} - ${minGrade}-${maxGrade}-р анги`;
    }
    if (childGrade) {
      return `${gradeText} - ${childGrade}-р анги`;
    }
    return null;
  };

  const gradeDisplay = getGradeDisplay();

  return (
    <div className="bg-white rounded-[16px] border-2 border-[#0C0A0126] lg:sticky lg:top-[125px] flex flex-col overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 p-4 lg:hidden cursor-pointer"
      >
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-[#0C0A0126]">
          <Image src={icon} alt={title} width={24} height={24} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-base font-extrabold text-black font-nunito truncate">
            {title}
          </p>
          {isPaid ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-black text-[#58CC02] shrink-0">
                {progressPercent}%
              </span>
            </div>
          ) : isChild ? (
            <p className="text-xs font-bold text-amber-500 mt-0.5">
              Түгжээтэй
            </p>
          ) : (
            <p className="text-xs font-bold text-[#58CC02] mt-0.5">
              {price?.toLocaleString("en-US")}₮
            </p>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded content — always visible on desktop, toggle on mobile */}
      <div
        className={`flex-col gap-6 p-5 pt-0 lg:!flex lg:!p-5 ${
          isExpanded ? "flex" : "hidden"
        }`}
      >
        {videoUrl && (
          <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {!videoUrl && (
          <div className="relative bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
            <Image
              src={topicKey === "multiplication" ? "/test2.png" : "/test1.png"}
              alt={
                topicKey === "multiplication" ? "Multiplication" : "Fraction"
              }
              width={1000}
              height={1000}
              className={`${
                topicKey === "multiplication"
                  ? "object-center"
                  : "object-bottom"
              } object-cover w-full h-[340px]`}
            />
          </div>
        )}

        <div className="hidden lg:flex w-16 h-16 rounded-md items-center justify-center border border-[#0C0A0126]">
          <Image src={icon} alt={title} width={32} height={32} />
        </div>

        <div className="flex flex-col gap-[10px]">
          <p className="hidden lg:block text-2xl font-extrabold text-black font-nunito">
            {title}
          </p>

          <p className="text-black font-semibold text-xl font-nunito">
            {description}
          </p>

          {gradeDisplay && (
            <p className="text-[#58CC02] font-bold text-base font-nunito">
              /{gradeDisplay}/
            </p>
          )}

          <div className="flex gap-[10px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-[10px]">
              <Calendar size={16} className="text-black" />
              <span className="text-xs font-medium text-[#1F2937]">
                {lessonCount} хичээл
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-[10px]">
              <Dumbbell size={16} className="text-black" />
              <span className="text-xs font-medium text-[#1F2937]">
                {taskCount} даалгавар
              </span>
            </div>
          </div>
        </div>

        {isPaid && isAdult ? (
          <button
            onClick={onSwitchProfile}
            className="duo-button duo-button-green w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <Users size={18} />
            Хүүхдийн профайл руу шилжих
          </button>
        ) : isPaid ? (
          <div className="border border-[#0C0A0126] rounded-[10px] p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Таны явц
              </span>
              <span className="text-sm font-black text-[#58CC02]">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#58CC02] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : isChild ? (
          <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <Lock size={28} className="text-amber-500" />
            <p className="text-base font-bold text-amber-700 font-nunito text-center">
              Эцэг эхээсээ асуугаарай!
            </p>
            <p className="text-xs text-amber-600/80 font-medium font-nunito text-center">
              Энэ хичээлийг нээхийн тулд эцэг эх худалдаж авна
            </p>
          </div>
        ) : (
          <button
            onClick={onShowPaywall}
            className="duo-button duo-button-green w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            {price?.toLocaleString("en-US")}₮ Худалдаж авах
          </button>
        )}
      </div>
    </div>
  );
}
