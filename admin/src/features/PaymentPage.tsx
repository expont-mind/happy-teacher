"use client";

import { useEffect, useState } from "react";
import { Footer, SearchBar, Sidebar } from "@/components/constants";
import { createClient } from "@/utils/supabase/client";
import { OrderDataTable, Order } from "@/components/payment";

export const PaymentPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      // First fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("child_coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setLoading(false);
        return;
      }

      // Fetch related data separately
      const childIds = [...new Set(ordersData?.map(o => o.child_id) || [])];
      const couponIds = [...new Set(ordersData?.map(o => o.coupon_id) || [])];

      const [profilesRes, couponsRes] = await Promise.all([
        childIds.length > 0
          ? supabase.from("profiles").select("id, full_name, email").in("id", childIds)
          : { data: [], error: null },
        couponIds.length > 0
          ? supabase.from("coupons").select("id, title, price, image").in("id", couponIds)
          : { data: [], error: null },
      ]);

      // Create lookup maps
      const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const couponsMap = new Map((couponsRes.data || []).map(c => [c.id, c]));

      // Merge data
      const data = (ordersData || []).map(order => ({
        ...order,
        profiles: profilesMap.get(order.child_id) || null,
        coupons: couponsMap.get(order.coupon_id) || null,
      }));

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesCode = order.code?.toLowerCase().includes(searchTermLower);
    const matchesPhone = order.phone?.toLowerCase().includes(searchTermLower);
    const matchesDeliveryPhone = order.delivery_info?.phone?.toLowerCase().includes(searchTermLower);
    const matchesRecipient = order.delivery_info?.recipient_name?.toLowerCase().includes(searchTermLower);
    const matchesAddress = order.delivery_info?.address?.toLowerCase().includes(searchTermLower);
    return matchesCode || matchesPhone || matchesDeliveryPhone || matchesRecipient || matchesAddress;
  });

  return (
    <div className="flex">
      <Sidebar user="" payment="active" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <p className="h-10 flex items-center font-Inter text-2xl font-semibold text-[#020617]">
              Orders
            </p>

            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <OrderDataTable data={filteredOrders} loading={loading} />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
