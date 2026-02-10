import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const CTA = () => {
  return (
    <section className="w-full flex justify-center bg-[#58CC02] py-16 lg:py-24 px-4 lg:px-8 overflow-hidden relative">
      {/* Decorative circles */}
      <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-[#4CAF00]/30" />
      <div className="absolute bottom-[-60px] left-[-30px] w-[180px] h-[180px] rounded-full bg-[#46A302]/20" />
      <div className="absolute top-[20%] left-[10%] w-[60px] h-[60px] rounded-full bg-white/10 animate-float" />
      <div
        className="absolute bottom-[20%] right-[15%] w-[40px] h-[40px] rounded-full bg-white/10 animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="max-w-[800px] w-full flex flex-col gap-6 lg:gap-8 items-center text-center relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing-page-illustrations/cta-ensemble.png"
          alt="Happy Academy дүрүүд"
          className="w-[250px] lg:w-[400px] object-contain mix-blend-multiply"
        />

        <h2 className="text-white font-extrabold text-3xl lg:text-[52px] font-nunito leading-tight">
          Өнөөдрөөс эхэлцгээе!
        </h2>
        <p className="text-white/90 text-base lg:text-lg font-normal font-nunito max-w-[500px]">
          Үнэгүй бүртгүүлж, эхний хичээлээ туршиж үзээрэй. Хүүхдээ математикт дуртай болгох аялал энд эхэлнэ.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link href="/shop?tab=lessons">
            <button className="bg-white hover:bg-gray-50 rounded-[16px] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all px-8 py-3.5 text-[#58CC02] font-bold text-sm leading-6 font-nunito uppercase cursor-pointer">
              Суралцаж эхлэх
            </button>
          </Link>
          <Link href="/shop?tab=products">
            <button className="rounded-[16px] border-2 border-white/80 text-white hover:bg-white hover:text-[#58CC02] transition-all px-8 py-3.5 font-bold text-sm leading-6 font-nunito uppercase cursor-pointer flex items-center gap-2">
              <ShoppingBag size={16} />
              Дэлгүүр үзэх
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
