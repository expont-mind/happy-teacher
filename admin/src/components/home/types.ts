import { Product } from "@/generated/graphql";

export interface ProductDataTableProps {
  data: Product[];
  loading: boolean;
  deletingProduct: Product | null;
  handleDeleteProduct: () => void;
  setDeletingProduct: (product: Product | null) => void;
  isSubmitLoading: boolean;
}

export interface ProductRowProps {
  product: Product;
  index: number;
  deletingProduct: Product | null;
  handleDeleteProduct: () => void;
  setDeletingProduct: (product: Product | null) => void;
  isSubmitLoading: boolean;
}

export type DeleteProductDialogProps = {
  product: Product;
  setDeletingProduct: (product: Product | null) => void;
  handleDeleteProduct: () => void;
  isSubmitLoading: boolean;
};
