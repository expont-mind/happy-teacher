"use client";

import { X, RotateCcw } from "lucide-react";

interface ResetConfirmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetConfirmModal({
  isVisible,
  onClose,
  onConfirm,
}: ResetConfirmModalProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} className="text-gray-500" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6">
            <RotateCcw size={40} className="text-orange-600" />
          </div>

          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Дахин эхлэх
          </h2>

          <p className="text-gray-600 font-medium mb-8">
            Бүх будсан зургийг арилгах уу?
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl transition-colors"
            >
              Үгүй
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition-colors"
            >
              Тийм
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
