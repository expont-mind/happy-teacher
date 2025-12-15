"use client";

import { Undo2, Redo2, Lightbulb, Download, Flag } from "lucide-react";

interface ActionToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onHelp: () => void;
  onDownload: () => void;
  onEnd: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function ActionToolbar({
  onUndo,
  onRedo,
  onHelp,
  onDownload,
  onEnd,
  canUndo,
  canRedo,
}: ActionToolbarProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 transition-all ${
          canUndo
            ? "bg-white border-blue-200 hover:border-blue-400"
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
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 transition-all ${
          canRedo
            ? "bg-white border-green-200 hover:border-green-400"
            : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
        }`}
      >
        <Redo2
          size={28}
          className={canRedo ? "text-green-500" : "text-gray-400"}
        />
      </button>

      {/* Help/Hint Button */}
      <button
        onClick={onHelp}
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-white border-yellow-200 hover:border-yellow-400 transition-all"
      >
        <Lightbulb size={28} className="text-yellow-500" />
      </button>

      {/* Download Button */}
      <button
        onClick={onDownload}
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-white border-purple-200 hover:border-purple-400 transition-all"
      >
        <Download size={28} className="text-purple-500" />
      </button>

      {/* Finish Button */}
      <button
        onClick={onEnd}
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md border-2 bg-(--duo-green) border-green-400 hover:bg-(--duo-green-dark) transition-all"
      >
        <Flag size={28} className="text-white" />
      </button>
    </div>
  );
}
