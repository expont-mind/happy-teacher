"use client";

import { memo } from "react";
import { Flag } from "lucide-react";

interface FinishButtonProps {
  onClick: () => void;
}

// Memoized to prevent re-renders when parent state changes (rerender-memo)
const FinishButton = memo(function FinishButton({ onClick }: FinishButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-(--duo-green) hover:bg-(--duo-green-dark) text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-lg flex items-center gap-3 transition-all active:scale-95"
    >
      Дуусгах
      <Flag size={24} className="text-white" />
    </button>
  );
});

export default FinishButton;
