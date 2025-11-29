import { Brand, Category } from "@/generated/graphql";
import { SetStateAction } from "react";

export type MainContentProps = {
  isSubmitted: boolean;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  brandId: string;
  setBrandId: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  images: string[];
  setImages: React.Dispatch<SetStateAction<string[]>>;
  price: string;
  setPrice: (value: string) => void;
  discountPrice: string;
  setDiscountPrice: (value: string) => void;
};

export type SideContentProps = {
  isSubmitted: boolean;
  setColors: (value: string[]) => void;
  colorsInput: string;
  setColorsInput: (value: string) => void;
  setSizes: (value: string[]) => void;
  sizesInput: string;
  setSizesInput: (value: string) => void;
  stock: string;
  setStock: (value: string) => void;
  setTags: (value: string[]) => void;
  tagsInput: string;
  setTagsInput: (value: string) => void;
  featured: boolean;
  setFeatured: (value: boolean) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  newArrival: boolean;
  setNewArrival: (value: boolean) => void;
  bestSeller: boolean;
  setBestSeller: (value: boolean) => void;
  isSubmitLoading: boolean;
  clearAllFields: () => void;
  onSubmit: () => void;
};

export type AddImagesProps = {
  images: string[];
  setImages: React.Dispatch<SetStateAction<string[]>>;
  isSubmitted: boolean;
};

export type CategoryProps = {
  categoryId: string;
  setCategoryId: (categoryId: string) => void;
  isSubmitted: boolean;
};

// export type MainCategoryProps = {
//   isSubmitted: boolean;
//   mainCategorys: Category[];
//   setMainCategoryId: (value: string) => void;
//   mainCategoryId: string;
//   refetch: () => Promise<any>;
//   loading: boolean;
// };

export type BrandProps = {
  isSubmitted: boolean;
  brandId: string;
  setBrandId: (value: string) => void;
};

// export type BrandDialogProps = {
//   name: string;
//   setName: (val: string) => void;
//   image: string;
//   setImage: (val: string) => void;
//   creatingBrand: boolean;
//   editingBrand?: Brand | null;
//   setCreatingBrand: (val: boolean) => void;
//   handleCreateBrand: () => void;
//   handleEditBrand: () => void;
//   isSubmitLoading: boolean;
// };

export type AddImageProps = {
  image: string;
  setImage: (val: string) => void;
  isSubmitted: boolean;
};

export type CategoryDialogProps = {
  image: string;
  setImage: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  creatingCategory: boolean;
  editingCategory?: Category | null;
  setCreatingCategory: (val: boolean) => void;
  isSubmitLoading: boolean;
  handleCreateCategory: () => void;
  handleEditCategory: () => void;
  isSubmitted: boolean;
};

export type BrandDialogProps = {
  image: string;
  setImage: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  creatingBrand: boolean;
  editingBrand?: Brand | null;
  setCreatingBrand: (val: boolean) => void;
  isSubmitLoading: boolean;
  handleCreateBrand: () => void;
  handleEditBrand: () => void;
  isSubmitted: boolean;
};
