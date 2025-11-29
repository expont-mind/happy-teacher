"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import AuthModal from "@/src/components/auth/AuthModal";
import Loader from "@/src/components/ui/Loader";

interface PaywallProps {
  topicKey: string;
  onUnlocked?: () => void;
}

export default function Paywall({ topicKey, onUnlocked }: PaywallProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shouldPurchaseAfterLogin, setShouldPurchaseAfterLogin] =
    useState(false);
  const { user, checkPurchase, purchaseTopic } = useAuth();

  useEffect(() => {
    const checkUnlocked = async () => {
      setLoading(true);
      if (user) {
        const isPurchased = await checkPurchase(topicKey);
        setUnlocked(isPurchased);

        // If user just logged in and we should purchase, do it now
        if (!isPurchased && shouldPurchaseAfterLogin) {
          try {
            await purchaseTopic(topicKey);
            const purchased = await checkPurchase(topicKey);
            setUnlocked(purchased);
            if (purchased) {
              onUnlocked?.();
            }
          } catch (error) {
            // Error is handled in AuthProvider
          }
          setShouldPurchaseAfterLogin(false);
        }
      } else {
        setUnlocked(false);
      }
      setLoading(false);
    };

    checkUnlocked();
  }, [
    user,
    topicKey,
    checkPurchase,
    shouldPurchaseAfterLogin,
    purchaseTopic,
    onUnlocked,
  ]);

  const handlePurchase = async () => {
    if (!user) {
      setShouldPurchaseAfterLogin(true);
      setShowAuthModal(true);
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
      <div className="flex flex-col items-center justify-center text-center p-6 bg-linear-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-3xl border-4 border-purple-200">
        <Loader />
      </div>
    );
  }

  if (unlocked) return null;

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center p-6 bg-linear-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-3xl border-4 border-purple-200">
        <h2 className="text-3xl font-extrabold text-purple-800 mb-2">
          Сэдэв нээх
        </h2>
        <p className="text-purple-700 mb-4">
          {user
            ? "Энэ сэдэв цоожтой байна. Худалдаж авч үргэлжлүүлээрэй! 🔓"
            : "Энэ сэдэв цоожтой байна. Нэвтэрч худалдаж авна уу! 🔓"}
        </p>
        <button
          onClick={handlePurchase}
          className="cursor-pointer px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 active:scale-95"
        >
          {user ? "Худалдаж авах" : "Нэвтрэх"}
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setShouldPurchaseAfterLogin(false);
        }}
        onSuccess={() => {
          // User state will update via useEffect, which will trigger purchase
          // if shouldPurchaseAfterLogin is true
        }}
      />
    </>
  );
}
