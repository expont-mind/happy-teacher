export interface DeliveryLocation {
  id: string;
  name: string;
  fee: number;
  description: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  locations: DeliveryLocation[];
}

export interface CountrysideFees {
  [key: string]: number;
}

export interface DeliveryConfig {
  fee: number;
  mode: string;
  zones: DeliveryZone[];
  countryside: {
    enabled: boolean;
    fees: CountrysideFees;
  };
}

export const deliveryConfig: DeliveryConfig = {
  fee: 50,
  mode: "zone_based",
  zones: [
    {
      id: "zone_central",
      name: "Төвийн бүс",
      description: "Бага тойруу & Ойр орчим",
      locations: [
        {
          id: "loc_talbai",
          fee: 6000,
          name: "Талбай / Төв шуудан",
          description: "Сүхбаатарын талбай орчим",
        },
        {
          id: "loc_ikh_delguur",
          fee: 6000,
          name: "Их дэлгүүр / 40, 50 мянгат",
          description: "Төвийн худалдааны төвүүд",
        },
        {
          id: "loc_circus",
          fee: 6000,
          name: "Цирк / Нарны зам",
          description: "Цирк, Нарны гудамж орчим",
        },
        {
          id: "loc_shutis",
          fee: 6000,
          name: "Багшийн дээд / ШУТИС",
          description: "Их сургуулиудын орчим",
        },
      ],
    },
    {
      id: "zone_west",
      name: "Баруун бүс",
      description: "Хорооллууд & Сонгинохайрхан",
      locations: [
        {
          id: "loc_bichil",
          fee: 6000,
          name: "Бичил / 3, 4-р хороолол",
          description: "",
        },
        {
          id: "loc_10_gemtel",
          fee: 6000,
          name: "10-р хороолол / Гэмтэл",
          description: "",
        },
        {
          id: "loc_1_horoolol",
          fee: 6000,
          name: "1-р хороолол",
          description: "",
        },
        {
          id: "loc_5shar_tolgoit",
          fee: 10000,
          name: "5 шар / Толгойт",
          description: "",
        },
      ],
    },
    {
      id: "zone_east",
      name: "Зүүн бүс",
      description: "Сансар & Баянзүрх",
      locations: [
        {
          id: "loc_sansar",
          fee: 10000,
          name: "Сансар / Зүүн 4 зам",
          description: "",
        },
        {
          id: "loc_13_15",
          fee: 10000,
          name: "13, 15-р хороолол / Нарантуул",
          description: "",
        },
        {
          id: "loc_jukov",
          fee: 10000,
          name: "Жуков / Офицеруудын ордон",
          description: "",
        },
        {
          id: "loc_shar_khad",
          fee: 10000,
          name: "Шар хад / Амгалант",
          description: "",
        },
      ],
    },
    {
      id: "zone_south",
      name: "Урд бүс",
      description: "Хан-Уул & Зайсан",
      locations: [
        {
          id: "loc_120",
          fee: 6000,
          name: "120 / 19-р хороолол",
          description: "",
        },
        {
          id: "loc_zaisan",
          fee: 6000,
          name: "Зайсан / Маршал",
          description: "",
        },
        {
          id: "loc_yarmag",
          fee: 10000,
          name: "Яармаг / Вива сити",
          description: "",
        },
      ],
    },
    {
      id: "zone_north",
      name: "Хойд бүс",
      description: "Чингэлтэй & Сүхбаатар",
      locations: [
        {
          id: "loc_100_ail",
          fee: 6000,
          name: "100 айл / 32-ын тойрог",
          description: "",
        },
        {
          id: "loc_6_7",
          fee: 10000,
          name: "6 буудал / 7 буудал",
          description: "",
        },
        {
          id: "loc_kailaast",
          fee: 10000,
          name: "Хайлааст / Чингэлтэй",
          description: "",
        },
      ],
    },
    {
      id: "zone_remote",
      name: "Алслагдсан бүсүүд",
      description: "Тусгай тарифтай",
      locations: [
        {
          id: "loc_nisekh",
          fee: 12000,
          name: "Нисэх / Био комбинат",
          description: "",
        },
        {
          id: "loc_22_tovchoo",
          fee: 12000,
          name: "22-ын товчоо / Эмээлт",
          description: "",
        },
        {
          id: "loc_gachuurt",
          fee: 15000,
          name: "Гачуурт / Хужирбулан",
          description: "",
        },
        {
          id: "loc_zuslanguud",
          fee: 20000,
          name: "Зуслангууд",
          description: "Шарга морьт, Жигжид, Гүнт гэх мэт",
        },
        {
          id: "loc_nalaikh",
          fee: 20000,
          name: "Налайх / Тэрэлж",
          description: "",
        },
      ],
    },
  ],
  countryside: {
    enabled: true,
    fees: {
      tov: 25000,
      uvs: 25000,
      khovd: 25000,
      bulgan: 25000,
      dornod: 25000,
      orkhon: 25000,
      khentii: 25000,
      selenge: 25000,
      zavkhan: 25000,
      dundgovi: 25000,
      khovsgol: 25000,
      omnogovi: 25000,
      arkhangai: 25000,
      dornogovi: 25000,
      govi_altai: 25000,
      govisumber: 25000,
      bayan_olgii: 25000,
      darkhan_uul: 25000,
      ovorkhangai: 25000,
      bayankhongor: 25000,
      sukhbaatar_aimag: 25000,
    },
  },
};

export const countrysideNames: { [key: string]: string } = {
  tov: "Төв аймаг",
  uvs: "Увс аймаг",
  khovd: "Ховд аймаг",
  bulgan: "Булган аймаг",
  dornod: "Дорнод аймаг",
  orkhon: "Орхон аймаг",
  khentii: "Хэнтий аймаг",
  selenge: "Сэлэнгэ аймаг",
  zavkhan: "Завхан аймаг",
  dundgovi: "Дундговь аймаг",
  khovsgol: "Хөвсгөл аймаг",
  omnogovi: "Өмнөговь аймаг",
  arkhangai: "Архангай аймаг",
  dornogovi: "Дорноговь аймаг",
  govi_altai: "Говь-Алтай аймаг",
  govisumber: "Говьсүмбэр аймаг",
  bayan_olgii: "Баян-Өлгий аймаг",
  darkhan_uul: "Дархан-Уул аймаг",
  ovorkhangai: "Өвөрхангай аймаг",
  bayankhongor: "Баянхонгор аймаг",
  sukhbaatar_aimag: "Сүхбаатар аймаг",
};
