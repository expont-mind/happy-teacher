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
import { BrandDialog, BrandProps } from ".";
import { useCreateBrandForm } from "../hooks/useCreateBrandForm";

export const SelectBrand = ({
  brandId,
  setBrandId,
  isSubmitted,
}: BrandProps) => {
  const {
    name,
    setName,
    image,
    setImage,
    isSubmitLoading,
    creatingBrand,
    setCreatingBrand,
    editingBrand,
    setEditingBrand,
    brands,
    loading,
    handleCreateBrand,
    handleEditBrand,
    handleDeleteBrand,
  } = useCreateBrandForm(setBrandId);

  const SelectedCategory = () => {
    const selected = brands.find((b) => b.id === brandId);
    if (selected) {
      setEditingBrand(selected);
      setName(selected.name);
      setImage(selected.image ?? "");
      setCreatingBrand(true);
    }
  };

  const CreatingBrand = (value: any) => {
    setCreatingBrand(value);
    if (!value) {
      setEditingBrand(null);
      setName("");
    }
  };

  return (
    <div className={`flex items-center border border-gray-200 rounded-md`}>
      <Select onValueChange={setBrandId} value={brandId}>
        <SelectTrigger className="w-full h-[34px] px-3 py-1 bg-white outline-none border-none hover:bg-gray-50 transition-all duration-200 cursor-pointer focus:border-blue-600 shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>

        <SelectContent className="bg-white border border-gray-200">
          <div
            onClick={() => setCreatingBrand(true)}
            className="border-b border-gray-200 "
          >
            <div className="p-2  rounded-md hover:bg-gray-50 transition-all duration-200">
              <button className="w-full text-left flex items-center gap-1 text-sm text-blue-600 cursor-pointer">
                <Plus size={16} />
                Add brand
              </button>
            </div>
          </div>
          <SelectGroup className="max-h-[284px] overflow-y-scroll">
            {loading ? (
              <Loader />
            ) : brands.length >= 1 ? (
              brands?.map((brand) => (
                <SelectItem
                  key={brand?.id}
                  value={brand?.id}
                  className="hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  {brand?.name}
                </SelectItem>
              ))
            ) : (
              <p className="text-black text-sm font-normal px-3 py-2">
                Please select main brand
              </p>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="px-1 flex items-center">
        <button
          onClick={SelectedCategory}
          disabled={!brandId}
          className="p-1 text-sm text-blue-600 disabled:text-gray-500 cursor-pointer hover:bg-gray-50 rounded-full transition-all duration-200"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() => handleDeleteBrand(brandId)}
          disabled={!brandId}
          className="p-1 text-sm text-red-600 disabled:text-gray-500 cursor-pointer hover:bg-gray-50 rounded-full transition-all duration-200"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <BrandDialog
        image={image}
        setImage={setImage}
        name={name}
        setName={setName}
        creatingBrand={creatingBrand}
        setCreatingBrand={CreatingBrand}
        editingBrand={editingBrand}
        isSubmitLoading={isSubmitLoading}
        handleCreateBrand={handleCreateBrand}
        handleEditBrand={handleEditBrand}
        isSubmitted={isSubmitted}
      />
    </div>
  );
};
