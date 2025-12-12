"use client";

import { X, Trash2 } from "lucide-react";

interface DeleteChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  childName: string;
}

export default function DeleteChildModal({
  isOpen,
  onClose,
  onConfirm,
  childName,
}: DeleteChildModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[382px] bg-[#FFFAF7] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
        >
          <X size={24} className="text-[#333333]" />
        </button>

        <div className="p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="w-full p-4 flex gap-4 items-center">
              <div className="min-w-[56px] h-[56px] bg-[#FF4B4B26] rounded-full flex items-center justify-center">
                <Trash2 size={28} className="text-[#FF4B4B]" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-extrabold text-[#333333] font-nunito leading-tight">
                  Профайл устгах
                </p>
                <p className="text-xs font-semibold text-[#858480] font-nunito leading-tight mt-1">
                  Энэ үйлдлийг буцаах боломжгүй
                </p>
              </div>
            </div>

            <p className="text-base font-semibold text-[#858480] font-nunito text-center">
              Та <span className="font-bold text-[#333333]">{childName}</span>-н
              профайлыг устгахдаа итгэлтэй байна уу?
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-[10px] bg-white border border-[#0C0A0126] hover:bg-[#F7F7F7] border-b-4 text-[#333333] font-bold text-lg font-nunito rounded-2xl transition-colors uppercase tracking-wide cursor-pointer"
            >
              Болих
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-[10px] bg-[#FF4B4B] hover:bg-[#FF3B3B] border-b-4 border-[#D93030] text-white font-bold text-lg font-nunito rounded-2xl shadow-lg transition-colors uppercase tracking-wide cursor-pointer"
            >
              Устгах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
