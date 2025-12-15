import Image from "next/image";

export const Lessons = () => {
  return (
    <div className="w-full flex justify-center bg-white py-[126px]">
      <div className="max-w-[1280px] flex flex-col gap-20 items-center">
        <div className="flex flex-col gap-6 items-center">
          <p className="text-[#0C0A01] text-5xl font-bold font-nunito">
            Бидний хичээлүүд
          </p>
          <p className="text-[#54534D] text-2xl font-normal font-nunito">
            Үе шаттайгаар өсөн дэвших математикийн сургалт
          </p>
        </div>

        {/* <div className="flex flex-col gap-10">
          <div className="flex gap-10">
            <div className="w-full border-2 border-[#0C0A0126] rounded-[20px] py-8 pl-8 pr-16 flex flex-col gap-8">
              <Image
                src="/svg/NotePencil.svg"
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
            <div className="w-full border-2 border-[#0C0A0126] rounded-[20px] py-8 pl-8 pr-16 flex flex-col gap-8">
              <Image
                src="/svg/NotePencil.svg"
                alt="Icon"
                width={60}
                height={60}
              />
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
        </div> */}
      </div>
    </div>
  );
};
