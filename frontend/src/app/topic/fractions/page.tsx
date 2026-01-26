import type { Metadata } from "next";
import FractionsContent from "@/src/components/topic/FractionsContent";
import { fractionLessons } from "@/src/data/lessons/fractions";

export const metadata: Metadata = {
  title: "Энгийн бутархай - Математикийн хичээл",
  description: `Энгийн бутархайн бодлогыг шат дараатай эзэмшиж, хөгжилтэй тоглоомын аргаар суралцаарай. ${fractionLessons.length} хичээл, интерактив дасгал.`,
  openGraph: {
    title: "Энгийн бутархай - Happy Academy",
    description:
      "Энгийн бутархайн бодлогыг шат дараатай эзэмшиж, хөгжилтэй тоглоомын аргаар суралцаарай.",
    images: ["/Fraction.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Энгийн бутархай - Happy Academy",
    description:
      "Энгийн бутархайн бодлогыг шат дараатай эзэмшиж, хөгжилтэй тоглоомын аргаар суралцаарай.",
    images: ["/Fraction.png"],
  },
};

export default function FractionsPage() {
  return <FractionsContent />;
}
