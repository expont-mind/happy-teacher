"use client";

import { Frown } from "lucide-react";
import { DataTableLoader } from "../constants";
import { OrderDataTableProps, OrderRowProps } from ".";
import Link from "next/link";
import { format } from "date-fns";

const getDeliveryStatusClass = (status?: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "processing":
      return "bg-blue-500";
    case "shipped":
      return "bg-purple-500";
    case "delivered":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

const getDeliveryStatusLabel = (status?: string) => {
  switch (status) {
    case "pending":
      return "Хүлээгдэж буй";
    case "processing":
      return "Боловсруулж буй";
    case "shipped":
      return "Хүргэгдэж буй";
    case "delivered":
      return "Хүргэгдсэн";
    default:
      return "-/-";
  }
};

const formatPrice = (price: number) => {
  return price?.toLocaleString() + "₮";
};

const OrderRow = ({ order, index }: OrderRowProps) => {
  const formattedId = String(index + 1).padStart(4, "0");
  const productPrice = order.coupons?.price || 0;
  const deliveryFee = order.delivery_info?.delivery_fee || 0;
  const totalPrice = productPrice + deliveryFee;

  return (
    <Link
      href={`/payment/${order?.id}`}
      className="flex items-center border-t border-[#E4E4E7] min-h-[52px] hover:bg-[#FAFAFA] transition-all duration-200"
    >
      <p className="px-4 py-2 max-w-[60px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {formattedId}
      </p>
      <p className="px-4 py-2 max-w-[120px] w-full text-[#09090B] font-Inter text-sm font-mono h-full flex items-center border-r border-[#E4E4E7]">
        {order?.code || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[160px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order.coupons?.title || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[140px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order.delivery_info?.recipient_name || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[120px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order.phone || order.delivery_info?.phone || "-/-"}
      </p>
      <div className="px-4 py-2 max-w-[200px] w-full text-[#09090B] font-Inter text-xs font-normal h-full flex flex-col justify-center border-r border-[#E4E4E7]">
        <p className="text-gray-500">{order.delivery_info?.zone_name}</p>
        <p className="truncate">{order.delivery_info?.location_name}</p>
      </div>
      <div className="px-4 py-2 max-w-[120px] w-full font-Inter text-sm h-full flex flex-col justify-center border-r border-[#E4E4E7]">
        <p className="text-[#09090B] font-semibold">{formatPrice(totalPrice)}</p>
        {deliveryFee > 0 && (
          <p className="text-xs text-gray-400">+{formatPrice(deliveryFee)} хүргэлт</p>
        )}
      </div>
      <p className="px-4 py-2 max-w-[100px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order?.created_at
          ? format(new Date(order.created_at), "MM/dd")
          : "-/-"}
      </p>
      <div className="px-2 py-2 max-w-[120px] w-full h-full flex items-center">
        <p
          className={`px-[10px] py-[2px] rounded-full text-[#FAFAFA] font-Inter text-xs font-semibold ${getDeliveryStatusClass(
            order?.delivery_status
          )}`}
        >
          {getDeliveryStatusLabel(order?.delivery_status)}
        </p>
      </div>
    </Link>
  );
};

export const OrderDataTable = ({ data, loading }: OrderDataTableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden min-w-[1100px]">
        <div className="flex items-center bg-gray-50">
          <p className="px-4 py-2 max-w-[60px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            #
          </p>
          <p className="px-4 py-2 max-w-[120px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Код
          </p>
          <p className="px-4 py-2 max-w-[160px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Бүтээгдэхүүн
          </p>
          <p className="px-4 py-2 max-w-[140px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Хүлээн авагч
          </p>
          <p className="px-4 py-2 max-w-[120px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Утас
          </p>
          <p className="px-4 py-2 max-w-[200px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Хаяг
          </p>
          <p className="px-4 py-2 max-w-[120px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Нийт үнэ
          </p>
          <p className="px-4 py-2 max-w-[100px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Огноо
          </p>
          <p className="px-4 py-2 max-w-[120px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center">
            Төлөв
          </p>
        </div>

        {loading ? (
          <DataTableLoader />
        ) : data && data.length > 0 ? (
          data.map((order, index) => (
            <OrderRow key={order?.id} order={order} index={index} />
          ))
        ) : (
          <div className="py-10 flex flex-col gap-2 justify-center items-center border-t border-[#E4E4E7]">
            <Frown size={40} />
            <p className="text-[#09090B] text-base font-Inter font-semibold">
              Захиалга олдсонгүй
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
