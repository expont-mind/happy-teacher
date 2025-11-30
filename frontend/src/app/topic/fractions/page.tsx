"use client";
import { useEffect, useState } from "react";
import { fractionLessons } from "@/src/data/lessons/fractions";
import Paywall from "@/src/components/topic/paywall/Paywall";
import Roadmap from "@/src/components/topic/roadmap/Roadmap";
import { useAuth } from "@/src/components/auth";
import { BookOpen, Target } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen
                size={64}
                className="text-[var(--duo-blue)] animate-pulse"
                strokeWidth={2.5}
              />
            </div>
            <h1
              className="text-4xl font-black mb-4"
              style={{ color: "var(--duo-blue)" }}
            >
              Бутархай
            </h1>
            <div className="text-gray-600 font-semibold">Уншиж байна...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 animate-float">
            <BookOpen
              size={64}
              className="text-[var(--duo-blue)]"
              strokeWidth={2.5}
            />
          </div>
          <h1
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ color: "var(--duo-blue)" }}
          >
            Бутархай
          </h1>
          <p className="text-lg text-gray-600 font-semibold flex items-center justify-center gap-2">
            Бутархай тоонуудтай танилцаж, дасгал хийцгээе!
            <Target
              size={20}
              className="text-[var(--duo-green)]"
              strokeWidth={2.5}
            />
          </p>
        </div>

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
    </div>
  );
}
