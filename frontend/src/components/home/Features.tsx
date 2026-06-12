"use client";

import Image from "next/image";
import { AnimatedSection } from "./AnimatedSection";

const features = [
  {
    title: "Тоглоом шиг суралцах",
    description:
      "Хүүхэд бодлого бодож, зураг будаж, даалгавраа гүйцэтгэх бүртээ үе давж оноо цуглуулж дараагийн шат руу шилжинэ.",
    image: "/landing-page-illustrations/feature-game.png",
    color: "#58CC02",
  },
  {
    title: "Тархины шинжлэх ухаанд суурилсан",
    description:
      "Тархины судалгаанд үндэслэн бүтээгдсэн. Өдөр бүр тогтмол суралцах үед допамин ялгарч, суралцах хүсэл нэмэгдэнэ.",
    image: "/landing-page-illustrations/feature-brain.png",
    color: "#1CB0F6",
  },
  {
    title: "Найрсаг дүрүүд үргэлж хамт",
    description:
      "Манай найрсаг дүрүүд хичээл бүрийн турш урам өгч, чиглүүлж, дэмжинэ. Ганцаараа биш, хамтдаа суралцана.",
    image: "/landing-page-illustrations/feature-characters.png",
    color: "#CE82FF",
  },
  {
    title: "Эцэг эхтэй холбогдсон",
    description:
      "Хичээл бүрт хүүхдийнхээ явцыг мэдэх боломжтой. Амжилтыг нь хамтдаа баярлан, дэмжлэгийг нь цаг тухайд нь үзүүлээрэй.",
    image: "/landing-page-illustrations/feature-parents.png",
    color: "#FFC800",
  },
];

export const Features = () => {
  return (
    <section className="w-full py-20 lg:py-32 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-14 lg:gap-20 items-center">
        <AnimatedSection className="text-center">
          <p className="text-[#58CC02] text-sm font-bold font-nunito uppercase tracking-wider mb-3">
            Яагаад бид вэ?
          </p>
          <h2 className="text-[#1F2937] text-3xl lg:text-[52px] font-extrabold font-nunito leading-tight">
            Яагаад Happy Academy вэ?
          </h2>
          <p className="text-[#6B7280] text-lg lg:text-xl font-normal font-nunito mt-4 max-w-[600px] mx-auto">
            Бид математикийг хөгжилтэй, амархан, үр дүнтэй болгодог
          </p>
        </AnimatedSection>

        <div className="w-full flex flex-col gap-16 lg:gap-24">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title}>
              <div
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-8 lg:gap-16`}
              >
                {/* Image Side */}
                <div className={`lg:w-1/2 flex justify-center ${index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"}`}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={400}
                    height={400}
                    className="w-[200px] h-[200px] lg:w-[360px] lg:h-[360px] object-contain"
                  />
                </div>

                {/* Text Side */}
                <div className="lg:w-1/2 flex flex-col gap-4 text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div
                      className="w-1.5 h-10 rounded-full hidden lg:block shrink-0"
                      style={{ backgroundColor: feature.color }}
                    />
                    <h3 className="text-[#1F2937] font-extrabold text-2xl lg:text-[36px] font-nunito leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-[#6B7280] text-base lg:text-lg font-normal font-nunito leading-relaxed max-w-[480px] mx-auto lg:mx-0">
                    {feature.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};
