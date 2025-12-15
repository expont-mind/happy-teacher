import Image from "next/image";

export const Features = () => {
  return (
    <div className="w-full flex justify-center bg-[#D6F5D6] py-[126px]">
      <div className="max-w-[1280px] flex flex-col gap-20 items-center">
        <div className="flex flex-col gap-6 items-center">
          <p className="text-[#0C0A01] text-5xl font-bold font-nunito">
            Яагаад Happy Teacher вэ?
          </p>
          <p className="text-[#54534D] text-2xl font-normal font-nunito">
            Бид математикийг хөгжилтэй, амархан, үр дүнтэй болгодог
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex gap-10">
            <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 pl-8 pr-16 flex flex-col gap-8">
              <Image
                src="/svg/RainbowCloud.svg"
                alt="Icon"
                width={60}
                height={60}
              />
              <div className="flex flex-col gap-3 ">
                <p className="text-black font-bold text-[26px] font-nunito">
                  Өнгөт сургалт
                </p>
                <p className="text-black text-2xl font-normal font-nunito">
                  Бодлого бодоод зураг будах замаар математикийн ойлголтыг
                  гүнзгийрүүлнэ. Хүүхэд бүр уран бүтээлчээр дамжуулан суралцана.
                </p>
              </div>
            </div>
            <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 pl-8 pr-16 flex flex-col gap-8">
              <Image src="/svg/Bird.svg" alt="Icon" width={60} height={60} />
              <div className="flex flex-col gap-3 ">
                <p className="text-black font-bold text-[26px] font-nunito">
                  Найрсаг дүр
                </p>
                <p className="text-black text-2xl font-normal font-nunito">
                  Манай хөгжилтэй дүр хүүхдэд алхам бүрд нь туслаж, урамшуулж,
                  тайлбарлаж өгнө. Суралцах явцад ганцаараа байхгүй.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-10">
            <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 pl-8 pr-16 flex flex-col gap-8">
              <Image
                src="/svg/Strategy.svg"
                alt="Icon"
                width={60}
                height={60}
              />
              <div className="flex flex-col gap-3 ">
                <p className="text-black font-bold text-[26px] font-nunito">
                  Тоглоомжуулалт
                </p>
                <p className="text-black text-2xl font-normal font-nunito h-[128px]">
                  Оноо цуглуулж, медаль авч, жагсаалтын дээгүүрт гараарай. Сурах
                  мотиваци байнга өндөр байна.
                </p>
              </div>
            </div>
            <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 pl-8 pr-16 flex flex-col gap-8">
              <Image src="/svg/Users.svg" alt="Icon" width={60} height={60} />
              <div className="flex flex-col gap-3 ">
                <p className="text-black font-bold text-[26px] font-nunito">
                  Эцэг эхтэй холбогдох
                </p>
                <p className="text-black text-2xl font-normal font-nunito">
                  3 хичээл бүрт SMS/имайлаар хүүхдийнхээ явцыг мэдэх. Гэр бүлийн
                  халуун уур амьсгалыг бүрдүүлнэ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
