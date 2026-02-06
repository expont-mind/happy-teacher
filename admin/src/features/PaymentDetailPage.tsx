"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Footer, Sidebar } from "@/components/constants";
import { createClient } from "@/utils/supabase/client";
import { Order } from "@/components/payment";
import { ArrowLeft, Package, MapPin, Phone, User, FileText, Truck, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentDetailPageProps {
  id: string;
}

const statusOptions = [
  { value: "pending", label: "Хүлээгдэж буй", color: "bg-yellow-500" },
  { value: "processing", label: "Боловсруулж буй", color: "bg-blue-500" },
  { value: "shipped", label: "Хүргэгдэж буй", color: "bg-purple-500" },
  { value: "delivered", label: "Хүргэгдсэн", color: "bg-green-500" },
];

export const PaymentDetailPage = ({ id }: PaymentDetailPageProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);

      // First fetch the order (no FK constraints, so fetch separately)
      const { data: orderData, error: orderError } = await supabase
        .from("child_coupons")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        toast.error("Захиалга олдсонгүй");
        setLoading(false);
        return;
      }

      // Fetch related data separately
      const [profileRes, couponRes] = await Promise.all([
        orderData.child_id
          ? supabase.from("profiles").select("full_name, email").eq("id", orderData.child_id).single()
          : { data: null, error: null },
        orderData.coupon_id
          ? supabase.from("coupons").select("title, price, image").eq("id", orderData.coupon_id).single()
          : { data: null, error: null },
      ]);

      // Merge data
      const mergedOrder: Order = {
        ...orderData,
        profiles: profileRes.data || null,
        coupons: couponRes.data || null,
      };

      setOrder(mergedOrder);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    const { error } = await supabase
      .from("child_coupons")
      .update({ delivery_status: newStatus })
      .eq("id", order.id);

    if (error) {
      toast.error("Төлөв шинэчлэхэд алдаа гарлаа");
    } else {
      setOrder({ ...order, delivery_status: newStatus as Order["delivery_status"] });
      toast.success("Төлөв амжилттай шинэчлэгдлээ");
    }
    setUpdating(false);
  };

  const formatPrice = (price: number) => {
    return price?.toLocaleString() + "₮";
  };

  const productPrice = order?.coupons?.price || 0;
  const deliveryFee = order?.delivery_info?.delivery_fee || 0;
  const totalPrice = productPrice + deliveryFee;

  return (
    <div className="flex">
      <Sidebar user="" payment="active" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link
                href="/payment"
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <p className="h-10 flex items-center font-Inter text-2xl font-semibold text-[#020617]">
                Захиалгын дэлгэрэнгүй
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : order ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="bg-white rounded-lg border border-[#E4E4E7] p-6 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Захиалгын мэдээлэл</h2>
                      <p className="text-sm text-gray-500">Бүтээгдэхүүн болон төлбөрийн мэдээлэл</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Захиалгын код</p>
                        <p className="font-mono font-semibold text-gray-900">{order.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Бүтээгдэхүүн</p>
                        <p className="font-semibold text-gray-900">{order.coupons?.title || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Захиалсан огноо</p>
                        <p className="font-semibold text-gray-900">
                          {order.created_at
                            ? format(new Date(order.created_at), "yyyy/MM/dd HH:mm")
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Барааны үнэ</span>
                        <span className="font-semibold">{formatPrice(productPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Хүргэлтийн төлбөр</span>
                        <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="h-px bg-gray-200 my-2" />
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">Нийт</span>
                        <span className="text-lg font-bold text-green-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Хүргэлтийн төлөв</p>
                      <Select
                        value={order.delivery_status || "pending"}
                        onValueChange={handleStatusChange}
                        disabled={updating}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white rounded-lg border border-[#E4E4E7] p-6 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Хүргэлтийн мэдээлэл</h2>
                      <p className="text-sm text-gray-500">Хүлээн авагчийн хаяг болон холбоо барих</p>
                    </div>
                  </div>

                  {order.delivery_info ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Хүлээн авагч</p>
                          <p className="font-semibold text-gray-900">{order.delivery_info.recipient_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Утас</p>
                          <p className="font-semibold text-gray-900">{order.delivery_info.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Хаяг</p>
                          <p className="font-semibold text-gray-900">{order.delivery_info.zone_name}</p>
                          <p className="text-gray-600">{order.delivery_info.location_name}</p>
                          <p className="text-gray-600 mt-1">{order.delivery_info.address}</p>
                        </div>
                      </div>

                      {order.delivery_info.notes && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Нэмэлт тэмдэглэл</p>
                            <p className="text-gray-600">{order.delivery_info.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Хүргэлтийн мэдээлэл оруулаагүй</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Захиалга олдсонгүй
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
