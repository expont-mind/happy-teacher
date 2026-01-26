import type { Metadata } from "next";
import TopicsContent from "@/src/components/topic/TopicsContent";

export const metadata: Metadata = {
  title: "Хичээлүүд - Математикийн сэдвүүд",
  description:
    "Энгийн бутархай, хүрд болон бусад математикийн сэдвүүдийг интерактив аргаар суралцаарай. Хүүхдүүдэд зориулсан хөгжилтэй хичээлүүд.",
  openGraph: {
    title: "Хичээлүүд - Happy Academy",
    description:
      "Математикийн сэдвүүдийг интерактив аргаар суралцаарай. Хүүхдүүдэд зориулсан хөгжилтэй хичээлүүд.",
  },
};

export default function TopicsPage() {
  return <TopicsContent />;
}
