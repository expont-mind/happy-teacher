import { Coupon } from "@/src/types";
import {
  Zap,
  ShoppingBag,
  Gamepad2,
  IceCream,
  Clapperboard,
  Gift,
  Ticket,
} from "lucide-react";

interface CouponCardProps {
  coupon: Coupon;
  activeXP: number;
  onPurchase: (coupon: Coupon) => void;
  isLoading: boolean;
  loadingId?: string;
}

export const getIcon = (id: string) => {
  switch (id) {
    case "game_time_30":
      return <Gamepad2 size={36} className="text-black" />;
    case "ice_cream":
      return <IceCream size={36} className="text-black" />;
    case "movie_night":
      return <Clapperboard size={36} className="text-black" />;
    case "toy_small":
      return <Gift size={36} className="text-black" />;
    default:
      return <Ticket size={36} className="text-black" />;
  }
};

export const CouponCard = ({
  coupon,
  activeXP,
  onPurchase,
  isLoading,
  loadingId,
}: CouponCardProps) => {
  const canAfford = activeXP >= coupon.cost;

  return (
    <div className="group relative bg-white border-2 border-[#E5E5E5] rounded-[24px] p-5 hover:border-[#58CC02] transition-all duration-300 flex flex-col gap-4 h-full">
      {/* Icon & Cost Header */}
      <div className="flex justify-between items-start w-full">
        <div className="p-4 border-[1.5px] rounded-[16px] border-[#58CC02] bg-white ">
          {getIcon(coupon.id)}
        </div>

        <div className="flex gap-1 items-center bg-[#F3F4F6] backdrop-blur-sm rounded-xl px-3 py-1.5 w-fit ">
          <Zap size={16} color="black" />
          <p className="text-[#1F2937] font-bold text-xs font-nunito">
            {coupon.cost} XP
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 grow">
        <h3 className="text-[#4B5563] font-extrabold font-nunito text-lg leading-tight group-hover:text-[#58CC02] transition-colors line-clamp-2">
          {coupon.title}
        </h3>

        <p className="text-gray-500 font-bold font-nunito text-sm leading-snug line-clamp-3">
          {coupon.description}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onPurchase(coupon)}
        disabled={!canAfford || isLoading}
        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 mt-auto font-extrabold font-nunito uppercase tracking-wide text-sm cursor-pointer ${
          canAfford
            ? "bg-[#58CC02] text-white shadow-[0_4px_0_#46A302]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
        }`}
      >
        {isLoading && loadingId === coupon.id ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="font-extrabold font-nunito text-sm uppercase">
              Авах
            </span>
            <ShoppingBag size={18} strokeWidth={2.5} />
          </>
        )}
      </button>
    </div>
  );
};
