"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, MapPin, ChevronRight } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface DeliveryZone {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  location_count?: number;
}

interface DeliveryZoneFormData {
  name: string;
  description: string;
  is_active: boolean;
}

export const DeliveryZonesPage = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<DeliveryZoneFormData>({
    name: "",
    description: "",
    is_active: true,
  });

  const supabase = createClient();

  useEffect(() => {
    const loadZones = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*, delivery_locations(count)")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching zones:", error);
        toast.error(`Алдаа: ${error.message}`);
      } else {
        const zonesWithCount = (data || []).map((zone) => ({
          ...zone,
          location_count: zone.delivery_locations?.[0]?.count || 0,
        }));
        setZones(zonesWithCount);
      }
      setLoading(false);
    };
    loadZones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchZones = async () => {
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("*, delivery_locations(count)")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error(`Алдаа: ${error.message}`);
    } else {
      const zonesWithCount = (data || []).map((zone) => ({
        ...zone,
        location_count: zone.delivery_locations?.[0]?.count || 0,
      }));
      setZones(zonesWithCount);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", is_active: true });
    setEditingZone(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || "",
      is_active: zone.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Нэр оруулна уу");
      return;
    }

    setSubmitting(true);

    if (editingZone) {
      const { error } = await supabase
        .from("delivery_zones")
        .update({
          name: formData.name,
          description: formData.description || null,
          is_active: formData.is_active,
        })
        .eq("id", editingZone.id);

      if (error) {
        toast.error(`Алдаа: ${error.message}`);
      } else {
        toast.success("Амжилттай шинэчлэгдлээ");
        setDialogOpen(false);
        resetForm();
        fetchZones();
      }
    } else {
      const maxSortOrder =
        zones.length > 0 ? Math.max(...zones.map((z) => z.sort_order)) : 0;

      const { error } = await supabase.from("delivery_zones").insert({
        name: formData.name,
        description: formData.description || null,
        is_active: formData.is_active,
        sort_order: maxSortOrder + 1,
      });

      if (error) {
        toast.error(`Алдаа: ${error.message}`);
      } else {
        toast.success("Амжилттай үүсгэлээ");
        setDialogOpen(false);
        resetForm();
        fetchZones();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (zone: DeliveryZone) => {
    const { error } = await supabase
      .from("delivery_zones")
      .delete()
      .eq("id", zone.id);

    if (error) {
      if (error.code === "23503") {
        toast.error("Энэ бүсэд байршлууд байгаа тул устгах боломжгүй");
      } else {
        toast.error(`Алдаа: ${error.message}`);
      }
    } else {
      toast.success("Амжилттай устгалаа");
      fetchZones();
    }
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" delivery="zones" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2563EB]">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-Inter text-2xl font-semibold text-[#020617]">
                    Хүргэлтийн бүсүүд
                  </p>
                  <p className="text-sm text-gray-500">
                    Улаанбаатар хотын хүргэлтийн бүс болон байршлууд
                  </p>
                </div>
              </div>
              <Button
                onClick={openCreateDialog}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Шинэ бүс нэмэх
              </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#E4E4E7] overflow-hidden">
              <div className="flex items-center border-b border-[#E4E4E7] bg-[#FAFAFA] text-sm font-medium text-gray-500">
                <p className="px-4 py-3 w-[200px]">Бүсийн нэр</p>
                <p className="px-4 py-3 flex-1">Тайлбар</p>
                <p className="px-4 py-3 w-[120px] text-center">Байршлууд</p>
                <p className="px-4 py-3 w-[100px] text-center">Төлөв</p>
                <p className="px-4 py-3 w-[150px] text-center">Үйлдэл</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
                </div>
              ) : zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <MapPin className="w-12 h-12 mb-2" />
                  <p>Одоогоор бүс байхгүй байна</p>
                </div>
              ) : (
                zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center border-b border-[#E4E4E7] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <p className="px-4 py-3 w-[200px] font-medium text-[#09090B]">
                      {zone.name}
                    </p>
                    <p className="px-4 py-3 flex-1 text-gray-600 text-sm">
                      {zone.description || "-"}
                    </p>
                    <div className="px-4 py-3 w-[120px] flex justify-center">
                      <Link
                        href={`/delivery/zones/${zone.id}`}
                        className="flex items-center gap-1 text-[#2563EB] hover:underline text-sm font-medium"
                      >
                        {zone.location_count} байршил
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="px-4 py-3 w-[100px] flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          zone.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {zone.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </div>
                    <div className="px-4 py-3 w-[150px] flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(zone)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Устгах уу?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{zone.name}&quot; бүсийг устгах гэж байна.
                              Энэ бүсийн бүх байршлууд устгагдана.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Болих</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(zone)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Устгах
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Бүс засах" : "Шинэ бүс нэмэх"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Жишээ: Төвийн бүс"
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
                placeholder="Жишээ: Бага тойруу & Ойр орчим"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Идэвхтэй</Label>
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
              ) : editingZone ? (
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
