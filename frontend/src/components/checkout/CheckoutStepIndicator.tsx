"use client";

import { Check, Truck, CreditCard, PartyPopper } from "lucide-react";

type CheckoutStep = "delivery" | "payment" | "success";

interface CheckoutStepIndicatorProps {
  currentStep: CheckoutStep;
}

const steps: { key: CheckoutStep; label: string; icon: typeof Truck }[] = [
  { key: "delivery", label: "Хүргэлт", icon: Truck },
  { key: "payment", label: "Төлбөр", icon: CreditCard },
  { key: "success", label: "Баярлалаа", icon: PartyPopper },
];

const stepIndex = (step: CheckoutStep) =>
  steps.findIndex((s) => s.key === step);

export const CheckoutStepIndicator = ({
  currentStep,
}: CheckoutStepIndicatorProps) => {
  const currentIdx = stepIndex(currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-[#58CC02] text-white"
                    : isActive
                      ? "bg-[#58CC02] text-white shadow-[0_4px_0_#46A302]"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <span
                className={`text-xs font-bold font-nunito ${
                  isCompleted || isActive ? "text-[#58CC02]" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 ${
                  idx < currentIdx ? "bg-[#58CC02]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
