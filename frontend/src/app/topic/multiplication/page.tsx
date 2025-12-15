"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";
import Paywall from "@/src/components/topic/paywall/Paywall";
import TopicInfoCard from "@/src/components/topic/TopicInfoCard";
import VerticalRoadmap from "@/src/components/topic/VerticalRoadmap";
import { useAuth } from "@/src/components/auth";
import Skeleton from "@/src/components/ui/Skeleton";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";

function MultiplicationContent() {
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
    window.history.replaceState({}, "", "/topic/multiplication");

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
        const isPurchased = await checkPurchase("multiplication");
        setPaid(isPurchased);

        // Load completed lessons
        const completed = await getCompletedLessons("multiplication");
        setCompletedIds(completed);
      } else {
        setPaid(false);
      }
      setLoading(false);
    };

    checkPaid();
  }, [user, activeProfile, checkPurchase, getCompletedLessons]);

  const progressPercent = useMemo(() => {
    if (multiplicationLessons.length === 0) return 0;
    return Math.round((completedIds.length / multiplicationLessons.length) * 100);
  }, [completedIds]);

  const items = useMemo(
    () => multiplicationLessons.map((l) => ({ id: l.id, title: l.title })),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Topic Info Card */}
          <TopicInfoCard
            title="Үржих"
            description="Үржих үйлдлийг эзэмшиж, дасгал хийцгээе! ✨"
            lessonCount={multiplicationLessons.length}
            taskCount={multiplicationLessons.length}
            progressPercent={progressPercent}
            iconType="multiplication"
            isPaid={paid}
            onShowPaywall={() => setShowPaywall(true)}
          />

          {/* Right Column - Vertical Roadmap */}
          <VerticalRoadmap
            items={items}
            topicKey="multiplication"
            completedIds={completedIds}
            headerTitle="Үржүүлэх дасгал"
            isPaid={paid}
            onShowPaywall={() => setShowPaywall(true)}
          />
        </div>

        {/* Paywall Dialog */}
        {showPaywall && (
          <Paywall
            topicKey="multiplication"
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

export default function MultiplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      }
    >
      <MultiplicationContent />
    </Suspense>
  );
}
