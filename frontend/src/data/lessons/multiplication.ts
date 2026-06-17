const CDN = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CDN_RAW = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;
const CDN_AUTO = `${CDN}/f_auto`;
const M = "happy-teacher/multiplication";

export type MultiplicationLesson = {
  id: string;
  title: string;
  introMessages?: { message: string; character: string }[]; // Array of messages with characters for random toasts
  mainImage: string;
  maskImage: string;
  backgroundImage: string;
  helpImage: string;
  helpVideoId?: string; // Optional video URL for help
  tableImage?: string; // Multiplication table image for hint
  palette: { color: string; label: string }[];
};

export const multiplicationLessons: MultiplicationLesson[] = [
  {
    id: "page-1",
    title: "2-ын хүрд",
    introMessages: [
      {
        message: "Hulk, харлаа? Энэ хүүхэд үнэхээр сайн будаж байна!",
        character: "iron-man",
      },
      {
        message: "Тийм ээ Tony! Hulk ийм сайн будаж чаддаггүй...",
        character: "hulk",
      },
      {
        message: "Гайхалтай! Чи бидний багт орох ёстой!",
        character: "iron-man",
      },
      {
        message: "HULK PROUD! Чи маш сайн хийж байна!",
        character: "hulk",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_1.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_1_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_1_background.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/2.png`,
    palette: [
      { color: "#3fbfff", label: "1" },
      { color: "#af4c0f", label: "2" },
      { color: "#ff66c4", label: "3" },
      { color: "#00bf63", label: "4" },
      { color: "#ffde59", label: "5" },
      { color: "#ff6d4d", label: "6" },
      { color: "#8f1eae", label: "8" },
      { color: "#4910bc", label: "10" },
    ],
  },
  {
    id: "page-2",
    title: "Халк",
    introMessages: [
      {
        message:
          "Ахмад аа, энэ хүүхдийн будалтыг хар! Яг л урлагийн бүтээл шиг байна!",
        character: "hulk",
      },
      {
        message:
          "Тийм ээ Hulk! Ийм авьяастай хүүхэд байхад бид санаа зовохгүй!",
        character: "captain-america",
      },
      {
        message: "T'Challa, чи ч гэсэн үз! Гайхалтай биш гэж үү?",
        character: "captain-america",
      },
      {
        message: "Wakanda-д ч ийм сайн будагч ховор! Чи онцгой!",
        character: "black-panther",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_2.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_2_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_2_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/2.png`,
    palette: [
      { color: "#af4c0f", label: "2" },
      { color: "#ff66c4", label: "3" },
      { color: "#00bf63", label: "4, 9" },
      { color: "#ffde59", label: "5" },
      { color: "#ff6d4d", label: "6" },
      { color: "#fbe2c1", label: "7" },
      { color: "#8f1eae", label: "8" },
      { color: "#4910bc", label: "10" },
      { color: "#9eff1f", label: "12" },
      { color: "#3fbffe", label: "14" },
      { color: "#ff3131", label: "16" },
    ],
  },
  {
    id: "page-3",
    title: "3-ын хүрд",
    introMessages: [
      {
        message: "Ахмад аа, энэ хүүхэд яг л чам шиг тууштай будаж байна!",
        character: "iron-man",
      },
      {
        message:
          "Тийм ээ Tony! Тэвчээр бол амжилтын түлхүүр гэдгийг сайн мэднэ!",
        character: "captain-america",
      },
      {
        message: "Бид хоёр ийм сайн будаж чадах уу даа? Ха-ха!",
        character: "iron-man",
      },
      {
        message: "Чи жинхэнэ баатар шиг ажиллаж байна! Бахархаж байна!",
        character: "captain-america",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_3.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_3_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_3_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/3.png`,
    palette: [
      { color: "#f3ce00", label: "1" },
      { color: "#ff751f", label: "3" },
      { color: "#3fbfff", label: "4" },
      { color: "#b174e7", label: "6" },
      { color: "#ff3131", label: "9" },
      { color: "#004aad", label: "12" },
      { color: "#684530", label: "15" },
      { color: "#ff66c4", label: "18" },
    ],
  },
  {
    id: "page-4",
    title: "Төмөр хүн",
    introMessages: [
      {
        message:
          "Tony, энэ хүүхдийг хар! Миний бамбайнаас ч илүү нарийн будаж байна!",
        character: "captain-america",
      },
      {
        message:
          "Тийм ээ Ахмад аа! JARVIS-ийн тооцооллоос ч илүү нарийвчлалтай!",
        character: "iron-man",
      },
      {
        message: "Thanos, чи ч гэсэн үз! Энэ хүүхэд ямар сайн вэ!",
        character: "captain-america",
      },
      {
        message: "Хм... Энэ хүүхэд үнэхээр авьяастай байна. Гайхалтай!",
        character: "thanos",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_4.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_4_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_4_background.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/3.png`,
    palette: [
      { color: "#ff751f", label: "3" },
      { color: "#b174e7", label: "6" },
      { color: "#00bf63", label: "7" },
      { color: "#3fbfff", label: "8" },
      { color: "#ff3131", label: "9" },
      { color: "#004aad", label: "12" },
      { color: "#684530", label: "15" },
      { color: "#7ed957", label: "16" },
      { color: "#ff66c4", label: "18" },
      { color: "#fff3c2", label: "21" },
      { color: "#95928d", label: "24" },
      { color: "#ff8e97", label: "27" },
    ],
  },
  {
    id: "page-5",
    title: "2,3-ын хүрд",
    introMessages: [
      {
        message: "Thor, энэ хүүхдийн өнгө сонголтыг хар! Яг л солонго шиг!",
        character: "black-panther",
      },
      {
        message: "Asgard-д ч ийм сайн урлагч ховор байдаг! Гайхалтай!",
        character: "thor",
      },
      {
        message: "Hulk, чи ч бас харж байна уу? Үнэхээр сайхан!",
        character: "thor",
      },
      {
        message: "Дайчид мориндоо!",
        character: "captain-america",
      },
      {
        message: "HULK SEE! HULK LIKE! Чи хамгийн шилдэг!",
        character: "hulk",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_5_test.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_5_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_5_background.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/2,3.png`,
    palette: [
      { color: "#9eff1f", label: "4" },
      { color: "#004aad", label: "6" },
      { color: "#ffe81a", label: "8" },
      { color: "#6cb61f", label: "9" },
      { color: "#9440dd", label: "10" },
      { color: "#ff751f", label: "12" },
      { color: "#00bf63", label: "14" },
      { color: "#fff3c1", label: "15" },
      { color: "#ff66c4", label: "16" },
      { color: "#ff3131", label: "18" },
      { color: "#3fbfff", label: "21" },
      { color: "#bfbfbf", label: "24" },
      { color: "#af4c0f", label: "27" },
    ],
  },
  {
    id: "page-6",
    title: "4-ын хүрд",
    introMessages: [
      {
        message: "Wolverine, энэ хүүхдийн тууштай байдлыг хар! Чам шиг!",
        character: "thanos",
      },
      {
        message:
          "Тийм ээ! Энэ хүүхэд миний adamantium сэтгэлтэй адил хатуужилтай!",
        character: "wolverine",
      },
      {
        message: "Ахмад аа, чи ч бас үзээч! Гайхалтай биш гэж үү?",
        character: "wolverine",
      },
      {
        message: "Тийм! Энэ хүүхэд жинхэнэ аварга болж байна!",
        character: "captain-america",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_6.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_6_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_6_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/4.png`,
    palette: [
      { color: "#3fbfff", label: "4" },
      { color: "#af4c0f", label: "8" },
      { color: "#00bf63", label: "12" },
      { color: "#bfbfbf", label: "16" },
      { color: "#004aad", label: "20" },
      { color: "#8c52ff", label: "24" },
    ],
  },
  {
    id: "page-7",
    title: "Машин",
    introMessages: [
      {
        message: "Steve, энэ хүүхэд хэн бэ? Яаж ийм сайн будаж байгаа юм?",
        character: "wolverine",
      },
      {
        message: "Би ч мэдэхгүй Logan, гэхдээ гайхалтай авьяастай!",
        character: "minecraft",
      },
      {
        message: "Tony, чи ч бас хар! Энэ бол урлагийн бүтээл!",
        character: "minecraft",
      },
      {
        message: "Вау! JARVIS, үүнийг бичлэг хий! Гайхалтай!",
        character: "iron-man",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_7.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_7_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_7_background.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/4.png`,
    palette: [
      { color: "#3fbfff", label: "4" },
      { color: "#af4c0f", label: "8" },
      { color: "#00bf63", label: "12" },
      { color: "#bfbfbf", label: "16" },
      { color: "#004aad", label: "20" },
      { color: "#8c52ff", label: "24" },
      { color: "#ff66c4", label: "28" },
      { color: "#ff751f", label: "32" },
      { color: "#eb0000", label: "36" },
    ],
  },
  {
    id: "page-8",
    title: "5-ын хүрд",
    introMessages: [
      {
        message: "Hulk, энэ хүүхэд чамаас ч илүү сайн будаж байна!",
        character: "minecraft",
      },
      {
        message: "HULK AGREE! Энэ хүүхэд гайхалтай! Hulk бахархаж байна!",
        character: "hulk",
      },
      {
        message: "T'Challa, чи ч гэсэн үз! Wakanda-д ч ийм авьяас ховор!",
        character: "hulk",
      },
      {
        message: "Үнэн! Энэ хүүхэд манай улсын эрдэнэс болох байлаа!",
        character: "black-panther",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_8.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_8_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_8_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/5.png`,
    palette: [
      { color: "#38b6ff", label: "10" },
      { color: "#bfbfbf", label: "15" },
      { color: "#ffe81a", label: "20" },
      { color: "#af4c0f", label: "25" },
      { color: "#9440dd", label: "30" },
      { color: "#3a4a9f", label: "35" },
    ],
  },
  {
    id: "page-9",
    title: "Ахмад америк",
    introMessages: [
      {
        message: "Thor, энэ хүүхдийн хурдыг хар! Mjolnir-ээс ч хурдан!",
        character: "iron-man",
      },
      {
        message: "Тийм ээ Stark! Энэ хүүхэд Asgard-ийн баатруудаас ч дээр!",
        character: "thor",
      },
      {
        message: "Thanos, чи ч гэсэн үз! Infinity Stone-гүйгээр ч чадвартай!",
        character: "thor",
      },
      {
        message: "Хм... Энэ хүүхэд үнэхээр онцгой. Бахархмаар!",
        character: "thanos",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_9.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_9_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_9_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/5.png`,
    palette: [
      { color: "#00bf63", label: "8" },
      { color: "#38b6ff", label: "10" },
      { color: "#bfbfbf", label: "15" },
      { color: "#9eff1f", label: "16" },
      { color: "#ffe81a", label: "20" },
      { color: "#af4c0f", label: "25" },
      { color: "#9440dd", label: "30" },
      { color: "#3a4a9f", label: "35" },
      { color: "#eb0000", label: "40" },
      { color: "#ff751f", label: "45" },
    ],
  },
  {
    id: "page-10",
    title: "4,5-ын хүрд",
    introMessages: [
      {
        message: "Wolverine, энэ хүүхдийн нарийвчлалыг хар! Гайхалтай!",
        character: "hulk",
      },
      {
        message: "Тийм ээ Hulk! Миний мэс шиг нарийн будаж байна!",
        character: "wolverine",
      },
      {
        message: "Ахмад аа, чи ч гэсэн үз! Энэ хүүхэд профессор болох нь!",
        character: "wolverine",
      },
      {
        message: "Тийм! Энэ хүүхдэд баярлалаа! Бид бахархаж байна!",
        character: "captain-america",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_10.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_10_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_10_background.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/4,5.png`,
    palette: [
      { color: "#00bf63", label: "8" },
      { color: "#38b6ff", label: "10" },
      { color: "#8ebfe7", label: "12" },
      { color: "#bfbfbf", label: "15" },
      { color: "#9eff1f", label: "16" },
      { color: "#ffe81a", label: "20" },
      { color: "#587654", label: "24" },
      { color: "#af4c0f", label: "25" },
      { color: "#ff66c4", label: "28" },
      { color: "#9440dd", label: "30" },
      { color: "#3a4a9f", label: "32" },
      { color: "#3a4a5f", label: "35" },
      { color: "#fff3c2", label: "36" },
      { color: "#eb0000", label: "40" },
      { color: "#ff751f", label: "45" },
    ],
  },
  {
    id: "page-11",
    title: "6-ын хүрд",
    introMessages: [
      {
        message: "Steve, энэ хүүхдийн будалтыг хар! Үнэхээр гайхалтай!",
        character: "thor",
      },
      {
        message: "Тийм ээ Thor! Энэ хүүхэд математикийн баатар болж байна!",
        character: "minecraft",
      },
      {
        message: "Tony, чи ч бас хар! JARVIS-аас ч илүү ухаалаг!",
        character: "minecraft",
      },
      {
        message: "Вау! Энэ хүүхдийг Avengers-т авах хэрэгтэй! Ха-ха!",
        character: "iron-man",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_11.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_11_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_11_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/6.png`,
    palette: [
      { color: "#fff3c2", label: "12" },
      { color: "#27b03b", label: "16" },
      { color: "#32b6fe", label: "18" },
      { color: "#7942ed", label: "24" },
      { color: "#00bf63", label: "30" },
      { color: "#ffe236", label: "36" },
      { color: "#6e442b", label: "42" },
    ],
  },
  {
    id: "page-12",
    title: "Танос",
    introMessages: [
      {
        message: "Hulk, энэ хүүхдийн хүчийг хар! Чам шиг хүчтэй!",
        character: "captain-america",
      },
      {
        message: "HULK IMPRESSED! Энэ хүүхэд Hulk-аас ч хүчтэй будаж байна!",
        character: "hulk",
      },
      {
        message: "T'Challa, чи ч бас үз! Бараг дуусч байна шүү дээ!",
        character: "hulk",
      },
      {
        message: "Гайхалтай! Wakanda Forever! Чи тэвчээртэй байгаарай!",
        character: "black-panther",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_12.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_12_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_12_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/6.png`,
    palette: [
      { color: "#fff3c2", label: "12" },
      { color: "#38b6ff", label: "18" },
      { color: "#7940ed", label: "24" },
      { color: "#00bf63", label: "30" },
      { color: "#ffe236", label: "36" },
      { color: "#366cff", label: "42" },
      { color: "#462c7a", label: "48" },
      { color: "#a13ed4", label: "54" },
    ],
  },
  {
    id: "page-13",
    title: "7-ын хүрд",
    introMessages: [
      {
        message:
          "Thanos, энэ хүүхдийг хар! Infinity Stone-гүйгээр ч гайхалтай!",
        character: "black-panther",
      },
      {
        message: "Хм... Энэ хүүхэд миний цуглуулгаас ч илүү үнэ цэнэтэй!",
        character: "thanos",
      },
      {
        message: "Wolverine, чи юу гэж бодож байна?",
        character: "thanos",
      },
      {
        message: "Энэ хүүхэд жинхэнэ аварга! Бид бүгд бахархаж байна!",
        character: "wolverine",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_13.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_13_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_13_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/7.png`,
    palette: [
      { color: "#9eff1f", label: "14" },
      { color: "#38b6ff", label: "15" },
      { color: "#7940ed", label: "21" },
      { color: "#4910bc", label: "28" },
      { color: "#ffe236", label: "35" },
      { color: "#ff751f", label: "42" },
      { color: "#af4c0f", label: "49" },
    ],
  },
  {
    id: "page-14",
    title: "Тор",
    introMessages: [
      {
        message: "Tony, энэ хүүхэд хамгийн хэцүү хэсгийг давж байна!",
        character: "thanos",
      },
      {
        message: "Гайхалтай! JARVIS, бичлэг хий! Энэ түүхэнд үлдэх мөч!",
        character: "iron-man",
      },
      {
        message: "Thor, чи ч бас хар! Asgard-д ч ийм зоригтой хүүхэд ховор!",
        character: "iron-man",
      },
      {
        message: "By Odin's beard! Энэ хүүхэд жинхэнэ баатар! Бууж өгөхгүй!",
        character: "thor",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_14.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_14_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_14_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/7.png`,
    palette: [
      { color: "#9eff1f", label: "14" },
      { color: "#38b6fe", label: "16" },
      { color: "#7940ed", label: "21" },
      { color: "#4910bc", label: "28" },
      { color: "#8ebfe7", label: "35" },
      { color: "#ff751f", label: "42" },
      { color: "#ffe236", label: "49" },
      { color: "#af4c0f", label: "56" },
      { color: "#ff0000", label: "63" },
    ],
  },
  {
    id: "page-15",
    title: "6,7-ын хүрд",
    introMessages: [
      {
        message: "Hulk, энэ хүүхэд амжилттай дууслаа! Бид бүгд бахархаж байна!",
        character: "wolverine",
      },
      {
        message:
          "HULK SO PROUD! Энэ хүүхэд жинхэнэ АВАРГА! HULK SMASH... with joy!",
        character: "hulk",
      },
      {
        message:
          "Ахмад аа, чи ч бас хар! Бид бүгд энэ хүүхдээр бахархаж байна!",
        character: "hulk",
      },
      {
        message: "Баяр хүргэе! Чи Avengers-ийн нэгэн адил ялалт байгууллаа! 🎉",
        character: "captain-america",
      },
    ],
    mainImage: `${CDN_RAW}/${M}/page_15.svg`,
    maskImage: `${CDN}/q_100,f_png/${M}/page_15_mask`,
    backgroundImage: `${CDN_AUTO}/${M}/page_15_background1.png`,
    helpImage: `${CDN_AUTO}/${M}/page_12_help.png`,
    tableImage: `${CDN_AUTO}/${M}/6,7.png`,
    palette: [
      { color: "#b9b9b9", label: "12" },
      { color: "#38b6ff", label: "14" },
      { color: "#9acd32", label: "18" },
      { color: "#366cff", label: "21" },
      { color: "#4910bc", label: "24" },
      { color: "#7940ed", label: "28" },
      { color: "#00bf63", label: "30" },
      { color: "#ff66c4", label: "35" },
      { color: "#ffe234", label: "36" },
      { color: "#ff757f", label: "42" },
      { color: "#ff6135", label: "48" },
      { color: "#556b2f", label: "49" },
      { color: "#af4c0f", label: "54" },
      { color: "#ff0000", label: "56" },
      { color: "#ff1493", label: "63" },
    ],
  },
];

export type TopicKey = "fractions" | "multiplication";
