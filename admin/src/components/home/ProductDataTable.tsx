"use client";

import * as React from "react";
import { ProductDataTableProps, ProductRowProps } from "./types";
import { Frown } from "lucide-react";
import { DataTableLoader } from "../constants";
import Image from "next/image";
import { DeleteProductDialog } from ".";
import { formatPrice } from "../functions/FormatPrice";
import Link from "next/link";
import { format } from "date-fns";

const ProductRow = ({
  product,
  index,
  isSubmitLoading,
  setDeletingProduct,
  handleDeleteProduct,
}: ProductRowProps) => {
  const formattedId = String(index + 1).padStart(4, "0");

  return (
    <div className="flex w-full">
      <Link
        prefetch
        href={`/product/${product?.id}`}
        className="w-full flex items-center border-t border-[#E4E4E7] h-[64px] hover:bg-[#FAFAFA] transition-all duration-200"
      >
        <p className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {formattedId}
        </p>
        <div className="px-4 py-2 w-full h-full flex items-center gap-2 border-r border-[#E4E4E7]">
          <Image
            src={
              product?.images?.[0] ||
              "https://static.vecteezy.com/system/resources/previews/006/059/989/non_2x/crossed-camera-icon-avoid-taking-photos-image-is-not-available-illustration-free-vector.jpg"
            }
            width={48}
            height={48}
            alt={"Title"}
            className="min-w-12 h-12 object-cover object-center rounded-[6px]"
          />
          <p className="text-[#09090B] font-Inter text-sm font-normal ">
            {product?.name || "-/-"}
          </p>
        </div>
        <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {product?.category?.name || "-/-"}
        </p>
        <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {product?.discountPrice ? (
            <span>{formatPrice(Number(product?.discountPrice))}</span>
          ) : (
            <span>{formatPrice(Number(product?.price))}</span>
          )}
        </p>
        <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {product?.stock || "0"}
        </p>
        <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-normal h-full flex items-center border-r border-[#E4E4E7]">
          {format(new Date(product?.createdAt), "MMM d, yyyy") || "-/-"}
        </p>
      </Link>
      <div className="max-w-[82px] w-full h-[64px] flex items-center justify-center border-t border-[#E4E4E7]">
        <DeleteProductDialog
          product={product}
          isSubmitLoading={isSubmitLoading}
          setDeletingProduct={setDeletingProduct}
          handleDeleteProduct={handleDeleteProduct}
        />
      </div>
    </div>
  );
};

export const ProductDataTable = ({
  data,
  loading,
  isSubmitLoading,
  deletingProduct,
  setDeletingProduct,
  handleDeleteProduct,
}: ProductDataTableProps) => {
  return (
    <div className="w-full">
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
        <div className="flex items-center">
          <p className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-normal h-10 flex items-center border-r border-[#E4E4E7]">
            ID
          </p>
          <p className="px-4 py-2  w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Name
          </p>
          <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Category
          </p>
          <p className="px-4 py-2 max-w-[291px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Price
          </p>
          <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Stock
          </p>
          <p className="px-4 py-2 max-w-[164px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center border-r border-[#E4E4E7]">
            Date
          </p>
          <div className="px-4 py-2 max-w-[82px] w-full text-[#09090B] font-Inter text-sm font-semibold h-10 flex items-center"></div>
        </div>

        {loading ? (
          <DataTableLoader />
        ) : data && data.length > 0 ? (
          data.map((product, index) => (
            <ProductRow
              key={product?.id}
              product={product}
              index={index}
              deletingProduct={deletingProduct}
              isSubmitLoading={isSubmitLoading}
              setDeletingProduct={setDeletingProduct}
              handleDeleteProduct={handleDeleteProduct}
            />
          ))
        ) : (
          <div className="py-10 flex flex-col gap-2 justify-center items-center border-t border-[#E4E4E7]">
            <Frown size={40} />
            <p className="text-[#09090B] text-base font-Inter font-semibold">
              Product not found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
