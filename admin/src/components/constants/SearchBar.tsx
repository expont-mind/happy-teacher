import { Search } from "lucide-react";
import { SearchBarProps } from ".";

export const SearchBar = ({ searchTerm, setSearchTerm }: SearchBarProps) => {
  return (
    <div className="flex gap-2 items-center w-full h-10 px-3 py-1 border border-[#E4E4E7] rounded-lg bg-white">
      <Search size={16} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search"
        className="w-full outline-none text-sm font-normal text-[#09090B]"
      />
    </div>
  );
};
