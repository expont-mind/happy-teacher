"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { PurchasedCoupon, Coupon } from "@/src/types";
import { InventoryCard } from "./InventoryCard";

interface OrderHistorySectionProps {
  orders: PurchasedCoupon[];
  coupons: Coupon[];
  onAddDeliveryInfo: (orderId: string, couponId: string) => void;
}

export const OrderHistorySection = ({
  orders,
  coupons,
  onAddDeliveryInfo,
}: OrderHistorySectionProps) => {
  const [expanded, setExpanded] = useState(false);

  if (orders.length === 0) return null;

  const displayedOrders = expanded ? orders : orders.slice(0, 2);
  const hasMore = orders.length > 2;

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[#4B5563] font-bold text-xl font-nunito">
              Захиалгууд
            </p>
            <p className="text-gray-400 font-semibold text-xs font-nunito">
              {orders.length} захиалга
            </p>
          </div>
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[#58CC02] font-bold text-sm font-nunito cursor-pointer hover:underline"
          >
            {expanded ? (
              <>
                Хураах <ChevronUp size={16} />
              </>
            ) : (
              <>
                Бүгдийг харах ({orders.length}) <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedOrders.map((pc) => (
          <InventoryCard
            key={pc.id}
            purchasedCoupon={pc}
            coupon={coupons.find((c) => c.id === pc.coupon_id)}
            onAddDeliveryInfo={
              !pc.delivery_info
                ? () => onAddDeliveryInfo(pc.id, pc.coupon_id)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};
