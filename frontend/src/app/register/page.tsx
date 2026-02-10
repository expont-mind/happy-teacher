"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { useRouter, useSearchParams } from "next/navigation";
import ParentInfoForm from "@/src/components/auth/forms/ParentInfoForm";
import ChildInfoForm from "@/src/components/auth/forms/ChildInfoForm";
import RegistrationSuccess from "@/src/components/auth/forms/RegistrationSuccess";
import { showErrorToast } from "@/src/components/ui/CharacterToast";
import Skeleton from "@/src/components/ui/Skeleton";

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

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = (parseInt(searchParams.get("step") ?? "1") || 1) as 1 | 2;
  const redirectParam = searchParams.get("redirect");

  const setStep = (newStep: 1 | 2) => {
    const params = new URLSearchParams({ step: String(newStep) });
    if (redirectParam) params.set("redirect", redirectParam);
    router.push(`/register?${params.toString()}`);
  };

  const [loading, setLoading] = useState(false);

  // Step 1 - Parent Info
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 - Child Info
  const [childName, setChildName] = useState("");
  const [childIcon, setChildIcon] = useState(CHILD_ICONS[0]);
  const [childAge, setChildAge] = useState<number>(9);
  const [childGrade, setChildGrade] = useState<number>(4);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const { signUp, supabase } = useAuth();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const generatePinCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signUpData = await signUp(
        email,
        password,
        email.split("@")[0],
        false,
        phone
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

      const { data: createdChild, error } = await supabase
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
        showErrorToast(`Алдаа: ${error.message}`);
        return;
      }

      // Link any guest orders made with this phone number to the new child
      if (phone && createdChild?.id) {
        const { error: linkError } = await supabase
          .from("child_coupons")
          .update({ child_id: createdChild.id })
          .eq("phone", phone);

        if (linkError) {
          console.warn("Failed to link guest orders:", linkError);
        } else {
          // Clear guest localStorage
          localStorage.removeItem(`guest_orders_${phone}`);
        }
      }

      setGeneratedCode(pinCode);
    } catch (error: any) {
      if (error.message !== "Parent registration failed") {
      }
      showErrorToast("Бүртгэл үүсгэхэд алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  if (generatedCode) {
    return (
      <RegistrationSuccess
        generatedCode={generatedCode}
        onContinue={() => {
          const loginUrl = redirectParam
            ? `/login?redirect=${encodeURIComponent(redirectParam)}`
            : "/login";
          router.push(loginUrl);
        }}
      />
    );
  }

  return (
    <div className="w-full h-[calc(100vh-77px)] flex justify-center items-center bg-[#FFFAF7]">
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center bg-[#FFFAF7]">
          <div className="max-w-[382px] w-full flex flex-col gap-9">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
