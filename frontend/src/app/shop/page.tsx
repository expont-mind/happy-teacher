"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth";
import { Coupon, PurchasedCoupon } from "@/src/types";
import { toast } from "sonner";
import { createClient } from "@/src/utils/supabase/client";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";
import { ShopHeader } from "@/src/components/shop/ShopHeader";
import { ShopTabs } from "@/src/components/shop/ShopTabs";
import { CouponCard } from "@/src/components/shop/CouponCard";
import { InventoryCard } from "@/src/components/shop/InventoryCard";
import { EmptyInventory } from "@/src/components/shop/EmptyInventory";
import PurchaseConfirmModal from "@/src/components/shop/PurchaseConfirmModal";

export default function ShopPage() {
  const { activeProfile, addXP, loading } = useAuth();
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"shop" | "inventory">("shop");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [loadingCouponId, setLoadingCouponId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase.from("coupons").select("*");
      if (error) {
        console.error("Error fetching coupons:", error);
        return;
      }
      if (data) {
        // Map snake_case code_prefix to camelCase if necessary, or just cast if DB matches
        const mappedCoupons: Coupon[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          cost: item.cost,
          image: item.image,
          color: item.color,
          codePrefix: item.code_prefix || item.codePrefix || "CODE", // Handle both cases
        }));
        setCoupons(mappedCoupons);
      }
    } catch (err) {
      console.error("Unexpected error fetching coupons:", err);
    }
  };

  useEffect(() => {
    if (activeProfile?.type === "child") {
      fetchPurchasedCoupons();
    }
  }, [activeProfile]);

  const fetchPurchasedCoupons = async () => {
    if (!activeProfile) return;

    try {
      const { data, error } = await supabase
        .from("child_coupons")
        .select("*")
        .eq("child_id", activeProfile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          "Could not fetch coupons from DB, checking local storage",
          error
        );
        const saved = localStorage.getItem(`coupons_${activeProfile.id}`);
        if (saved) {
          setPurchasedCoupons(JSON.parse(saved));
        }
        return;
      }

      if (data) {
        setPurchasedCoupons(data);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  const generateCode = (prefix: string) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const handlePurchase = (coupon: Coupon) => {
    if (!activeProfile || purchaseLoading) return;

    if ((activeProfile.xp || 0) < coupon.cost) {
      showCharacterToast("XP хүрэлцэхгүй байна! Дахиад хичээл хийгээрэй.");
      return;
    }

    setSelectedCoupon(coupon);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!activeProfile || !selectedCoupon || purchaseLoading) return;

    setPurchaseLoading(true);
    setLoadingCouponId(selectedCoupon.id);

    try {
      // 1. Deduct XP
      const result = await addXP(-selectedCoupon.cost);

      if (!result) {
        throw new Error("Failed to deduct XP");
      }

      // 2. Create Coupon Record
      const newCode = generateCode(selectedCoupon.codePrefix);
      const newCoupon = {
        child_id: activeProfile.id,
        coupon_id: selectedCoupon.id,
        code: newCode,
        is_used: false,
        created_at: new Date().toISOString(),
      };

      // Try DB insert
      const { data, error } = await supabase
        .from("child_coupons")
        .insert(newCoupon)
        .select()
        .single();

      if (error) {
        console.warn("DB insert failed, saving locally", error);
        // Local fallback
        const localCoupon = { ...newCoupon, id: Date.now().toString() };
        const updatedCoupons = [localCoupon, ...purchasedCoupons];
        setPurchasedCoupons(updatedCoupons);
        localStorage.setItem(
          `coupons_${activeProfile.id}`,
          JSON.stringify(updatedCoupons)
        );

        showCharacterToast(`Амжилттай! Таны код: ${newCode}`, "green");
      } else {
        setPurchasedCoupons([data, ...purchasedCoupons]);
        showCharacterToast(`Амжилттай! Таны код: ${newCode}`, "green");
      }

      setActiveTab("inventory");
      setShowConfirmModal(false);
      setSelectedCoupon(null);
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error("Худалдан авалт амжилтгүй боллоо");
    } finally {
      setPurchaseLoading(false);
      setLoadingCouponId(null);
    }
  };

  if (loading) return null;

  if (activeProfile?.type !== "child") {
    return (
      <div className="w-full min-h-[calc(100vh-77px)] flex justify-center items-center bg-[#FFFAF7]">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-nunito mb-4">
            Зөвхөн хүүхдэд зориулсан хэсэг
          </h1>
          <p className="text-gray-500 font-nunito">
            Та хүүхдийн профайлаар нэвтэрнэ үү.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7] px-4 pb-20">
      <div className="max-w-[1280px] w-full flex flex-col gap-8 md:gap-14">
        <ShopHeader activeProfile={activeProfile} />

        <ShopTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          inventoryCount={purchasedCoupons.length}
        />

        {activeTab === "shop" ? (
          <div className="flex flex-col gap-7 py-2">
            <p className="text-[#4B5563] font-bold text-[28px] font-nunito px-2">
              Боломжит купонууд
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  activeXP={activeProfile.xp || 0}
                  onPurchase={handlePurchase}
                  isLoading={purchaseLoading}
                  loadingId={loadingCouponId || undefined}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-7 py-2">
            <p className="text-[#4B5563] font-bold text-[28px] font-nunito px-2">
              Таны цуглуулга
            </p>

            {purchasedCoupons.length === 0 ? (
              <EmptyInventory onShopClick={() => setActiveTab("shop")} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchasedCoupons.map((pc) => (
                  <InventoryCard
                    key={pc.id}
                    purchasedCoupon={pc}
                    coupon={coupons.find((c) => c.id === pc.coupon_id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <PurchaseConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedCoupon(null);
          }}
          onConfirm={handleConfirmPurchase}
          coupon={selectedCoupon}
          isLoading={purchaseLoading}
        />
      </div>
    </div>
  );
}
