"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth";
import { createClient } from "@/src/utils/supabase/client";
import { UserCircle, Baby, Plus, Trash2, Pencil } from "lucide-react";
import AddChildModal from "@/src/components/auth/AddChildModal";
import EditChildModal from "@/src/components/auth/EditChildModal";
import DeleteChildModal from "@/src/components/auth/DeleteChildModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface ChildProfile {
  id: string;
  name: string;
  pin_code: string;
  avatar?: string;
  age?: number;
  class?: number;
}

export default function ProfilesPage() {
  const { user, loading, selectProfile, activeProfile } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<ChildProfile | null>(null);
  const [childToEdit, setChildToEdit] = useState<ChildProfile | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!loading) {
      if (!user) {
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

  const handleChildSelect = (child: ChildProfile) => {
    selectProfile({
      id: child.id,
      name: child.name,
      type: "child",
      avatar: child.avatar,
      parentId: user?.id,
    });
    router.push("/");
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
      <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center bg-[#FFFAF7]">
        <div className="max-w-[1280px] h-[436px] w-full flex flex-col items-center gap-12">
          <div className="h-12 w-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <div className="flex flex-col items-center gap-4 w-40 md:w-48">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[32px] bg-gray-200 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-4 w-40 md:w-48">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[32px] bg-gray-200 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-4 w-40 md:w-48">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[32px] bg-gray-200 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-77px)] flex justify-center items-center bg-[#FFFAF7]">
      <div className="max-w-[1280px] w-full flex flex-col items-center gap-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#333333] font-nunito text-center">
          Хэрэглэгчид
        </h1>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {/* Adult Profile */}
          <div
            onClick={handleAdultSelect}
            className="group flex flex-col items-center gap-4 cursor-pointer w-40 md:w-48"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[32px] overflow-hidden shadow-[0_8px_0_#0C0A0126] hover:shadow-[0_8px_0_#0C0A0140] active:shadow-none active:translate-y-2 transition-all relative bg-blue-500 flex items-center justify-center duration-200">
              <UserCircle size={80} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[#333333] font-extrabold text-xl text-center truncate w-full uppercase tracking-wide font-nunito">
              {user?.user_metadata?.full_name || "Том хүн"}
            </span>
          </div>

          {/* Children Profiles */}
          {children.map((child) => (
            <div
              key={child.id}
              onClick={() => handleChildSelect(child)}
              className="group flex flex-col items-center gap-4 cursor-pointer w-40 md:w-48 relative"
            >
              <div className="w-40 h-40 md:w-48 md:h-48 flex flex-col gap-2 items-center justify-center rounded-[32px] overflow-hidden shadow-[0_8px_0_#0C0A0126] hover:shadow-[0_8px_0_#0C0A0140] active:shadow-none active:translate-y-2 transition-all relative bg-[#FFD700] duration-200">
                <div className="h-7"></div>
                {child.avatar && child.avatar.startsWith("/") ? (
                  <Image
                    src={child.avatar}
                    alt={child.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                ) : (
                  <Baby size={80} className="text-black" strokeWidth={2} />
                )}
                <p className="text-white font-extrabold font-nunito text-xl tracking-widest text-shadow-sm">
                  {child.pin_code}
                </p>
              </div>
              <span className="text-[#333333] font-extrabold text-xl text-center truncate w-full uppercase tracking-wide font-nunito">
                {child.name}
              </span>

              {/* Action Buttons */}
              <div className="absolute -top-2 -right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChildToEdit(child);
                  }}
                  className="bg-blue-500 w-10 h-10 flex justify-center items-center rounded-xl shadow-[0_4px_0_#1d4ed8] active:shadow-none active:translate-y-1 hover:bg-blue-600 text-white cursor-pointer duration-200"
                  title="Засах"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={(e) => handleDeleteClick(child, e)}
                  className="bg-red-500 w-10 h-10 flex justify-center items-center rounded-xl shadow-[0_4px_0_#b91c1c] active:shadow-none active:translate-y-1 hover:bg-red-600 text-white cursor-pointer duration-200"
                  title="Устгах"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Add Profile Button */}
          <div
            onClick={() => setShowAddModal(true)}
            className="group flex flex-col items-center gap-4 cursor-pointer w-40 md:w-48"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[32px] overflow-hidden border-[3px] border-dashed border-[#0C0A0166] transition-all relative flex items-center justify-center bg-transparent hover:bg-[#0C0A0105]">
              <Plus
                size={64}
                className="text-[#333333] transition-colors"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-[#333333] font-extrabold text-xl text-center uppercase tracking-wide transition-colors font-nunito">
              Хүүхэд нэмэх
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-[#0C0A0166] font-extrabold hover:text-[#0C0A0199] transition-colors uppercase tracking-widest text-sm font-nunito cursor-pointer"
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

      <EditChildModal
        isOpen={!!childToEdit}
        onClose={() => setChildToEdit(null)}
        child={childToEdit}
        onChildUpdated={() => {
          fetchChildren();
        }}
      />

      <DeleteChildModal
        isOpen={!!childToDelete}
        onClose={() => setChildToDelete(null)}
        onConfirm={confirmDelete}
        childName={childToDelete?.name || ""}
      />
    </div>
  );
}
