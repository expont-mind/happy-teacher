import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="w-full flex justify-center bg-[#4A4A4A] py-20">
      <div className="max-w-[1280px] w-full flex flex-col gap-20">
        <div className="flex gap-8 w-full">
          <div className="max-w-[316px] w-full">
            <div className="flex gap-[10px] items-center py-1.5">
              <Image
                src="/svg/GraduationCap.svg"
                alt="Icon"
                width={30}
                height={30}
              />
              <p className="text-base font-extrabold text-white font-nunito">
                HAPPY TEACHER
              </p>
            </div>
          </div>

          <div className="w-full flex gap-[104px]">
            <div className="flex flex-col gap-[18px] w-full">
              <p className="text-base font-bold text-[#F3F4F6] font-nunito">
                Бүтээгдэхүүн
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Хичээлүүд
                </p>
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Тоглоомууд
                </p>
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Үнийн санал
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[18px] w-full">
              <p className="text-base font-bold text-[#F3F4F6] font-nunito">
                Компани
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Бидний тухай
                </p>
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Багш нар
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-[18px] w-full">
              <p className="text-base font-bold text-[#F3F4F6] font-nunito">
                Дэмжлэг
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Тусламж
                </p>
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  Холбоо барих
                </p>
                <p className="text-sm font-semibold text-[#F3F4F6] font-nunito">
                  FAQ
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-[316px] w-full">
            <div className="flex gap-[10px] items-center justify-end py-1.5">
              <Image
                src="/svg/Instagram.svg"
                alt="Icon"
                width={24}
                height={24}
              />
              <Image
                src="/svg/Facebook.svg"
                alt="Icon"
                width={24}
                height={24}
              />
              <Image src="/svg/Youtube.svg" alt="Icon" width={24} height={24} />
            </div>
          </div>
        </div>

        <div className="border-t border-[#858480] pt-8 w-full flex justify-center">
          <div className="flex items-center gap-6">
            <p className="text-sm font-normal text-[#B6B5B2] font-nunito">
              © 2025 Happy Teacher
            </p>
            <p className="text-sm font-normal text-[#B6B5B2] font-nunito underline leading-[21px]">
              Privacy policy
            </p>
            <p className="text-sm font-normal text-[#B6B5B2] font-nunito underline leading-[21px]">
              Terms of service
            </p>
            <p className="text-sm font-normal text-[#B6B5B2] font-nunito underline leading-[21px]">
              Cookies settings
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
