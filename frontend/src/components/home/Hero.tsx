import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="w-full flex justify-center bg-white py-[144px]">
      <div className="relative max-w-[1280px] w-full flex flex-col items-start gap-6">
        <p className="text-[#1F2937] font-extrabold text-[56px] font-nunito max-w-[410px] leading-16">
          Математикийг <span className="text-[#58CC02]">амархан</span> сур.
          Үргэлж.
        </p>
        <p className="text-[#54534D] text-lg font-normal font-nunito max-w-[474px]">
          Хөгжилтэй тоглоом, өнгөт зураг болон найрсаг багшаар дамжуулан
          математикийг амархан эзэмшээрэй.
        </p>
        <Link href="/topic" className="cursor-pointer" data-tutorial="main-cta">
          <button className="bg-[#58CC02] rounded-[16px] border-b-4 border-[#46A302] px-9 py-4 text-white font-bold text-base leading-6 font-nunito uppercase">
            Эхлэх
          </button>
        </Link>

        <Image
          src="/svg/home1.png"
          alt="Icon"
          width={468}
          height={400}
          className="absolute -right-[50px] bottom-6"
        />
        <Image
          src="/svg/home2.png"
          alt="Icon"
          width={330}
          height={244}
          className="absolute right-[450px] -bottom-6"
        />
      </div>
    </div>
  );
};
