import { fractionLessons } from "@/src/data/lessons/fractions";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";

export const TOPICS_DATA = [
  {
    title: "Бутархай",
    description: "Бутархай тоонуудтай танилцаж, хөгжилтэй аргаар суралцаарай.",
    icon: "/svg/Strategy.svg",
    link: "/topic/fractions",
    lessonCount: fractionLessons.length,
    price: 3,
    image: "/Fraction.png",
    planet: "/Planet.png",
  },
  {
    title: "Үржих",
    description: "Үржих хүрдээ цээжилж, тоо бодох хурдаа нэмэгдүүлээрэй.",
    icon: "/svg/Calculator.svg",
    link: "/topic/multiplication",
    lessonCount: multiplicationLessons.length,
    price: 3,
    image: "/Multiplication.png",
    planet: "",
  },
];
