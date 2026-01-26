import type { Metadata } from "next";
import HelpContent from "@/src/components/help/HelpContent";

export const metadata: Metadata = {
  title: "Тусламж - Happy Academy",
  description:
    "Happy Academy гэж юу вэ? Хүүхдүүдэд математикийг ойлгомжтой, хөгжилтэй аргаар заах онлайн сургалтын платформ. Түгээмэл асуултууд.",
  openGraph: {
    title: "Тусламж - Happy Academy",
    description:
      "Happy Academy гэж юу вэ? Хүүхдүүдэд математикийг ойлгомжтой, хөгжилтэй аргаар заах онлайн сургалтын платформ.",
  },
};

export default function HelpPage() {
  return <HelpContent />;
}
