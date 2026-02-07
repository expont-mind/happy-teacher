"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, MapPin, ArrowLeft } from "lucide-react";
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
  is_active: boolean;
}

interface DeliveryLocation {
  id: string;
  zone_id: string;
  name: string;
  fee: number;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface LocationFormData {
  name: string;
  fee: number;
  description: string;
  is_active: boolean;
}

export const DeliveryZoneDetailPage = ({ zoneId }: { zoneId: string }) => {
  const [zone, setZone] = useState<DeliveryZone | null>(null);
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<DeliveryLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    fee: 0,
    description: "",
    is_active: true,
  });

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch zone
      const { data: zoneData, error: zoneError } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("id", zoneId)
        .single();

      if (zoneError) {
        console.error("Error fetching zone:", zoneError);
        toast.error(`Алдаа: ${zoneError.message}`);
      } else {
        setZone(zoneData);
      }

      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("delivery_locations")
        .select("*")
        .eq("zone_id", zoneId)
        .order("sort_order", { ascending: true });

      if (locationsError) {
        console.error("Error fetching locations:", locationsError);
        toast.error(`Алдаа: ${locationsError.message}`);
      } else {
        setLocations(locationsData || []);
      }

      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("delivery_locations")
      .select("*")
      .eq("zone_id", zoneId)
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error(`Алдаа: ${error.message}`);
    } else {
      setLocations(data || []);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", fee: 0, description: "", is_active: true });
    setEditingLocation(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (location: DeliveryLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      fee: location.fee,
      description: location.description || "",
      is_active: location.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Нэр оруулна уу");
      return;
    }

    setSubmitting(true);

    if (editingLocation) {
      const { error } = await supabase
        .from("delivery_locations")
        .update({
          name: formData.name,
          fee: formData.fee,
          description: formData.description || null,
          is_active: formData.is_active,
        })
        .eq("id", editingLocation.id);

      if (error) {
        toast.error(`Алдаа: ${error.message}`);
      } else {
        toast.success("Амжилттай шинэчлэгдлээ");
        setDialogOpen(false);
        resetForm();
        fetchLocations();
      }
    } else {
      const maxSortOrder =
        locations.length > 0
          ? Math.max(...locations.map((l) => l.sort_order))
          : 0;

      const { error } = await supabase.from("delivery_locations").insert({
        zone_id: zoneId,
        name: formData.name,
        fee: formData.fee,
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
        fetchLocations();
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (location: DeliveryLocation) => {
    const { error } = await supabase
      .from("delivery_locations")
      .delete()
      .eq("id", location.id);

    if (error) {
      toast.error(`Алдаа: ${error.message}`);
    } else {
      toast.success("Амжилттай устгалаа");
      fetchLocations();
    }
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" delivery="zones" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            {/* Back Button */}
            <Link
              href="/delivery"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Буцах</span>
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2563EB]">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-Inter text-2xl font-semibold text-[#020617]">
                    {zone?.name || "..."}
                  </p>
                  <p className="text-sm text-gray-500">
                    {zone?.description || "Байршлуудын жагсаалт"}
                  </p>
                </div>
              </div>
              <Button
                onClick={openCreateDialog}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Шинэ байршил нэмэх
              </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#E4E4E7] overflow-hidden">
              <div className="flex items-center border-b border-[#E4E4E7] bg-[#FAFAFA] text-sm font-medium text-gray-500">
                <p className="px-4 py-3 w-[250px]">Байршлын нэр</p>
                <p className="px-4 py-3 flex-1">Тайлбар</p>
                <p className="px-4 py-3 w-[120px] text-right">Хүргэлтийн төлбөр</p>
                <p className="px-4 py-3 w-[100px] text-center">Төлөв</p>
                <p className="px-4 py-3 w-[120px] text-center">Үйлдэл</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
                </div>
              ) : locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <MapPin className="w-12 h-12 mb-2" />
                  <p>Одоогоор байршил байхгүй байна</p>
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center border-b border-[#E4E4E7] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <p className="px-4 py-3 w-[250px] font-medium text-[#09090B]">
                      {location.name}
                    </p>
                    <p className="px-4 py-3 flex-1 text-gray-600 text-sm">
                      {location.description || "-"}
                    </p>
                    <p className="px-4 py-3 w-[120px] text-right font-medium text-[#09090B]">
                      {location.fee.toLocaleString()}₮
                    </p>
                    <div className="px-4 py-3 w-[100px] flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {location.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </div>
                    <div className="px-4 py-3 w-[120px] flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(location)}
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
                              &quot;{location.name}&quot; байршлыг устгах гэж
                              байна.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Болих</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(location)}
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
              {editingLocation ? "Байршил засах" : "Шинэ байршил нэмэх"}
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
                placeholder="Жишээ: Талбай / Төв шуудан"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee">Хүргэлтийн төлбөр (₮)</Label>
              <Input
                id="fee"
                type="number"
                value={formData.fee}
                onChange={(e) =>
                  setFormData({ ...formData, fee: parseInt(e.target.value) || 0 })
                }
                placeholder="6000"
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
                placeholder="Жишээ: Сүхбаатарын талбай орчим"
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
              ) : editingLocation ? (
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
