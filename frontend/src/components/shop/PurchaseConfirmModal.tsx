"use client";

import { X, ShoppingBag } from "lucide-react";
import { Coupon } from "@/src/data/coupons";

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  coupon: Coupon | null;
  isLoading: boolean;
}

export default function PurchaseConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  coupon,
  isLoading,
}: PurchaseConfirmModalProps) {
  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[382px] bg-[#FFFAF7] rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
          disabled={isLoading}
        >
          <X size={24} className="text-[#333333]" />
        </button>

        <div className="p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="w-full p-4 flex gap-4 items-center">
              <div className="min-w-[56px] h-[56px] bg-[#58CC0226] rounded-full flex items-center justify-center">
                <ShoppingBag size={28} className="text-[#58CC02]" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-extrabold text-[#333333] font-nunito leading-tight">
                  Купон авах
                </p>
                <p className="text-xs font-semibold text-[#858480] font-nunito leading-tight mt-1">
                  {coupon.cost} XP зарцуулагдана
                </p>
              </div>
            </div>

            <p className="text-base font-semibold text-[#858480] font-nunito text-center">
              Та{" "}
              <span className="font-bold text-[#333333]">{coupon.title}</span>-г{" "}
              <span className="font-bold text-[#58CC02]">{coupon.cost} XP</span>
              -ээр авахдаа итгэлтэй байна уу?
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-[10px] bg-white border border-[#0C0A0126] shadow-[0_4px_0_#E5E5E5] active:shadow-none active:translate-y-1 text-[#333333] font-bold text-lg font-nunito rounded-2xl transition-all uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Болих
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-[10px] bg-[#58CC02] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 text-white font-bold text-lg font-nunito rounded-2xl transition-all uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Авах"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
