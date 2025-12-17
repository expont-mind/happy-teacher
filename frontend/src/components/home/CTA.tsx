import Image from "next/image";
import Link from "next/link";

export const CTA = () => {
  return (
    <div className="w-full flex justify-center bg-[#58CC02] py-16 lg:py-20 px-4 overflow-hidden">
      <div className="relative max-w-[1280px] w-full flex flex-col gap-8 items-center text-center">
        <p className="text-white font-extrabold text-3xl lg:text-[56px] font-nunito z-10">
          Өнөөдөр л эхэлцгээе!
        </p>
        <Link href="/topic" className="z-10">
          <button className="bg-white rounded-[16px] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all px-9 py-4 text-[#58CC02] font-bold text-base leading-6 font-nunito uppercase cursor-pointer">
            Эхлэх
          </button>
        </Link>
        <Image
          src="/svg/cloud.svg"
          alt="Icon"
          width={72}
          height={72}
          className="hidden lg:block absolute right-[120px] bottom-2"
        />
        <Image
          src="/svg/star.svg"
          alt="Icon"
          width={36}
          height={36}
          className="hidden lg:block absolute right-[250px] -top-10"
        />
        <Image
          src="/svg/star.svg"
          alt="Icon"
          width={36}
          height={36}
          className="hidden lg:block absolute left-[280px] -bottom-4 rotate-135"
        />
        <Image
          src="/svg/rainbow.svg"
          alt="Icon"
          width={72}
          height={72}
          className="hidden lg:block absolute -left-[20px] -top-8"
        />

        {/* Mobile only decorations (optional, simple cloud maybe) */}
        <Image
          src="/svg/cloud.svg"
          alt="Icon"
          width={48}
          height={48}
          className="lg:hidden absolute right-0 -bottom-4 opacity-50"
        />
      </div>
    </div>
  );
};
