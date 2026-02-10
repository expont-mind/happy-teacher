import { ShoppingBag, Sparkles, GraduationCap } from "lucide-react";
import { UserProfile } from "@/src/components/auth/types";
import Image from "next/image";

interface ShopHeaderProps {
  activeProfile?: UserProfile | null;
}

export const ShopHeader = ({ activeProfile }: ShopHeaderProps) => {
  const isChild = activeProfile?.type === "child";
  const isParent = activeProfile?.type === "adult";

  const xp = activeProfile?.xp || 0;
  const level = activeProfile?.level || 1;
  const xpInLevel = xp % 100;

  return (
    <div className="mt-8 md:mt-[50px] relative w-full bg-linear-to-r from-[#6FDC6F] to-[#32CD32] p-6 md:py-7 md:px-14 flex flex-col md:flex-row items-center gap-6 md:gap-7 rounded-[20px] shadow-[2px_4px_5px_#58CC02]">
      <div className="absolute top-3 right-4 rotate-10">
        <Image src="/svg/Sparkle.svg" alt="Sparkle" width={32} height={32} />
      </div>

      <div className="shrink-0 w-[90px] h-[90px] rounded-full bg-white border-[3px] border-[#58CC02] overflow-hidden relative flex items-center justify-center text-3xl">
        {isParent ? (
          <GraduationCap size={32} color="black" />
        ) : (
          <ShoppingBag size={32} color="black" />
        )}
      </div>

      <div className="flex flex-col gap-4 w-full items-center md:items-start text-center md:text-left">
        <div className="flex flex-col gap-1.5">
          {isChild ? (
            <>
              <p className="text-white font-extrabold text-2xl md:text-[24px] font-nunito">
                Шагналын дэлгүүр
              </p>
              <p className="text-white font-medium text-sm font-nunito">
                Цуглуулсан XP-ээрээ шагнал аваарай!
              </p>
            </>
          ) : isParent ? (
            <>
              <p className="text-white font-extrabold text-2xl md:text-[24px] font-nunito">
                Дэлгүүр
              </p>
              <p className="text-white font-medium text-sm font-nunito">
                Хүүхдээ хичээлд бүртгүүлж, бүтээгдэхүүн захиалаарай
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-extrabold text-2xl md:text-[24px] font-nunito">
                Дэлгүүр
              </p>
              <p className="text-white font-medium text-sm font-nunito">
                Хүүхдэд зориулсан бүтээгдэхүүнүүд
              </p>
            </>
          )}

          {isChild && (
            <div className="flex items-start gap-2 mt-1">
              <div className="shrink-0 animate-float">
                <Image
                  src="/character/yellow-right.png"
                  alt=""
                  width={36}
                  height={36}
                />
              </div>
              <div className="relative bg-white/90 rounded-xl px-3 py-2 shadow-md border-2 border-[#FFD700]/30">
                <div
                  className="absolute w-0 h-0 left-[-6px] top-3"
                  style={{
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderRight: "6px solid rgba(255,255,255,0.9)",
                  }}
                />
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#FFD700] shrink-0" />
                  <p className="text-[#4b4b4b] font-semibold text-xs font-nunito leading-tight">
                    Хичээл хийж XP цуглуулаад шагналаа аваарай!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* XP + Level - child only */}
        {isChild && (
          <div className="flex items-center gap-3">
            <div className="bg-[#FFFFFF40] rounded-[20px] px-[10px] py-1.5 flex items-center gap-[10px]">
              <Image
                src="/svg/Lightning.svg"
                alt="Lightning"
                width={32}
                height={32}
              />
              <div className="flex flex-col w-[64px] items-start">
                <p className="text-white font-semibold text-sm font-nunito">
                  XP
                </p>
                <p className="text-white font-extrabold text-sm font-nunito">
                  {xp}
                </p>
              </div>
            </div>

            <div className="bg-[#FFFFFF40] rounded-[20px] px-3 py-1.5 flex items-center gap-2">
              <div className="flex flex-col items-start">
                <p className="text-white font-semibold text-xs font-nunito">
                  Түвшин {level}
                </p>
                <div className="w-16 h-2 bg-white/30 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${xpInLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
