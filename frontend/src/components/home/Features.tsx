import Image from "next/image";

export const Features = () => {
  return (
    <div className="w-full flex justify-center bg-[#D6F5D6] py-16 lg:py-[126px] px-4">
      <div className="max-w-[1280px] w-full flex flex-col gap-12 lg:gap-20 items-center">
        <div className="flex flex-col gap-6 items-center text-center">
          <h2 className="text-[#0C0A01] text-3xl lg:text-5xl font-bold font-nunito">
            Яагаад Happy Academy вэ?
          </h2>
          <p className="text-[#54534D] text-lg lg:text-2xl font-normal font-nunito">
            Бид математикийг хөгжилтэй, амархан, үр дүнтэй болгодог
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 w-full">
          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image
              src="/svg/Controller.png"
              alt="Тоглоом шиг суралцах дүрс"
              width={60}
              height={60}
              className="w-[60px] h-[60px]"
            />
            <div className="flex flex-col gap-3">
              <h3 className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Тоглоом шиг үе шаттай суралц
              </h3>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                Хүүхэд бодлого бодож, зураг будаж, даалгавраа гүйцэтгэх бүртээ
                үе давж оноо цуглуулж дараагийн шат руу шилжинэ. Ингэснээр
                суралцах үйл явц нь тоглоом мэт сонирхолтой болж, уйдахгүйгээр
                мэдлэгээ ахиулна.
              </p>
            </div>
          </div>
          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image src="/svg/Head.png" alt="Найрсаг дүрийн тусламж" width={60} height={60} />
            <div className="flex flex-col gap-3">
              <h3 className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Ганцаараа биш найрсаг дүр үргэлж хамт
              </h3>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                Манай найрсаг дүр хичээл бүрийн турш урам өгч, чиглүүлж, тусалж
                дэмжинэ. Мөн түүхээр дамжуулан хүүхэд амжилтад хүрэх баяр хөөр,
                алдаа гаргасан үедээ бууж өгөхгүй байх өөртөө итгэх сэтгэл зүйг
                сурна.
              </p>
            </div>
          </div>

          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image
              src="/svg/GreenBrain.png"
              alt="Тархины судалгаанд суурилсан"
              width={60}
              height={60}
              className="w-[60px] h-[60px]"
            />
            <div className="flex flex-col gap-3">
              <h3 className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Тархины судалгаанд суурилсан
              </h3>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                Тархины судалгаанд үндэслэн бүтээгдсэн ба хүүхэд өдөр бүр
                тогтмол суралцах үед батламж авна. Энэ нь тархинд допамин хэмээх
                урамшууллын гормон ялгарч, суралцах үйл явцад аз жаргалын
                мэдрэмж нэмэгдэнэ.
              </p>
            </div>
          </div>
          <div className="w-full bg-white border-2 border-[#0C0A0126] rounded-[20px] py-8 px-6 lg:pl-8 lg:pr-16 flex flex-col gap-6 lg:gap-8 h-full">
            <Image src="/svg/Users.png" alt="Эцэг эхтэй холбогдох" width={60} height={60} />
            <div className="flex flex-col gap-3">
              <h3 className="text-black font-bold text-xl lg:text-[26px] font-nunito">
                Эцэг эхтэй холбогдох
              </h3>
              <p className="text-black text-lg lg:text-2xl font-normal font-nunito leading-relaxed">
                Хичээл бүрт SMS/Имэйлээр хүүхдийнхээ явцыг мэдэх. Эцэг эх
                хүүхдийнхээ хичээлд оролцож, амжилтыг нь хамтдаа баярлан,
                дэмжлэгийг нь цаг тухайд нь үзүүлэх боломжтой.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
