"use client";

import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { AddImages, MainContentProps, SelectBrand, SelectCategory } from ".";

export const MainContent = ({
  isSubmitted,
  name,
  setName,
  description,
  setDescription,
  brandId,
  setBrandId,
  categoryId,
  setCategoryId,
  images,
  setImages,
  price,
  setPrice,
  discountPrice,
  setDiscountPrice,
}: MainContentProps) => {
  const [isDiscountActive, setIsDiscountActive] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-[592px] w-full">
      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Product name</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Name"
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 ${
              isSubmitted && !name ? "border-red-500" : "border-gray-200"
            }`}
          />
          {isSubmitted && !name && (
            <p className="text-red-500 text-xs mt-1">
              Product name is required
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Description</p>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            placeholder="Description"
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 ${
              isSubmitted && !description ? "border-red-500" : "border-gray-200"
            }`}
          />
          {isSubmitted && !description && (
            <p className="text-red-500 text-xs mt-1">Description is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Brand</p>
          <SelectBrand
            brandId={brandId}
            setBrandId={setBrandId}
            isSubmitted={isSubmitted}
          />
          {isSubmitted && !brandId && (
            <p className="text-red-500 text-xs mt-1">Brand is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Category</p>
          <SelectCategory
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            isSubmitted={isSubmitted}
          />
          {isSubmitted && !categoryId && (
            <p className="text-red-500 text-xs mt-1">Category is required</p>
          )}
        </div>
      </div>

      <AddImages
        images={images}
        setImages={setImages}
        isSubmitted={isSubmitted}
      />

      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex gap-4">
        <div className="flex flex-col gap-1 w-full">
          <p className="text-gray-500 text-sm font-normal">Price</p>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="Price"
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 ${
              isSubmitted && !price ? "border-red-500" : "border-gray-200"
            }`}
          />
          {isSubmitted && !price && (
            <p className="text-red-500 text-xs mt-1">Price is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-2">
            <Switch
              id="discount-switch"
              checked={isDiscountActive}
              onCheckedChange={(checked) => {
                setIsDiscountActive(checked);
                if (!checked) {
                  setDiscountPrice("");
                }
              }}
              className="cursor-pointer"
            />
            <Label
              htmlFor="discount-switch"
              className="text-gray-500 text-sm font-normal"
            >
              Discount
            </Label>
          </div>
          <input
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            type="number"
            placeholder="Discount"
            disabled={!isDiscountActive}
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal transition-all duration-200 ${
              isDiscountActive
                ? "border-gray-200 focus:border-blue-600"
                : "border-gray-200 cursor-not-allowed"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
