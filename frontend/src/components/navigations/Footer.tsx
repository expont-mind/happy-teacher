import Image from "next/image";
import Link from "next/link";
import { TOPICS_DATA } from "@/src/data/topics";

export const Footer = () => {
  return (
    <>
      {/* Steppe grass divider */}
      <div className="w-full overflow-hidden leading-[0] bg-[#58CC02]">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="w-full h-[30px] md:h-[40px] lg:h-[60px] block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1440,20 1440,30 L1440,60 L0,60 Z"
            fill="#2D2D2D"
          />
        </svg>
      </div>

      <footer className="w-full flex justify-center bg-[#2D2D2D] py-16 lg:py-20 px-4 lg:px-8 pb-32 md:pb-20 -mb-16 md:mb-0">
      <div className="max-w-[1280px] w-full flex flex-col gap-12 lg:gap-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-8 w-full justify-between">
          <div className="max-w-none lg:max-w-[316px] w-full">
            <div className="flex gap-[10px] items-center py-1.5">
              <Image
                src="/svg/GraduationCap.svg"
                alt="Icon"
                width={30}
                height={30}
              />
              <p className="text-base font-extrabold text-white font-nunito">
                Happy Academy
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-[104px]">
            <div className="flex flex-col gap-[18px] w-full">
              <p className="text-base font-bold text-[#F3F4F6] font-nunito">
                Бүтээгдэхүүн
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/topic"
                  prefetch={true}
                  className="text-sm font-semibold text-[#F3F4F6] font-nunito hover:text-[#58CC02] transition-colors"
                >
                  Хичээлүүд
                </Link>
                <Link
                  href="/shop"
                  prefetch={true}
                  className="text-sm font-semibold text-[#F3F4F6] font-nunito hover:text-[#58CC02] transition-colors"
                >
                  Дэлгүүр
                </Link>
                {TOPICS_DATA.map((topic, index) => (
                  <Link
                    key={index}
                    href={topic.link}
                    prefetch={true}
                    className="text-sm font-semibold text-[#F3F4F6] font-nunito hover:text-[#58CC02] transition-colors"
                  >
                    {topic.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[18px] w-full">
              <p className="text-base font-bold text-[#F3F4F6] font-nunito">
                Дэмжлэг
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/help"
                  prefetch={true}
                  className="text-sm font-semibold text-[#F3F4F6] font-nunito hover:text-[#58CC02] transition-colors"
                >
                  Тусламж
                </Link>
                <a
                  href="tel:88086681"
                  className="text-sm font-semibold text-[#F3F4F6] font-nunito hover:text-[#58CC02] transition-colors"
                >
                  Холбоо барих
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-none lg:max-w-[316px] w-full">
            <div className="flex gap-[10px] items-center justify-start lg:justify-end py-1.5">
              <Link
                href="#"
                target="blank"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/svg/Instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="https://www.facebook.com/happymathmn"
                target="blank"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/svg/Facebook.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="#"
                target="blank"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/svg/Youtube.svg"
                  alt="Youtube"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#858480] pt-8 w-full flex justify-center">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between w-full text-center md:text-left">
            <p className="text-sm font-normal text-[#B6B5B2] font-nunito">
              © 2026 Happy Academy
            </p>
            <p className="text-sm font-normal text-[#B6B5B2] font-nunito">
              Powered by{" "}
              <Link
                href="https://www.expontmind.com/"
                target="_blank"
                className="font-bold border-b border-transparent hover:border-[#B6B5B2] transition-all"
              >
                ExpontMind
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};
