import Link from "next/link";

export const CTA = () => {
  return (
    <div className="w-full flex justify-center bg-[#58CC02] py-20">
      <div className="max-w-[1280px] flex flex-col gap-8 items-center">
        <p className="text-white font-extrabold text-[56px] font-nunito">
          Өнөөдөр л эхэлцгээе!
        </p>
        <Link href="/sign-up">
          <button className="bg-white rounded-[16px] border-b-4 border-[#46A302] px-9 py-4 text-[#58CC02] font-bold text-base leading-6 font-nunito uppercase cursor-pointer">
            Эхлэх
          </button>
        </Link>
      </div>
    </div>
  );
};
