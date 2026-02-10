import { Coupon } from "@/src/types";
import Image from "next/image";
import { ShoppingBag, Info } from "lucide-react";

interface CouponCardProps {
  coupon: Coupon;
  onPurchase: (coupon: Coupon) => void;
  isLoading: boolean;
  loadingId?: string;
  onDetail?: (coupon: Coupon) => void;
}

export const CouponCard = ({
  coupon,
  onPurchase,
  isLoading,
  loadingId,
  onDetail,
}: CouponCardProps) => {
  return (
    <div className="group relative bg-white border-2 border-[#E5E5E5] rounded-[24px] overflow-hidden hover:border-[#58CC02] transition-all duration-300 flex flex-col h-full">
      {/* Clickable area for detail */}
      <div
        className={onDetail ? "cursor-pointer" : ""}
        onClick={onDetail ? () => onDetail(coupon) : undefined}
      >
        {/* Full Width Image */}
        <div className="relative w-full aspect-4/3">
          <Image
            src={coupon.image}
            alt={coupon.title}
            fill
            className="object-cover"
          />
          {/* Price Badge - Top Left */}
          <div className="absolute top-3 left-3 flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md">
            <p className="text-[#1F2937] font-bold text-sm font-nunito">
              {coupon.price.toLocaleString()}₮
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

      {/* Action Button with Price */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onPurchase(coupon)}
          disabled={isLoading}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-sm cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && loadingId === coupon.id ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingBag size={18} strokeWidth={2.5} />
              <span className="font-extrabold font-nunito text-sm">
                {coupon.price.toLocaleString()}₮ Худалдаж авах
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
