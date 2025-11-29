"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CategoryDialogProps } from ".";
import { WhiteLoader } from "../constants";
import { AddImage } from "./AddImage";

export const CategoryDialog = ({
  image,
  setImage,
  name,
  setName,
  creatingCategory,
  editingCategory,
  setCreatingCategory,
  isSubmitLoading,
  handleCreateCategory,
  handleEditCategory,
  isSubmitted,
}: CategoryDialogProps) => {
  return (
    <Dialog
      open={!!creatingCategory}
      onOpenChange={() => setCreatingCategory(false)}
    >
      <DialogContent className="bg-white flex flex-col gap-4 rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] border border-[#E4E4E7] p-6">
        <DialogTitle>
          <p className="font-semibold text-xl leading-8 text-[#09090B] text-center">
            {editingCategory ? "Edit category" : "Create category"}
          </p>
        </DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 text-sm font-normal">Category name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Name"
              className={`h-9 border px-3 py-1 rounded-md outline-none text-sm font-normal focus:border-blue-600 transition-all duration-200 ${
                isSubmitted && !name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {isSubmitted && !name && (
              <p className="text-red-500 text-xs mt-1">
                Category name is required
              </p>
            )}
          </div>

          <AddImage
            image={image}
            setImage={setImage}
            isSubmitted={isSubmitted}
          />
        </div>

        <DialogFooter className="flex justify-end gap-1">
          <button
            onClick={() => setCreatingCategory(false)}
            className="py-2 px-4 text-sm font-medium text-[#09090B] rounded-lg transition-all bg-white hover:bg-gray-50 duration-200 cursor-pointer outline-none"
          >
            Cancel
          </button>
          <button
            onClick={
              editingCategory ? handleEditCategory : handleCreateCategory
            }
            className="py-2 px-4 text-sm font-medium text-white rounded-lg transition-all outline-none bg-blue-600 hover:bg-blue-500 duration-200 cursor-pointer"
          >
            {isSubmitLoading ? (
              <WhiteLoader />
            ) : editingCategory ? (
              "Save"
            ) : (
              "Continue"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
