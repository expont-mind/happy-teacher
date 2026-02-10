import { Coupon } from "@/src/types";
import Image from "next/image";
import { Zap, Info } from "lucide-react";

interface XpCouponCardProps {
  coupon: Coupon;
  currentXp: number;
  onPurchase: (coupon: Coupon) => void;
  isLoading?: boolean;
  onDetail?: (coupon: Coupon) => void;
}

export const XpCouponCard = ({
  coupon,
  currentXp,
  onPurchase,
  isLoading,
  onDetail,
}: XpCouponCardProps) => {
  const canAfford = currentXp >= coupon.cost;

  return (
    <div className="group relative bg-white border-2 border-[#E5E5E5] rounded-[24px] overflow-hidden hover:border-[#58CC02] transition-all duration-300 flex flex-col h-full">
      {/* Clickable area for detail */}
      <div
        className={onDetail ? "cursor-pointer" : ""}
        onClick={onDetail ? () => onDetail(coupon) : undefined}
      >
        {/* Image */}
        <div className="relative w-full aspect-4/3">
          <Image
            src={coupon.image}
            alt={coupon.title}
            fill
            className="object-cover"
          />
          {/* XP Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#FFD700]/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md">
            <Zap size={14} className="text-white fill-white" />
            <p className="text-white font-bold text-sm font-nunito">
              {coupon.cost} XP
            </p>
          </div>
          {/* Info badge */}
          {onDetail && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-md">
              <Info size={14} className="text-[#58CC02]" />
              <p className="text-[#4B5563] font-bold text-xs font-nunito">
                Дэлгэрэнгүй
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 grow p-5">
          <h3 className="text-[#4B5563] font-extrabold font-nunito text-lg leading-tight group-hover:text-[#58CC02] transition-colors line-clamp-2">
            {coupon.title}
          </h3>
          <p className="text-gray-500 font-bold font-nunito text-sm leading-snug line-clamp-2">
            {coupon.description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-5 pb-5">
        {canAfford ? (
          <button
            onClick={() => onPurchase(coupon)}
            disabled={isLoading}
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-sm cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={18} strokeWidth={2.5} className="fill-white" />
            <span>{coupon.cost} XP - Авах</span>
          </button>
        ) : (
          <div className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold font-nunito text-sm bg-gray-100 text-gray-400 border-2 border-gray-200">
            <Zap size={16} className="text-gray-400" />
            <span>{coupon.cost - currentXp} XP дутуу</span>
          </div>
        )}
      </div>
    </div>
  );
};
