"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fractionLessons } from "@/src/data/lessons/fractions";
import Paywall from "@/src/components/topic/paywall/Paywall";
import Roadmap from "@/src/components/topic/roadmap/Roadmap";
import { useAuth } from "@/src/components/auth";
import { BookOpen, Target } from "lucide-react";
import Skeleton from "@/src/components/ui/Skeleton";
import { toast } from "sonner";

export default function FractionsRoadmapPage() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, activeProfile, checkPurchase } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check payment status from URL params
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Төлбөр амжилттай! Хичээлээ эхлүүлээрэй.");
    } else if (paymentStatus === "error") {
      const reason = searchParams.get("reason");
      toast.error(`Төлбөр амжилтгүй: ${reason || "Алдаа гарлаа"}`);
    } else if (paymentStatus === "pending") {
      toast.info("Төлбөр хүлээгдэж байна...");
    }
  }, [searchParams]);

  useEffect(() => {
    const checkPaid = async () => {
      if (user || activeProfile) {
        const isPurchased = await checkPurchase("fractions");
        setPaid(isPurchased);
      } else {
        setPaid(false);
      }
      setLoading(false);
    };
    checkPaid();
  }, [user, activeProfile, checkPurchase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
            <Skeleton className="h-12 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 animate-float">
            <BookOpen
              size={64}
              className="text-(--duo-blue)"
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
              className="text-(--duo-green)"
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
