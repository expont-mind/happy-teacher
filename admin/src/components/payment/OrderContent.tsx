"use client";

import { ItemsProps, OrderContentProps } from ".";
import Image from "next/image";
import { formatPrice } from "../functions/FormatPrice";
import { format } from "date-fns";
import Link from "next/link";

const Items = ({ item, order }: ItemsProps) => {
  const price = item?.product?.discountPrice || item?.product?.price || 0;

  return (
    <Link href={`/product/${item?.product?.id}`}>
      <div className="w-full flex bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Image
          src={
            item?.product?.images?.[0] ||
            "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/c5/no-image-px759fvb06aw65eaaqpopg.png/no-image-ousebmandtg1ym1w6nntl.png?_a=DATAdtAAZAA0"
          }
          width={152}
          height={152}
          alt={item?.product?.name || "Product"}
          className="min-w-[152px] h-[152px] bg-gray-100 object-cover object-center "
        />
        <div className="flex flex-col justify-between px-4 py-2 w-full">
          <div className="flex flex-col gap-1">
            <p className="font-Inter text-xl font-semibold text-black">
              {item?.product?.name || "-/-"}
            </p>
            <div className="flex flex-col">
              {item?.color && item.color.trim() !== "" && (
                <p className="text-gray-500 text-sm font-normal">
                  Color: <span className="text-black">{item.color}</span>
                </p>
              )}

              {item?.size && item.size.trim() !== "" && (
                <p className="text-gray-500 text-sm font-normal">
                  Size: <span className="text-black">{item.size}</span>
                </p>
              )}

              <p className="text-gray-500 text-sm font-normal">
                Date:{" "}
                <span className="text-black">
                  {format(new Date(order?.createdAt || ""), "MMM d, yyyy") ||
                    "-/-"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm font-normal">
              Total price:{" "}
              <span className="text-black">
                {formatPrice(Number(price))} * {item?.quantity || "0"}
              </span>
            </p>
            <p className="text-lg font-semibold text-black">
              {formatPrice(Number(price) * Number(item?.quantity))}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const OrderContent = ({ order, loading }: OrderContentProps) => {
  return (
    <div className="flex flex-col gap-4 max-w-[592px] w-full">
      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-[154px] w-full border border-gray-200 rounded-lg bg-white flex animate-pulse overflow-hidden"
              >
                <div className="min-w-[152px] h-full bg-gray-200" />
                <div className="flex flex-col justify-between px-4 py-2 w-full">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-2/3 bg-gray-200 rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-4 w-2/5 bg-gray-200 rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          order?.items?.map((item) => (
            <Items key={item?.product?.id} item={item} order={order} />
          ))
        )}
      </div>
    </div>
  );
};
