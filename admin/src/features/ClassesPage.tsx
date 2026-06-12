"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Plus, Trash2 } from "lucide-react";
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

interface ClassRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  child_count: number;
}

export const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/classes").catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setClasses(json.classes || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    }).catch(() => null);
    setSubmitting(false);
    if (res?.ok) {
      setDialogOpen(false);
      setName("");
      setDescription("");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ ангийг устгах уу? Хүүхдүүд устахгүй, зөвхөн ангиас гарна.")) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (res?.ok) load();
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" classes="classes" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2563EB]">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-Inter text-2xl font-semibold text-[#020617]">
                    Ангиуд
                  </p>
                  <p className="font-Inter text-sm text-gray-500">
                    Сургалтын ангиуд болон сурагчид
                  </p>
                </div>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus size={16} /> Шинэ анги
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr className="text-left font-Inter text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Ангийн нэр</th>
                    <th className="px-4 py-3 font-medium">Тайлбар</th>
                    <th className="px-4 py-3 font-medium">Сурагчид</th>
                    <th className="px-4 py-3 font-medium">Төлөв</th>
                    <th className="px-4 py-3 font-medium text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Уншиж байна...
                      </td>
                    </tr>
                  ) : classes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Одоогоор анги байхгүй байна
                      </td>
                    </tr>
                  ) : (
                    classes.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-gray-100 hover:bg-gray-50 font-Inter text-sm"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/classes/${c.id}`}
                            className="text-[#2563EB] hover:underline flex items-center gap-1"
                          >
                            {c.name} <ChevronRight size={14} />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {c.description || "-"}
                        </td>
                        <td className="px-4 py-3">{c.child_count}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              c.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                          </span>
                        </td>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ анги</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-Inter text-sm font-medium text-[#334155]">
                Ангийн нэр
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-Inter text-sm font-medium text-[#334155]">
                Тайлбар
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Болих
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !name.trim()}>
              {submitting ? "Үүсгэж байна..." : "Үүсгэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
