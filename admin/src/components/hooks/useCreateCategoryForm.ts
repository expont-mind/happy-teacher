"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Category,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/generated/graphql";

export const useCreateCategoryForm = (setCategoryId: (id: string) => void) => {
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [editCategory] = useUpdateCategoryMutation();
  const { data, loading, refetch } = useGetCategoriesQuery({
    fetchPolicy: "cache-first",
  });

  const categories = (data?.getCategorys || []).filter(
    (category): category is Category => category !== null
  );

  const handleCreateCategory = async () => {
    setIsSubmitLoading(true);
    try {
      await createCategory({
        variables: {
          input: {
            name,
            image,
            isActive,
          },
        },
      });

      toast.success("Category added successfully");
      setCreatingCategory(false);
      await refetch();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to add category");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    setIsSubmitLoading(true);
    try {
      await editCategory({
        variables: {
          input: {
            id: editingCategory.id,
            name,
            image,
            isActive,
          },
        },
      });

      toast.success("Category edited successfully");
      setCreatingCategory(false);
      await refetch();
    } catch (error) {
      console.error("Error editing category:", error);
      toast.error("Failed to edit category");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory({
        variables: {
          deleteCategoryByIdId: id,
        },
      });

      toast.success("Category deleted successfully");
      setCategoryId("");
      await refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
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
    creatingCategory,
    setCreatingCategory,
    editingCategory,
    setEditingCategory,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    categories,
    loading,
  };
};
