"use client";

import { useState, useRef, useEffect } from "react";
import { Baby, Lock, RefreshCw } from "lucide-react";

interface PinLoginProps {
  profileName: string;
  profileAvatar: string;
  onVerify: (pin: string) => Promise<boolean>;
  onSuccess: () => void;
  onBack: () => void;
}

export default function PinLogin({
  profileName,
  profileAvatar,
  onVerify,
  onSuccess,
  onBack,
}: PinLoginProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = async (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Check if all 4 digits are entered
    if (index === 3 && value) {
      const enteredPin = newPin.join("");
      await handleVerify(enteredPin);
    }
  };

  const handleVerify = async (enteredPin: string) => {
    setVerifying(true);
    try {
      const isValid = await onVerify(enteredPin);
      if (isValid) {
        onSuccess();
      } else {
        handleError();
      }
    } catch (err) {
      handleError();
    } finally {
      setVerifying(false);
    }
  };

  const handleError = () => {
    setError(true);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    }, 500);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newPin = pastedData.split("").concat(["", "", "", ""]).slice(0, 4);
      setPin(newPin);
      if (pastedData.length === 4) {
        await handleVerify(pastedData);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-bounce-in">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 duo-button duo-button-gray px-4 py-2 text-sm"
        >
          ← Буцах
        </button>

        {/* Profile Card */}
        <div className="duo-card p-8">
          {/* Profile Avatar */}
          <div className="text-center mb-6">
            <div className="inline-block relative">
              <div className="w-32 h-32 bg-linear-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-400 shadow-lg">
                <span className="text-6xl">{profileAvatar}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-3 border-4 border-white shadow-lg">
                <Baby size={24} className="text-white" />
              </div>
            </div>
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: "var(--duo-gray-900)" }}
            >
              {profileName}
            </h2>
            <p
              className="font-bold flex items-center justify-center gap-2"
              style={{ color: "var(--duo-gray-700)" }}
            >
              <Lock size={18} />4 оронтой кодоо оруулна уу
            </p>
          </div>

          {/* PIN Input */}
          <div
            className={`flex gap-4 justify-center mb-6 ${
              shake ? "animate-shake" : ""
            }`}
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={verifying}
                className={`w-16 h-20 text-center text-3xl font-black rounded-2xl border-4 focus:outline-none transition-all ${
                  error
                    ? "border-red-400 bg-red-50 text-red-600"
                    : digit
                    ? "border-yellow-400 bg-yellow-50 text-gray-800"
                    : "border-gray-300 bg-white text-gray-800 focus:border-yellow-400"
                } ${verifying ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            ))}
          </div>

          {/* Loading Indicator */}
          {verifying && (
            <div className="flex justify-center mb-4">
              <RefreshCw className="animate-spin text-yellow-500" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-red-500 font-bold text-lg">
                ❌ Буруу код байна! Дахин оролдоно уу.
              </p>
            </div>
          )}

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500 font-semibold">
              💡 Эцэг эхдээ асуугаарай
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
