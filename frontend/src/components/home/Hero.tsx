import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="w-full flex justify-center bg-white py-16 lg:py-[144px] px-4 overflow-hidden">
      <div className="relative max-w-[1280px] w-full flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
        <p className="text-[#1F2937] font-extrabold text-4xl lg:text-[56px] font-nunito max-w-[410px] lg:leading-14 leading-tight z-10">
          Математикийг <span className="text-[#58CC02]">амархан</span> сур.
          Үргэлж.
        </p>
        <p className="text-[#54534D] text-lg lg:text-xl font-normal font-nunito max-w-[474px] z-10">
          Хөгжилтэй тоглоом, өнгөт зураг болон найрсаг багшаар дамжуулан
          математикийг амархан эзэмшээрэй.
        </p>
        <Link
          href="/topic"
          className="cursor-pointer z-10"
          data-tutorial="main-cta"
        >
          <button className="bg-[#58CC02] rounded-[16px] shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all px-9 py-4 text-white font-bold text-base leading-6 font-nunito uppercase cursor-pointer">
            Эхлэх
          </button>
        </Link>

        {/* Desktop Images */}
        <Image
          src="/svg/home1.png"
          alt="Icon"
          width={468}
          height={400}
          className="hidden lg:block absolute -right-[50px] -bottom-6"
        />
        <Image
          src="/svg/home2.png"
          alt="Icon"
          width={330}
          height={244}
          className="hidden lg:block absolute right-[450px] -bottom-10"
        />

        {/* Mobile Images (Optional: simplified or different positioning) */}
        <div className="lg:hidden w-full flex justify-center mt-8">
          <Image
            src="/svg/home1.png"
            alt="Happy Teacher"
            width={300}
            height={256}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};
