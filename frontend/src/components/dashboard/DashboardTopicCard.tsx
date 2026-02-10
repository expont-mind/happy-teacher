"use client";

import Image from "next/image";
import { Check, ShoppingCart } from "lucide-react";

interface Child {
  id: string;
  name: string;
  avatar: string;
}

interface DashboardTopicCardProps {
  title: string;
  icon: string;
  lessonCount: number;
  price: number;
  children: Child[];
  purchasedChildIds: Set<string>;
  onBuy: () => void;
}

export default function DashboardTopicCard({
  title,
  icon,
  lessonCount,
  price,
  children,
  purchasedChildIds,
  onBuy,
}: DashboardTopicCardProps) {
  const allPurchased =
    children.length > 0 && children.every((c) => purchasedChildIds.has(c.id));
  const somePurchased = children.some((c) => purchasedChildIds.has(c.id));

  return (
    <div className="rounded-[20px] border-2 border-[#E5E5E5] bg-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-[#58CC02] bg-white">
          <Image src={icon} alt={title} width={24} height={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-[#333333] font-nunito truncate">
            {title}
          </h3>
          <p className="text-xs font-medium text-gray-500">
            {lessonCount} хичээл
          </p>
        </div>
        <p className="shrink-0 text-sm font-black text-[#58CC02] font-nunito">
          {price.toLocaleString("en-US")}₮
        </p>
      </div>

      {/* Per-child status */}
      {children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {children.map((child) => {
            const purchased = purchasedChildIds.has(child.id);
            return (
              <div
                key={child.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-nunito ${
                  purchased
                    ? "bg-[#58CC02]/10 text-[#58CC02]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  <Image
                    src={child.avatar}
                    alt={child.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <span className="truncate max-w-[60px]">{child.name}</span>
                {purchased && <Check size={12} strokeWidth={3} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Buy button */}
      {!allPurchased && (
        <button
          onClick={onBuy}
          className="duo-button duo-button-green w-full py-2.5 text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          {somePurchased ? "Бусад хүүхдэд авах" : "Худалдаж авах"}
        </button>
      )}

      {allPurchased && (
        <div className="text-center py-2 text-sm font-bold text-[#58CC02] font-nunito">
          Бүх хүүхэд авсан
        </div>
      )}
    </div>
  );
}
