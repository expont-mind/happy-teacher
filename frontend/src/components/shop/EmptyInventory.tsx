import { Ticket } from "lucide-react";

interface EmptyInventoryProps {
  onShopClick: () => void;
}

export const EmptyInventory = ({ onShopClick }: EmptyInventoryProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[30px] border-2 border-[#E5E5E5] border-dashed">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-gray-100">
        <Ticket size={40} className="text-gray-300" />
      </div>
      <h3 className="text-xl font-extrabold text-[#4B5563] font-nunito mb-2">
        Одоогоор купон алга
      </h3>
      <p className="text-gray-400 font-nunito font-bold mb-8 text-center max-w-sm">
        Дэлгүүрээс хүссэн шагналаа худалдаж аваад энд хадгалаарай.
      </p>
      <button
        onClick={onShopClick}
        className="px-8 py-3 bg-[#58CC02] text-white font-extrabold font-nunito rounded-2xl shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all uppercase tracking-wide text-sm cursor-pointer"
      >
        Дэлгүүр хэсэх
      </button>
    </div>
  );
};
