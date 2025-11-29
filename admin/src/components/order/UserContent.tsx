"use client";

import { useState } from "react";
import { UserContentProps } from ".";
import { DownArrow } from "../svg";
import { toast } from "sonner";
import { formatPrice, getStatusClass } from "../functions";
import { PriceDetail } from "./PriceDetail";
import { Loader } from "../constants";
import { OrderStatus, useUpdateOrderStatusMutation } from "@/generated/graphql";

export const UserContent = ({ order, refetch, loading }: UserContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "bg-[#F97316]",
    [OrderStatus.SHIPPED]: "bg-[#2563EB]",
    [OrderStatus.DELIVERED]: "bg-[#18BA51]",
    [OrderStatus.CANCELLED]: "bg-[#E11D48]",
  };

  const [editStatus] = useUpdateOrderStatusMutation();

  const handleEditStatus = async (newStatus: OrderStatus) => {
    try {
      await editStatus({
        variables: {
          input: {
            id: order?.id || "",
            status: newStatus,
          },
        },
      });

      toast.success("Status edited successfully");
      refetch();
    } catch (error) {
      console.error("Error editing status:", error);
      toast.error("Failed to edit status");
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-[592px] w-full">
      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 w-full">
            <p className="text-gray-500 text-sm font-normal">Username</p>
            <p className="text-black text-sm font-medium">
              {order?.name || "-/-"}
            </p>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="text-gray-500 text-sm font-normal">Email</p>
            <p className="text-black text-sm font-medium">
              {order?.email || "-/-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 w-full">
            <p className="text-gray-500 text-sm font-normal">Phone number</p>
            <p className="text-black text-sm font-medium">
              {order?.phone || "-/-"}
            </p>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <p className="text-gray-500 text-sm font-normal">Order number</p>
            <p className="text-black text-sm font-medium">
              {order?.orderNumber || "-/-"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Address</p>
          <p className="text-black text-sm font-medium">
            {order?.address?.city || "-/-"}, {order?.address?.district || "-/-"}
            , {order?.address?.khoroo || "-/-"},{" "}
            {order?.address?.apartment || "-/-"},{" "}
            {order?.address?.detail || "-/-"}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Status</p>
          <div className="relative flex">
            <div
              onClick={toggleDropdown}
              className={`flex gap-1 items-center px-[10px] py-[2px] rounded-full cursor-pointer transition-all duration-200 ${getStatusClass(
                order?.status || ""
              )}`}
            >
              <p className="text-white font-Inter text-xs font-semibold">
                {order?.status || (
                  <span className="text-black text-sm font-medium leading-5">
                    -/-
                  </span>
                )}
              </p>
              <DownArrow />
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-[120px] overflow-hidden">
                {(Object.keys(statusMap) as OrderStatus[]).map((status) => (
                  <div
                    key={status}
                    onClick={() => handleEditStatus(status)}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        <div className="flex flex-col gap-1 w-full">
          <p className="text-gray-500 text-sm font-normal">Price detail</p>
          {loading ? (
            <Loader />
          ) : (
            order?.items.map((item) => (
              <PriceDetail key={item?.product?.id} item={item} />
            ))
          )}

          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-black text-sm font-medium">Delivery fee</p>
              <p className="text-black text-sm font-medium">
                {order?.totalPrice && Number(order.totalPrice) > 100000
                  ? formatPrice(0)
                  : formatPrice(5000)}
              </p>
            </div>
          )}
        </div>
        <div className="w-full h-[1px] bg-gray-200"></div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-black">Total</p>
          <p className="text-lg font-semibold text-black">
            {formatPrice(Number(order?.totalPrice)) || "-/-"}
          </p>
        </div>
      </div>
    </div>
  );
};
