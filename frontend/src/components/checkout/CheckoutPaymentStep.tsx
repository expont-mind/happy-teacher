"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Smartphone, ArrowLeft } from "lucide-react";
import { Coupon } from "@/src/types";

interface QPayLink {
  name: string;
  description: string;
  logo: string;
  link: string;
}

type PaymentStatus =
  | "idle"
  | "creating"
  | "waiting"
  | "checking"
  | "success"
  | "error"
  | "expired";

interface CheckoutPaymentStepProps {
  coupon: Coupon;
  userId?: string;
  phone?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const CheckoutPaymentStep = ({
  coupon,
  userId,
  phone,
  onSuccess,
  onBack,
}: CheckoutPaymentStepProps) => {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [qrImage, setQrImage] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [links, setLinks] = useState<QPayLink[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAllBanks, setShowAllBanks] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(mobileRegex.test(userAgent) && isSmallScreen);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const popularBanks = [
    "Khan bank",
    "Social Pay",
    "M bank",
    "Trade and Development bank",
    "Most money",
    "qPay wallet",
  ];

  const sortedLinks = [...links].sort((a, b) => {
    const aPopular = popularBanks.includes(a.name) ? 0 : 1;
    const bPopular = popularBanks.includes(b.name) ? 0 : 1;
    return aPopular - bPopular;
  });

  const displayedLinks = showAllBanks ? sortedLinks : sortedLinks.slice(0, 6);

  const createInvoice = useCallback(async () => {
    setStatus("creating");
    setErrorMessage("");

    try {
      const response = await fetch("/api/bonum/qpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: coupon.price }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invoice үүсгэхэд алдаа гарлаа");
      }

      setQrImage(data.qrImage);
      setQrCode(data.qrCode);
      setLinks(data.links || []);
      setInvoiceId(data.invoiceId);
      setTransactionId(data.transactionId);
      setStatus("waiting");

      localStorage.setItem(
        `qpay_invoice_${data.transactionId}`,
        data.invoiceId
      );
      localStorage.setItem("qpay_latest_qrcode", data.qrCode);

      // Save pending invoice to DB
      fetch("/api/bonum/save-pending-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: data.transactionId,
          invoiceId: data.invoiceId,
          qrCode: data.qrCode,
          amount: coupon.price,
          userId,
          purchaseType: "product",
          couponId: coupon.id,
          phone,
        }),
      }).catch((err) =>
        console.error("Error saving pending invoice:", err)
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Алдаа гарлаа"
      );
      setStatus("error");
    }
  }, [coupon.price, coupon.id, userId, phone]);

  const checkPaymentStatus = useCallback(async () => {
    if (!qrCode) return false;

    try {
      const response = await fetch("/api/bonum/get-invoice-status-qpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });

      const data = await response.json();

      if (data.isPaid) {
        setStatus("success");

        localStorage.removeItem(`qpay_invoice_${transactionId}`);
        localStorage.removeItem("qpay_latest_qrcode");

        fetch("/api/bonum/save-pending-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, status: "completed" }),
        }).catch((err) =>
          console.error("Error updating pending invoice:", err)
        );

        onSuccess();
        return true;
      }

      if (data.status === "EXPIRED") {
        setStatus("expired");
        setErrorMessage("Төлбөрийн хугацаа дууссан");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking payment:", error);
      return false;
    }
  }, [qrCode, transactionId, onSuccess]);

  // Create invoice on mount
  useEffect(() => {
    if (status === "idle") {
      createInvoice();
    }
  }, [status, createInvoice]);

  // Poll every 3s
  useEffect(() => {
    if (status !== "waiting") return;

    const interval = setInterval(async () => {
      setStatus("checking");
      const isDone = await checkPaymentStatus();
      if (!isDone) {
        setStatus("waiting");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, checkPaymentStatus]);

  return (
    <div className="flex flex-col gap-6">
      {/* Order Summary Compact */}
      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <Image
            src={coupon.image}
            alt={coupon.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#4B5563] font-extrabold font-nunito text-sm leading-tight truncate">
            {coupon.title}
          </h3>
        </div>
        <p className="text-[#58CC02] font-extrabold font-nunito text-lg shrink-0">
          {coupon.price.toLocaleString()}₮
        </p>
      </div>

      {/* Payment Content */}
      <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6">
        {/* Creating */}
        {status === "creating" && (
          <div className="flex flex-col items-center justify-center py-12">
            <video src="/bouncing-loader.webm" autoPlay loop muted playsInline className="w-40 h-40" />
            <p className="mt-4 text-gray-600 font-nunito">
              QR код үүсгэж байна...
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle size={48} className="text-red-500" />
            <p className="mt-4 text-red-600 font-medium font-nunito">
              {errorMessage}
            </p>
            <button
              onClick={createInvoice}
              className="mt-4 px-6 py-2 bg-[#58CC02] text-white rounded-xl font-bold font-nunito hover:bg-[#4CAF00] transition cursor-pointer"
            >
              Дахин оролдох
            </button>
          </div>
        )}

        {/* Expired */}
        {status === "expired" && (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle size={48} className="text-orange-500" />
            <p className="mt-4 text-orange-600 font-medium font-nunito">
              Төлбөрийн хугацаа дууссан
            </p>
            <button
              onClick={() => {
                setStatus("idle");
              }}
              className="mt-4 px-6 py-2 bg-[#58CC02] text-white rounded-xl font-bold font-nunito hover:bg-[#4CAF00] transition cursor-pointer"
            >
              Шинэ QR үүсгэх
            </button>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle size={64} className="text-[#58CC02]" />
            <p className="mt-4 text-[#58CC02] font-bold text-xl font-nunito">
              Төлбөр амжилттай!
            </p>
          </div>
        )}

        {/* QR Code + Banks */}
        {(status === "waiting" || status === "checking") && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#58CC02]/10 rounded-xl flex items-center justify-center">
                <Smartphone size={20} className="text-[#58CC02]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#4B5563] font-nunito">
                  QPay Төлбөр
                </h2>
                <p className="text-sm text-gray-400 font-nunito">
                  QR кодыг уншуулна уу
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 font-nunito">Төлөх дүн</p>
              <p className="text-3xl font-black text-gray-800 font-nunito">
                {coupon.price.toLocaleString()}₮
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm">
                {qrImage && (
                  <Image
                    src={`data:image/png;base64,${qrImage}`}
                    alt="QPay QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-4 h-4 border-2 border-[#58CC02]/30 border-t-[#58CC02] rounded-full animate-spin" />
                <p className="text-sm text-[#58CC02] font-nunito">
                  Төлбөр шалгаж байна...
                </p>
              </div>

              {/* Dev Test Button */}
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={() => {
                    setStatus("success");
                    localStorage.removeItem(
                      `qpay_invoice_${transactionId}`
                    );
                    localStorage.removeItem("qpay_latest_qrcode");
                    onSuccess();
                  }}
                  className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition border-2 border-orange-600 cursor-pointer"
                >
                  DEV: Төлбөр амжилттай (Тест)
                </button>
              )}
            </div>

            {/* Bank Links - Mobile only */}
            {isMobile && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-400 font-nunito">
                    эсвэл
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3 font-nunito">
                    Банкны апп сонгох
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedLinks.map((bank) => (
                      <a
                        key={bank.name}
                        href={bank.link}
                        className="flex flex-col items-center p-3 rounded-xl border border-gray-200 hover:border-[#58CC02]/50 hover:bg-[#58CC02]/10 transition-all"
                      >
                        <Image
                          src={bank.logo}
                          alt={bank.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                        <span className="text-xs text-gray-600 mt-2 text-center line-clamp-1 font-nunito">
                          {bank.description}
                        </span>
                      </a>
                    ))}
                  </div>

                  {links.length > 6 && (
                    <button
                      onClick={() => setShowAllBanks(!showAllBanks)}
                      className="w-full mt-3 py-2 text-sm text-[#58CC02] font-medium hover:bg-[#58CC02]/10 rounded-lg transition font-nunito cursor-pointer"
                    >
                      {showAllBanks
                        ? "Хураах"
                        : `Бүх банк харах (${links.length})`}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Footer note */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 text-center font-nunito">
                Төлбөр төлөгдсөний дараа автоматаар баталгаажна
              </p>
            </div>
          </>
        )}
      </div>

      {/* Back button (only before success) */}
      {status !== "success" && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 justify-center text-gray-400 font-bold font-nunito text-sm hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Буцах
        </button>
      )}
    </div>
  );
};
