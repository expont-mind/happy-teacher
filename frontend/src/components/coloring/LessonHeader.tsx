"use client";

import {
  Trophy,
  ArrowLeft,
  Menu,
  Undo2,
  Redo2,
  Lightbulb,
  Download,
  Flag,
  BookOpen,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { FractionLabel } from "@/src/components/ui/Fraction";

interface LessonHeaderProps {
  title: string;
  onBack: () => void;
  // Mobile props
  selectedColor?: string;
  colors?: { color: string; label?: string }[];
  onSelectColor?: (color: string) => void;
  // Action handlers
  onUndo?: () => void;
  onRedo?: () => void;
  onHelp?: () => void;
  onDownload?: () => void;
  onEnd?: () => void;
  onShowIntro?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function LessonHeader({
  title,
  onBack,
  selectedColor,
  colors = [],
  onSelectColor,
  onUndo,
  onRedo,
  onHelp,
  onDownload,
  onEnd,
  onShowIntro,
  canUndo = false,
  canRedo = false,
}: LessonHeaderProps) {
  return (
    <div className="sticky top-0 z-40 lg:static bg-(--duo-green) px-2 lg:px-6 py-2 lg:py-4 flex items-center gap-2 rounded-t-2xl lg:rounded-b-none">
      {/* Back button */}
      <button
        onClick={onBack}
        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer shrink-0"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>

      {/* Desktop: Trophy and Title */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl">
          <Trophy size={24} className="text-white" />
        </div>
        <h1 className="text-white font-bold text-lg">{title}</h1>
      </div>

      {/* Mobile: Color palette in single row */}
      {colors.length > 0 && (
        <div
          className="lg:hidden flex-1 overflow-x-auto scrollbar-hide"
          data-tutorial="mobile-color-picker"
        >
          <div className="flex gap-1 min-w-max">
            {colors.map(({ color, label }, index) => (
              <button
                key={`${color}-${index}`}
                onClick={() => onSelectColor?.(color)}
                className={`flex items-center gap-1 px-1.5 py-1 rounded-lg transition-all ${
                  selectedColor === color
                    ? "bg-white/30"
                    : "hover:bg-white/20"
                }`}
                aria-label={`Select color ${color}`}
              >
                <div
                  className={`w-6 h-6 rounded-md border-2 transition-all ${
                    selectedColor === color
                      ? "border-white shadow-md"
                      : "border-white/40"
                  }`}
                  style={{ backgroundColor: color }}
                />
                {label && (
                  <FractionLabel
                    label={label}
                    className={`text-xs font-bold ${
                      selectedColor === color ? "text-white" : "text-white/80"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile actions menu */}
      <div className="lg:hidden shrink-0">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              data-tutorial="mobile-actions-menu"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={20} className="text-white" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              sideOffset={8}
              align="end"
            >
              <div className="grid grid-cols-2 gap-2 min-w-[240px]">
                <Popover.Close asChild>
                  <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Undo2 size={20} className="text-blue-500" />
                    <span className="font-medium text-gray-700 text-sm">
                      Буцаах
                    </span>
                  </button>
                </Popover.Close>

                <Popover.Close asChild>
                  <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-green-200 bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Redo2 size={20} className="text-green-500" />
                    <span className="font-medium text-gray-700 text-sm">
                      Дахих
                    </span>
                  </button>
                </Popover.Close>

                {onHelp && (
                  <Popover.Close asChild>
                    <button
                      onClick={onHelp}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 border-yellow-200 bg-yellow-50 cursor-pointer"
                    >
                      <Lightbulb size={20} className="text-yellow-500" />
                      <span className="font-medium text-gray-700 text-sm">
                        Тусламж
                      </span>
                    </button>
                  </Popover.Close>
                )}

                <Popover.Close asChild>
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-purple-200 bg-purple-50 cursor-pointer"
                  >
                    <Download size={20} className="text-purple-500" />
                    <span className="font-medium text-gray-700 text-sm">
                      Татах
                    </span>
                  </button>
                </Popover.Close>

                {onShowIntro && (
                  <Popover.Close asChild>
                    <button
                      onClick={onShowIntro}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer"
                    >
                      <BookOpen size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-700 text-sm">
                        Түүх
                      </span>
                    </button>
                  </Popover.Close>
                )}

                <Popover.Close asChild>
                  <button
                    onClick={onEnd}
                    className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500 text-white cursor-pointer"
                  >
                    <Flag size={20} />
                    <span className="font-bold text-sm">Дуусгах</span>
                  </button>
                </Popover.Close>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
