"use client";

import { useState } from "react";
import { X, Baby, RefreshCw, Copy } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { toast } from "sonner";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onChildAdded?: () => void;
}

export default function AddChildModal({
  isOpen,
  onClose,
  userId,
  onChildAdded,
}: AddChildModalProps) {
  const [name, setName] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "success">("input");
  const supabase = createClient();

  if (!isOpen) return null;

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const pin = generatePin();

    try {
      const { error } = await supabase.from("children").insert({
        parent_id: userId,
        name: name,
        pin_code: pin,
      });

      if (error) throw error;

      setGeneratedPin(pin);
      setStep("success");
      toast.success("Хүүхдийн бүртгэл амжилттай үүслээ!");
      onChildAdded?.();
    } catch (error: any) {
      console.error("Error adding child:", error);
      toast.error("Алдаа гарлаа: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPin = () => {
    navigator.clipboard.writeText(generatedPin);
    toast.success("PIN код хуулагдлаа!");
  };

  const handleClose = () => {
    setName("");
    setGeneratedPin("");
    setStep("input");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} className="text-gray-500" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-4">
              <Baby size={40} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">
              {step === "input" ? "Хүүхэд нэмэх" : "Амжилттай!"}
            </h2>
            <p className="text-gray-600 font-medium mt-2">
              {step === "input"
                ? "Хүүхдийнхээ нэрийг оруулаад PIN код үүсгээрэй"
                : "Энэ кодыг хүүхэддээ өгч нэвтрүүлээрэй"}
            </p>
          </div>

          {step === "input" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Хүүхдийн нэр
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Жишээ: Ананд"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all font-bold text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>
                    <span>Үүсгэх</span>
                    <Baby size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-300">
                <p className="text-sm font-bold text-gray-500 mb-2">
                  Нэвтрэх PIN код
                </p>
                <div className="text-5xl font-black text-gray-800 tracking-widest mb-4">
                  {generatedPin}
                </div>
                <button
                  onClick={copyPin}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Copy size={16} />
                  <span>Хуулах</span>
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg transform active:scale-95 transition-all"
              >
                Болсон
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
