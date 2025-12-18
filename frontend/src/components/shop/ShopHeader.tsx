import { ShoppingBag } from "lucide-react";
import { UserProfile } from "@/src/components/auth/types";
import Image from "next/image";

interface ShopHeaderProps {
  activeProfile: UserProfile;
}

export const ShopHeader = ({ activeProfile }: ShopHeaderProps) => {
  return (
    <div className="mt-8 md:mt-[50px] relative w-full bg-linear-to-r from-[#6FDC6F] to-[#32CD32] p-6 md:py-7 md:px-14 flex flex-col md:flex-row items-center gap-6 md:gap-7 rounded-[20px] shadow-[2px_4px_5px_#58CC02]">
      <div className="absolute top-3 right-4 rotate-10">
        <Image src="/svg/Sparkle.svg" alt="Sparkle" width={32} height={32} />
      </div>
      <div className="shrink-0 w-[90px] h-[90px] rounded-full bg-white border-[3px] border-[#58CC02] overflow-hidden relative flex items-center justify-center text-3xl">
        <ShoppingBag size={32} color="black" />
      </div>
      <div className="flex flex-col gap-6 w-full items-center md:items-start text-center md:text-left">
        <div className="flex flex-col gap-1.5">
          <p className="text-white font-extrabold text-2xl md:text-[24px] font-nunito">
            XP Дэлгүүр
          </p>
          <p className="text-white font-medium text-sm font-nunito">
            Цуглуулсан оноогоороо шагнал аваарай!
          </p>
        </div>

        <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
          <Image
            src="/svg/Lightning.svg"
            alt="Lightning"
            width={32}
            height={32}
          />
          <div className="flex flex-col w-[64px] items-start">
            <p className="text-white font-semibold text-sm font-nunito">XP</p>
            <p className="text-white font-extrabold text-sm font-nunito">
              {activeProfile?.xp || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
