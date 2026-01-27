"use client";

import { memo } from "react";
import { Clock, RotateCcw } from "lucide-react";

interface TimeUpModalProps {
  isVisible: boolean;
  onRestart: () => void;
}

const TimeUpModal = memo(function TimeUpModal({
  isVisible,
  onRestart,
}: TimeUpModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <Clock size={40} className="text-red-600" />
          </div>

          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Хугацаа дууслаа!
          </h2>

          <p className="text-gray-600 font-medium mb-8">
            Цаг дууссан байна. Дахин оролдоорой!
          </p>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={20} />
            Дахин эхлэх
          </button>
        </div>
      </div>
    </div>
  );
});

export default TimeUpModal;
