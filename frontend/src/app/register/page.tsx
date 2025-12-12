"use client";

import { useState } from "react";
import { useAuth } from "@/src/components/auth";
import { useRouter, useSearchParams } from "next/navigation";
import ParentInfoForm from "@/src/components/auth/forms/ParentInfoForm";
import ChildInfoForm from "@/src/components/auth/forms/ChildInfoForm";
import RegistrationSuccess from "@/src/components/auth/forms/RegistrationSuccess";
import { toast } from "sonner";

export const CHILD_ICONS = [
  "/svg/BirdBlack.svg",
  "/svg/Rabbit.svg",
  "/svg/Butterfly.svg",
  "/svg/Cat.svg",
  "/svg/Cow.svg",
  "/svg/Dog.svg",
  "/svg/Horse.svg",
  "/svg/Fish.svg",
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = (parseInt(searchParams.get("step") ?? "1") || 1) as 1 | 2;

  const setStep = (newStep: 1 | 2) => {
    router.push(`/register?step=${newStep}`);
  };

  const [loading, setLoading] = useState(false);

  // Step 1 - Parent Info
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 - Child Info
  const [childName, setChildName] = useState("");
  const [childIcon, setChildIcon] = useState(CHILD_ICONS[0]);
  const [childAge, setChildAge] = useState<number>(6);
  const [childGrade, setChildGrade] = useState<number>(1);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const { signUp, supabase } = useAuth();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const generatePinCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signUpData = await signUp(
        email,
        password,
        email.split("@")[0],
        false
      );

      if (!signUpData?.user?.id) {
        throw new Error("Parent registration failed");
      }

      let session = signUpData.session;
      if (!session) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.warn("Auto-login failed:", signInError);
        } else {
          session = signInData.session;
        }
      }

      const newParentId = session?.user?.id || signUpData.user.id;

      const pinCode = generatePinCode();

      const { error } = await supabase
        .from("children")
        .insert({
          parent_id: newParentId,
          name: childName,
          avatar: childIcon,
          age: childAge,
          class: childGrade,
          pin_code: pinCode,
        })
        .select()
        .single();

      if (error) {
        console.error("Child insert error:", error);
        toast.error(`Алдаа: ${error.message}`);
        return;
      }

      setGeneratedCode(pinCode);
    } catch (error: any) {
      if (error.message !== "Parent registration failed") {
      }
      toast.error("Бүртгэл үүсгэхэд алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  if (generatedCode) {
    return (
      <RegistrationSuccess
        generatedCode={generatedCode}
        onContinue={() => router.push("/")}
      />
    );
  }

  return (
    <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center bg-[#FFFAF7]">
      <div className="max-w-[382px] w-full flex flex-col gap-9">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-full flex gap-2">
            <div
              className={`h-[6px] w-full rounded-full transition-all duration-300 ${
                step >= 1 ? "bg-[#58CC02]" : "bg-[#E5E5E5]"
              }`}
            />
            <div
              className={`h-[6px] w-full rounded-full transition-all duration-300 ${
                step >= 2 ? "bg-[#58CC02]" : "bg-[#E5E5E5]"
              }`}
            />
          </div>

          <p className="text-xs font-bold text-[#333333] font-nunito">
            Алхам {step} / 2
          </p>
        </div>

        {step === 1 ? (
          <ParentInfoForm
            phone={phone}
            email={email}
            password={password}
            loading={loading}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleStep1Submit}
          />
        ) : (
          <ChildInfoForm
            childName={childName}
            childIcon={childIcon}
            childAge={childAge}
            childGrade={childGrade}
            loading={loading}
            onNameChange={setChildName}
            onIconChange={setChildIcon}
            onAgeChange={setChildAge}
            onGradeChange={setChildGrade}
            onSubmit={handleStep2Submit}
          />
        )}
      </div>
    </div>
  );
}
