"use client";

import { Trophy, ArrowLeft } from "lucide-react";

interface LessonHeaderProps {
  title: string;
  onBack: () => void;
}

export default function LessonHeader({ title, onBack }: LessonHeaderProps) {
  return (
    <div className="bg-(--duo-green) px-6 py-4 flex items-center justify-between">
      {/* Left - Back button, Trophy and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div className="bg-white/20 p-2 rounded-xl">
          <Trophy size={24} className="text-white" />
        </div>
        <h1 className="text-white font-bold text-lg">{title}</h1>
      </div>
    </div>
  );
}
