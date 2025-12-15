"use client";
import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { fractionLessons } from "@/src/data/lessons/fractions";
import Paywall from "@/src/components/topic/paywall/Paywall";
import TopicInfoCard from "@/src/components/topic/TopicInfoCard";
import VerticalRoadmap from "@/src/components/topic/VerticalRoadmap";
import { useAuth } from "@/src/components/auth";
import Skeleton from "@/src/components/ui/Skeleton";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";

function FractionsRoadmapContent() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const { user, activeProfile, checkPurchase, getCompletedLessons } = useAuth();
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  // Check for payment callback result - only run once
  useEffect(() => {
    if (toastShownRef.current) return;

    const paymentStatus = searchParams.get("payment");
    if (!paymentStatus) return;

    toastShownRef.current = true;

    // URL-г шууд цэвэрлэх - toast давтагдахаас сэргийлнэ
    window.history.replaceState({}, "", "/topic/fractions");

    if (paymentStatus === "success") {
      setPaid(true);
      setShowPaywall(false);
      showCharacterToast("Төлбөр амжилттай! Хичээлээ эхлүүлээрэй!", "green");
    } else if (paymentStatus === "error") {
      const reason = searchParams.get("reason");
      if (reason === "no_invoice") {
        showCharacterToast("Төлбөр баталгаажуулалт амжилтгүй. Дахин оролдоно уу.", "red");
      } else if (reason === "save_failed") {
        showCharacterToast("Худалдан авалт хадгалахад алдаа гарлаа.", "red");
      } else {
        showCharacterToast("Төлбөр амжилтгүй боллоо. Дахин оролдоно уу.", "red");
      }
    } else if (paymentStatus === "failed") {
      const status = searchParams.get("status");
      showCharacterToast(`Төлбөр төлөгдөөгүй байна. (${status || "PENDING"})`, "red");
    } else if (paymentStatus === "pending") {
      showCharacterToast("Төлбөр хүлээгдэж байна. Түр хүлээнэ үү.", "yellow");
    }
  }, []);

  useEffect(() => {
    const checkPaid = async () => {
      if (user || activeProfile) {
        const isPurchased = await checkPurchase("fractions");
        setPaid(isPurchased);

        // Load completed lessons
        const completed = await getCompletedLessons("fractions");
        setCompletedIds(completed);
      } else {
        setPaid(false);
      }
      setLoading(false);
    };
    checkPaid();
  }, [user, activeProfile, checkPurchase, getCompletedLessons]);

  const progressPercent = useMemo(() => {
    if (fractionLessons.length === 0) return 0;
    return Math.round((completedIds.length / fractionLessons.length) * 100);
  }, [completedIds]);

  const items = useMemo(
    () => fractionLessons.map((l) => ({ id: l.id, title: l.title })),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ">
          {/* Left Column - Topic Info Card */}
          <TopicInfoCard
            title="Бутархай"
            description="Бутархай тооны ухагдах, дасгал хийцгээе! 😊"
            lessonCount={fractionLessons.length}
            taskCount={fractionLessons.length}
            progressPercent={progressPercent}
            isPaid={paid}
            onShowPaywall={() => setShowPaywall(true)}
          />

          {/* Right Column - Vertical Roadmap */}
          <VerticalRoadmap
            items={items}
            topicKey="fractions"
            completedIds={completedIds}
            headerTitle="Энгийн бутархайг будацгаая"
            isPaid={paid}
            onShowPaywall={() => setShowPaywall(true)}
          />
        </div>

        {/* Paywall Dialog */}
        {showPaywall && (
          <Paywall
            topicKey="fractions"
            onUnlocked={() => {
              setPaid(true);
              setShowPaywall(false);
            }}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function FractionsRoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      }
    >
      <FractionsRoadmapContent />
    </Suspense>
  );
}
