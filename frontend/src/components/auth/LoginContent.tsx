"use client";

import { useState } from "react";
import { UserCircle, Baby } from "lucide-react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import EmailLoginForm from "@/src/components/auth/forms/EmailLoginForm";
import CodeLoginForm from "@/src/components/auth/forms/CodeLoginForm";

export default function LoginContent() {
  const [loginMethod, setLoginMethod] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, selectProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      setEmail("");
      setPassword("");
      const profilesUrl = redirectParam
        ? `/profiles?redirect=${encodeURIComponent(redirectParam)}`
        : "/profiles";
      router.push(profilesUrl);
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
        .select("name, id, parent_id, avatar")
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
        avatar: data.avatar,
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
        <div className="flex gap-3 bg-[#F3F4F6] rounded-2xl p-1.5">
          <button
            onClick={() => setLoginMethod("email")}
            className={`flex-1 py-2.5 rounded-xl font-extrabold font-nunito text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMethod === "email"
                ? "bg-white text-[#58CC02] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <UserCircle size={16} />
            Эцэг эх
          </button>
          <button
            onClick={() => setLoginMethod("code")}
            className={`flex-1 py-2.5 rounded-xl font-extrabold font-nunito text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMethod === "code"
                ? "bg-white text-[#58CC02] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Baby size={16} />
            Хүүхэд
          </button>
        </div>

        <div className="grid *:col-start-1 *:row-start-1">
          <div className={loginMethod === "email" ? "" : "invisible"}>
            <EmailLoginForm
              email={email}
              password={password}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleEmailLogin}
              redirectParam={redirectParam}
            />
          </div>
          <div className={loginMethod === "code" ? "" : "invisible"}>
            <CodeLoginForm
              pin={pin}
              loading={loading}
              onPinChange={setPin}
              onSubmit={handleCodeLogin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
