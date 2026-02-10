"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import { useAuth } from "@/src/components/auth";
import { Coupon, DeliveryInfo } from "@/src/types";
import { toast } from "sonner";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";

import { CheckoutStepIndicator } from "@/src/components/checkout/CheckoutStepIndicator";
import { CheckoutDeliveryStep } from "@/src/components/checkout/CheckoutDeliveryStep";
import { CheckoutPaymentStep } from "@/src/components/checkout/CheckoutPaymentStep";
import { CheckoutSuccessStep } from "@/src/components/checkout/CheckoutSuccessStep";

type CheckoutStep = "delivery" | "payment" | "success";

interface CheckoutPageProps {
  couponId: string;
}

export const CheckoutPage = ({ couponId }: CheckoutPageProps) => {
  const router = useRouter();
  const supabase = createClient();
  const { user, activeProfile } = useAuth();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<CheckoutStep>("delivery");
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [orderCode, setOrderCode] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const { data, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("id", couponId)
          .single();

        if (error || !data) {
          toast.error("Бүтээгдэхүүн олдсонгүй");
          router.push("/shop?tab=products");
          return;
        }

        setCoupon({
          id: data.id,
          title: data.title,
          description: data.description,
          cost: data.cost || 0,
          price: data.price || 0,
          image: data.image,
          color: data.color,
          codePrefix: data.code_prefix || data.codePrefix || "CODE",
        });
      } catch (err) {
        console.error("Error fetching coupon:", err);
        toast.error("Алдаа гарлаа");
        router.push("/shop?tab=products");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [couponId, router, supabase]);

  const generateCode = (prefix: string) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const handleDeliverySubmit = (info: DeliveryInfo) => {
    setDeliveryInfo(info);
    setStep("payment");
  };

  const handlePaymentSuccess = async () => {
    if (!coupon || !deliveryInfo) return;

    setSavingOrder(true);

    try {
      const newCode = generateCode(coupon.codePrefix);
      const childId = activeProfile?.id || crypto.randomUUID();

      const newOrder = {
        child_id: childId,
        coupon_id: coupon.id,
        code: newCode,
        is_used: false,
        created_at: new Date().toISOString(),
        delivery_status: "pending" as const,
        phone: deliveryInfo.phone,
        purchase_type: "qpay" as const,
        delivery_info: deliveryInfo,
      };

      const { error } = await supabase
        .from("child_coupons")
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error("DB insert failed:", error);
        // Save locally as backup
        if (activeProfile?.id) {
          const localKey = `coupons_${activeProfile.id}`;
          const existing = JSON.parse(
            localStorage.getItem(localKey) || "[]"
          );
          existing.unshift({ ...newOrder, id: Date.now().toString() });
          localStorage.setItem(localKey, JSON.stringify(existing));
        }
      }

      // Send notification
      try {
        await fetch("/api/order-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderCode: newCode,
            productTitle: coupon.title,
            productPrice: coupon.price,
            deliveryFee: deliveryInfo.delivery_fee,
            recipientName: deliveryInfo.recipient_name,
            phone: deliveryInfo.phone,
            zoneName: deliveryInfo.zone_name,
            locationName: deliveryInfo.location_name,
            address: deliveryInfo.address,
            notes: deliveryInfo.notes,
          }),
        });
      } catch (err) {
        console.error("Failed to send order notification:", err);
      }

      setOrderCode(newCode);
      setStep("success");
      showCharacterToast(`Төлбөр амжилттай! Код: ${newCode}`, "green");
    } catch (err) {
      console.error("Error saving order:", err);
      toast.error("Захиалга хадгалахад алдаа гарлаа");
    } finally {
      setSavingOrder(false);
    }
  };

  if (loading || !coupon) {
    return (
      <div className="w-full min-h-[calc(100vh-77px)] pb-16 md:pb-0 -mb-16 md:mb-0 flex justify-center items-center bg-[#FFFAF7]">
        <video src="/bouncing-loader.webm" autoPlay loop muted playsInline className="w-40 h-40" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-77px)] pb-16 md:pb-0 -mb-16 md:mb-0 flex flex-col items-center bg-[#FFFAF7] pt-6 px-4">
      <div className="max-w-xl w-full flex flex-col gap-8">
        {/* Step Indicator */}
        <CheckoutStepIndicator currentStep={step} />

        {/* Step Content */}
        {step === "delivery" && (
          <CheckoutDeliveryStep
            coupon={coupon}
            onSubmit={handleDeliverySubmit}
            isLoading={false}
          />
        )}

        {step === "payment" && deliveryInfo && (
          <CheckoutPaymentStep
            coupon={coupon}
            userId={user?.id}
            phone={deliveryInfo.phone}
            onSuccess={handlePaymentSuccess}
            onBack={() => setStep("delivery")}
          />
        )}

        {step === "success" && deliveryInfo && (
          <CheckoutSuccessStep
            coupon={coupon}
            orderCode={orderCode}
            deliveryInfo={deliveryInfo}
          />
        )}
      </div>
    </div>
  );
};
