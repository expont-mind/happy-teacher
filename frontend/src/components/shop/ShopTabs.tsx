import { ShoppingBag, Ticket, Lock } from "lucide-react";

interface ShopTabsProps {
  activeTab: "shop" | "inventory";
  setActiveTab: (tab: "shop" | "inventory") => void;
  inventoryCount: number;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export const ShopTabs = ({
  activeTab,
  setActiveTab,
  inventoryCount,
  isLoggedIn = true,
  onLoginRequired,
}: ShopTabsProps) => {
  const handleInventoryClick = () => {
    if (!isLoggedIn && onLoginRequired) {
      onLoginRequired();
    } else {
      setActiveTab("inventory");
    }
  };
  return (
    <div className="flex justify-center -mt-4 z-10 select-none">
      <div className="relative bg-white p-2 rounded-[24px] shadow-[0_4px_0_#E5E5E5] border-2 border-[#E5E5E5] flex">
        {/* Sliding Active Indicator */}
        <div
          className={`absolute top-2 bottom-2 w-[180px] rounded-[16px] transition-transform duration-300 ease-in-out z-0 bg-[#58CC02] ${
            activeTab === "shop"
              ? "translate-x-0 left-2"
              : "translate-x-full left-2"
          }`}
        />

        {/* Shop Tab */}
        <button
          onClick={() => setActiveTab("shop")}
          className={`relative z-10 w-[180px] h-12 rounded-[16px] font-extrabold font-nunito text-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
            activeTab === "shop" ? "text-white" : "text-gray-400"
          }`}
        >
          <ShoppingBag
            size={20}
            strokeWidth={2.5}
            className={activeTab === "shop" ? "text-white" : "text-gray-400"}
          />
          Дэлгүүр
        </button>

        {/* Inventory Tab */}
        <button
          onClick={handleInventoryClick}
          className={`relative z-10 w-[180px] h-12 rounded-[16px] font-extrabold font-nunito text-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
            activeTab === "inventory" ? "text-white" : "text-gray-400"
          }`}
        >
          {!isLoggedIn ? (
            <Lock
              size={18}
              strokeWidth={2.5}
              className="text-gray-400"
            />
          ) : (
            <Ticket
              size={20}
              strokeWidth={2.5}
              className={
                activeTab === "inventory" ? "text-white" : "text-gray-400"
              }
            />
          )}
          Купонууд
          {isLoggedIn && inventoryCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs ml-1 font-black ${
                activeTab === "inventory"
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {inventoryCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
