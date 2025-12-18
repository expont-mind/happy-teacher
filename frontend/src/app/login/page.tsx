"use client";

import { useState } from "react";
import { Mail, Hash } from "lucide-react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import EmailLoginForm from "@/src/components/auth/forms/EmailLoginForm";
import CodeLoginForm from "@/src/components/auth/forms/CodeLoginForm";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, selectProfile } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      setEmail("");
      setPassword("");
      router.push("/profiles");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("children")
        .select("name, id, parent_id")
        .eq("pin_code", pin)
        .maybeSingle();

      if (error || !data) {
        alert("Буруу код байна!");
        setLoading(false);
        return;
      }

      selectProfile({
        id: data.id,
        name: data.name,
        type: "child",
        parentId: data.parent_id,
      });

      setPin("");
      router.push("/");
    } catch (err) {
      console.error("Error verifying pin:", err);
      alert("Алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-77px)] flex justify-center items-center bg-[#FFFAF7]">
      <div className="max-w-[382px] w-full flex flex-col gap-9">
        <div className="flex p-1 bg-[#E5E5E5] rounded-[16px]">
          <button
            onClick={() => setLoginMethod("email")}
            className={`flex-1 py-2 px-4 rounded-[12px] font-extrabold font-nunito text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMethod === "email"
                ? "bg-white text-[#58CC02] shadow-sm"
                : "text-[#858480]"
            }`}
          >
            <Mail size={16} />
            Имэйл
          </button>
          <button
            onClick={() => setLoginMethod("code")}
            className={`flex-1 py-2 px-4 rounded-[12px] font-extrabold font-nunito text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMethod === "code"
                ? "bg-white text-[#58CC02] shadow-sm"
                : "text-[#858480]"
            }`}
          >
            <Hash size={16} />
            Код
          </button>
        </div>

        {loginMethod === "email" ? (
          <EmailLoginForm
            email={email}
            password={password}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleEmailLogin}
          />
        ) : (
          <CodeLoginForm
            pin={pin}
            loading={loading}
            onPinChange={setPin}
            onSubmit={handleCodeLogin}
          />
        )}
      </div>
    </div>
  );
}
