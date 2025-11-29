"use client";
import { useEffect, useState } from "react";
import { fractionLessons } from "@/src/data/lessons/fractions";
import Paywall from "@/src/components/topic/paywall/Paywall";
import Roadmap from "@/src/components/topic/roadmap/Roadmap";
import { useAuth } from "@/src/components/auth";

export default function FractionsRoadmapPage() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, checkPurchase } = useAuth();

  useEffect(() => {
    const checkPaid = async () => {
      if (user) {
        const isPurchased = await checkPurchase("fractions");
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
        <h1 className="text-3xl font-extrabold text-purple-800">Бутархай</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-purple-700">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-purple-800">Бутархай</h1>

      {!paid && (
        <Paywall
          topicKey="fractions"
          onUnlocked={() => {
            setPaid(true);
          }}
        />
      )}

      {paid && (
        <Roadmap
          topicKey="fractions"
          items={fractionLessons.map((l) => ({ id: l.id, title: l.title }))}
        />
      )}
    </div>
  );
}
