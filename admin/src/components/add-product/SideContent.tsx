"use client";

import { SideContentProps } from ".";
import { ChangeEvent } from "react";
import { WhiteLoader } from "../constants";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export const SideContent = ({
  isSubmitted,
  setColors,
  colorsInput,
  setColorsInput,
  setSizes,
  sizesInput,
  setSizesInput,
  stock,
  setStock,
  setTags,
  tagsInput,
  setTagsInput,
  featured,
  setFeatured,
  isActive,
  setIsActive,
  newArrival,
  setNewArrival,
  bestSeller,
  setBestSeller,
  isSubmitLoading,
  clearAllFields,
  onSubmit,
}: SideContentProps) => {
  const handleCommaSeparatedInput = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleColorsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorsInput(value);
    setColors(handleCommaSeparatedInput(value));
  };

  const handleSizesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSizesInput(value);
    setSizes(handleCommaSeparatedInput(value));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    setTags(handleCommaSeparatedInput(value));
  };

  return (
    <div className="flex flex-col gap-4 max-w-[592px] w-full">
      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Color</p>
          <input
            type="text"
            placeholder="Color"
            value={colorsInput}
            onChange={handleColorsChange}
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 border-gray-200`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Size</p>
          <input
            type="text"
            placeholder="Size"
            value={sizesInput}
            onChange={handleSizesChange}
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 border-gray-200`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Tags</p>
          <input
            type="text"
            placeholder="Tags"
            value={tagsInput}
            onChange={handleTagsChange}
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 border-gray-200`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-500 text-sm font-normal">Stock</p>
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            placeholder="Stock"
            className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 ${
              isSubmitted && !stock ? "border-red-500" : "border-gray-200"
            }`}
          />
          {isSubmitted && !stock && (
            <p className="text-red-500 text-xs mt-1">Stock is required</p>
          )}
        </div>
      </div>

      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        <div className="w-full flex gap-4">
          <div className="flex items-center gap-2 w-full">
            <Switch
              id="discount-switch"
              className="cursor-pointer"
              checked={featured}
              onCheckedChange={setFeatured}
            />
            <Label
              htmlFor="discount-switch"
              className="text-gray-500 text-sm font-normal"
            >
              Featured
            </Label>
          </div>

          <div className="flex items-center gap-2 w-full">
            <Switch
              id="discount-switch"
              className="cursor-pointer"
              checked={bestSeller}
              onCheckedChange={setBestSeller}
            />
            <Label
              htmlFor="discount-switch"
              className="text-gray-500 text-sm font-normal"
            >
              Best Seller
            </Label>
          </div>
        </div>

        <div className="w-full flex gap-4">
          <div className="flex items-center gap-2 w-full">
            <Switch
              id="discount-switch"
              className="cursor-pointer"
              checked={newArrival}
              onCheckedChange={setNewArrival}
            />
            <Label
              htmlFor="discount-switch"
              className="text-gray-500 text-sm font-normal"
            >
              New Arrival
            </Label>
          </div>

          <div className="flex items-center gap-2 w-full">
            <Switch
              id="discount-switch"
              className="cursor-pointer"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label
              htmlFor="discount-switch"
              className="text-gray-500 text-sm font-normal"
            >
              Active
            </Label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={clearAllFields}
          className="w-full px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer rounded-lg text-black text-sm font-medium"
        >
          Clear
        </button>
        <button
          onClick={onSubmit}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-all duration-200 cursor-pointer rounded-lg text-white text-sm font-medium"
        >
          {isSubmitLoading ? <WhiteLoader /> : "Complete"}
        </button>
      </div>
    </div>
  );
};
