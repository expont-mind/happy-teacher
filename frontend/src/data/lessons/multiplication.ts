export type MultiplicationLesson = {
    id: string;
    title: string;
    mainImage: string;
    maskImage: string;
    backgroundImage: string;
    helpImage: string;
    palette: { color: string; label: string }[];
};

export const multiplicationLessons: MultiplicationLesson[] = [
    {
        id: "page-3",
        title: "3-р хуудас: Буддацгаая",
        mainImage: "/multiplication/page_3.svg",
        maskImage: "/multiplication/page_3_mask.png",
        backgroundImage: "/multiplication/page_3_background_test.png",
        helpImage: "/multiplication/page_12_help.png",
        palette: [
            { color: "#3fbfff", label: "1" },
            { color: "#af4c0f", label: "2" },
            { color: "#ff66c4", label: "3" },
            { color: "#00bf63", label: "4" },
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
        id: "page-4",
        title: "4-р хуудас: Буддацгаая",
        mainImage: "/multiplication/page_4.svg",
        maskImage: "/multiplication/page_3_mask.png",
        backgroundImage: "/multiplication/page_4_background.png",
        helpImage: "/multiplication/page_12_help.png",
        palette: [
            { color: "#3fbfff", label: "1" },
            { color: "#af4c0f", label: "2" },
            { color: "#ff66c4", label: "3" },
            { color: "#00bf63", label: "4" },
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
];

export type TopicKey = "fractions" | "multiplication";
