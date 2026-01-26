"use client";

import { useState, useSyncExternalStore, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Undo2,
  Redo2,
  Lightbulb,
  Download,
  Flag,
  BookOpen,
  X,
} from "lucide-react";
import Image from "next/image";

interface ActionToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onHelp?: () => void;
  onDownload: () => void;
  onEnd: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onShowIntro?: () => void;
  topicKey?: string;
  tableImage?: string;
}

// Memoized to prevent re-renders when parent state changes (rerender-memo)
const ActionToolbar = memo(function ActionToolbar({
  onUndo,
  onRedo,
  onHelp,
  onDownload,
  onEnd,
  canUndo,
  canRedo,
  onShowIntro,
  topicKey,
  tableImage,
}: ActionToolbarProps) {
  const [showTableModal, setShowTableModal] = useState(false);
  // Use useSyncExternalStore for SSR-safe mounted check (avoids useEffect setState warning)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Memoized handlers to avoid recreation
  const openTableModal = useCallback(() => setShowTableModal(true), []);
  const closeTableModal = useCallback(() => setShowTableModal(false), []);
  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div className="sticky top-6 self-start flex flex-col items-center gap-4">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        data-tutorial="undo-btn"
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 transition-all ${
          canUndo
            ? "bg-white border-blue-200 hover:border-blue-400 cursor-pointer"
            : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
        }`}
      >
        <Undo2
          size={28}
          className={canUndo ? "text-blue-500" : "text-gray-400"}
        />
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        data-tutorial="redo-btn"
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 transition-all ${
          canRedo
            ? "bg-white border-green-200 hover:border-green-400 cursor-pointer"
            : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
        }`}
      >
        <Redo2
          size={28}
          className={canRedo ? "text-green-500" : "text-gray-400"}
        />
      </button>

      {/* Help/Hint Button */}
      {/* {onHelp && ( */}
      <button
        onClick={onHelp}
        data-tutorial="lesson-help-btn"
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-white border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer"
      >
        <Lightbulb size={28} className="text-yellow-500" />
      </button>
      {/* )} */}

      {/* Download Button */}
      <button
        onClick={onDownload}
        data-tutorial="download-btn"
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-white border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
      >
        <Download size={28} className="text-purple-500" />
      </button>

      {/* Story/Intro Button - for fractions */}
      {onShowIntro && topicKey !== "multiplication" && (
        <button
          onClick={onShowIntro}
          data-tutorial="story-btn"
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-white border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
        >
          <BookOpen size={28} className="text-blue-500" />
        </button>
      )}

      {/* Multiplication Table Button - for multiplication */}
      {topicKey === "multiplication" && tableImage ? (
        <button
          onClick={openTableModal}
          data-tutorial="table-btn"
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-white border-orange-200 hover:border-orange-400 transition-all cursor-pointer"
        >
          <BookOpen size={28} className="text-orange-500" />
        </button>
      ) : null}

      {/* Finish Button */}
      <button
        onClick={onEnd}
        data-tutorial="done-btn"
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-(--duo-green) border-green-400 hover:bg-(--duo-green-dark) transition-all cursor-pointer"
      >
        <Flag size={28} className="text-white" />
      </button>

      {/* Table Image Modal - rendered via Portal to appear above all content */}
      {mounted && showTableModal && tableImage
        ? createPortal(
            <div
              className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={closeTableModal}
            >
              <div
                className="relative bg-white rounded-4xl p-4 max-w-[90vw] max-h-[90vh] shadow-2xl"
                onClick={stopPropagation}
              >
                <button
                  onClick={closeTableModal}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer z-10"
                >
                  <X size={24} className="text-gray-600" />
                </button>
                <Image
                  src={tableImage}
                  alt="Үржвэрийн хүснэгт"
                  width={600}
                  height={600}
                  className="rounded-xl max-h-[80vh] w-auto object-contain"
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
});

export default ActionToolbar;
