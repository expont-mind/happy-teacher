import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бүртгүүлэх",
  description: "Happy Academy-д бүртгүүлэх. Эцэг эхийн болон хүүхдийн мэдээлэл оруулах.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
