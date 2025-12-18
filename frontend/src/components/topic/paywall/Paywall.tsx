"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { useRouter } from "next/navigation";
import Loader from "@/src/components/ui/Loader";
import { X, Check } from "lucide-react";
import Image from "next/image";
import { CreateInvoiceButton } from "@/src/components/bonum";
import { createClient } from "@/src/utils/supabase/client";

interface PaywallProps {
  topicKey: string;
  onUnlocked?: () => void;
  onClose?: () => void;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
}

const TOPIC_PRICE = 3;

export default function Paywall({
  topicKey,
  onUnlocked,
  onClose,
}: PaywallProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [purchasedChildIds, setPurchasedChildIds] = useState<Set<string>>(
    new Set()
  );

  const { user, activeProfile, checkPurchase } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      if (!user) {
        setUnlocked(false);
        setLoading(false);
        return;
      }

      // If child is logged in, auto-select them
      if (activeProfile?.type === "child") {
        setSelectedChildIds([activeProfile.id]);
      }

      // If adult, fetch children and their purchase status
      if (activeProfile?.type === "adult") {
        const { data: childrenData } = await supabase
          .from("children")
          .select("id, name, avatar")
          .eq("parent_id", user.id);

        if (childrenData) {
          setChildren(childrenData);

          // Check purchases for all children
          const { data: purchases } = await supabase
            .from("purchases")
            .select("child_id")
            .eq("user_id", user.id)
            .eq("topic_key", topicKey)
            .not("child_id", "is", null);

          const purchasedIds = new Set(purchases?.map((p) => p.child_id) || []);
          setPurchasedChildIds(purchasedIds);

          // Default select first child who doesn't have it (optional, or just start empty)
          const notPurchased = childrenData.filter(
            (c) => !purchasedIds.has(c.id)
          );
          if (notPurchased.length > 0) {
            setSelectedChildIds([notPurchased[0].id]);
          }
        }
      }

      // Initial check for current user access
      checkAccess();

      setLoading(false);
    };

    init();
  }, [user, activeProfile, topicKey]);

  // Check access logic
  const checkAccess = async () => {
    if (activeProfile?.type === "child") {
      const isPurchased = await checkPurchase(topicKey);
      setUnlocked(isPurchased);
      if (isPurchased && onUnlocked) onUnlocked();
    } else {
      // For adult, we only 'unlock' if looking at content specifically,
      // but here we are primarily a purchase modal.
      // So we default to locked unless we want to hide the modal.
      setUnlocked(false);
    }
  };

  const toggleChild = (childId: string) => {
    if (purchasedChildIds.has(childId)) return;

    setSelectedChildIds((prev) => {
      if (prev.includes(childId)) {
        return prev.filter((id) => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const generateTransactionId = () => {
    // For child, use their own ID if selectedChildIds is empty (safeguard)
    const childPart =
      selectedChildIds.length > 0
        ? selectedChildIds.join("-")
        : activeProfile?.type === "child"
        ? activeProfile.id
        : "none";

    return `${topicKey}_${user?.id || "guest"}_${childPart}_${Date.now()}`;
  };

  const getCallbackUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const childIdsParam =
      selectedChildIds.length > 0
        ? selectedChildIds.join(",")
        : activeProfile?.type === "child"
        ? activeProfile.id
        : "";

    // Important: For child user, we need to pass their ID as childIds so it gets recorded correctly
    return `${baseUrl}/payment-callback?topicKey=${topicKey}&userId=${user?.id}&childIds=${childIdsParam}`;
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment initiated:", data);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert("Төлбөр үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
  };

  // If child, price is always TOPIC_PRICE (1). If adult, times selections.
  const currentPrice =
    (activeProfile?.type === "child"
      ? 1
      : Math.max(1, selectedChildIds.length)) * TOPIC_PRICE;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
        <Loader />
      </div>
    );
  }

  if (unlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[464px] bg-white rounded-3xl flex flex-col gap-6 p-8 items-center overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-gray-100 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
        >
          <X size={24} className="text-gray-500" />
        </button>

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
            <h2 className="text-xl font-black text-gray-800 text-center">
              Хичээл худалдаж аваарай
            </h2>
            <p className="text-sm font-medium text-gray-500 text-center">
              Энэ хичээлийг үзэхийн тулд худалдаж авах шаардлагатай.
            </p>
            <p className="text-3xl font-black text-(--duo-green) mt-2">
              {currentPrice > 0 ? currentPrice : TOPIC_PRICE}₮
            </p>
          </div>
        </div>

        {/* Child Selection for Adults */}
        {activeProfile?.type === "adult" && (
          <div className="w-full">
            <p className="text-sm font-bold text-gray-700 mb-3 ml-1">
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
                        <span className="font-bold text-gray-700 truncate text-sm">
                          {child.name}
                        </span>
                        {isPurchased && (
                          <span className="text-[10px] text-green-600 font-bold">
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
                <p className="text-sm text-gray-500">
                  Бүртгэлтэй хүүхэд байхгүй байна.
                </p>
                <button
                  onClick={() => router.push("/settings")}
                  className="text-[#58CC02] font-bold text-sm mt-1 hover:underline"
                >
                  Хүүхэд нэмэх
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-[10px] px-5 py-6 bg-[#D6F5D6] rounded-[20px] w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/svg/PaletteBlack.svg"
              alt="Icon"
              width={20}
              height={20}
            />
            <p className="text-sm font-medium text-black font-nunito">
              16 өнгөт зургийн даалгавар
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/svg/Calculator.svg"
              alt="Icon"
              width={20}
              height={20}
            />
            <p className="text-sm font-medium text-black font-nunito">
              Бутархай тооны дэлгэрэнгүй сургалт
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
              Медаль болон шагнал авах боломж
            </p>
          </div>
        </div>

        <div className="flex gap-6 w-full">
          {user || activeProfile ? (
            <CreateInvoiceButton
              amount={currentPrice}
              callback={getCallbackUrl()}
              transactionId={generateTransactionId()}
              items={[
                {
                  title: `${topicKey} хичээл${
                    activeProfile?.type === "child"
                      ? ""
                      : ` (${selectedChildIds.length} хүүхэд)`
                  }`,
                  remark: "Happy Teacher сургалтын хичээл",
                  amount: currentPrice,
                  count: 1,
                },
              ]}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              className={`duo-button duo-button-green w-full py-3 text-sm flex items-center justify-center gap-2 ${
                activeProfile?.type === "adult" && selectedChildIds.length === 0
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              }`}
            >
              Худалдаж авах
            </CreateInvoiceButton>
          ) : (
            <button
              onClick={handleLoginRedirect}
              className="duo-button duo-button-green w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              Нэвтрэх
            </button>
          )}

          <button
            onClick={onClose}
            className="max-w-[124px] w-full flex justify-center items-center text-[#333333] font-bold text-lg cursor-pointer"
          >
            Цуцлах
          </button>
        </div>
      </div>
    </div>
  );
}
