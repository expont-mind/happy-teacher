"use client";

import { CheckCircle, ArrowRight, Copy, Check } from "lucide-react";
import { Coupon, DeliveryInfo } from "@/src/types";
import Link from "next/link";
import { useState } from "react";

interface CheckoutSuccessStepProps {
  coupon: Coupon;
  orderCode: string;
  deliveryInfo: DeliveryInfo;
}

export const CheckoutSuccessStep = ({
  coupon,
  orderCode,
  deliveryInfo,
}: CheckoutSuccessStepProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Success Icon */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="w-20 h-20 rounded-full bg-[#58CC02]/10 flex items-center justify-center">
          <CheckCircle size={48} className="text-[#58CC02]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#4B5563] font-nunito">
          Төлбөр амжилттай!
        </h2>
        <p className="text-gray-400 font-bold font-nunito text-sm text-center">
          Таны захиалга баталгаажлаа
        </p>
      </div>

      {/* Order Code */}
      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 w-full">
        <p className="text-sm text-gray-400 font-bold font-nunito mb-2 text-center">
          Захиалгын код
        </p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-extrabold text-[#58CC02] font-nunito tracking-widest">
            {orderCode}
          </p>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Хуулах"
          >
            {copied ? (
              <Check size={16} className="text-[#58CC02]" strokeWidth={3} />
            ) : (
              <Copy size={16} className="text-gray-400" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 w-full">
        <h3 className="text-sm font-extrabold text-[#4B5563] font-nunito mb-3">
          Захиалгын мэдээлэл
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-nunito">
            <span className="text-gray-400 font-bold">Бүтээгдэхүүн</span>
            <span className="text-[#4B5563] font-bold">{coupon.title}</span>
          </div>
          <div className="flex justify-between text-sm font-nunito">
            <span className="text-gray-400 font-bold">Үнэ</span>
            <span className="text-[#4B5563] font-bold">
              {coupon.price.toLocaleString()}₮
            </span>
          </div>
          {deliveryInfo.type === "pickup" ? (
            <div className="flex justify-between text-sm font-nunito">
              <span className="text-gray-400 font-bold">Очиж авах</span>
              <span className="text-[#4B5563] font-bold text-right max-w-[60%]">
                {deliveryInfo.pickup_location_name}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm font-nunito">
                <span className="text-gray-400 font-bold">Хүргэлт</span>
                <span className="text-[#4B5563] font-bold">
                  {deliveryInfo.zone_name} - {deliveryInfo.location_name}
                </span>
              </div>
              <div className="flex justify-between text-sm font-nunito">
                <span className="text-gray-400 font-bold">Хүргэлтийн төлбөр</span>
                <span className="text-[#4B5563] font-bold">
                  {deliveryInfo.delivery_fee > 0
                    ? `${deliveryInfo.delivery_fee.toLocaleString()}₮`
                    : "Үнэгүй"}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between text-sm font-nunito">
            <span className="text-gray-400 font-bold">Утас</span>
            <span className="text-[#4B5563] font-bold">
              {deliveryInfo.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Back to Shop */}
      <Link
        href="/shop?tab=products"
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:translate-y-1 font-extrabold font-nunito tracking-wide text-sm cursor-pointer bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:bg-[#4CAF00]"
      >
        <span>Дэлгүүр рүү буцах</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};
