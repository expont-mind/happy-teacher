"use client";

import { Flag } from "lucide-react";

interface FinishButtonProps {
  onClick: () => void;
}

export default function FinishButton({ onClick }: FinishButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-(--duo-green) hover:bg-(--duo-green-dark) text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-lg flex items-center gap-3 transition-all active:scale-95"
    >
      Дуусгах
      <Flag size={24} className="text-white" />
    </button>
  );
}
