import { CheckCircle, Mail } from "lucide-react";

interface RegistrationSuccessProps {
  generatedCode: string;
  onContinue: () => void;
}

export default function RegistrationSuccess({
  generatedCode,
  onContinue,
}: RegistrationSuccessProps) {
  return (
    <div className="h-[calc(100vh-75px)] bg-[#FFFAF7] flex items-center justify-center p-4">
      <div className="max-w-[414px] w-full px-7 py-9 flex flex-col gap-8 items-center bg-white rounded-[20px]">
        <div className="flex flex-col gap-[10px] items-center">
          <CheckCircle size={50} className="text-[#58CC02] mx-auto" />
          <p className="text-2xl font-extrabold text-[#58CC02] leading-9 font-nunito">
            Амжилттай бүртгэгдлээ!
          </p>
        </div>

        <div className="w-full bg-[#FFF9E6] border-2 border-[#FFD700] rounded-2xl p-4 flex gap-3">
          <Mail size={24} className="text-[#D97706] shrink-0 mt-1" />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-[#333333] font-nunito">
              Имэйлээ баталгаажуулна уу
            </p>
            <p className="text-xs font-semibold text-[#858480] font-nunito">
              Таны имэйл хаяг руу баталгаажуулах холбоос илгээсэн. Имэйлээ
              шалгаад баталгаажуулна уу.
            </p>
          </div>
        </div>

        <div className="w-full bg-[#F0F9FF] border-2 border-[#58CC02] rounded-2xl p-4">
          <p className="text-sm font-bold text-[#333333] font-nunito mb-2 text-center">
            Хүүхдийн нэвтрэх код
          </p>
          <p className="text-[#58CC02] font-bold text-5xl font-nunito text-center">
            {generatedCode}
          </p>
          <p className="text-xs font-semibold text-[#858480] font-nunito text-center mt-2">
            Энэ кодыг хадгалж аваарай! Хүүхэд энэ кодоор нэвтрэх болно.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="bg-[#58CC02] w-full shadow-[0_4px_0_#46A302] active:shadow-none active:translate-y-1 transition-all rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer uppercase tracking-wide"
        >
          Нэвтрэх хуудас руу очих
        </button>
      </div>
    </div>
  );
}
