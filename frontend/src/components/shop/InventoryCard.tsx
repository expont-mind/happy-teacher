import { COUPONS } from "@/src/data/coupons";
import { getIcon } from "./CouponCard";

export interface PurchasedCoupon {
  id: string;
  coupon_id: string;
  code: string;
  created_at: string;
  is_used: boolean;
}

interface InventoryCardProps {
  purchasedCoupon: PurchasedCoupon;
}

export const InventoryCard = ({ purchasedCoupon }: InventoryCardProps) => {
  const couponInfo = COUPONS.find(
    (c) => c.id === purchasedCoupon.coupon_id
  ) || {
    title: "Unknown Coupon",
    description: "Description not found",
    color: "bg-gray-500",
    id: "unknown",
    cost: 0,
    codePrefix: "UNK",
    image: "",
  };

  return (
    <div className="relative bg-white rounded-[24px] overflow-hidden border-2 border-[#E5E5E5] hover:border-[#58CC02] transition-colors shadow-sm min-h-[160px] flex">
      {/* Left Side: Visual */}
      <div
        className={`w-32 ${couponInfo.color} flex items-center justify-center relative overflown-hidden`}
      >
        <div className="text-white transform scale-125 drop-shadow-md">
          {getIcon(couponInfo.id)}
        </div>
        {/* Ticket holes */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFAF7] rounded-full" />
      </div>

      {/* Right Side: Content */}
      <div className="flex-1 p-6 flex flex-col justify-center gap-3">
        <div>
          <h3 className="font-extrabold text-[#333333] font-nunito text-xl leading-none mb-1">
            {couponInfo.title}
          </h3>
          <p className="text-sm text-gray-400 font-bold font-nunito">
            {couponInfo.description}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <div className="bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 inline-flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 font-nunito uppercase tracking-wider">
              КОД:
            </span>
            <span className="font-mono font-black text-[#333333] text-lg tracking-widest">
              {purchasedCoupon.code}
            </span>
          </div>
          <span className="text-xs text-gray-300 font-bold font-nunito">
            {new Date(purchasedCoupon.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Used status overlay */}
      {purchasedCoupon.is_used && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] z-10 pointer-events-none">
          <span className="px-6 py-2 bg-[#333333] text-white font-extrabold font-nunito text-lg rounded-xl transform -rotate-12 border-4 border-white shadow-xl tracking-widest">
            ХЭРЭГЛЭСЭН
          </span>
        </div>
      )}
    </div>
  );
};
