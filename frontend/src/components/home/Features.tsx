import Image from "next/image";

export const Features = () => {
  return (
    <div className="w-full flex justify-center bg-[#D6F5D6] py-16 lg:py-[126px] px-4">
      <div className="max-w-[1280px] w-full flex flex-col gap-12 lg:gap-20 items-center">
        <div className="flex flex-col gap-6 items-center text-center">
          <p className="text-[#0C0A01] text-3xl lg:text-5xl font-bold font-nunito">
            Яагаад Happy Teacher вэ?
          </p>
          <p className="text-[#54534D] text-lg lg:text-2xl font-normal font-nunito">
            Бид математикийг хөгжилтэй, амархан, үр дүнтэй болгодог
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 w-full">
          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image
              src="/svg/RainbowCloud.svg"
              alt="Icon"
              width={60}
              height={60}
            />
            <div className="flex flex-col gap-3">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Өнгөт сургалт
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                Бодлого бодоод зураг будах замаар математикийн ойлголтыг
                гүнзгийрүүлнэ. Хүүхэд бүр уран бүтээлчээр дамжуулан суралцана.
              </p>
            </div>
          </div>
          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image src="/svg/Bird.svg" alt="Icon" width={60} height={60} />
            <div className="flex flex-col gap-3">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Найрсаг дүр
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                Манай хөгжилтэй дүр хүүхдэд алхам бүрд нь туслаж, урамшуулж,
                тайлбарлаж өгнө. Суралцах явцад ганцаараа байхгүй.
              </p>
            </div>
          </div>

          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image src="/svg/Strategy.svg" alt="Icon" width={60} height={60} />
            <div className="flex flex-col gap-3">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Тоглоомжуулалт
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed h-auto lg:h-[128px]">
                Оноо цуглуулж, медаль авч, жагсаалтын дээгүүрт гараарай. Сурах
                мотиваци байнга өндөр байна.
              </p>
            </div>
          </div>
          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image src="/svg/Users.svg" alt="Icon" width={60} height={60} />
            <div className="flex flex-col gap-3">
              <p className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Эцэг эхтэй холбогдох
              </p>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                3 хичээл бүрт SMS/имайлаар хүүхдийнхээ явцыг мэдэх. Гэр бүлийн
                халуун уур амьсгалыг бүрдүүлнэ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
