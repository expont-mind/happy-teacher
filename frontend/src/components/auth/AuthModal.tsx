"use client";

import { useState, useRef } from "react";
import PinLogin from "./PinLogin";
import AdultLogin from "./AdultLogin";
import { Baby, UserCircle, X } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { useAuth } from "@/src/components/auth";

import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthStep = "choice" | "pin-login" | "adult-login";

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>("choice");
  const [childName, setChildName] = useState("Хүүхэд");
  const [childId, setChildId] = useState("");
  const [childParentId, setChildParentId] = useState("");
  const childDataRef = useRef<{
    id: string;
    name: string;
    parentId: string;
  } | null>(null);
  const { selectProfile } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleChildSelect = () => {
    setStep("pin-login");
  };

  const handleAdultSelect = () => {
    setStep("adult-login");
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("children")
        .select("name, id, parent_id")
        .eq("pin_code", pin)
        .maybeSingle();

      if (error || !data) return false;

      setChildName(data.name);
      setChildId(data.id);
      setChildParentId(data.parent_id);

      // Store in ref for immediate access in handlePinSuccess
      childDataRef.current = {
        id: data.id,
        name: data.name,
        parentId: data.parent_id,
      };

      return true;
    } catch (err) {
      console.error("Error verifying pin:", err);
      return false;
    }
  };

  const handlePinSuccess = () => {
    if (childDataRef.current) {
      selectProfile({
        id: childDataRef.current.id,
        name: childDataRef.current.name,
        type: "child",
        parentId: childDataRef.current.parentId,
      });
    }
    onSuccess?.();
    onClose();
    setStep("choice");
  };

  const handleAdultLoginSuccess = () => {
    // Adult login is handled in AdultLogin component via signIn which sets the profile
    onSuccess?.();
    onClose();
    setStep("choice");
    router.push("/profiles");
  };

  const handleBack = () => {
    setStep("choice");
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-white">
      {step === "choice" && (
        <div className="min-h-screen bg-linear-to-b from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center p-4 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer z-10"
          >
            <X size={32} className="text-gray-500" />
          </button>

          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-12 animate-bounce-in">
              <h1
                className="text-5xl md:text-6xl font-black mb-4 text-shadow-lg"
                style={{ color: "var(--duo-green)" }}
              >
                Хэн сурч байна?
              </h1>
              <p
                className="text-xl font-bold"
                style={{ color: "var(--duo-gray-700)" }}
              >
                Төрлөө сонгоно уу 🎉
              </p>
            </div>

            {/* Choice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <button
                onClick={handleAdultSelect}
                className="group cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="duo-card p-12 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-linear-to-br from-blue-400 to-purple-400 rounded-full p-8 border-4 border-blue-400 shadow-lg group-hover:scale-110 transition-transform">
                      <UserCircle
                        size={80}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                  <h2
                    className="text-4xl font-black mb-3"
                    style={{ color: "var(--duo-blue)" }}
                  >
                    Том хүн
                  </h2>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "var(--duo-gray-700)" }}
                  >
                    Имэйл, нууц үгээр нэвтрэх
                  </p>
                </div>
              </button>

              <button
                onClick={handleChildSelect}
                className="group cursor-pointer transform transition-all hover:scale-105"
              >
                <div className="duo-card p-12 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-linear-to-br from-yellow-200 to-orange-200 rounded-full p-8 border-4 border-yellow-400 shadow-lg group-hover:scale-110 transition-transform">
                      <Baby
                        size={80}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                  <h2
                    className="text-4xl font-black mb-3"
                    style={{ color: "var(--duo-yellow-dark)" }}
                  >
                    Хүүхэд
                  </h2>
                  <p
                    className="text-lg font-bold"
                    style={{ color: "var(--duo-gray-700)" }}
                  >
                    4 оронтой кодоор нэвтрэх
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "adult-login" && (
        <AdultLogin onSuccess={handleAdultLoginSuccess} onBack={handleBack} />
      )}

      {step === "pin-login" && (
        <PinLogin
          profileName={childName}
          profileAvatar="👶"
          onVerify={verifyPin}
          onSuccess={handlePinSuccess}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
