import type { Metadata } from "next";
import MultiplicationContent from "@/src/components/topic/MultiplicationContent";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";

export const metadata: Metadata = {
  title: "Хүрд - Үржвэрийн хүснэгт",
  description: `Хүрдийг хялбар аргаар цээжилснээр тоо бодох хурд нэмэгдэж, математикийн хичээлд дурлах эхлэл тавигдана. ${multiplicationLessons.length} хичээл.`,
  openGraph: {
    title: "Хүрд - Happy Academy",
    description:
      "Хүрдийг хялбар аргаар цээжилснээр тоо бодох хурд нэмэгдэж, математикийн хичээлд дурлах эхлэл тавигдана.",
    images: ["/Multiplication.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Хүрд - Happy Academy",
    description:
      "Хүрдийг хялбар аргаар цээжилснээр тоо бодох хурд нэмэгдэж, математикийн хичээлд дурлах эхлэл тавигдана.",
    images: ["/Multiplication.png"],
  },
};

export default function MultiplicationPage() {
  return <MultiplicationContent />;
}
