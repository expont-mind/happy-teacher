"use client";

import { Frown } from "lucide-react";
import { DataTableLoader } from "../constants";
import { OrderDataTableProps, OrderRowProps } from ".";
import Link from "next/link";
import { getStatusClass } from "../functions";
import { formatPrice } from "../functions/FormatPrice";
import { format } from "date-fns";

const OrderRow = ({ order, index }: OrderRowProps) => {
  const formattedId = String(index + 1).padStart(4, "0");

  return (
    <Link
      href={`/order/${order?.id}`}
      className="flex items-center border-t border-[#E4E4E7] h-[36px] hover:bg-[#FAFAFA] transition-all duration-200"
    >
      <p className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {formattedId}
      </p>
      <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order?.name || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order?.email || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {order?.phone || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {formatPrice(Number(order?.totalPrice)) || "-/-"}
      </p>
      <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
        {format(new Date(order?.createdAt), "MMM d, yyyy") || "-/-"}
      </p>
      <div className="px-2 py-2 max-w-[164px] w-full h-full flex items-center justify-between">
        <div className="px-2">
          <p
            className={`px-[10px] py-[2px] rounded-full text-[#FAFAFA] font-Inter text-xs font-semibold transition-all duration-200 ${getStatusClass(
              order?.status || ""
            )}`}
          >
            {order?.status || "-/-"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const OrderDataTable = ({ data, loading }: OrderDataTableProps) => {
  return (
    <div className="w-full">
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
        <div className="flex items-center">
          <p className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-normal h-10 flex items-center border-r border-[#E4E4E7]">
            ID
          </p>
          <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Name
          </p>
          <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Email
          </p>
          <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Phone number
          </p>
          <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Total price
          </p>
          <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Date
          </p>
          <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center">
            Status
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
              Order not found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
