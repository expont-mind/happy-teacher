"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Hash,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Sidebar, Footer } from "@/components/constants";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

interface Purchase {
  id: string;
  topic_key: string;
  child_name: string | null;
  created_at: string | null;
}

interface Invoice {
  id: string;
  amount: number | null;
  topic_key: string | null;
  status: string | null;
  created_at: string | null;
}

interface Summary {
  topics_purchased: number;
  total_paid: number;
}

interface UserDetailData {
  profile: Profile;
  purchases: Purchase[];
  invoices: Invoice[];
  summary: Summary;
}

const TOPIC_LABELS: Record<string, string> = {
  fractions: "Бутархай",
  multiplication: "Үржвэр",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Хүлээгдэж буй",
  paid: "Төлсөн",
  completed: "Дууссан",
  expired: "Хугацаа дууссан",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-500",
};

function topicLabel(key: string | null): string {
  if (!key) return "-";
  return TOPIC_LABELS[key] || key;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "-";
  return format(new Date(iso), "yyyy/MM/dd HH:mm");
}

function fmtPrice(n: number | null): string {
  return `${(n || 0).toLocaleString()}₮`;
}

export const UserDetailPage = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setNotFound(false);
      const res = await fetch(`/api/users/${userId}`).catch(() => null);
      if (res?.ok) {
        setData(await res.json());
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    run();
  }, [userId]);

  return (
    <div className="flex">
      <Sidebar user="active" payment="" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1200px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex gap-4 items-center h-10">
              <button
                onClick={() => router.back()}
                className="border border-gray-200 rounded-lg bg-white text-black w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <p className="h-10 flex items-center font-Inter text-2xl font-semibold -tracking-[0.6px] text-[#020617]">
                User Detail
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : notFound || !data ? (
              <div className="bg-white rounded-lg border border-[#E2E8F0] py-16 text-center font-Inter text-gray-500">
                Хэрэглэгч олдсонгүй
              </div>
            ) : (
              <>
                {/* Profile card */}
                <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center overflow-hidden shrink-0">
                      {data.profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.profile.avatar_url}
                          alt={data.profile.full_name || "avatar"}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="font-Inter text-2xl font-semibold text-[#2563EB]">
                          {(data.profile.full_name || data.profile.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="font-Inter text-xl font-semibold text-[#020617]">
                        {data.profile.full_name || "-/-"}
                      </p>
                      <div className="flex items-center gap-2 font-Inter text-sm text-gray-500">
                        <Mail size={14} /> {data.profile.email || "-"}
                      </div>
                      <div className="flex items-center gap-2 font-Inter text-sm text-gray-500">
                        <Phone size={14} /> {data.profile.phone || "-"}
                      </div>
                      <div className="flex items-center gap-2 font-Inter text-sm text-gray-500">
                        <Calendar size={14} /> Бүртгүүлсэн:{" "}
                        {data.profile.created_at
                          ? format(new Date(data.profile.created_at), "yyyy/MM/dd")
                          : "-"}
                      </div>
                      <div className="flex items-center gap-2 font-Inter text-xs text-gray-400">
                        <Hash size={12} />{" "}
                        <span className="font-mono">{data.profile.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-lg border border-[#E2E8F0] p-4 flex items-center gap-3 min-w-[150px]">
                      <div className="p-2 rounded-lg bg-[#EFF6FF]">
                        <ShoppingBag className="text-[#2563EB]" size={18} />
                      </div>
                      <div>
                        <p className="font-Inter text-xs text-gray-500">
                          Авсан сэдэв
                        </p>
                        <p className="font-Inter text-xl font-semibold text-[#020617]">
                          {data.summary.topics_purchased}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#E2E8F0] p-4 flex items-center gap-3 min-w-[150px]">
                      <div className="p-2 rounded-lg bg-[#EFF6FF]">
                        <Wallet className="text-[#2563EB]" size={18} />
                      </div>
                      <div>
                        <p className="font-Inter text-xs text-gray-500">
                          Нийт төлсөн
                        </p>
                        <p className="font-Inter text-xl font-semibold text-[#020617]">
                          {fmtPrice(data.summary.total_paid)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchases */}
                <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                  <p className="px-4 py-3 font-Inter text-sm font-semibold text-[#020617] border-b border-gray-100">
                    Худалдан авсан сэдвүүд
                  </p>
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="text-left font-Inter text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">Сэдэв</th>
                        <th className="px-4 py-3 font-medium">Хүүхэд</th>
                        <th className="px-4 py-3 font-medium">Огноо</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.purchases.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-gray-400 font-Inter text-sm"
                          >
                            Худалдан авалт алга
                          </td>
                        </tr>
                      ) : (
                        data.purchases.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t border-gray-100 font-Inter text-sm"
                          >
                            <td className="px-4 py-3">{topicLabel(p.topic_key)}</td>
                            <td className="px-4 py-3 text-gray-500">
                              {p.child_name || "-"}
                            </td>
                            <td className="px-4 py-3">{fmtDate(p.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Invoices */}
                <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                  <p className="px-4 py-3 font-Inter text-sm font-semibold text-[#020617] border-b border-gray-100">
                    Төлбөрийн түүх
                  </p>
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="text-left font-Inter text-sm text-gray-500">
                        <th className="px-4 py-3 font-medium">Дүн</th>
                        <th className="px-4 py-3 font-medium">Сэдэв</th>
                        <th className="px-4 py-3 font-medium">Төлөв</th>
                        <th className="px-4 py-3 font-medium">Огноо</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.invoices.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-gray-400 font-Inter text-sm"
                          >
                            Төлбөрийн бичлэг алга
                          </td>
                        </tr>
                      ) : (
                        data.invoices.map((inv) => (
                          <tr
                            key={inv.id}
                            className="border-t border-gray-100 font-Inter text-sm"
                          >
                            <td className="px-4 py-3 font-medium">
                              {fmtPrice(inv.amount)}
                            </td>
                            <td className="px-4 py-3">{topicLabel(inv.topic_key)}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  STATUS_STYLES[inv.status || ""] ||
                                  "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {STATUS_LABELS[inv.status || ""] ||
                                  inv.status ||
                                  "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3">{fmtDate(inv.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
