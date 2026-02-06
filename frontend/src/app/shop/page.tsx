"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/auth";
import { Coupon, PurchasedCoupon, DeliveryInfo } from "@/src/types";
import { toast } from "sonner";
import { createClient } from "@/src/utils/supabase/client";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";
import { ShopHeader } from "@/src/components/shop/ShopHeader";
import { ShopTabs } from "@/src/components/shop/ShopTabs";
import { CouponCard } from "@/src/components/shop/CouponCard";
import { InventoryCard } from "@/src/components/shop/InventoryCard";
import { EmptyInventory } from "@/src/components/shop/EmptyInventory";
import { DeliveryForm } from "@/src/components/shop/DeliveryForm";
import PhoneInputDialog from "@/src/components/shop/PhoneInputDialog";
import QPayDialog from "@/src/components/qpay/QPayDialog";

// LocalStorage key for pending delivery info
const PENDING_ORDER_KEY = "pending_delivery_order";

interface PendingOrder {
  orderId: string;
  couponId: string;
  code: string;
}

export default function ShopPage() {
  const { activeProfile, user, loading } = useAuth();
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"shop" | "inventory">("shop");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [loadingCouponId, setLoadingCouponId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showQPayDialog, setShowQPayDialog] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  // Track order being edited (for adding/updating delivery info)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Check if user is logged in as a child
  const isLoggedIn = !!activeProfile?.type;

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
        const mappedCoupons: Coupon[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          cost: item.cost || 0,
          price: item.price || 0,
          image: item.image,
          color: item.color,
          codePrefix: item.code_prefix || item.codePrefix || "CODE",
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
      checkPendingOrder();
    }
  }, [activeProfile]);

  const fetchPurchasedCoupons = async () => {
    if (!activeProfile) return;

    // Always check localStorage first
    const localStorageKey = `coupons_${activeProfile.id}`;
    const savedLocal = localStorage.getItem(localStorageKey);
    const localCoupons: PurchasedCoupon[] = savedLocal ? JSON.parse(savedLocal) : [];

    try {
      const { data, error } = await supabase
        .from("child_coupons")
        .select("*")
        .eq("child_id", activeProfile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          "Could not fetch coupons from DB, using local storage",
          error
        );
        // Use localStorage data when DB fails
        if (localCoupons.length > 0) {
          setPurchasedCoupons(localCoupons);
        }
        return;
      }

      if (data && data.length > 0) {
        // Merge: DB data takes priority, but include local-only items
        const dbIds = new Set(data.map((d: PurchasedCoupon) => d.id));
        const localOnly = localCoupons.filter((lc) => !dbIds.has(lc.id));
        const merged = [...data, ...localOnly];
        setPurchasedCoupons(merged);

        // Sync local-only items to localStorage (in case some were missed)
        if (localOnly.length > 0) {
          localStorage.setItem(localStorageKey, JSON.stringify(merged));
        }
      } else {
        // No DB data, use localStorage
        if (localCoupons.length > 0) {
          setPurchasedCoupons(localCoupons);
        }
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      // Fallback to localStorage on any error
      if (localCoupons.length > 0) {
        setPurchasedCoupons(localCoupons);
      }
    }
  };

  // Check for pending order that needs delivery info (after page refresh)
  const checkPendingOrder = async () => {
    if (!activeProfile) return;

    try {
      const pendingStr = localStorage.getItem(PENDING_ORDER_KEY);
      if (!pendingStr) return;

      const pending: PendingOrder = JSON.parse(pendingStr);

      // First check localStorage for the order
      const localStorageKey = `coupons_${activeProfile.id}`;
      const savedLocal = localStorage.getItem(localStorageKey);
      const localCoupons: PurchasedCoupon[] = savedLocal ? JSON.parse(savedLocal) : [];
      const localOrder = localCoupons.find((c) => c.id === pending.orderId);

      // Try Supabase first
      const { data: order, error } = await supabase
        .from("child_coupons")
        .select("*")
        .eq("id", pending.orderId)
        .eq("child_id", activeProfile.id)
        .single();

      // Use DB order if available, otherwise use local order
      const foundOrder = order || localOrder;

      if (error && !localOrder) {
        // Order not found in both DB and localStorage, clear pending
        localStorage.removeItem(PENDING_ORDER_KEY);
        return;
      }

      if (!foundOrder) {
        localStorage.removeItem(PENDING_ORDER_KEY);
        return;
      }

      // If order exists but has no delivery info, show the form
      if (!foundOrder.delivery_info) {
        const coupon = coupons.find((c) => c.id === pending.couponId);
        if (coupon) {
          setSelectedCoupon(coupon);
        }
        setEditingOrderId(pending.orderId);
        setShowDeliveryForm(true);
        setActiveTab("inventory");
      } else {
        // Order already has delivery info, clear pending
        localStorage.removeItem(PENDING_ORDER_KEY);
      }
    } catch (err) {
      console.error("Error checking pending order:", err);
      localStorage.removeItem(PENDING_ORDER_KEY);
    }
  };

  // Re-check pending order when coupons are loaded
  useEffect(() => {
    if (coupons.length > 0 && activeProfile?.type === "child") {
      checkPendingOrder();
    }
  }, [coupons]);

  const generateCode = (prefix: string) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const handlePurchase = (coupon: Coupon) => {
    if (purchaseLoading) return;

    setSelectedCoupon(coupon);
    setShowPhoneDialog(true);
  };

  // Handle login required for inventory tab
  const handleLoginRequired = () => {
    toast.error("Купонуудыг харахын тулд нэвтэрнэ үү");
    router.push("/login");
  };

  // Handle phone input submission - proceed to payment
  const handlePhoneSubmit = (phone: string) => {
    setCustomerPhone(phone);
    setShowPhoneDialog(false);
    setShowQPayDialog(true);
  };

  // Payment success - immediately save to Supabase
  const handlePaymentSuccess = async () => {
    if (!selectedCoupon) return;

    setPurchaseLoading(true);

    try {
      // Generate code
      const newCode = generateCode(selectedCoupon.codePrefix);

      // Use activeProfile.id if logged in, otherwise use a guest UUID
      const childId = activeProfile?.id || crypto.randomUUID();

      // Immediately save to Supabase (without delivery info)
      const newOrder = {
        child_id: childId,
        coupon_id: selectedCoupon.id,
        code: newCode,
        is_used: false,
        created_at: new Date().toISOString(),
        delivery_status: "pending" as const,
        phone: customerPhone,
      };

      const { data, error } = await supabase
        .from("child_coupons")
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error("DB insert failed:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error,
          insertedData: newOrder,
        });

        // Show error to user but still proceed with local storage as backup
        toast.error("Серверт хадгалахад алдаа гарлаа. Хүргэлтийн мэдээллийг оруулна уу.", {
          duration: 5000,
        });

        const localOrder = { ...newOrder, id: Date.now().toString() };
        const updatedCoupons = [localOrder, ...purchasedCoupons];
        setPurchasedCoupons(updatedCoupons);
        localStorage.setItem(
          `coupons_${childId}`,
          JSON.stringify(updatedCoupons)
        );
        // Store pending for delivery form
        localStorage.setItem(
          PENDING_ORDER_KEY,
          JSON.stringify({
            orderId: localOrder.id,
            couponId: selectedCoupon.id,
            code: newCode,
          })
        );
        setEditingOrderId(localOrder.id);
      } else {
        setPurchasedCoupons([data, ...purchasedCoupons]);
        // Store pending for delivery form (in case of refresh)
        localStorage.setItem(
          PENDING_ORDER_KEY,
          JSON.stringify({
            orderId: data.id,
            couponId: selectedCoupon.id,
            code: newCode,
          })
        );
        setEditingOrderId(data.id);

        showCharacterToast(
          `Төлбөр амжилттай! Код: ${newCode}`,
          "green"
        );
      }

      setShowQPayDialog(false);
      setShowDeliveryForm(true);
      setActiveTab("inventory");
      setCustomerPhone('');
    } catch (err) {
      console.error("Error saving order:", err);
      toast.error("Захиалга хадгалахад алдаа гарлаа");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const sendOrderNotification = async (
    orderCode: string,
    coupon: Coupon,
    deliveryInfo: DeliveryInfo
  ) => {
    try {
      await fetch("/api/order-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode,
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
  };

  // Handle delivery form submission (update existing order)
  const handleDeliverySubmit = async (deliveryInfo: DeliveryInfo) => {
    if (!activeProfile || !editingOrderId) return;

    setPurchaseLoading(true);

    try {
      // Update existing order with delivery info
      // First try with child_id filter for security
      let { data, error } = await supabase
        .from("child_coupons")
        .update({
          delivery_info: deliveryInfo,
          delivery_status: "pending",
        })
        .eq("id", editingOrderId)
        .eq("child_id", activeProfile.id)
        .select()
        .single();

      // If no match with child_id filter, try without it (order might be from different profile)
      if (error && error.code === "PGRST116") {
        console.warn("First update attempt failed, trying without child_id filter");
        const retryResult = await supabase
          .from("child_coupons")
          .update({
            delivery_info: deliveryInfo,
            delivery_status: "pending",
          })
          .eq("id", editingOrderId)
          .select()
          .single();
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error("DB update failed:", {
          message: error.message,
          code: error.code,
          details: error.details,
          editingOrderId,
          childId: activeProfile.id,
        });

        // Check if this is a local-only order (ID is not a valid UUID)
        const isLocalId = !editingOrderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

        if (isLocalId) {
          // This is a local-only order, update localStorage and warn user
          const updatedCoupons = purchasedCoupons.map((pc) =>
            pc.id === editingOrderId
              ? { ...pc, delivery_info: deliveryInfo, delivery_status: "pending" as const }
              : pc
          );
          setPurchasedCoupons(updatedCoupons);
          localStorage.setItem(
            `coupons_${activeProfile.id}`,
            JSON.stringify(updatedCoupons)
          );

          toast.error("Захиалга серверт хадгалагдсангүй. Дахин оролдоно уу.");
          setShowDeliveryForm(false);
          setSelectedCoupon(null);
          setEditingOrderId(null);
          return;
        }

        // DB error for a real order - show error and don't close form
        toast.error("Хүргэлтийн мэдээлэл хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      // Success - update state with new data from database
      setPurchasedCoupons((prev) =>
        prev.map((pc) => (pc.id === editingOrderId ? data : pc))
      );

      // Clear pending order from localStorage
      localStorage.removeItem(PENDING_ORDER_KEY);

      // Find the order to send notification
      const order = purchasedCoupons.find((pc) => pc.id === editingOrderId);
      const coupon = selectedCoupon || coupons.find((c) => c.id === order?.coupon_id);

      if (order && coupon) {
        sendOrderNotification(order.code, coupon, deliveryInfo);
      }

      showCharacterToast(
        "Хүргэлтийн мэдээлэл амжилттай хадгалагдлаа!",
        "green"
      );

      setShowDeliveryForm(false);
      setSelectedCoupon(null);
      setEditingOrderId(null);
    } catch (err) {
      console.error("Error updating delivery info:", err);
      toast.error("Хүргэлтийн мэдээлэл хадгалахад алдаа гарлаа");
    } finally {
      setPurchaseLoading(false);
      setLoadingCouponId(null);
    }
  };

  // Cancel delivery form (order already saved, just close form)
  const handleDeliveryCancel = () => {
    // Clear pending order from localStorage
    localStorage.removeItem(PENDING_ORDER_KEY);

    setShowDeliveryForm(false);
    setSelectedCoupon(null);
    setEditingOrderId(null);
  };

  // Handle click on inventory card to add delivery info
  const handleAddDeliveryInfo = (orderId: string, couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (coupon) {
      setSelectedCoupon(coupon);
    }
    setEditingOrderId(orderId);
    setShowDeliveryForm(true);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setShowQPayDialog(false);
    setSelectedCoupon(null);
  };

  if (loading) return null;

  return (
    <div className="w-full min-h-[calc(100vh-77px)] flex justify-center bg-[#FFFAF7] px-4 pb-20">
      <div className="max-w-[1280px] w-full flex flex-col gap-8 md:gap-14">
        <ShopHeader activeProfile={activeProfile} />

        <ShopTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          inventoryCount={purchasedCoupons.length}
          isLoggedIn={isLoggedIn}
          onLoginRequired={handleLoginRequired}
        />

        {activeTab === "shop" ? (
          <div className="flex flex-col gap-7 py-2">
            <p className="text-[#4B5563] font-bold text-[28px] font-nunito px-2">
              Боломжит бүтээгдэхүүнүүд
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onPurchase={handlePurchase}
                  isLoading={purchaseLoading}
                  loadingId={loadingCouponId || undefined}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-7 py-2">
            {/* Show Delivery Form */}
            {showDeliveryForm && (selectedCoupon || editingOrderId) ? (
              <div className="max-w-xl mx-auto w-full">
                <DeliveryForm
                  onSubmit={handleDeliverySubmit}
                  onCancel={handleDeliveryCancel}
                  isLoading={purchaseLoading}
                  productPrice={selectedCoupon?.price || 0}
                />
              </div>
            ) : (
              <>
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
                        onAddDeliveryInfo={
                          !pc.delivery_info
                            ? () => handleAddDeliveryInfo(pc.id, pc.coupon_id)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Phone Input Dialog - before payment */}
        <PhoneInputDialog
          isOpen={showPhoneDialog}
          onClose={() => {
            setShowPhoneDialog(false);
            setSelectedCoupon(null);
          }}
          onSubmit={handlePhoneSubmit}
          productTitle={selectedCoupon?.title}
        />

        {/* QPay Payment Dialog */}
        <QPayDialog
          isOpen={showQPayDialog}
          onClose={() => {
            setShowQPayDialog(false);
            setSelectedCoupon(null);
            setCustomerPhone('');
          }}
          amount={selectedCoupon?.price || 0}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          userId={user?.id}
        />
      </div>
    </div>
  );
}
