import { CheckCircle } from "lucide-react";

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

        <p className="text-[#FFD700] font-bold text-5xl font-nunito">
          {generatedCode}
        </p>

        <p className="text-sm font-semibold text-[#858480] font-nunito text-center">
          Энэ кодыг хадгалж аваарай! Хүүхэд энэ кодоор нэвтрэх болно.
        </p>

        <button
          onClick={onContinue}
          className="bg-[#58CC02] w-full border-b-4 border-[#46A302] rounded-2xl px-6 py-[10px] text-white font-bold text-lg font-nunito leading-7 cursor-pointer"
        >
          Үргэлжлүүлэх
        </button>
      </div>
    </div>
  );
}
