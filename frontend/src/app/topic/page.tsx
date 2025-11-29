import Link from "next/link";

export default function TopicsPage() {
  const topics = [
    { key: "fractions", title: "Бутархай" },
    { key: "multiplication", title: "Үржих" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-purple-800">Сэдвүүд</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {topics.map((t) => (
          <Link
            key={t.key}
            className="cursor-pointer block p-6 rounded-3xl border-4 border-purple-200 bg-linear-to-br from-pink-100 via-purple-50 to-blue-50 hover:shadow-xl"
            href={`/topic/${t.key}`}
          >
            <div className="text-2xl font-bold text-purple-900">{t.title}</div>
            <div className="text-purple-700 mt-2">
              Дотор нь зам, түвшнүүд байна 🎯
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
