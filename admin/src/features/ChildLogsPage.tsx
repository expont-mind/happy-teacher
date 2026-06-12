"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, AlertCircle, Zap } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { Button } from "@/components/ui/button";

interface LogRow {
  id: string;
  topic_key: string;
  lesson_id: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
  mistake_count: number | null;
  xp_earned: number | null;
  is_first_completion: boolean | null;
}

interface Totals {
  lessons: number;
  seconds: number;
  mistakes: number;
  xp: number;
}

const TOPIC_LABELS: Record<string, string> = {
  fractions: "Бутархай",
  multiplication: "Үржвэр",
};

function fmtTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}м ${s}с` : `${s}с`;
}

export const ChildLogsPage = ({ childId }: { childId: string }) => {
  const router = useRouter();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [totals, setTotals] = useState<Totals>({
    lessons: 0,
    seconds: 0,
    mistakes: 0,
    xp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 50;

  const load = async (nextOffset: number, append: boolean) => {
    setLoading(true);
    const res = await fetch(
      `/api/children/${childId}/logs?limit=${LIMIT}&offset=${nextOffset}`
    ).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      const page: LogRow[] = json.logs || [];
      setLogs((prev) => (append ? [...prev, ...page] : page));
      setTotals(json.totals || { lessons: 0, seconds: 0, mistakes: 0, xp: 0 });
      setHasMore(page.length === LIMIT);
    }
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      setOffset(0);
      await load(0, false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const loadMore = () => {
    const next = offset + LIMIT;
    setOffset(next);
    load(next, true);
  };

  const cards = [
    { label: "Нийт хичээл", value: totals.lessons, icon: BookOpen },
    { label: "Нийт цаг", value: fmtDuration(totals.seconds), icon: Clock },
    { label: "Нийт алдаа", value: totals.mistakes, icon: AlertCircle },
    { label: "Нийт XP", value: totals.xp, icon: Zap },
  ];

  return (
    <div className="flex">
      <Sidebar user="" payment="" classes="classes" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <p className="font-Inter text-2xl font-semibold text-[#020617]">
                Сурлагын явц
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-[#EFF6FF]">
                    <c.icon className="text-[#2563EB]" size={18} />
                  </div>
                  <div>
                    <p className="font-Inter text-xs text-gray-500">{c.label}</p>
                    <p className="font-Inter text-xl font-semibold text-[#020617]">
                      {c.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr className="text-left font-Inter text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Сэдэв</th>
                    <th className="px-4 py-3 font-medium">Хичээл</th>
                    <th className="px-4 py-3 font-medium">Эхэлсэн</th>
                    <th className="px-4 py-3 font-medium">Дууссан</th>
                    <th className="px-4 py-3 font-medium">Хугацаа</th>
                    <th className="px-4 py-3 font-medium">Алдаа</th>
                    <th className="px-4 py-3 font-medium">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        Уншиж байна...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        Одоогоор бичлэг алга
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-t border-gray-100 font-Inter text-sm"
                      >
                        <td className="px-4 py-3">
                          {TOPIC_LABELS[l.topic_key] || l.topic_key}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{l.lesson_id}</td>
                        <td className="px-4 py-3">{fmtTime(l.started_at)}</td>
                        <td className="px-4 py-3">{fmtTime(l.finished_at)}</td>
                        <td className="px-4 py-3">{fmtDuration(l.duration_seconds)}</td>
                        <td className="px-4 py-3">{l.mistake_count ?? 0}</td>
                        <td className="px-4 py-3">{l.xp_earned ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Уншиж байна..." : "Цааш"}
                </Button>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
