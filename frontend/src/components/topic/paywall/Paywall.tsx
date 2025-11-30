"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import AuthModal from "@/src/components/auth/AuthModal";
import Loader from "@/src/components/ui/Loader";
import { Lock, BookOpen, Gamepad2, Trophy } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
        <Loader />
      </div>
    );
  }

  if (unlocked) return null;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="duo-card text-center p-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <Lock
              size={80}
              className="text-[var(--duo-yellow-dark)]"
              strokeWidth={2.5}
            />
          </div>

          {/* Title */}
          <h2
            className="text-4xl font-black mb-4"
            style={{ color: "var(--duo-yellow-dark)" }}
          >
            Сэдэв цоожтой байна
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-700 font-semibold mb-8 max-w-md mx-auto">
            {user
              ? "Энэ сэдвийг нээхийн тулд худалдаж аваарай!"
              : "Энэ сэдвийг нээхийн тулд эхлээд нэвтэрнэ үү!"}
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded-2xl border border-gray-200">
              <div className="flex justify-center mb-2">
                <BookOpen
                  size={32}
                  className="text-[var(--duo-blue)]"
                  strokeWidth={2}
                />
              </div>
              <p className="text-sm font-bold text-gray-700">10+ хичээл</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-200">
              <div className="flex justify-center mb-2">
                <Gamepad2
                  size={32}
                  className="text-[var(--duo-purple)]"
                  strokeWidth={2}
                />
              </div>
              <p className="text-sm font-bold text-gray-700">
                Интерактив дасгал
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-200">
              <div className="flex justify-center mb-2">
                <Trophy
                  size={32}
                  className="text-[var(--duo-yellow-dark)]"
                  strokeWidth={2}
                />
              </div>
              <p className="text-sm font-bold text-gray-700">
                Шагнал цуглуулах
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePurchase}
            className="duo-button duo-button-yellow px-12 py-5 text-xl cursor-pointer"
          >
            {user ? "Худалдаж авах" : "Нэвтрэх"}
          </button>
        </div>
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
