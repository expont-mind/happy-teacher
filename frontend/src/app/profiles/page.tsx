"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { UserCircle, Baby, Plus, Trash2 } from "lucide-react";
import AddChildModal from "@/src/components/auth/AddChildModal";
import DeleteChildModal from "@/src/components/auth/DeleteChildModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChildProfile {
  id: string;
  name: string;
  pin_code: string;
}

export default function ProfilesPage() {
  const { user, loading, selectProfile, activeProfile } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<ChildProfile | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
        return;
      }
      if (activeProfile?.type === "child") {
        router.push("/");
        return;
      }
    }

    if (user) {
      fetchChildren();
    }
  }, [user, loading, router, activeProfile]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleDeleteClick = (child: ChildProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setChildToDelete(child);
  };

  const confirmDelete = async () => {
    if (!childToDelete) return;

    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childToDelete.id);

      if (error) throw error;
      toast.success("Профайл устгагдлаа");
      fetchChildren();
    } catch (error) {
      toast.error("Алдаа гарлаа");
    } finally {
      setChildToDelete(null);
    }
  };

  const handleAdultSelect = () => {
    if (!user) return;
    if (activeProfile?.type !== "adult") {
      selectProfile({
        id: user.id,
        name:
          user.user_metadata.full_name || user.email?.split("@")[0] || "Adult",
        type: "adult",
      });
    }
    router.push("/");
  };

  if (loading || isLoadingProfiles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-[1280px] w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-center text-gray-700">
          Хэрэглэгчид
        </h1>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {/* Adult Profile */}
          <div
            onClick={handleAdultSelect}
            className="group flex flex-col items-center gap-4 cursor-pointer w-40 md:w-48"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-b-8 border-gray-200 active:border-b-0 active:translate-y-2 transition-all relative bg-blue-400 flex items-center justify-center shadow-xl hover:bg-blue-500">
              <UserCircle size={80} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-gray-700 font-black text-xl text-center truncate w-full uppercase tracking-wide">
              {user?.user_metadata?.full_name || "Том хүн"}
            </span>
          </div>

          {/* Children Profiles */}
          {children.map((child) => (
            <div
              key={child.id}
              className="group flex flex-col items-center gap-4 cursor-default w-40 md:w-48 relative"
            >
              <div className="w-40 h-40 md:w-48 md:h-48 flex flex-col gap-2 items-center justify-center rounded-3xl overflow-hidden border-b-8 border-gray-200 transition-all relative bg-yellow-400 shadow-xl">
                <div className="h-7"></div>
                <Baby size={80} className="text-white" strokeWidth={2.5} />
                <p className="text-white font-bold font-mono text-xl tracking-widest">
                  {child.pin_code}
                </p>
              </div>
              <span className="text-gray-700 font-black text-xl text-center truncate w-full uppercase tracking-wide">
                {child.name}
              </span>

              {/* Delete Button (visible on hover) */}
              <button
                onClick={(e) => handleDeleteClick(child, e)}
                className="absolute -top-2 -right-2 bg-red-500 w-10 h-10 flex justify-center items-center rounded-xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10 text-white cursor-pointer"
                title="Устгах"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {/* Add Profile Button */}
          <div
            onClick={() => setShowAddModal(true)}
            className="group flex flex-col items-center gap-4 cursor-pointer w-40 md:w-48"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all relative flex items-center justify-center bg-transparent">
              <Plus
                size={64}
                className="text-gray-300 group-hover:text-gray-400 transition-colors"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-gray-400 font-black text-xl text-center uppercase tracking-wide group-hover:text-gray-500 transition-colors">
              Хүүхэд нэмэх
            </span>
          </div>
        </div>

        <div className="mt-20 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-sm"
          >
            Нүүр хуудас руу буцах
          </button>
        </div>
      </div>

      {user && (
        <AddChildModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          userId={user.id}
          onChildAdded={() => {
            fetchChildren();
          }}
        />
      )}

      <DeleteChildModal
        isOpen={!!childToDelete}
        onClose={() => setChildToDelete(null)}
        onConfirm={confirmDelete}
        childName={childToDelete?.name || ""}
      />
    </div>
  );
}
