import Image from "next/image";
import Link from "next/link";

export const CTA = () => {
  return (
    <div className="w-full flex justify-center bg-[#58CC02] py-20">
      <div className="relative max-w-[1280px] w-full flex flex-col gap-8 items-center">
        <p className="text-white font-extrabold text-[56px] font-nunito">
          Өнөөдөр л эхэлцгээе!
        </p>
        <Link href="/topic">
          <button className="bg-white rounded-[16px] border-b-4 border-[#46A302] px-9 py-4 text-[#58CC02] font-bold text-base leading-6 font-nunito uppercase cursor-pointer">
            Эхлэх
          </button>
        </Link>
        <Image
          src="/svg/cloud.svg"
          alt="Icon"
          width={72}
          height={72}
          className="absolute right-[120px] bottom-2"
        />
        <Image
          src="/svg/star.svg"
          alt="Icon"
          width={36}
          height={36}
          className="absolute right-[250px] -top-10"
        />
        <Image
          src="/svg/star.svg"
          alt="Icon"
          width={36}
          height={36}
          className="absolute left-[280px] -bottom-4 rotate-135"
        />
        <Image
          src="/svg/rainbow.svg"
          alt="Icon"
          width={72}
          height={72}
          className="absolute -left-[20px] -top-8"
        />
      </div>
    </div>
  );
};
