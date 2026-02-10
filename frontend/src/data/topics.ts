import { fractionLessons } from "@/src/data/lessons/fractions";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";

export const TOPICS_DATA = [
  {
    key: "fractions",
    title: "Энгийн бутархай",
    description:
      "Энгийн бутархайн бодлогыг шат дараатай эзэмшиж, хөгжилтэй тоглоомын аргаар суралцаарай",
    gradeText: "Таны хүүхдэд зориулсан",
    gradeRange: null, // Хүүхдийн сонгосон ангийг харуулна
    icon: "/svg/ControllerBlack.tiff",
    link: "/topic/fractions",
    lessonCount: fractionLessons.length,
    price: 29900,
    image: "/Fraction.png",
    planet: "/Planet.png",
  },
  {
    key: "multiplication",
    title: "Хүрд",
    description:
      "Хүрдийг хялбар аргаар цээжилснээр тоо бодох хурд нэмэгдэж, математикийн хичээлд дурлах эхлэл тавигдана",
    gradeText: "Таны хүүхдэд зориулсан",
    gradeRange: "1-5", // Тогтмол 1-5-р анги
    icon: "/svg/Calculator.svg",
    link: "/topic/multiplication",
    lessonCount: multiplicationLessons.length,
    price: 29900,
    image: "/Multiplication.png",
    planet: "",
  },
];
