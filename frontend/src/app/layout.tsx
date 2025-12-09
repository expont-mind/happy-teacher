import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/src/components/navigations/Header";
import { Footer } from "@/src/components/navigations/Footer";
import { AuthProvider } from "@/src/components/auth";
import { TutorialProvider, TutorialOverlay } from "@/src/components/tutorial";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Happy Teacher - Математик сурах хөгжилтэй арга",
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
      <body className={` ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <TutorialProvider>
            <div className="w-full min-h-screen bg-white">
              <Header />

              <main>{children}</main>

              <Footer />
            </div>
            <TutorialOverlay />
            <Toaster richColors position="top-right" />
          </TutorialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
