import { Edit, Plus, Trash2 } from "lucide-react";
import { Loader } from "../constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CategoryDialog, CategoryProps } from ".";
import { useCreateCategoryForm } from "../hooks/useCreateCategoryForm";

export const SelectCategory = ({
  categoryId,
  setCategoryId,
  isSubmitted,
}: CategoryProps) => {
  const {
    name,
    setName,
    image,
    setImage,
    isSubmitLoading,
    creatingCategory,
    setCreatingCategory,
    editingCategory,
    setEditingCategory,
    categories,
    loading,
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
  } = useCreateCategoryForm(setCategoryId);

  const SelectedCategory = () => {
    const selected = categories.find((b) => b.id === categoryId);
    if (selected) {
      setEditingCategory(selected);
      setName(selected.name);
      setImage(selected.image ?? "");
      setCreatingCategory(true);
    }
  };

  const CreatingCategory = (value: any) => {
    setCreatingCategory(value);
    if (!value) {
      setEditingCategory(null);
      setName("");
    }
  };

  return (
    <div className={`flex items-center border border-gray-200 rounded-md`}>
      <Select onValueChange={setCategoryId} value={categoryId}>
        <SelectTrigger className="w-full h-[34px] px-3 py-1 bg-white outline-none border-none hover:bg-gray-50 transition-all duration-200 cursor-pointer focus:border-blue-600 shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>

        <SelectContent className="bg-white border border-gray-200">
          <div
            onClick={() => setCreatingCategory(true)}
            className="border-b border-gray-200 "
          >
            <div className="p-2  rounded-md hover:bg-gray-50 transition-all duration-200">
              <button className="w-full text-left flex items-center gap-1 text-sm text-blue-600 cursor-pointer">
                <Plus size={16} />
                Add category
              </button>
            </div>
          </div>
          <SelectGroup className="max-h-[284px] overflow-y-scroll">
            {loading ? (
              <Loader />
            ) : categories.length >= 1 ? (
              categories?.map((category) => (
                <SelectItem
                  key={category?.id}
                  value={category?.id}
                  className="hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  {category?.name}
                </SelectItem>
              ))
            ) : (
              <p className="text-black text-sm font-normal px-3 py-2">
                Please select main category
              </p>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="px-1 flex items-center">
        <button
          onClick={SelectedCategory}
          disabled={!categoryId}
          className="p-1 text-sm text-blue-600 disabled:text-gray-500 cursor-pointer hover:bg-gray-50 rounded-full transition-all duration-200"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() => handleDeleteCategory(categoryId)}
          disabled={!categoryId}
          className="p-1 text-sm text-red-600 disabled:text-gray-500 cursor-pointer hover:bg-gray-50 rounded-full transition-all duration-200"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <CategoryDialog
        image={image}
        setImage={setImage}
        name={name}
        setName={setName}
        creatingCategory={creatingCategory}
        setCreatingCategory={CreatingCategory}
        editingCategory={editingCategory}
        isSubmitLoading={isSubmitLoading}
        handleCreateCategory={handleCreateCategory}
        handleEditCategory={handleEditCategory}
        isSubmitted={isSubmitted}
      />
    </div>
  );
};
