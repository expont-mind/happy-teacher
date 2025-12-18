export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  color: string;
  codePrefix: string;
}

export const COUPONS: Coupon[] = [
  {
    id: "game_time_30",
    title: "Тоглоомын цаг",
    description: "30 минут тоглох эрх",
    cost: 100,
    image: "/svg/Joystick.svg", // Need to verify if this exists or use generic
    color: "bg-blue-500",
    codePrefix: "GAME",
  },
  {
    id: "ice_cream",
    title: "Зайрмаг",
    description: "Дуртай зайрмагаа авах эрх",
    cost: 300,
    image: "/svg/IceCream.svg",
    color: "bg-pink-500",
    codePrefix: "ICE",
  },
  {
    id: "movie_night",
    title: "Кино үзэх",
    description: "Гэр бүлээрээ кино үзэх эрх",
    cost: 500,
    image: "/svg/Popcorn.svg",
    color: "bg-orange-500",
    codePrefix: "MOVIE",
  },
  {
    id: "toy_small",
    title: "Жижиг тоглоом",
    description: "10,000₮ дотор тоглоом авах",
    cost: 1000,
    image: "/svg/Toy.svg",
    color: "bg-purple-500",
    codePrefix: "TOY",
  },
];
