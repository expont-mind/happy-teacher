"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { useRouter } from "next/navigation";
import Loader from "@/src/components/ui/Loader";
import { X } from "lucide-react";
import Image from "next/image";
import { CreateInvoiceButton } from "@/src/components/bonum";

interface PaywallProps {
  topicKey: string;
  onUnlocked?: () => void;
  onClose?: () => void;
}

const TOPIC_PRICE = 3;

export default function Paywall({ topicKey, onUnlocked, onClose }: PaywallProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, activeProfile, checkPurchase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUnlocked = async () => {
      setLoading(true);
      if (user || activeProfile) {
        const isPurchased = await checkPurchase(topicKey);
        setUnlocked(isPurchased);
      } else {
        setUnlocked(false);
      }
      setLoading(false);
    };

    checkUnlocked();
  }, [user, activeProfile, topicKey, checkPurchase]);

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const generateTransactionId = () => {
    return `${topicKey}_${user?.id || "guest"}_${Date.now()}`;
  };

  const getCallbackUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    // Client-side page ашиглана - localStorage-с invoiceId авах боломжтой
    return `${baseUrl}/payment-callback?topicKey=${topicKey}&userId=${user?.id}`;
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment initiated:", data);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert("Төлбөр үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
  };

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
      <div className="relative w-full max-w-[464px] bg-white rounded-3xl flex flex-col gap-6 p-8 items-center overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-gray-100 shadow-xl">
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
              {TOPIC_PRICE}₮
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] px-5 py-6 bg-[#D6F5D6] rounded-[20px] max-w-[348px] w-full">
          <div className="flex items-center gap-2">
            <Image src="/svg/Palette.svg" alt="Icon" width={20} height={20} />
            <p className="text-sm font-medium text-black">
              16 өнгөт зургийн даалгавар
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/svg/Calculator.svg" alt="Icon" width={20} height={20} />
            <p className="text-sm font-medium text-black">
              Бутархай тооны дэлгэрэнгүй сургалт
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/svg/Trophy.svg" alt="Icon" width={20} height={20} />
            <p className="text-sm font-medium text-black">
              Медаль болон шагнал авах боломж
            </p>
          </div>
        </div>

        <div className="flex gap-6 w-full">
          {user || activeProfile ? (
            activeProfile?.type === "child" ? (
              <button
                onClick={() => alert("Эцэг эхээсээ худалдаж авч өгөхийг хүсээрэй!")}
                className="bg-[#58CC02] w-full border-b-4 border-[#46A302] rounded-2xl px-6 py-[10px] text-white font-bold text-lg leading-7 cursor-pointer hover:bg-[#46A302] transition-colors tracking-wide"
              >
                Худалдаж авах
              </button>
            ) : (
              <CreateInvoiceButton
                amount={TOPIC_PRICE}
                callback={getCallbackUrl()}
                transactionId={generateTransactionId()}
                items={[
                  {
                    title: `${topicKey} хичээл`,
                    remark: "Happy Teacher сургалтын хичээл",
                    amount: TOPIC_PRICE,
                    count: 1,
                  },
                ]}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                className="duo-button duo-button-green w-full py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                Худалдаж авах
              </CreateInvoiceButton>
            )
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
