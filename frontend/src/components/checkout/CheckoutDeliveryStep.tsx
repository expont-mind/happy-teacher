"use client";

import { Coupon, DeliveryInfo } from "@/src/types";
import { DeliveryForm } from "@/src/components/shop/DeliveryForm";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CheckoutDeliveryStepProps {
  coupon: Coupon;
  onSubmit: (deliveryInfo: DeliveryInfo) => void;
  isLoading: boolean;
}

export const CheckoutDeliveryStep = ({
  coupon,
  onSubmit,
  isLoading,
}: CheckoutDeliveryStepProps) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Order Summary */}
      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-4 flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
          <Image
            src={coupon.image}
            alt={coupon.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-[#4B5563] font-extrabold font-nunito text-base leading-tight truncate">
            {coupon.title}
          </h3>
          <p className="text-gray-400 font-bold font-nunito text-sm truncate">
            {coupon.description}
          </p>
        </div>
        <div className="shrink-0">
          <p className="text-[#58CC02] font-extrabold font-nunito text-lg">
            {coupon.price.toLocaleString()}₮
          </p>
        </div>
      </div>

      {/* Delivery Form */}
      <DeliveryForm
        onSubmit={onSubmit}
        onCancel={() => {}}
        isLoading={isLoading}
        productPrice={coupon.price}
      />

      {/* Back Link */}
      <Link
        href="/shop?tab=products"
        className="flex items-center gap-2 justify-center text-gray-400 font-bold font-nunito text-sm hover:text-gray-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Дэлгүүр рүү буцах
      </Link>
    </div>
  );
};
