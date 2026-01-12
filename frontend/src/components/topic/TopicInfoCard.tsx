"use client";

import { Calendar, Dumbbell, Play, ShoppingCart, Users } from "lucide-react";
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
  price = 3,
  isPaid = true,
  onShowPaywall,
  videoUrl,
  isAdult = false,
  onSwitchProfile,
  topicKey,
}: TopicInfoCardProps) {
  // Ангийн текстийг бэлдэх
  const getGradeDisplay = () => {
    if (!gradeText) return null;

    // Хэрэв gradeRange тогтмол өгөгдсөн бол (жишээ: "1-5")
    if (gradeRange) {
      return `${gradeText} - ${gradeRange}-р анги`;
    }

    // Хэрэв олон хүүхдийн ангиуд өгөгдсөн бол (3-7 гэх мэтээр харуулах)
    if (childGrades && childGrades.length > 0) {
      const uniqueGrades = [...new Set(childGrades)].sort((a, b) => a - b);
      if (uniqueGrades.length === 1) {
        return `${gradeText} - ${uniqueGrades[0]}-р анги`;
      }
      // Олон анги байвал хамгийн бага - хамгийн их гэж харуулах
      const minGrade = Math.min(...uniqueGrades);
      const maxGrade = Math.max(...uniqueGrades);
      return `${gradeText} - ${minGrade}-${maxGrade}-р анги`;
    }

    // Ганц хүүхдийн анги
    if (childGrade) {
      return `${gradeText} - ${childGrade}-р анги`;
    }

    return null;
  };

  const gradeDisplay = getGradeDisplay();
  return (
    <div className="bg-white rounded-[16px] border-2 border-[#0C0A0126] p-5 lg:sticky lg:top-[125px] flex flex-col gap-6">
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
          {/* <div className="text-center">
            <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-3">
              <Play size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Тайлбар видео</p>
          </div> */}
          <Image
            src={topicKey === "multiplication" ? "/test2.png" : "/test1.png"}
            alt={topicKey === "multiplication" ? "Multiplication" : "Fraction"}
            width={1000}
            height={1000}
            className={`${topicKey === "multiplication" ? "object-center" : "object-bottom"} object-cover w-full h-[340px]`}
          />
        </div>
      )}

      <div className="w-16 h-16 rounded-md flex items-center justify-center border border-[#0C0A0126]">
        <Image src={icon} alt={title} width={32} height={32} />
      </div>

      <div className="flex flex-col gap-[10px]">
        <p className="text-2xl font-extrabold text-black font-nunito">
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
      ) : (
        <button
          onClick={onShowPaywall}
          className="duo-button duo-button-green w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {price}₮ Худалдаж авах
        </button>
      )}
    </div>
  );
}
