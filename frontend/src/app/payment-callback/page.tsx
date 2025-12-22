"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/components/auth";
import Loader from "@/src/components/ui/Loader";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, activeProfile } = useAuth();
  const [status, setStatus] = useState<string>("Төлбөр шалгаж байна...");
  const processedRef = useRef(false);

  useEffect(() => {
    // Зөвхөн нэг удаа ажиллуулах
    if (processedRef.current) return;
    processedRef.current = true;

    const processPayment = async () => {
      const topicKey = searchParams.get("topicKey");
      const userId = searchParams.get("userId");
      const transactionId = searchParams.get("transactionId");
      const childIds = searchParams.get("childIds");
      const childId = searchParams.get("childId"); // Legacy support

      if (!topicKey) {
        setStatus("Алдаа: topicKey олдсонгүй");
        setTimeout(() => router.replace("/topic"), 2000);
        return;
      }

      // localStorage-с invoiceId авах
      let invoiceId: string | null = null;

      if (transactionId) {
        invoiceId = localStorage.getItem(`bonum_invoice_${transactionId}`);
      }

      if (!invoiceId) {
        invoiceId = localStorage.getItem("bonum_latest_invoice");
      }

      if (!invoiceId) {
        setStatus("Төлбөрийн мэдээлэл олдсонгүй");
        setTimeout(
          () =>
            router.replace(
              `/topic/${topicKey}?payment=error&reason=no_invoice`
            ),
          2000
        );
        return;
      }

      // get-invoice-status API дуудах
      setStatus("Төлбөр баталгаажуулж байна...");

      try {
        const response = await fetch(
          `/api/bonum/get-invoice-status?invoiceId=${encodeURIComponent(
            invoiceId
          )}`
        );
        const data = await response.json();

        if (data.isPaid) {
          // Төлбөр амжилттай - purchase хадгалах
          setStatus("Худалдан авалт хадгалж байна...");

          const validUserId =
            userId && userId !== "undefined"
              ? userId
              : user?.id ||
                (activeProfile?.type === "child"
                  ? activeProfile.parentId
                  : undefined);

          if (!validUserId) {
            setStatus("Хэрэглэгчийн мэдээлэл олдсонгүй");
            router.replace(`/topic/${topicKey}?payment=error&reason=no_user`);
            return;
          }

          // Validate and get childIds
          const validChildIds =
            (childIds && childIds !== "undefined" ? childIds : null) ||
            (childId && childId !== "undefined" ? childId : null) ||
            (activeProfile?.type === "child" ? activeProfile.id : null);

          if (!validChildIds) {
            setStatus("Хүүхдийн мэдээлэл олдсонгүй");
            router.replace(`/topic/${topicKey}?payment=error&reason=no_child`);
            return;
          }

          const saveResponse = await fetch("/api/bonum/save-purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: validUserId,
              topicKey,
              invoiceId,
              childIds: validChildIds,
            }),
          });

          const saveData = await saveResponse.json();

          if (!saveResponse.ok) {
            console.error("Failed to save purchase:", saveData.error);
          }

          if (saveData.success) {
            if (transactionId) {
              localStorage.removeItem(`bonum_invoice_${transactionId}`);
            }
            localStorage.removeItem("bonum_latest_invoice");
            localStorage.removeItem("bonum_latest_transaction");

            setStatus("Төлбөр амжилттай!");
            router.replace(`/topic/${topicKey}?payment=success`);
          } else {
            setStatus("Хадгалахад алдаа гарлаа");
            router.replace(
              `/topic/${topicKey}?payment=error&reason=save_failed`
            );
          }
        } else {
          // Төлбөр төлөгдөөгүй
          setStatus(`Төлбөр төлөгдөөгүй (${data.status})`);
          router.replace(
            `/topic/${topicKey}?payment=failed&status=${data.status}`
          );
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        setStatus("Алдаа гарлаа");
        router.replace(`/topic/${topicKey}?payment=error&reason=check_failed`);
      }
    };

    processPayment();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <Loader />
        <p className="mt-4 text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
