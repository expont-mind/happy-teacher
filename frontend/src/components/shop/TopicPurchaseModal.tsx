"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { X, Check } from "lucide-react";
import Image from "next/image";
import QPayDialog from "@/src/components/qpay/QPayDialog";
import { createClient } from "@/src/utils/supabase/client";
import { TOPICS_DATA } from "@/src/data/topics";

interface TopicPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicKey: string;
  onSuccess: () => void;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
}

const getTopicData = (topicKey: string) => {
  return TOPICS_DATA.find((t) => t.link.includes(topicKey));
};

export default function TopicPurchaseModal({
  isOpen,
  onClose,
  topicKey,
  onSuccess,
}: TopicPurchaseModalProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [purchasedChildIds, setPurchasedChildIds] = useState<Set<string>>(
    new Set()
  );
  const [showQPayDialog, setShowQPayDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user, activeProfile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen || !user) return;

    const init = async () => {
      setLoading(true);

      const { data: childrenData } = await supabase
        .from("children")
        .select("id, name, avatar")
        .eq("parent_id", user.id);

      if (childrenData) {
        setChildren(childrenData);

        const { data: purchases } = await supabase
          .from("purchases")
          .select("child_id")
          .eq("user_id", user.id)
          .eq("topic_key", topicKey)
          .not("child_id", "is", null);

        const purchasedIds = new Set(
          purchases?.map((p) => p.child_id) || []
        );
        setPurchasedChildIds(purchasedIds);

        const notPurchased = childrenData.filter(
          (c) => !purchasedIds.has(c.id)
        );
        if (notPurchased.length > 0) {
          setSelectedChildIds([notPurchased[0].id]);
        }
      }

      setLoading(false);
    };

    init();
  }, [isOpen, user, topicKey]);

  const toggleChild = (childId: string) => {
    if (purchasedChildIds.has(childId)) return;
    setSelectedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const topicData = getTopicData(topicKey);
  const topicPrice = topicData?.price || 0;
  const currentPrice = Math.max(1, selectedChildIds.length) * topicPrice;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-[464px] bg-white rounded-3xl flex flex-col gap-6 p-8 items-center overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
        >
          <X size={24} className="text-gray-500" />
        </button>

        {loading ? (
          <div className="py-12">
            <video src="/bouncing-loader.webm" autoPlay loop muted playsInline className="w-40 h-40" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col gap-4 items-center max-w-[280px] mt-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <Image
                  src="/svg/ShoppingCartSimple.svg"
                  alt="Shopping Cart"
                  width={32}
                  height={32}
                />
              </div>
              <div className="flex flex-col gap-2 items-center">
                <h2 className="text-lg font-bold text-gray-800 text-center font-nunito">
                  {topicData?.title || "Хичээл"}
                </h2>
                <p className="text-sm font-medium text-gray-500 text-center font-nunito">
                  {topicData?.lessonCount} интерактив хичээл
                </p>
                <p className="text-3xl font-black text-[#58CC02] mt-2 font-nunito">
                  {currentPrice.toLocaleString("en-US")}₮
                </p>
              </div>
            </div>

            {/* Child Selection */}
            <div className="w-full">
              <p className="text-sm font-bold text-gray-700 mb-3 ml-1 font-nunito">
                Хэн суралцах вэ?{" "}
                <span className="text-xs font-normal text-gray-500">
                  (Олон хүүхэд сонгож болно)
                </span>
              </p>
              {children.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {children.map((child) => {
                    const isSelected = selectedChildIds.includes(child.id);
                    const isPurchased = purchasedChildIds.has(child.id);

                    return (
                      <button
                        key={child.id}
                        onClick={() => !isPurchased && toggleChild(child.id)}
                        disabled={isPurchased}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                          isPurchased
                            ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "border-[#58CC02] bg-[#58CC02]/10"
                            : "border-gray-200 hover:border-[#58CC02]/50"
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-full bg-gray-100 shrink-0">
                          <Image
                            src={child.avatar}
                            alt={child.name}
                            fill
                            className={`object-contain p-1 ${
                              isPurchased ? "grayscale" : ""
                            }`}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-gray-700 truncate text-sm font-nunito">
                            {child.name}
                          </span>
                          {isPurchased && (
                            <span className="text-[10px] text-green-600 font-bold font-nunito">
                              Авсан байна
                            </span>
                          )}
                        </div>
                        {isSelected && !isPurchased && (
                          <div className="ml-auto text-[#58CC02]">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 font-nunito">
                    Бүртгэлтэй хүүхэд байхгүй байна.
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="flex flex-col gap-[10px] px-5 py-6 bg-[#D6F5D6] rounded-[20px] w-full">
              <div className="flex items-center gap-2">
                <Image
                  src="/svg/PaletteBlack.svg"
                  alt="Icon"
                  width={20}
                  height={20}
                />
                <p className="text-sm font-medium text-black font-nunito">
                  {topicData?.lessonCount || 16} интерактив зурган даалгавар
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/svg/TrophyBlack.svg"
                  alt="Icon"
                  width={20}
                  height={20}
                />
                <p className="text-sm font-medium text-black font-nunito">
                  Медаль, оноо, урамшуулал
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-6 w-full">
              <button
                onClick={() => setShowQPayDialog(true)}
                disabled={selectedChildIds.length === 0}
                className={`duo-button duo-button-green w-full py-3 text-sm flex items-center justify-center gap-2 ${
                  selectedChildIds.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                Худалдаж авах
              </button>
              <button
                onClick={onClose}
                className="max-w-[124px] w-full flex justify-center items-center text-[#333333] font-bold text-lg cursor-pointer font-nunito"
              >
                Цуцлах
              </button>
            </div>
          </>
        )}
      </div>

      <QPayDialog
        isOpen={showQPayDialog}
        onClose={() => setShowQPayDialog(false)}
        amount={currentPrice}
        topicKey={topicKey}
        childIds={selectedChildIds}
        userId={user?.id}
        purchaseType="topic"
        onSuccess={() => {
          setShowQPayDialog(false);
          onSuccess();
          onClose();
        }}
        onError={(error) => {
          console.error("QPay error:", error);
        }}
      />
    </div>
  );
}
