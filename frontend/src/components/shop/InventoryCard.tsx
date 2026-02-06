import { PurchasedCoupon, Coupon } from "@/src/types";
import Image from "next/image";
import { MapPin, Phone, Truck, Plus, Store } from "lucide-react";

interface InventoryCardProps {
  purchasedCoupon: PurchasedCoupon;
  coupon?: Coupon;
  onAddDeliveryInfo?: () => void;
}

const statusColors = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Хүлээгдэж буй" },
  processing: { bg: "bg-blue-100", text: "text-blue-700", label: "Бэлтгэж буй" },
  shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Илгээсэн" },
  delivered: { bg: "bg-green-100", text: "text-green-700", label: "Хүргэсэн" },
};

export const InventoryCard = ({
  purchasedCoupon,
  coupon,
  onAddDeliveryInfo,
}: InventoryCardProps) => {
  const couponInfo = coupon || {
    title: "Unknown Coupon",
    description: "Description not found",
    color: "bg-gray-500",
    id: "unknown",
    cost: 0,
    price: 0,
    codePrefix: "UNK",
    image: "",
  };

  const deliveryInfo = purchasedCoupon.delivery_info;
  const deliveryStatus = purchasedCoupon.delivery_status || "pending";
  const statusStyle = statusColors[deliveryStatus] || statusColors.pending;

  return (
    <div className="relative bg-white rounded-[24px] overflow-hidden border-2 border-[#E5E5E5] hover:border-[#58CC02] transition-colors shadow-sm flex flex-col">
      <div className="flex min-h-[160px]">
        {/* Left Side: Visual */}
        <div className="w-32 relative flex items-center justify-center overflow-hidden flex-shrink-0">
          {couponInfo.image ? (
            <Image
              src={couponInfo.image}
              alt={couponInfo.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className={`w-full h-full ${couponInfo.color}`} />
          )}
          {/* Ticket holes */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFFAF7] rounded-full z-10" />
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

          <div className="flex items-center gap-3 mt-1 flex-wrap">
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
      </div>

      {/* Delivery Info Section */}
      {deliveryInfo ? (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            {deliveryInfo.type === "pickup" ? (
              <>
                <Store className="w-4 h-4 text-[#58CC02]" />
                <span className="text-sm font-bold text-[#4B5563] font-nunito">
                  Очиж авах
                </span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-[#58CC02]" />
                <span className="text-sm font-bold text-[#4B5563] font-nunito">
                  Хүргэлтийн мэдээлэл
                </span>
              </>
            )}
            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                {deliveryInfo.type === "pickup" ? (
                  <>
                    <p className="font-bold text-[#4B5563] font-nunito">
                      {deliveryInfo.pickup_location_name || deliveryInfo.location_name}
                    </p>
                    <p className="text-gray-400 font-nunito text-xs">
                      {deliveryInfo.pickup_location_address || deliveryInfo.address}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-[#4B5563] font-nunito">
                      {deliveryInfo.recipient_name}
                    </p>
                    <p className="text-gray-400 font-nunito">
                      {deliveryInfo.location_name}
                    </p>
                    <p className="text-gray-400 font-nunito text-xs">
                      {deliveryInfo.address}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`tel:${deliveryInfo.phone}`}
                className="font-bold text-[#58CC02] font-nunito hover:underline"
              >
                {deliveryInfo.phone}
              </a>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-400 font-nunito">Хүргэлтийн төлбөр:</span>
              {deliveryInfo.type === "pickup" ? (
                <span className="font-bold text-[#58CC02] font-nunito">
                  Үнэгүй
                </span>
              ) : deliveryInfo.delivery_fee > 0 ? (
                <span className="font-bold text-[#4B5563] font-nunito">
                  {deliveryInfo.delivery_fee.toLocaleString()}₮
                </span>
              ) : (
                <span className="font-bold text-[#4B5563] font-nunito">-</span>
              )}
            </div>
          </div>
        </div>
      ) : onAddDeliveryInfo ? (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <button
            onClick={onAddDeliveryInfo}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#58CC02]/10 hover:bg-[#58CC02]/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-[#58CC02]" />
            <span className="font-bold text-[#58CC02] font-nunito">
              Хүргэлтийн мэдээлэл оруулах
            </span>
          </button>
        </div>
      ) : null}

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
