"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/components/auth";
import { Coupon, PurchasedCoupon, DeliveryInfo } from "@/src/types";
import { toast } from "sonner";
import { createClient } from "@/src/utils/supabase/client";
import { showCharacterToast } from "@/src/components/ui/CharacterToast";
import { Gift, ShoppingBag, BookOpen, Zap } from "lucide-react";
import { TOPICS_DATA } from "@/src/data/topics";

import { XpCouponCard } from "@/src/components/shop/XpCouponCard";
import { CouponCard } from "@/src/components/shop/CouponCard";
import { TopicCard } from "@/src/components/shop/TopicCard";
import { OrderHistorySection } from "@/src/components/shop/OrderHistorySection";
import { DeliveryForm } from "@/src/components/shop/DeliveryForm";
import PurchaseConfirmModal from "@/src/components/shop/PurchaseConfirmModal";
import TopicPurchaseModal from "@/src/components/shop/TopicPurchaseModal";
import TopicDetailModal from "@/src/components/shop/TopicDetailModal";
import ProductDetailModal from "@/src/components/shop/ProductDetailModal";

const PENDING_ORDER_KEY = "pending_delivery_order";

interface PendingOrder {
  orderId: string;
  couponId: string;
  code: string;
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const { activeProfile, user, loading, spendXP } = useAuth();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isChild = activeProfile?.type === "child";
  const isParent = activeProfile?.type === "adult";

  // Shared state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // XP purchase state (child)
  const [showXpConfirm, setShowXpConfirm] = useState(false);

  const router = useRouter();

  // Tab state — read from ?tab= URL param (shown for parent + guest)
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"lessons" | "products">(
    tabParam === "products" ? "products" : "lessons"
  );

  // Topic purchase state (parent)
  const [selectedTopicKey, setSelectedTopicKey] = useState<string | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicPurchaseStatus, setTopicPurchaseStatus] = useState<
    Record<string, Set<string>>
  >({});

  // Detail modal state
  const [detailTopic, setDetailTopic] = useState<typeof TOPICS_DATA[number] | null>(null);
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);
  const [detailXpMode, setDetailXpMode] = useState(false);

  // Delivery state
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // --- Data Fetching ---

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (isChild) {
      fetchPurchasedCoupons();
      checkPendingOrder();
    }
  }, [activeProfile]);

  useEffect(() => {
    if (coupons.length > 0 && isChild) {
      checkPendingOrder();
    }
  }, [coupons]);

  useEffect(() => {
    if (isParent && user) {
      fetchTopicPurchaseStatus();
    }
  }, [isParent, user]);

  // Check for interrupted payments on page load
  useEffect(() => {
    if (!user) return;

    const checkPendingPayments = async () => {
      try {
        const res = await fetch("/api/bonum/check-pending-payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();

        if (data.completedPurchases?.length > 0) {
          if (isParent) fetchTopicPurchaseStatus();
          if (isChild) fetchPurchasedCoupons();

          for (const purchase of data.completedPurchases) {
            if (purchase.purchaseType === "topic") {
              showCharacterToast("Өмнөх төлбөр амжилттай! Хичээл нээгдлээ.", "green");
            } else {
              showCharacterToast(
                `Өмнөх төлбөр амжилттай! Код: ${purchase.code}`,
                "green"
              );
            }
          }
        }
      } catch (err) {
        console.error("Error checking pending payments:", err);
      }
    };

    checkPendingPayments();
  }, [user]);

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

  const fetchPurchasedCoupons = async () => {
    if (!activeProfile) return;

    const localStorageKey = `coupons_${activeProfile.id}`;
    const savedLocal = localStorage.getItem(localStorageKey);
    const localCoupons: PurchasedCoupon[] = savedLocal
      ? JSON.parse(savedLocal)
      : [];

    try {
      const { data, error } = await supabase
        .from("child_coupons")
        .select("*")
        .eq("child_id", activeProfile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch coupons from DB, using local storage", error);
        if (localCoupons.length > 0) setPurchasedCoupons(localCoupons);
        return;
      }

      if (data && data.length > 0) {
        const dbIds = new Set(data.map((d: PurchasedCoupon) => d.id));
        const localOnly = localCoupons.filter((lc) => !dbIds.has(lc.id));
        const merged = [...data, ...localOnly];
        setPurchasedCoupons(merged);
        if (localOnly.length > 0) {
          localStorage.setItem(localStorageKey, JSON.stringify(merged));
        }
      } else if (localCoupons.length > 0) {
        setPurchasedCoupons(localCoupons);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      if (localCoupons.length > 0) setPurchasedCoupons(localCoupons);
    }
  };

  const fetchTopicPurchaseStatus = async () => {
    if (!user) return;
    try {
      const { data: children } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id);

      if (!children || children.length === 0) return;

      const { data: purchases } = await supabase
        .from("purchases")
        .select("topic_key, child_id")
        .eq("user_id", user.id)
        .not("child_id", "is", null);

      if (!purchases) return;

      const status: Record<string, Set<string>> = {};
      for (const p of purchases) {
        if (!status[p.topic_key]) status[p.topic_key] = new Set();
        status[p.topic_key].add(p.child_id);
      }
      setTopicPurchaseStatus(status);
    } catch (err) {
      console.error("Error fetching topic purchase status:", err);
    }
  };

  const checkPendingOrder = async () => {
    if (!activeProfile) return;

    try {
      const pendingStr = localStorage.getItem(PENDING_ORDER_KEY);
      if (!pendingStr) return;

      const pending: PendingOrder = JSON.parse(pendingStr);

      const localStorageKey = `coupons_${activeProfile.id}`;
      const savedLocal = localStorage.getItem(localStorageKey);
      const localCoupons: PurchasedCoupon[] = savedLocal
        ? JSON.parse(savedLocal)
        : [];
      const localOrder = localCoupons.find((c) => c.id === pending.orderId);

      const { data: order, error } = await supabase
        .from("child_coupons")
        .select("*")
        .eq("id", pending.orderId)
        .eq("child_id", activeProfile.id)
        .single();

      const foundOrder = order || localOrder;

      if (error && !localOrder) {
        localStorage.removeItem(PENDING_ORDER_KEY);
        return;
      }
      if (!foundOrder) {
        localStorage.removeItem(PENDING_ORDER_KEY);
        return;
      }

      if (!foundOrder.delivery_info) {
        const coupon = coupons.find((c) => c.id === pending.couponId);
        if (coupon) setSelectedCoupon(coupon);
        setEditingOrderId(pending.orderId);
        setShowDeliveryForm(true);
      } else {
        localStorage.removeItem(PENDING_ORDER_KEY);
      }
    } catch (err) {
      console.error("Error checking pending order:", err);
      localStorage.removeItem(PENDING_ORDER_KEY);
    }
  };

  // --- Helpers ---

  const generateCode = (prefix: string) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const getTopicKeyFromLink = (link: string) => {
    const parts = link.split("/");
    return parts[parts.length - 1];
  };

  const isAllChildrenPurchased = (topicKey: string) => {
    if (!user) return false;
    // We need children count — approximate by checking if status exists
    // A more robust check happens in TopicPurchaseModal
    const purchased = topicPurchaseStatus[topicKey];
    if (!purchased || purchased.size === 0) return false;
    // For now, we don't have children count cached here,
    // so the TopicPurchaseModal handles the full check.
    // We'll show "purchased" only if we know there are purchases.
    return false; // Let the modal handle granular per-child checks
  };

  // --- XP Purchase Flow (Child) ---

  const handleXpPurchase = (coupon: Coupon) => {
    if (purchaseLoading) return;
    setSelectedCoupon(coupon);
    setShowXpConfirm(true);
  };

  const handleXpConfirm = async () => {
    if (!selectedCoupon || !activeProfile || !spendXP) return;

    setPurchaseLoading(true);

    try {
      const result = await spendXP(selectedCoupon.cost);

      if (!result || !result.success) {
        if (result?.error === "insufficient_xp") {
          toast.error("XP хүрэхгүй байна!");
        } else {
          toast.error("XP зарцуулахад алдаа гарлаа");
        }
        setPurchaseLoading(false);
        return;
      }

      // XP deducted successfully — create order
      const newCode = generateCode(selectedCoupon.codePrefix);
      const newOrder = {
        child_id: activeProfile.id,
        coupon_id: selectedCoupon.id,
        code: newCode,
        is_used: false,
        created_at: new Date().toISOString(),
        delivery_status: "pending" as const,
        purchase_type: "xp" as const,
      };

      const { data, error } = await supabase
        .from("child_coupons")
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error("DB insert failed after XP spend:", error);
        // Order failed but XP was already deducted — save locally as backup
        const localOrder = { ...newOrder, id: Date.now().toString() };
        setPurchasedCoupons([localOrder, ...purchasedCoupons]);
        localStorage.setItem(
          `coupons_${activeProfile.id}`,
          JSON.stringify([localOrder, ...purchasedCoupons])
        );
        localStorage.setItem(
          PENDING_ORDER_KEY,
          JSON.stringify({
            orderId: localOrder.id,
            couponId: selectedCoupon.id,
            code: newCode,
          })
        );
        setEditingOrderId(localOrder.id);
        toast.error("Серверт хадгалахад алдаа гарлаа.");
      } else {
        setPurchasedCoupons([data, ...purchasedCoupons]);
        localStorage.setItem(
          PENDING_ORDER_KEY,
          JSON.stringify({
            orderId: data.id,
            couponId: selectedCoupon.id,
            code: newCode,
          })
        );
        setEditingOrderId(data.id);
        showCharacterToast(`Шагнал авлаа! Код: ${newCode}`, "green");
      }

      setShowXpConfirm(false);
      setShowDeliveryForm(true);
    } catch (err) {
      console.error("Error in XP purchase:", err);
      toast.error("Алдаа гарлаа");
    } finally {
      setPurchaseLoading(false);
    }
  };

  // --- QPay Purchase Flow (Parent/Guest) → Navigate to checkout page ---

  const handleQPayPurchase = (coupon: Coupon) => {
    router.push(`/shop/checkout/${coupon.id}`);
  };

  // --- Delivery ---

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

  const handleDeliverySubmit = async (deliveryInfo: DeliveryInfo) => {
    if (!editingOrderId) return;

    setPurchaseLoading(true);

    try {
      let data;
      let error;

      if (activeProfile?.id) {
        const result = await supabase
          .from("child_coupons")
          .update({
            delivery_info: deliveryInfo,
            delivery_status: "pending",
          })
          .eq("id", editingOrderId)
          .eq("child_id", activeProfile.id)
          .select()
          .single();
        data = result.data;
        error = result.error;

        if (error && error.code === "PGRST116") {
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
      } else {
        const result = await supabase
          .from("child_coupons")
          .update({
            delivery_info: deliveryInfo,
            delivery_status: "pending",
          })
          .eq("id", editingOrderId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("DB update failed:", error);

        const isLocalId = !editingOrderId.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );

        if (isLocalId) {
          const updatedCoupons = purchasedCoupons.map((pc) =>
            pc.id === editingOrderId
              ? {
                  ...pc,
                  delivery_info: deliveryInfo,
                  delivery_status: "pending" as const,
                }
              : pc
          );
          setPurchasedCoupons(updatedCoupons);
          if (activeProfile?.id) {
            localStorage.setItem(
              `coupons_${activeProfile.id}`,
              JSON.stringify(updatedCoupons)
            );
          }
          toast.error("Захиалга серверт хадгалагдсангүй. Дахин оролдоно уу.");
          setShowDeliveryForm(false);
          setSelectedCoupon(null);
          setEditingOrderId(null);
          return;
        }

        toast.error("Хүргэлтийн мэдээлэл хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      setPurchasedCoupons((prev) =>
        prev.map((pc) => (pc.id === editingOrderId ? data : pc))
      );

      localStorage.removeItem(PENDING_ORDER_KEY);

      const order = purchasedCoupons.find((pc) => pc.id === editingOrderId);
      const coupon =
        selectedCoupon || coupons.find((c) => c.id === order?.coupon_id);

      if (order && coupon) {
        sendOrderNotification(order.code, coupon, deliveryInfo);
      }

      showCharacterToast("Хүргэлтийн мэдээлэл амжилттай хадгалагдлаа!", "green");

      setShowDeliveryForm(false);
      setSelectedCoupon(null);
      setEditingOrderId(null);
    } catch (err) {
      console.error("Error updating delivery info:", err);
      toast.error("Хүргэлтийн мэдээлэл хадгалахад алдаа гарлаа");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleDeliveryCancel = () => {
    localStorage.removeItem(PENDING_ORDER_KEY);
    setShowDeliveryForm(false);
    setSelectedCoupon(null);
    setEditingOrderId(null);
  };

  const handleAddDeliveryInfo = (orderId: string, couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (coupon) setSelectedCoupon(coupon);
    setEditingOrderId(orderId);
    setShowDeliveryForm(true);
  };

  // --- Render ---

  if (loading) return null;

  return (
    <div className="w-full min-h-[calc(100vh-77px)] flex flex-col items-center bg-[#FFFAF7]">
      {/* Hero Banner */}
      <div className="w-full bg-linear-to-br from-[#58CC02] via-[#4CAF00] to-[#3D9B00] relative overflow-hidden -mt-px">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-[10%] w-16 h-16 rounded-full bg-white/20" />
          <div className="absolute bottom-4 right-[15%] w-24 h-24 rounded-full bg-white/15" />
          <div className="absolute top-6 right-[30%] w-8 h-8 rounded-full bg-white/25" />
        </div>
        <div className="max-w-[1280px] mx-auto px-4 py-6 md:py-8 flex items-center gap-4 relative">
          <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isChild ? (
              <Gift size={28} className="text-white" />
            ) : (
              <ShoppingBag size={28} className="text-white" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-white font-extrabold text-xl md:text-2xl font-nunito">
              {isChild ? "Шагналын дэлгүүр" : "Дэлгүүр"}
            </h1>
            <p className="text-white/80 font-semibold text-xs md:text-sm font-nunito">
              {isChild
                ? `${activeProfile?.xp || 0} XP цуглуулсан — шагналаа аваарай!`
                : isParent
                ? "Хичээл болон бүтээгдэхүүн худалдаж аваарай"
                : "Хүүхдэд зориулсан бүтээгдэхүүнүүд"}
            </p>
          </div>
          {isChild && (
            <div className="ml-auto hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
              <Zap size={20} className="text-[#FFD700] fill-[#FFD700]" />
              <span className="text-white font-extrabold text-lg font-nunito">
                {activeProfile?.xp || 0}
              </span>
              <span className="text-white/70 font-bold text-sm font-nunito">XP</span>
            </div>
          )}
        </div>
        {/* Wave bottom */}
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-[20px] md:h-[30px] block">
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1380,15 1440,20 L1440,40 L0,40 Z" fill="#FFFAF7" />
        </svg>
      </div>

      <div className="max-w-[1280px] w-full flex flex-col gap-6 md:gap-10 px-4 pb-20">
        {/* Delivery Form Overlay */}
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
            {/* ===== CHILD VIEW ===== */}
            {isChild && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coupons.map((coupon) => (
                    <XpCouponCard
                      key={coupon.id}
                      coupon={coupon}
                      currentXp={activeProfile?.xp || 0}
                      onPurchase={handleXpPurchase}
                      isLoading={purchaseLoading}
                      onDetail={(c) => {
                        setDetailCoupon(c);
                        setDetailXpMode(true);
                      }}
                    />
                  ))}
                </div>
                <OrderHistorySection
                  orders={purchasedCoupons}
                  coupons={coupons}
                  onAddDeliveryInfo={handleAddDeliveryInfo}
                />
              </>
            )}

            {/* ===== PARENT / GUEST VIEW (Tabbed) ===== */}
            {!isChild && (
              <>
                {/* Tab Bar */}
                <div className="flex gap-3 bg-[#F3F4F6] rounded-2xl p-1.5">
                  <button
                    onClick={() => setActiveTab("lessons")}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm font-nunito transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "lessons"
                        ? "bg-white text-[#58CC02] shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <BookOpen size={16} />
                    Хичээлүүд
                  </button>
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm font-nunito transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "products"
                        ? "bg-white text-[#58CC02] shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <ShoppingBag size={16} />
                    Бүтээгдэхүүн
                  </button>
                </div>

                {/* Lessons Tab */}
                {activeTab === "lessons" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TOPICS_DATA.map((topic) => {
                      const topicKey = getTopicKeyFromLink(topic.link);
                      return (
                        <TopicCard
                          key={topic.link}
                          topic={topic}
                          allChildrenPurchased={isAllChildrenPurchased(topicKey)}
                          onPurchase={() => {
                            if (!user) {
                              router.push(
                                `/login?redirect=${encodeURIComponent("/shop?tab=lessons")}`
                              );
                              return;
                            }
                            setSelectedTopicKey(topicKey);
                            setShowTopicModal(true);
                          }}
                          onDetail={() => setDetailTopic(topic)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        onPurchase={handleQPayPurchase}
                        isLoading={purchaseLoading}
                        onDetail={(c) => {
                          setDetailCoupon(c);
                          setDetailXpMode(false);
                        }}
                      />
                    ))}
                  </div>
                )}

                {isParent && (
                  <OrderHistorySection
                    orders={purchasedCoupons}
                    coupons={coupons}
                    onAddDeliveryInfo={handleAddDeliveryInfo}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ===== MODALS ===== */}

        {/* Topic Detail Modal */}
        {detailTopic && (
          <TopicDetailModal
            isOpen={!!detailTopic}
            onClose={() => setDetailTopic(null)}
            topic={detailTopic}
            allChildrenPurchased={isAllChildrenPurchased(
              getTopicKeyFromLink(detailTopic.link)
            )}
            onPurchase={() => {
              if (!user) {
                router.push(
                  `/login?redirect=${encodeURIComponent("/shop?tab=lessons")}`
                );
                return;
              }
              const topicKey = getTopicKeyFromLink(detailTopic.link);
              setDetailTopic(null);
              setSelectedTopicKey(topicKey);
              setShowTopicModal(true);
            }}
          />
        )}

        {/* Product Detail Modal */}
        {detailCoupon && (
          <ProductDetailModal
            isOpen={!!detailCoupon}
            onClose={() => {
              setDetailCoupon(null);
              setDetailXpMode(false);
            }}
            coupon={detailCoupon}
            xpMode={detailXpMode}
            currentXp={activeProfile?.xp || 0}
            isLoading={purchaseLoading}
            onPurchase={() => {
              const coupon = detailCoupon;
              setDetailCoupon(null);
              if (detailXpMode) {
                handleXpPurchase(coupon);
              } else {
                handleQPayPurchase(coupon);
              }
              setDetailXpMode(false);
            }}
          />
        )}

        {/* XP Purchase Confirmation (Child) */}
        <PurchaseConfirmModal
          isOpen={showXpConfirm}
          onClose={() => {
            setShowXpConfirm(false);
            setSelectedCoupon(null);
          }}
          onConfirm={handleXpConfirm}
          coupon={selectedCoupon}
          currentXp={activeProfile?.xp || 0}
          isLoading={purchaseLoading}
        />

        {/* Topic Purchase Modal (Parent) */}
        {selectedTopicKey && (
          <TopicPurchaseModal
            isOpen={showTopicModal}
            onClose={() => {
              setShowTopicModal(false);
              setSelectedTopicKey(null);
            }}
            topicKey={selectedTopicKey}
            onSuccess={() => {
              fetchTopicPurchaseStatus();
            }}
          />
        )}


      </div>
    </div>
  );
}
