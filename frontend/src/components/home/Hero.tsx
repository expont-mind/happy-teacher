import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const Hero = () => {
  return (
    <section className="w-full bg-white py-16 lg:py-32 px-4 lg:pl-20 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
        {/* Text Side */}
        <div className="flex flex-col gap-5 lg:gap-6 lg:w-[45%] text-center lg:text-left items-center  lg:items-start">
          <span className="inline-flex bg-[#58CC02]/10 text-[#58CC02] px-4 py-1.5 rounded-full font-bold text-sm font-nunito border border-[#58CC02]/20">
            Хүүхдүүдэд зориулав
          </span>

          <h1 className="text-[#1F2937] font-extrabold text-4xl sm:text-5xl lg:text-[56px] font-nunito leading-tight lg:leading-[1.1]">
            Математикийг{" "}
            <span className="text-[#58CC02]">будаж</span>{" "}
            суралцаарай!
          </h1>

          <p className="text-[#6B7280] text-base lg:text-lg font-normal font-nunito max-w-[480px]">
            Бодлого бод, зураг буд, оноо цуглуул. Хөлөгт тоглоом, сургалтын хэрэгслүүдийг дэлгүүрээс аваарай!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/shop?tab=lessons"
              className="cursor-pointer"
              data-tutorial="main-cta"
            >
              <button className="w-full sm:w-auto bg-[#58CC02] hover:bg-[#4CAF00] rounded-[16px] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all px-8 py-3.5 text-white font-bold text-sm leading-6 font-nunito uppercase cursor-pointer">
                Суралцаж эхлэх
              </button>
            </Link>
            <Link href="/shop?tab=products" className="cursor-pointer">
              <button className="w-full sm:w-auto rounded-[16px] border-2 border-gray-200 text-[#4B5563] hover:border-[#58CC02] hover:text-[#58CC02] transition-all px-8 py-3.5 font-bold text-sm leading-6 font-nunito uppercase cursor-pointer flex items-center justify-center gap-2">
                <ShoppingBag size={16} />
                Дэлгүүр үзэх
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              {["#58CC02", "#1CB0F6", "#FFC800", "#CE82FF"].map(
                (color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold font-nunito"
                    style={{ backgroundColor: color }}
                  >
                    {["Б", "О", "А", "С"][i]}
                  </div>
                )
              )}
            </div>
            <p className="text-[#6B7280] text-sm font-semibold font-nunito">
              2,000+ хүүхэд суралцаж байна
            </p>
          </div>
        </div>

        {/* Illustration Side */}
        <div className="lg:flex-1 flex justify-center lg:justify-end">
          <div className="relative w-[300px] h-[280px] sm:w-[400px] sm:h-[350px] lg:w-[550px] lg:h-[460px]">
            <Image
              src="/landing-page-illustrations/hero-scene.png"
              alt="Хүүхэд математик будаж суралцаж байгаа зураглал"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};
