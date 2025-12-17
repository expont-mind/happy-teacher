import Image from "next/image";

export const HowItWorks = () => {
  return (
    <div className="w-full flex justify-center bg-[#D6F5D6] py-16 lg:py-[126px] px-4">
      <div className="max-w-[1280px] w-full flex flex-col gap-12 lg:gap-20 items-center">
        <div className="flex flex-col gap-6 items-center text-center">
          <p className="text-[#0C0A01] text-3xl lg:text-5xl font-bold font-nunito">
            Хэрхэн ажилладаг вэ?
          </p>
          <p className="text-[#54534D] text-lg lg:text-2xl font-normal font-nunito">
            3 хялбар алхамаар математикийн аялалаа эхлүүлээрэй
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-5 w-full mt-4 lg:mt-0">
          <div className="w-full border-2 border-[#0C0A0126] bg-white rounded-[20px] pt-[54px] px-6 pb-10 flex flex-col gap-8 items-center relative">
            <div className="absolute top-[-25px] left-[50%] translate-x-[-50%] rounded-full w-[50px] h-[50px] bg-[#58CC02] border-b-[3px] border-[#46A302] flex justify-center items-center shadow-md">
              <p className="text-lg font-extrabold text-white">1</p>
            </div>
            <Image
              src="/svg/NotePencil.svg"
              alt="Icon"
              width={60}
              height={60}
            />
            <div className="flex flex-col gap-3 items-center text-center">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Бүртгүүлэх
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito">
                Эцэг эх бүртгүүлээд хүүхдийнхээ профайл үүсгэнэ. Утасны дугаар,
                имайл, хүүхдийн нэр л хангалттай.
              </p>
            </div>
          </div>
          <div className="w-full border-2 border-[#0C0A0126] bg-white rounded-[20px] pt-[54px] px-6 pb-10 flex flex-col gap-8 items-center relative">
            <div className="absolute top-[-25px] left-[50%] translate-x-[-50%] rounded-full w-[50px] h-[50px] bg-[#58CC02] border-b-[3px] border-[#46A302] flex justify-center items-center shadow-md">
              <p className="text-lg font-extrabold text-white">2</p>
            </div>
            <Image src="/svg/Palette.svg" alt="Icon" width={60} height={60} />
            <div className="flex flex-col gap-3 items-center text-center">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Сурч эхлэх
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito">
                Бодлого бод, зураг буд, оноо цуглуул. Найрсаг дүр алхам бүрд
                тань туслана.
              </p>
            </div>
          </div>
          <div className="w-full border-2 border-[#0C0A0126] bg-white rounded-[20px] pt-[54px] px-6 pb-10 flex flex-col gap-8 items-center relative">
            <div className="absolute top-[-25px] left-[50%] translate-x-[-50%] rounded-full w-[50px] h-[50px] bg-[#58CC02] border-b-[3px] border-[#46A302] flex justify-center items-center shadow-md">
              <p className="text-lg font-extrabold text-white">3</p>
            </div>
            <Image src="/svg/Trophy.svg" alt="Icon" width={60} height={60} />
            <div className="flex flex-col gap-3 items-center text-center">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Ахиц дэвшил
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito">
                Медаль ав, жагсаалтад гар, шагнал хүртээрэй. Эцэг эх явцыг
                тогтмол мэдэх боломжтой.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
