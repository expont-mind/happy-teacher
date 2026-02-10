"use client";

import { X, ShoppingBag, Zap, Truck, Package } from "lucide-react";
import Image from "next/image";
import { Coupon } from "@/src/types";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  coupon: Coupon;
  isLoading?: boolean;
  /** XP mode — for child view */
  xpMode?: boolean;
  currentXp?: number;
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  onPurchase,
  coupon,
  isLoading,
  xpMode,
  currentXp = 0,
}: ProductDetailModalProps) {
  if (!isOpen) return null;

  const canAfford = xpMode ? currentXp >= coupon.cost : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10 cursor-pointer"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={coupon.image}
            alt={coupon.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Title + Price */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-[#333333] font-nunito">
              {coupon.title}
            </h2>
            {xpMode ? (
              <div className="flex items-center gap-1.5">
                <Zap size={20} className="text-[#FFD700] fill-[#FFD700]" />
                <span className="text-2xl font-black text-[#FFD700] font-nunito">
                  {coupon.cost} XP
                </span>
              </div>
            ) : (
              <p className="text-2xl font-black text-[#58CC02] font-nunito">
                {coupon.price.toLocaleString()}₮
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-[#6B7280] font-medium text-sm font-nunito leading-relaxed">
            {coupon.description}
          </p>

          {/* Info */}
          <div className="flex flex-col gap-3 bg-[#F9FAFB] rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D6F5D6] flex items-center justify-center shrink-0">
                <Package size={16} className="text-[#58CC02]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563] font-nunito">
                Бодит бүтээгдэхүүн
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D6F5D6] flex items-center justify-center shrink-0">
                <Truck size={16} className="text-[#58CC02]" />
              </div>
              <p className="text-sm font-semibold text-[#4B5563] font-nunito">
                Хүргэлттэй
              </p>
            </div>
          </div>

          {/* Action */}
          {xpMode ? (
            canAfford ? (
              <button
                onClick={() => {
                  onClose();
                  onPurchase();
                }}
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-base cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={18} strokeWidth={2.5} className="fill-white" />
                {coupon.cost} XP - Авах
              </button>
            ) : (
              <div className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold font-nunito text-sm bg-gray-100 text-gray-400 border-2 border-gray-200">
                <Zap size={16} className="text-gray-400" />
                {coupon.cost - currentXp} XP дутуу
              </div>
            )
          ) : (
            <button
              onClick={() => {
                onClose();
                onPurchase();
              }}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-base cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              {coupon.price.toLocaleString()}₮ Худалдаж авах
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
