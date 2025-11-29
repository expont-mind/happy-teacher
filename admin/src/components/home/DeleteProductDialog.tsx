import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { DeleteProductDialogProps } from ".";
import { WhiteLoader } from "../constants";

export const DeleteProductDialog = ({
  product,
  isSubmitLoading,
  setDeletingProduct,
  handleDeleteProduct,
}: DeleteProductDialogProps) => {
  const handleClick = () => {
    setDeletingProduct(product);
  };

  const handleCancel = () => {
    setDeletingProduct(null);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div
          className="p-3 rounded-full hover:bg-gray-100 duration-200 transition-all cursor-pointer text-red-600"
          onClick={handleClick}
        >
          <Trash2 size={20} />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white flex flex-col gap-4 rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] border border-[#E4E4E7] p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            className="py-2 px-4 text-sm font-medium text-[#09090B] rounded-lg transition-all bg-white hover:bg-gray-50 duration-200 cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0 shadow-none border-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="py-2 px-4 text-sm font-medium text-white rounded-lg transition-all outline-none bg-red-600 hover:bg-red-500 duration-200 cursor-pointer"
            onClick={handleDeleteProduct}
          >
            {isSubmitLoading ? <WhiteLoader /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
