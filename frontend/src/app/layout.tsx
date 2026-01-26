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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://happyacademy.mn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Happy Academy - Математик сурах хөгжилтэй арга",
    template: "%s | Happy Academy",
  },
  description:
    "Хүүхдүүдэд зориулсан математикийн интерактив сургалтын платформ. Бодлого бод, зураг буд, оноо цуглуулаарай!",
  keywords: [
    "математик",
    "хүүхдийн боловсрол",
    "интерактив сургалт",
    "бутархай",
    "хүрд",
    "монгол хүүхэд",
    "тоглоом",
    "сурах",
  ],
  authors: [{ name: "Happy Academy" }],
  creator: "ExpontMind",
  publisher: "Happy Academy",
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: siteUrl,
    siteName: "Happy Academy",
    title: "Happy Academy - Математик сурах хөгжилтэй арга",
    description:
      "Хүүхдүүдэд зориулсан математикийн интерактив сургалтын платформ. Бодлого бод, зураг буд, оноо цуглуулаарай!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Happy Academy - Математикийн интерактив сургалт",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy Academy - Математик сурах хөгжилтэй арга",
    description:
      "Хүүхдүүдэд зориулсан математикийн интерактив сургалтын платформ",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: "your-google-verification-code",
  },
};

// Static JSON-LD structured data for SEO (safe - no user input)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Happy Academy",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/svg/GraduationCap.svg`,
      },
      sameAs: ["https://www.facebook.com/happymathmn"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+976-88086681",
        contactType: "customer service",
        availableLanguage: "Mongolian",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Happy Academy",
      description:
        "Хүүхдүүдэд зориулсан математикийн интерактив сургалтын платформ",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "mn",
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#educationalOrganization`,
      name: "Happy Academy",
      url: siteUrl,
      description:
        "Хүүхдүүдэд зориулсан математикийн интерактив сургалтын платформ",
      areaServed: {
        "@type": "Country",
        name: "Mongolia",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
