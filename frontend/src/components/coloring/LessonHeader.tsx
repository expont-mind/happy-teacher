"use client";

import { Trophy, ArrowLeft, Palette, Menu, Undo2, Redo2, Lightbulb, Download, Flag, BookOpen } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

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
    <div className="sticky top-0 z-40 lg:static bg-(--duo-green) px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between rounded-t-2xl lg:rounded-b-none">
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
        {/* Color palette dropdown */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              data-tutorial="mobile-color-picker"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <div
                className="w-6 h-6 rounded-lg border-2 border-white/50"
                style={{ backgroundColor: selectedColor }}
              />
              <Palette size={20} className="text-white" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              sideOffset={8}
              align="end"
            >
              <div className="grid grid-cols-4 gap-3">
                {colors.map(({ color, label }) => (
                  <Popover.Close key={color} asChild>
                    <button
                      onClick={() => onSelectColor?.(color)}
                      className="flex flex-col items-center gap-1 transition-all cursor-pointer"
                      aria-label={`Select color ${color}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl transition-all ${
                          selectedColor === color
                            ? "ring-3 ring-offset-2 ring-gray-400 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                      {label && (
                        <span
                          className={`text-xs font-semibold ${
                            selectedColor === color
                              ? "text-purple-600"
                              : "text-gray-600"
                          }`}
                        >
                          {label}
                        </span>
                      )}
                    </button>
                  </Popover.Close>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Actions dropdown */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              data-tutorial="mobile-actions-menu"
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={24} className="text-white" />
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
                    <span className="font-medium text-gray-700 text-sm">Буцаах</span>
                  </button>
                </Popover.Close>

                <Popover.Close asChild>
                  <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-green-200 bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Redo2 size={20} className="text-green-500" />
                    <span className="font-medium text-gray-700 text-sm">Дахих</span>
                  </button>
                </Popover.Close>

                <Popover.Close asChild>
                  <button
                    onClick={onHelp}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-yellow-200 bg-yellow-50 cursor-pointer"
                  >
                    <Lightbulb size={20} className="text-yellow-500" />
                    <span className="font-medium text-gray-700 text-sm">Тусламж</span>
                  </button>
                </Popover.Close>

                <Popover.Close asChild>
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-purple-200 bg-purple-50 cursor-pointer"
                  >
                    <Download size={20} className="text-purple-500" />
                    <span className="font-medium text-gray-700 text-sm">Татах</span>
                  </button>
                </Popover.Close>

                {onShowIntro && (
                  <Popover.Close asChild>
                    <button
                      onClick={onShowIntro}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer"
                    >
                      <BookOpen size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-700 text-sm">Түүх</span>
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
