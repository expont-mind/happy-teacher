"use client";
import { useEffect, useState } from "react";
import Paywall from "@/src/components/topic/paywall/Paywall";
import { useAuth } from "@/src/components/auth";
import { Construction, Sparkles } from "lucide-react";

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

  // Multiplication Icon Component
  const MultiplyIcon = ({
    size = 64,
    className = "",
  }: {
    size?: number;
    className?: string;
  }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <MultiplyIcon
                size={64}
                className="text-[var(--duo-purple)] animate-pulse"
              />
            </div>
            <h1
              className="text-4xl font-black mb-4"
              style={{ color: "var(--duo-purple)" }}
            >
              Үржих
            </h1>
            <div className="text-gray-600 font-semibold">Уншиж байна...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 animate-float">
            <MultiplyIcon size={64} className="text-[var(--duo-purple)]" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ color: "var(--duo-purple)" }}
          >
            Үржих
          </h1>
          <p className="text-lg text-gray-600 font-semibold flex items-center justify-center gap-2">
            Үржих үйлдлийг эзэмшиж, дасгал хийцгээе!
            <Sparkles
              size={20}
              className="text-[var(--duo-yellow)]"
              strokeWidth={2.5}
            />
          </p>
        </div>

        {!paid && (
          <Paywall
            topicKey="multiplication"
            onUnlocked={() => {
              setPaid(true);
            }}
          />
        )}

        {paid && (
          <div className="max-w-2xl mx-auto">
            <div className="duo-card text-center p-12 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex justify-center mb-6">
                <Construction
                  size={80}
                  className="text-[var(--duo-purple)]"
                  strokeWidth={2.5}
                />
              </div>
              <h2
                className="text-3xl font-black mb-4"
                style={{ color: "var(--duo-purple)" }}
              >
                Тун удахгүй
              </h2>
              <p className="text-lg text-gray-700 font-semibold flex items-center justify-center gap-2">
                Энэ сэдвийн хичээлүүд бэлтгэгдэж байна. Удахгүй нэмэгдэнэ!
                <Sparkles
                  size={24}
                  className="text-[var(--duo-yellow)]"
                  strokeWidth={2.5}
                />
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
