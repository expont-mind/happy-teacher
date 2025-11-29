"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Loader } from "../constants";
import { Plus } from "lucide-react";
import { AddImagesProps } from ".";

export const AddImages = ({
  images,
  setImages,
  isSubmitted,
}: AddImagesProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setImages((prev: string[]) => [...prev, data.secure_url]);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <>
      <div className="w-full p-6 border border-gray-200 rounded-lg bg-white flex flex-col gap-4">
        <div className="flex flex-col gap-1 w-full">
          <p className="text-gray-500 text-sm font-normal">Product Images</p>

          <div className="grid grid-cols-4 gap-2">
            {images?.slice(-3).map((image, index) => (
              <div
                key={index}
                className="group relative w-full h-[129.5px] border border-dashed border-gray-200 rounded-lg flex justify-center items-center overflow-hidden"
              >
                <Image
                  src={image}
                  width={129.5}
                  height={129.5}
                  alt={`Uploaded ${index}`}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-200 text-black text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`${
                isSubmitted && images.length === 0
                  ? "border border-red-500 p-2 rounded-md"
                  : ""
              } w-full h-[129.5px] border border-dashed border-gray-200 rounded-lg flex justify-center items-center cursor-pointer`}
            >
              {isLoading ? (
                <div className="w-8 h-8 flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex justify-center items-center">
                  <Plus size={16} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
          {isSubmitted && images.length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              At least one image is required
            </p>
          )}
        </div>
      </div>
    </>
  );
};
