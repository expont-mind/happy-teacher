"use client";

import { Calendar, Clock, Play, ShoppingCart } from "lucide-react";

interface TopicInfoCardProps {
  title: string;
  description: string;
  lessonCount: number;
  taskCount: number;
  progressPercent: number;
  iconType?: "fractions" | "multiplication";
  isPaid?: boolean;
  onShowPaywall?: () => void;
  videoUrl?: string;
}

const TOPIC_PRICE = 3;

function FractionsIcon() {
  return (
    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
      <div className="grid grid-cols-2 gap-1 text-green-600 font-bold text-lg">
        <span>−</span>
        <span>×</span>
        <span>+</span>
        <span>=</span>
      </div>
    </div>
  );
}

function MultiplicationIcon() {
  return (
    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
      <svg
        width={32}
        height={32}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-purple-600"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>
  );
}

export default function TopicInfoCard({
  title,
  description,
  lessonCount,
  taskCount,
  progressPercent,
  iconType = "fractions",
  isPaid = true,
  onShowPaywall,
  videoUrl,
}: TopicInfoCardProps) {
  return (
    <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg p-6 lg:sticky lg:top-18">
      {videoUrl && (
        <div className="mb-6">
          <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {!videoUrl && (
        <div className="mb-6">
          <div className="relative aspect-video bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Play size={28} className="text-gray-400 ml-1" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Тайлбар видео</p>
            </div>
          </div>
        </div>
      )}

      {/* Icon */}
      {iconType === "multiplication" ? <MultiplicationIcon /> : <FractionsIcon />}

      {/* Title */}
      <h2 className="text-2xl font-black text-gray-800 mb-2">{title}</h2>

      {/* Description */}
      <p className="text-gray-600 font-medium mb-6">{description}</p>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            {lessonCount} хичээл
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
          <Clock size={18} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            {taskCount} даалгавар
          </span>
        </div>
      </div>

      {isPaid && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Таны явц
            </span>
            <span className="text-sm font-black text-(--duo-green)">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-(--duo-green) transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {!isPaid && (
        <button
          onClick={onShowPaywall}
          className="duo-button duo-button-green w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {TOPIC_PRICE}₮ Худалдаж авах
        </button>
      )}
    </div>
  );
}
