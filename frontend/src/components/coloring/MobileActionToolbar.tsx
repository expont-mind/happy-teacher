"use client";

import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { Undo2, Redo2, Lightbulb, Download, Flag } from "lucide-react";

interface MobileActionToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHelp: () => void;
  onDownload: () => void;
  onEnd: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function MobileActionToolbar({
  isOpen,
  onClose,
  onUndo,
  onRedo,
  onHelp,
  onDownload,
  onEnd,
  canUndo,
  canRedo,
}: MobileActionToolbarProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction(onUndo)}
          disabled={!canUndo}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Undo2 size={24} className="text-blue-500" />
          <span className="font-medium text-gray-700">Буцаах</span>
        </button>

        <button
          onClick={() => handleAction(onRedo)}
          disabled={!canRedo}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-200 bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Redo2 size={24} className="text-green-500" />
          <span className="font-medium text-gray-700">Дахих</span>
        </button>

        <button
          onClick={() => handleAction(onHelp)}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-yellow-200 bg-yellow-50 cursor-pointer"
        >
          <Lightbulb size={24} className="text-yellow-500" />
          <span className="font-medium text-gray-700">Тусламж</span>
        </button>

        <button
          onClick={() => handleAction(onDownload)}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 cursor-pointer"
        >
          <Download size={24} className="text-purple-500" />
          <span className="font-medium text-gray-700">Татах</span>
        </button>

        <button
          onClick={() => handleAction(onEnd)}
          className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500 text-white cursor-pointer"
        >
          <Flag size={24} />
          <span className="font-bold">Дуусгах</span>
        </button>
      </div>
    </BottomSheet>
  );
}
