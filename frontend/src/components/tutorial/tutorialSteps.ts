import { TutorialConfig } from "./types";

// Desktop tutorials - full detailed steps
export const childHomePageTutorialDesktop: TutorialConfig = {
  pageKey: "home:child:desktop",
  completionKey: "tutorial:home:child:desktop:completed",
  steps: [
    {
      id: "welcome",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Сайн уу! Би таны туслах багш. Эхлэхийн тулд энд дарна уу!",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "streak",
      targetSelector: '[data-tutorial="streak-stat"]',
      title:
        "Энэ нь таны дэс дараалал. Өдөр бүр хичээл хийж дараалалаа хадгална!",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "xp",
      targetSelector: '[data-tutorial="xp-stat"]',
      title:
        "Энэ нь таны цуглуулсан оноо. Хичээл дүүргэх тутам оноо нэмэгдэнэ!",
      character: "white",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "level",
      targetSelector: '[data-tutorial="level-stat"]',
      title: "Энэ нь таны түвшин. Оноо цуглуулж түвшингээ ахиулаарай!",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "notifications",
      targetSelector: '[data-tutorial="notifications-btn"]',
      title: "Мэдэгдлүүдээ энд харна уу.",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "help",
      targetSelector: '[data-tutorial="help-btn"]',
      title: "Тусламж хэрэгтэй бол энд дарна уу.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "start",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Гайхалтай! Одоо та бэлэн боллоо. Сурах аялалаа эхлүүлцгээе!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "bottom",
      highlightTarget: false,
    },
  ],
};

export const adultHomePageTutorialDesktop: TutorialConfig = {
  pageKey: "home:adult:desktop",
  completionKey: "tutorial:home:adult:desktop:completed",
  steps: [
    {
      id: "welcome",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Сайн уу! Би таны туслах багш. Эхлэхийн тулд энд дарна уу!",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "profiles",
      targetSelector: '[data-tutorial="profiles-btn"]',
      title: "Энд дарснаар хүүхэд нэмэх, удирдах боломжтой.",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "notifications",
      targetSelector: '[data-tutorial="notifications-btn"]',
      title: "Хүүхдийнхээ явцын мэдэгдлүүдийг энд харна уу.",
      character: "white",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "settings",
      targetSelector: '[data-tutorial="settings-btn"]',
      title: "Тохиргоогоо энд өөрчилнө үү.",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "help",
      targetSelector: '[data-tutorial="help-btn"]',
      title: "Тусламж хэрэгтэй бол энд дарна уу.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "start",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Гайхалтай! Одоо та бэлэн боллоо. Сурах аялалаа эхлүүлцгээе!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "bottom",
      highlightTarget: false,
    },
  ],
};

// Mobile tutorials - simplified (welcome, menu, start)
export const childHomePageTutorialMobile: TutorialConfig = {
  pageKey: "home:child:mobile",
  completionKey: "tutorial:home:child:mobile:completed",
  steps: [
    {
      id: "welcome",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Сайн уу! Би таны туслах багш. Эхлэхийн тулд энд дарна уу!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "menu",
      targetSelector: '[data-tutorial="mobile-menu-btn"]',
      title: "Цэсийг нээхийн тулд энд дарна уу!",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "start",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Гайхалтай! Одоо та бэлэн боллоо. Сурах аялалаа эхлүүлцгээе!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "bottom",
      highlightTarget: false,
    },
  ],
};

export const adultHomePageTutorialMobile: TutorialConfig = {
  pageKey: "home:adult:mobile",
  completionKey: "tutorial:home:adult:mobile:completed",
  steps: [
    {
      id: "welcome",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Сайн уу! Би таны туслах багш. Эхлэхийн тулд энд дарна уу!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "menu",
      targetSelector: '[data-tutorial="mobile-menu-btn"]',
      title: "Цэсийг нээхийн тулд энд дарна уу!",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "start",
      targetSelector: '[data-tutorial="main-cta"]',
      title: "Гайхалтай! Одоо та бэлэн боллоо. Сурах аялалаа эхлүүлцгээе!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "bottom",
      highlightTarget: false,
    },
  ],
};

// Desktop lesson tutorial - full detailed steps
export const lessonPageTutorialDesktop: TutorialConfig = {
  pageKey: "lesson:desktop",
  completionKey: "tutorial:lesson:desktop:completed",
  steps: [
    {
      id: "color-palette",
      targetSelector: '[data-tutorial="color-palette"]',
      title: "Энд дээр дарж өнгөө сонгоно уу!",
      character: "yellow",
      characterPosition: "right",
      tooltipPosition: "right",
      highlightTarget: true,
    },
    {
      id: "undo",
      targetSelector: '[data-tutorial="undo-btn"]',
      title: "Сүүлийн үйлдлийг буцаана.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "left",
      highlightTarget: true,
    },
    {
      id: "redo",
      targetSelector: '[data-tutorial="redo-btn"]',
      title: "Буцаасан үйлдлийг дахин хийнэ.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "left",
      highlightTarget: true,
    },
    {
      id: "help",
      targetSelector: '[data-tutorial="lesson-help-btn"]',
      title: "Тусламж хэрэгтэй бол энд дарна уу.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "left",
      highlightTarget: true,
    },
    {
      id: "download",
      targetSelector: '[data-tutorial="download-btn"]',
      title: "Зургаа татаж авна.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "left",
      highlightTarget: true,
    },
    {
      id: "story",
      targetSelector: '[data-tutorial="story-btn"]',
      title: "Үлгэрээ дахин үзэхийн тулд энд дарна уу.",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "left",
      highlightTarget: true,
    },
    {
      id: "done",
      targetSelector: '[data-tutorial="done-btn"]',
      title: "Дууссан бол энд дарж шалгуулна уу!",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "left",
      highlightTarget: true,
    },
  ],
};

// Mobile lesson tutorial - simplified steps
export const lessonPageTutorialMobile: TutorialConfig = {
  pageKey: "lesson:mobile",
  completionKey: "tutorial:lesson:mobile:completed",
  steps: [
    {
      id: "color-picker",
      targetSelector: '[data-tutorial="mobile-color-picker"]',
      title: "Өнгөө сонгохын тулд энд дарна уу!",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "actions-menu",
      targetSelector: '[data-tutorial="mobile-actions-menu"]',
      title: "Тусламж, түүх болон бусад үйлдлүүд энд байна.",
      character: "blue",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: true,
    },
    {
      id: "start",
      targetSelector: '[data-tutorial="mobile-color-picker"]',
      title: "Гайхалтай! Одоо та бэлэн боллоо. Будаж эхлээрэй!",
      character: "yellow",
      characterPosition: "left",
      tooltipPosition: "bottom",
      highlightTarget: false,
    },
  ],
};

// Legacy export for backwards compatibility
export const lessonPageTutorial = lessonPageTutorialDesktop;
