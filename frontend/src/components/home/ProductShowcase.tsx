"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "./AnimatedSection";

export const ProductShowcase = () => {
  return (
    <section className="w-full bg-white py-16 lg:py-24 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-12 lg:gap-16 items-center">
        <AnimatedSection className="text-center">
          <h2 className="text-[#1F2937] text-3xl lg:text-5xl font-bold font-nunito">
            Юу хийж болох вэ?
          </h2>
          <p className="text-[#6B7280] text-lg lg:text-xl font-normal font-nunito mt-4">
            Хоёр гайхалтай арга замаар хүүхдээ хөгжүүлээрэй
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 w-full">
          {/* Item 1: Coloring Book Learning */}
          <AnimatedSection>
            <Link href="/topic" className="block group">
              <div className="flex flex-col items-center text-center gap-6">
                <Image
                  src="/landing-page-illustrations/coloring-split.png"
                  alt="Будаж суралцах"
                  width={400}
                  height={300}
                  className="w-full max-w-[380px] object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <h3 className="text-[#1F2937] font-bold text-xl lg:text-2xl font-nunito">
                  Будаж суралц
                </h3>
                <p className="text-[#6B7280] text-base lg:text-lg font-normal font-nunito max-w-[400px]">
                  Математикийн бодлого бодож, зургийг будаж, хичээл бүрийг тоглоом шиг сонирхолтойгоор эзэмшээрэй.
                </p>
                <span className="bg-[#58CC02] hover:bg-[#4CAF00] rounded-[12px] shadow-[0_3px_0_#46A302] active:shadow-none active:translate-y-[2px] transition-all px-6 py-2.5 text-white font-bold text-sm font-nunito uppercase inline-block">
                  Эхлэх
                </span>
              </div>
            </Link>
          </AnimatedSection>

          {/* Item 2: Shop */}
          <AnimatedSection>
            <Link href="/shop?tab=products" className="block group">
              <div className="flex flex-col items-center text-center gap-6">
                <Image
                  src="/landing-page-illustrations/animal-shop.png"
                  alt="Дэлгүүр"
                  width={400}
                  height={300}
                  className="w-full max-w-[380px] object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <h3 className="text-[#1F2937] font-bold text-xl lg:text-2xl font-nunito">
                  Дэлгүүр
                </h3>
                <p className="text-[#6B7280] text-base lg:text-lg font-normal font-nunito max-w-[400px]">
                  Хөлөгт тоглоом, сургалтын хэрэгсэл, бусад хөгжүүлэх бүтээгдэхүүнүүдийг аваарай.
                </p>
                <span className="bg-[var(--ha-amber)] hover:bg-[#e8922e] rounded-[12px] shadow-[0_3px_0_var(--ha-amber-dark)] active:shadow-none active:translate-y-[2px] transition-all px-6 py-2.5 text-white font-bold text-sm font-nunito uppercase inline-block">
                  Дэлгүүр үзэх
                </span>
              </div>
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};
