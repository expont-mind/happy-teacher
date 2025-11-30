"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, UserDataTable } from "../components/home";
import { Footer, SearchBar, Sidebar } from "@/components/constants";
import { createClient } from "@/utils/supabase/client";

export const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching users:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error,
        });

        if (error.code === "PGRST116") {
          toast.error(
            "Profiles table not found. Please run the SQL setup script in Supabase."
          );
        } else if (error.code === "42501") {
          toast.error(
            "Permission denied. Please check Row Level Security policies."
          );
        } else {
          toast.error(
            `Failed to fetch users: ${error.message || "Unknown error"}`
          );
        }
      } else {
        console.log("Users fetched successfully:", data?.length || 0, "users");
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesEmail = user.email?.toLowerCase().includes(searchTermLower);
    const matchesName = user.full_name?.toLowerCase().includes(searchTermLower);
    return matchesEmail || matchesName;
  });

  return (
    <div className="flex">
      <Sidebar user="active" payment="" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <p className="h-10 flex items-center font-Inter text-2xl font-semibold text-[#020617]">
              Users
            </p>

            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <UserDataTable data={filteredUsers} loading={loading} />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
