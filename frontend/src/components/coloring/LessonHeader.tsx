"use client";

import { Trophy, ArrowLeft, Palette, Menu } from "lucide-react";

interface LessonHeaderProps {
  title: string;
  onBack: () => void;
  // Mobile props
  selectedColor?: string;
  onOpenColorPalette?: () => void;
  onOpenActions?: () => void;
}

export default function LessonHeader({
  title,
  onBack,
  selectedColor,
  onOpenColorPalette,
  onOpenActions,
}: LessonHeaderProps) {
  return (
    <div className="bg-(--duo-green) px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
      {/* Left - Back button, Trophy and Title */}
      <div className="flex items-center gap-2 lg:gap-3">
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div className="bg-white/20 p-2 rounded-xl hidden lg:block">
          <Trophy size={24} className="text-white" />
        </div>
        <h1 className="text-white font-bold text-base lg:text-lg truncate max-w-[150px] lg:max-w-none">
          {title}
        </h1>
      </div>

      {/* Right - Mobile toolbar triggers */}
      <div className="flex lg:hidden items-center gap-2">
        {/* Color palette button */}
        <button
          onClick={onOpenColorPalette}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
        >
          <div
            className="w-6 h-6 rounded-lg border-2 border-white/50"
            style={{ backgroundColor: selectedColor }}
          />
          <Palette size={20} className="text-white" />
        </button>

        {/* Actions button */}
        <button
          onClick={onOpenActions}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer"
        >
          <Menu size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
