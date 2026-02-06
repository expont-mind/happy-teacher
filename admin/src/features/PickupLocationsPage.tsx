"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Store, MapPin } from "lucide-react";
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
import { PickupLocation, PickupLocationFormData } from "@/components/delivery";

export const PickupLocationsPage = () => {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PickupLocationFormData>({
    name: "",
    address: "",
    description: "",
    is_active: true,
  });

  const supabase = createClient();

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pickup_locations")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching pickup locations:", error);
      toast.error(`Алдаа: ${error.message}`);
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pickup_locations")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching pickup locations:", error);
        toast.error(`Алдаа: ${error.message}`);
      } else {
        setLocations(data || []);
      }
      setLoading(false);
    };
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      is_active: true,
    });
    setEditingLocation(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (location: PickupLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      description: location.description || "",
      is_active: location.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Нэр болон хаяг оруулна уу");
      return;
    }

    setSubmitting(true);

    if (editingLocation) {
      // Update
      const { error } = await supabase
        .from("pickup_locations")
        .update({
          name: formData.name,
          address: formData.address,
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
      // Create
      const maxSortOrder =
        locations.length > 0
          ? Math.max(...locations.map((l) => l.sort_order))
          : 0;

      const { error } = await supabase.from("pickup_locations").insert({
        name: formData.name,
        address: formData.address,
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

  const handleDelete = async (location: PickupLocation) => {
    const { error } = await supabase
      .from("pickup_locations")
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
      <Sidebar user="" payment="" delivery="pickup" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#58CC02]">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-Inter text-2xl font-semibold text-[#020617]">
                    Очиж авах цэгүүд
                  </p>
                  <p className="text-sm text-gray-500">
                    Хэрэглэгчид бараагаа очиж авах боломжтой байршлууд
                  </p>
                </div>
              </div>
              <Button
                onClick={openCreateDialog}
                className="bg-[#58CC02] hover:bg-[#4CAF00] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Шинэ цэг нэмэх
              </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#E4E4E7] overflow-hidden">
              {/* Header Row */}
              <div className="flex items-center border-b border-[#E4E4E7] bg-[#FAFAFA] text-sm font-medium text-gray-500">
                <p className="px-4 py-3 w-[200px]">Нэр</p>
                <p className="px-4 py-3 flex-1">Хаяг</p>
                <p className="px-4 py-3 w-[200px]">Тайлбар</p>
                <p className="px-4 py-3 w-[100px] text-center">Төлөв</p>
                <p className="px-4 py-3 w-[120px] text-center">Үйлдэл</p>
              </div>

              {/* Data Rows */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#58CC02]/30 border-t-[#58CC02] rounded-full animate-spin" />
                </div>
              ) : locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <MapPin className="w-12 h-12 mb-2" />
                  <p>Одоогоор очиж авах цэг байхгүй байна</p>
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center border-b border-[#E4E4E7] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <p className="px-4 py-3 w-[200px] font-medium text-[#09090B]">
                      {location.name}
                    </p>
                    <p className="px-4 py-3 flex-1 text-gray-600 text-sm">
                      {location.address}
                    </p>
                    <p className="px-4 py-3 w-[200px] text-gray-400 text-sm">
                      {location.description || "-"}
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
                              &quot;{location.name}&quot; цэгийг устгах гэж
                              байна. Энэ үйлдлийг буцаах боломжгүй.
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
              {editingLocation ? "Цэг засах" : "Шинэ цэг нэмэх"}
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
                placeholder="Жишээ: Ubmart худалдааны төв"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Хаяг</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Жишээ: Чойжин ламын музьен баруун талд, 306 тоот"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Тайлбар (Заавал биш)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Жишээ: Ажлын өдрүүдэд авах боломжтой"
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
              className="bg-[#58CC02] hover:bg-[#4CAF00]"
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
