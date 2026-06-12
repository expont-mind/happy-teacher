"use client";

import Image from "next/image";
import { AnimatedSection } from "./AnimatedSection";

const steps = [
  {
    number: 1,
    title: "Бүртгүүлэх",
    description:
      "Эцэг эх бүртгүүлээд хүүхдийнхээ профайл үүсгэнэ. Утасны дугаар, имэйл, хүүхдийн нэр л хангалттай.",
    icon: "/landing-page-illustrations/step-register.png",
    color: "#58CC02",
    shadowColor: "#46A302",
  },
  {
    number: 2,
    title: "Бодлого бод, зураг буд",
    description:
      "Бодлого бод, зураг буд, оноо цуглуул. Найрсаг дүр алхам бүрд тань туслана.",
    icon: "/landing-page-illustrations/step-learn.png",
    color: "#1CB0F6",
    shadowColor: "#1899D6",
  },
  {
    number: 3,
    title: "Шагнал аваарай",
    description:
      "Медаль ав, жагсаалтад гар, шагнал хүртээрэй. Эцэг эх явцыг тогтмол мэдэх боломжтой.",
    icon: "/landing-page-illustrations/step-reward.png",
    color: "#FFC800",
    shadowColor: "#FFAB00",
  },
];

export const HowItWorks = () => {
  return (
    <section className="w-full py-16 lg:py-24 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-12 lg:gap-16 items-center">
        <AnimatedSection className="text-center">
          <h2 className="text-[#1F2937] text-3xl lg:text-5xl font-bold font-nunito">
            Хэрхэн ажилладаг вэ?
          </h2>
          <p className="text-[#6B7280] text-lg lg:text-xl font-normal font-nunito mt-4">
            3 хялбар алхамаар эхлээрэй
          </p>
        </AnimatedSection>

        <div className="w-full flex flex-col gap-14 lg:gap-20">
          {steps.map((step, index) => (
            <AnimatedSection key={step.number}>
              <div
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-6 lg:gap-16`}
              >
                {/* Illustration */}
                <div className={`lg:w-1/2 flex justify-center ${index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"}`}>
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={360}
                    height={360}
                    className="w-[220px] h-[220px] lg:w-[320px] lg:h-[320px] object-contain"
                  />
                </div>

                {/* Text */}
                <div className="lg:w-1/2 flex flex-col gap-3 text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-base font-extrabold text-white font-nunito shrink-0"
                      style={{
                        backgroundColor: step.color,
                        boxShadow: `0 3px 0 ${step.shadowColor}`,
                      }}
                    >
                      {step.number}
                    </span>
                    <h3 className="text-[#1F2937] font-bold text-xl lg:text-2xl font-nunito">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[#6B7280] text-base lg:text-lg font-normal font-nunito leading-relaxed max-w-[480px] mx-auto lg:mx-0">
                    {step.description}
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
