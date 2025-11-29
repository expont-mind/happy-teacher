"use client";
import { useEffect, useState } from "react";
import Paywall from "@/src/components/topic/paywall/Paywall";
import { useAuth } from "@/src/components/auth";

export default function MultiplicationPage() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, checkPurchase } = useAuth();

  useEffect(() => {
    const checkPaid = async () => {
      if (user) {
        const isPurchased = await checkPurchase("multiplication");
        setPaid(isPurchased);
      } else {
        setPaid(false);
      }
      setLoading(false);
    };

    checkPaid();
  }, [user, checkPurchase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-purple-800">Үржих</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-purple-700">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-purple-800">Үржих</h1>
      {!paid && (
        <Paywall
          topicKey="multiplication"
          onUnlocked={() => {
            setPaid(true);
          }}
        />
      )}
      {paid && (
        <div className="p-6 rounded-3xl border-4 border-purple-200 bg-white text-purple-700 font-semibold">
          Тун удахгүй 🚧
        </div>
      )}
    </div>
  );
}
