"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Gift, ImageIcon, Zap, DollarSign } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3002";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${FRONTEND_URL}${path}`;
}

interface CouponRow {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  price: number | null;
  image: string | null;
  color: string | null;
  code_prefix: string;
  created_at: string;
}

interface CouponFormData {
  id: string;
  title: string;
  description: string;
  cost: number;
  price: number;
  image: string;
  color: string;
  code_prefix: string;
}

const emptyForm: CouponFormData = {
  id: "",
  title: "",
  description: "",
  cost: 0,
  price: 0,
  image: "",
  color: "",
  code_prefix: "",
};

function CouponImage({
  src,
  alt,
  size,
  fill,
}: {
  src: string | null;
  alt: string;
  size?: number;
  fill?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const url = getImageUrl(src);

  if (!url || errored) {
    if (fill) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
      );
    }
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <ImageIcon className="text-gray-300" style={{ width: (size || 48) * 0.5, height: (size || 48) * 0.5 }} />
      </div>
    );
  }

  if (fill) {
    return (
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-contain"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="rounded-lg object-cover bg-gray-50"
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  );
}

export const CouponsPage = () => {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<CouponRow | null>(null);

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Fetch failed");
      }
      const data = await res.json();
      setCoupons(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching coupons:", message);
      toast.error(`Алдаа: ${message}`);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditing(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (coupon: CouponRow) => {
    setEditing(coupon);
    setFormData({
      id: coupon.id,
      title: coupon.title,
      description: coupon.description || "",
      cost: coupon.cost,
      price: coupon.price || 0,
      image: coupon.image || "",
      color: coupon.color || "",
      code_prefix: coupon.code_prefix,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Нэр оруулна уу");
      return;
    }
    if (!formData.code_prefix.trim()) {
      toast.error("Код prefix оруулна уу");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      cost: formData.cost,
      price: formData.price,
      image: formData.image || null,
      color: formData.color || null,
      code_prefix: formData.code_prefix,
    };

    try {
      if (editing) {
        const res = await fetch("/api/coupons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Update failed");
        }

        toast.success("Амжилттай шинэчлэгдлээ");
        setDialogOpen(false);
        resetForm();
        loadCoupons();
      } else {
        if (!formData.id.trim()) {
          toast.error("ID оруулна уу");
          setSubmitting(false);
          return;
        }

        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: formData.id, ...payload }),
        });

        if (!res.ok) {
          const err = await res.json();
          if (err.code === "23505") {
            toast.error("Энэ ID аль хэдийн байна");
          } else {
            throw new Error(err.error || "Insert failed");
          }
        } else {
          toast.success("Амжилттай үүсгэлээ");
          setDialogOpen(false);
          resetForm();
          loadCoupons();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Алдаа: ${message}`);
    }

    setSubmitting(false);
  };

  const handleDelete = async (coupon: CouponRow) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }

      toast.success("Амжилттай устгалаа");
      loadCoupons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Алдаа: ${message}`);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" delivery="" coupon="active" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2563EB]">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-Inter text-2xl font-semibold text-[#020617]">
                    Бүтээгдэхүүн удирдлага
                  </p>
                  <p className="text-sm text-gray-500">
                    Дэлгүүрийн бүтээгдэхүүн нэмэх, засах, устгах
                  </p>
                </div>
              </div>
              <Button
                onClick={openCreateDialog}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Шинэ бүтээгдэхүүн
              </Button>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-lg border border-[#E4E4E7]">
                <Gift className="w-12 h-12 mb-3" />
                <p className="font-medium">Одоогоор бүтээгдэхүүн байхгүй байна</p>
                <Button
                  onClick={openCreateDialog}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нэмэх
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white rounded-xl border border-[#E4E4E7] overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                    onClick={() => openEditDialog(coupon)}
                  >
                    {/* Image — fixed height */}
                    <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                      <CouponImage src={coupon.image} alt={coupon.title} fill />
                    </div>

                    {/* Content — flex-1 to fill remaining space */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <p className="font-semibold text-[#09090B] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                          {coupon.title}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {coupon.id}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 min-h-10">
                        {coupon.description || "—"}
                      </p>

                      {/* Price tags */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                            coupon.cost === 0
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          {coupon.cost === 0 ? "0 XP (!)" : `${coupon.cost} XP`}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                            !coupon.price || coupon.price === 0
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}
                        >
                          <DollarSign className="w-3 h-3" />
                          {!coupon.price || coupon.price === 0
                            ? "0₮ (!)"
                            : `${coupon.price.toLocaleString()}₮`}
                        </span>
                      </div>

                      {/* Spacer + Actions pinned to bottom */}
                      <div className="mt-auto flex items-center gap-2 pt-2 border-t border-gray-100">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono text-gray-500 bg-gray-100">
                          {coupon.code_prefix}
                        </span>
                        <div className="flex-1" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(coupon);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Засах
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(coupon);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Устгах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.title}&quot; бүтээгдэхүүнийг устгах гэж байна.
              Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болих</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-500 hover:bg-red-600"
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Бүтээгдэхүүн засах" : "Шинэ бүтээгдэхүүн нэмэх"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
            {!editing && (
              <div className="grid gap-2">
                <Label htmlFor="id">ID (unique, өөрчлөх боломжгүй)</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    })
                  }
                  placeholder="Жишээ: fraction_book"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Нэр</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Жишээ: Бутархайн ном"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Тайлбар</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Жишээ: Бутархай сурах ном"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cost">XP үнэ (хүүхдэд)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cost: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="500"
                />
                {formData.cost === 0 && (
                  <p className="text-xs text-red-500 font-medium">
                    XP үнэ 0 байна — хүүхэд үнэгүй авах боломжтой!
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">₮ үнэ (эцэг эхэд)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="15000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Зургийн зам</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="/bookfranctions.png эсвэл https://..."
              />
              {/* Image Preview */}
              {formData.image && (
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                  <CouponImage src={formData.image} alt="Preview" size={120} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="color">Өнгө (CSS class)</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="bg-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code_prefix">Код prefix</Label>
                <Input
                  id="code_prefix"
                  value={formData.code_prefix}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code_prefix: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="BOOK"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Болих
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#2563EB] hover:bg-[#1d4ed8]"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : editing ? (
                "Хадгалах"
              ) : (
                "Үүсгэх"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
