"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { useRouter } from "next/navigation";
import Loader from "@/src/components/ui/Loader";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PaywallProps {
  topicKey: string;
  onUnlocked?: () => void;
}

export default function Paywall({ topicKey, onUnlocked }: PaywallProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, activeProfile, checkPurchase, purchaseTopic } = useAuth();
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

  const handlePurchase = async () => {
    if (!user && !activeProfile) {
      router.push("/login");
      return;
    }

    if (activeProfile?.type === "child") {
      alert("Эцэг эхээсээ худалдаж авч өгөхийг хүсээрэй!");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await purchaseTopic(topicKey);
      const isPurchased = await checkPurchase(topicKey);
      setUnlocked(isPurchased);
      if (isPurchased) {
        onUnlocked?.();
      }
    } catch (error) {
      // Error is handled in AuthProvider
    }
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
      <div className="relative w-full max-w-[464px] bg-[#FFFAF7] rounded-[20px] flex flex-col gap-8 p-8 items-center overflow-hidden animate-in zoom-in-95 duration-200">
        <Link
          href="/topic"
          prefetch={true}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
        >
          <X size={24} className="text-[#333333]" />
        </Link>

        <div className="flex flex-col gap-8 items-center max-w-[236px] mt-9">
          <Image
            src="/svg/ShoppingCartSimple.svg"
            alt="Shopping Cart"
            width={50}
            height={50}
          />
          <div className="flex flex-col gap-2 items-center">
            <p className="text-base font-bold text-black font-nunito text-center">
              Хичээл худалдаж аваарай
            </p>
            <p className="text-xs font-semibold text-[#858480] font-nunito text-center">
              Энэ хичээлийг үзэхийн тулд худалдаж авах шаардлагатай.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] px-5 py-6 bg-[#D6F5D6] rounded-[20px] max-w-[348px] w-full">
          <div className="flex items-center gap-2">
            <Image src="/svg/Palette.svg" alt="Icon" width={20} height={20} />
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
            <Image src="/svg/Trophy.svg" alt="Icon" width={20} height={20} />
            <p className="text-sm font-medium text-black font-nunito">
              Медаль болон шагнал авах боломж
            </p>
          </div>
        </div>

        <div className="flex gap-6 w-full">
          <button
            onClick={handlePurchase}
            className="bg-[#58CC02] w-full border-b-4 border-[#46A302] rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer hover:bg-[#46A302] transition-colors tracking-wide"
          >
            {user || activeProfile ? "Худалдаж авах" : "Нэвтрэх"}
          </button>

          <Link
            href="/topic"
            prefetch={true}
            className="max-w-[124px] w-full flex justify-center items-center text-[#333333] font-bold text-lg font-nunito cursor-pointer"
          >
            Цуцлах
          </Link>
        </div>
      </div>
    </div>
  );
}
