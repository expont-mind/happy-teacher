"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Plus, Trash2 } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ChildRow {
  id: string;
  name: string;
  pin_code: string | null;
  avatar: string | null;
  age: number | null;
  class: number | null;
  xp: number | null;
  level: number | null;
  last_active_at: string | null;
  lessons_done: number;
}

export const ClassDetailPage = ({ classId }: { classId: string }) => {
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [newPin, setNewPin] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/classes/${classId}/children`).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setChildren(json.children || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/classes/${classId}/children`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: age ? Number(age) : undefined,
      }),
    }).catch(() => null);
    setSubmitting(false);
    if (res?.ok) {
      const json = await res.json();
      setNewPin(json.child?.pin_code || null);
      setName("");
      setAge("");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ сурагчийг устгах уу?")) return;
    const res = await fetch(`/api/children/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (res?.ok) load();
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewPin(null);
    setName("");
    setAge("");
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" classes="classes" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/classes"
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={20} />
                </Link>
                <p className="font-Inter text-2xl font-semibold text-[#020617]">
                  Ангийн сурагчид
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus size={16} /> Хүүхэд нэмэх
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr className="text-left font-Inter text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Нэр</th>
                    <th className="px-4 py-3 font-medium">PIN код</th>
                    <th className="px-4 py-3 font-medium">Хичээл</th>
                    <th className="px-4 py-3 font-medium">XP</th>
                    <th className="px-4 py-3 font-medium">Түвшин</th>
                    <th className="px-4 py-3 font-medium text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Уншиж байна...
                      </td>
                    </tr>
                  ) : children.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Энэ ангид сурагч алга
                      </td>
                    </tr>
                  ) : (
                    children.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-gray-100 hover:bg-gray-50 font-Inter text-sm"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/children/${c.id}/logs`}
                            className="text-[#2563EB] hover:underline"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-mono bg-gray-100 px-2 py-0.5 rounded">
                            <KeyRound size={12} className="text-gray-400" />
                            {c.pin_code || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{c.lessons_done}</td>
                        <td className="px-4 py-3">{c.xp ?? 0}</td>
                        <td className="px-4 py-3">{c.level ?? 1}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-md border border-gray-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хүүхэд нэмэх</DialogTitle>
          </DialogHeader>

          {newPin ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="font-Inter text-sm text-gray-500">
                Сурагчийн PIN код үүсгэгдлээ:
              </p>
              <p className="font-mono text-3xl font-bold tracking-widest text-[#2563EB]">
                {newPin}
              </p>
              <p className="font-Inter text-xs text-gray-400 text-center">
                Энэ кодыг сурагчид өгнө үү. Сурагч үүгээр нэвтэрнэ.
              </p>
              <Button onClick={closeDialog} className="mt-2">
                Болсон
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-Inter text-sm font-medium text-[#334155]">
                    Нэр
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-Inter text-sm font-medium text-[#334155]">
                    Нас (заавал биш)
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Болих
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting || !name.trim()}
                >
                  {submitting ? "Үүсгэж байна..." : "Үүсгэх"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
