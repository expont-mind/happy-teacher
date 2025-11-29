"use client";

import { Footer, Sidebar } from "@/src/components/constants";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  // const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // const {
  //   data,
  //   loading: itineraryLoading,
  //   refetch,
  // } = useGetProductsQuery({ fetchPolicy: "cache-first" });

  // const [deleteProduct] = useDeleteProductMutation({});

  // const products = (data?.getProducts || []).filter(
  //   (product): product is Product => product !== null
  // );

  // const filteredProducts = products.filter((product) => {
  //   const searchTermLower = searchTerm.toLowerCase();

  //   const matchesName = Array.isArray(product?.name)
  //     ? product.name?.toLowerCase().includes(searchTermLower)
  //     : false;

  //   const matchesCategory = product?.category?.name
  //     ?.toLowerCase()
  //     .includes(searchTermLower);

  //   const matchesBrand = product?.brand?.name
  //     ?.toLowerCase()
  //     .includes(searchTermLower);

  //   const matchesPrice = product?.price?.toString().includes(searchTermLower);

  //   const matchesTags = product?.tags?.some((tag) =>
  //     tag.toLowerCase().includes(searchTermLower)
  //   );

  //   return (
  //     matchesCategory ||
  //     matchesName ||
  //     matchesBrand ||
  //     matchesPrice ||
  //     matchesTags
  //   );
  // });

  // const handleDeleteProduct = async () => {
  //   setIsSubmitLoading(true);
  //   if (!deletingProduct) return;

  //   try {
  //     await deleteProduct({
  //       variables: { deleteProductByIdId: deletingProduct.id },
  //     });

  //     toast.success("Product deleted successfully");
  //     await refetch();
  //   } catch (error) {
  //     console.error("Error deleting product:", error);
  //     toast.error("Failed to delete product");
  //   } finally {
  //     setIsSubmitLoading(false);
  //   }
  // };

  return (
    <div className="flex">
      <Sidebar product="active" order="" user="" cover="" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex justify-between items-center h-10">
              <p className="h-10 flex items-center font-Inter text-2xl font-semibold text-[#020617]">
                Product
              </p>
              <Link prefetch href="/add-product">
                <button className="h-full flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-500 transition-all duration-200 cursor-pointer rounded-md text-white text-sm font-medium">
                  <Plus size={16} />
                  Add Product
                </button>
              </Link>
            </div>

            {/* <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}

            {/* <ProductDataTable
              data={filteredProducts}
              loading={itineraryLoading}
              deletingProduct={deletingProduct}
              setDeletingProduct={setDeletingProduct}
              handleDeleteProduct={handleDeleteProduct}
              isSubmitLoading={isSubmitLoading}
            /> */}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
