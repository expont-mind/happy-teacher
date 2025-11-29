"use client";

import { useState } from "react";
import { toast } from "sonner";

export const useCreateProductForm = () => {
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const clearAllFields = () => {
    setName("");
    setBrandId("");
    setCategoryId("");
    setColorsInput("");
    setSizesInput("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setImages([]);
    setStock("");
    setTagsInput("");
    setIsActive(true);
    setFeatured(false);
    setNewArrival(false);
    setBestSeller(false);
  };

  const isFormValid = () => {
    if (
      !name ||
      !description ||
      !brandId ||
      !categoryId ||
      !price ||
      !images[0]
    ) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  return {
    name,
    setName,
    brandId,
    setBrandId,
    categoryId,
    setCategoryId,
    colors,
    setColors,
    colorsInput,
    setColorsInput,
    sizes,
    setSizes,
    sizesInput,
    setSizesInput,
    description,
    setDescription,
    price,
    setPrice,
    discountPrice,
    setDiscountPrice,
    images,
    setImages,
    stock,
    setStock,
    tags,
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
    setIsSubmitLoading,
    isSubmitted,
    setIsSubmitted,
    clearAllFields,
    isFormValid,
  };
};
