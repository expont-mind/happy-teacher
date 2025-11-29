"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Brand,
  useDeleteBrandMutation,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useGetBrandsQuery,
} from "@/generated/graphql";

export const useCreateBrandForm = (setBrandId: (id: string) => void) => {
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [createBrand] = useCreateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();
  const [editBrand] = useUpdateBrandMutation();
  const { data, loading, refetch } = useGetBrandsQuery({
    fetchPolicy: "cache-first",
  });

  const brands = (data?.getBrands || []).filter(
    (brand): brand is Brand => brand !== null
  );

  const handleCreateBrand = async () => {
    setIsSubmitLoading(true);
    try {
      await createBrand({
        variables: {
          input: {
            name,
            image,
            isActive,
          },
        },
      });

      toast.success("Brand added successfully");
      setCreatingBrand(false);
      await refetch();
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Failed to add brand");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEditBrand = async () => {
    if (!editingBrand) return;
    setIsSubmitLoading(true);
    try {
      await editBrand({
        variables: {
          input: {
            id: editingBrand.id,
            name,
            image,
            isActive,
          },
        },
      });

      toast.success("Brand edited successfully");
      setCreatingBrand(false);
      await refetch();
    } catch (error) {
      console.error("Error editing brand:", error);
      toast.error("Failed to edit brand");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand({
        variables: {
          deleteBrandByIdId: id,
        },
      });

      toast.success("Brand deleted successfully");
      setBrandId("");
      await refetch();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
    }
  };

  return {
    name,
    setName,
    image,
    setImage,
    isActive,
    setIsActive,
    isSubmitLoading,
    setIsSubmitLoading,
    creatingBrand,
    setCreatingBrand,
    editingBrand,
    setEditingBrand,
    handleCreateBrand,
    handleEditBrand,
    handleDeleteBrand,
    brands,
    loading,
  };
};
