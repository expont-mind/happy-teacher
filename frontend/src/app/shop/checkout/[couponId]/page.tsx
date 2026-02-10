import { Suspense } from "react";
import { CheckoutPage } from "@/src/features/CheckoutPage";

export default async function CheckoutRoute({
  params,
}: {
  params: Promise<{ couponId: string }>;
}) {
  const { couponId } = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[calc(100vh-77px)] flex justify-center items-center bg-[#FFFAF7]">
          <video src="/bouncing-loader.webm" autoPlay loop muted playsInline className="w-40 h-40" />
        </div>
      }
    >
      <CheckoutPage couponId={couponId} />
    </Suspense>
  );
}
