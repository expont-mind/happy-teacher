"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Loader } from "../constants";
import { Plus } from "lucide-react";
import { AddImageProps } from ".";

export const AddImage = ({ image, setImage, isSubmitted }: AddImageProps) => {
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
      setImage(data.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage("");
  };

  return (
    <div className="w-full bg-white flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-gray-500 text-sm font-normal">Category image</p>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-[129.5px] h-[129.5px] border ${
            isSubmitted && !image
              ? "border-dashed border-red-500"
              : "border-dashed border-gray-200"
          } rounded-lg overflow-hidden flex justify-center items-center cursor-pointer`}
        >
          {isLoading ? (
            <div className="w-8 h-8 flex justify-center items-center">
              <Loader />
            </div>
          ) : image ? (
            <div className="group relative w-full h-full">
              <Image
                src={image}
                width={129.5}
                height={129.5}
                alt="Brand"
                className="object-cover w-full h-full"
              />
              <button
                onClick={() => handleRemoveImage()}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-200 text-black text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex justify-center items-center">
              <Plus size={16} />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {isSubmitted && !image && (
          <p className="text-red-500 text-xs mt-1">Image is required</p>
        )}
      </div>
    </div>
  );
};
