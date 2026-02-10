import type { Metadata } from "next";
import { Suspense } from "react";
import LoginContent from "@/src/components/auth/LoginContent";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  description: "Happy Academy-д нэвтрэх. Имэйл эсвэл хүүхдийн кодоор нэвтрэх.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
