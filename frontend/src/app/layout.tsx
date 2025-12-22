import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/src/components/navigations/Header";
import { AuthProvider } from "@/src/components/auth";
import { TutorialProvider, TutorialOverlay } from "@/src/components/tutorial";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Happy Academy - Математик сурах хөгжилтэй арга",
  description:
    "Хүүхдүүдэд зориулсан математикийн интерактив сургалтын платформ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={`${geistMono.variable} ${nunito.variable} antialiased`}>
        <AuthProvider>
          <TutorialProvider>
            <div className="w-full min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-[73px] w-full bg-white border-b border-[#0C0A0126]" />
                }
              >
                <Header />
              </Suspense>

              <main>{children}</main>
            </div>
            <TutorialOverlay />
            <Toaster richColors position="top-right" />
          </TutorialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
