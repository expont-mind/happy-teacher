"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/src/utils/supabase/client";
import { toast } from "sonner";
import { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Амжилттай нэвтэрлээ!");
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
          username: username,
        },
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Бүртгэл амжилттай! Имэйлээ шалгана уу.");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Гарах амжилттай!");
  };

  const checkPurchase = async (topicKey: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("topic_key", topicKey)
        .maybeSingle();

      // PGRST116 is "not found" error, which is expected when not purchased
      if (error) {
        // PGRST116 = not found (expected when not purchased)
        if (error.code === "PGRST116") {
          return false;
        }
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          console.warn(
            "⚠️ Purchases table not found. Please run SUPABASE_SETUP.sql in your Supabase SQL Editor."
          );
          return false;
        }

        console.warn("Error checking purchase:", error.message || error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.warn("Unexpected error checking purchase:", err);
      return false;
    }
  };

  const purchaseTopic = async (topicKey: string) => {
    if (!user) {
      throw new Error("Нэвтэрнэ үү");
    }

    try {
      // Check if already purchased
      const alreadyPurchased = await checkPurchase(topicKey);
      if (alreadyPurchased) {
        toast.info("Та энэ сэдвийг аль хэдийн худалдаж авсан байна.");
        return;
      }

      const { error } = await supabase.from("purchases").insert({
        user_id: user.id,
        topic_key: topicKey,
      });

      if (error) {
        // Handle specific error cases
        if (error.code === "23505") {
          // Unique constraint violation - already purchased
          toast.info("Та энэ сэдвийг аль хэдийн худалдаж авсан байна.");
          return;
        }
        // Table doesn't exist errors
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          toast.error(
            "Database table байхгүй байна. Supabase SQL Editor дээр SUPABASE_SETUP.sql файлыг ажиллуулна уу.",
            { duration: 8000 }
          );
          console.error(
            "📋 Please run the SQL from SUPABASE_SETUP.sql in your Supabase SQL Editor"
          );
          throw error;
        }
        toast.error(error.message || "Худалдан авалт амжилтгүй боллоо.");
        throw error;
      }

      toast.success("Худалдан авалт амжилттай!");
    } catch (err) {
      // Re-throw to let caller handle
      throw err;
    }
  };

  const markLessonCompleted = async (topicKey: string, lessonId: string) => {
    if (!user) {
      // Fallback to localStorage if not logged in
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (!list.includes(lessonId)) {
        const updated = [...list, lessonId];
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return;
    }

    try {
      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          topic_key: topicKey,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,topic_key,lesson_id",
        }
      );

      if (error) {
        // If table doesn't exist, fallback to localStorage
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          console.warn(
            "⚠️ user_progress table not found. Using localStorage fallback."
          );
          const key = `progress:${topicKey}`;
          const saved = localStorage.getItem(key);
          const list: string[] = saved ? JSON.parse(saved) : [];
          if (!list.includes(lessonId)) {
            const updated = [...list, lessonId];
            localStorage.setItem(key, JSON.stringify(updated));
          }
          return;
        }
        console.error("Error marking lesson completed:", error);
        throw error;
      }
    } catch (err) {
      console.error("Unexpected error marking lesson completed:", err);
      // Fallback to localStorage on error
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      if (!list.includes(lessonId)) {
        const updated = [...list, lessonId];
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  };

  const getCompletedLessons = async (topicKey: string): Promise<string[]> => {
    if (!user) {
      // Fallback to localStorage if not logged in
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    }

    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("topic_key", topicKey);

      if (error) {
        // If table doesn't exist, fallback to localStorage
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          console.warn(
            "⚠️ user_progress table not found. Using localStorage fallback."
          );
          const key = `progress:${topicKey}`;
          const saved = localStorage.getItem(key);
          return saved ? JSON.parse(saved) : [];
        }
        console.error("Error getting completed lessons:", error);
        // Fallback to localStorage on error
        const key = `progress:${topicKey}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      }

      return data?.map((item) => item.lesson_id) || [];
    } catch (err) {
      console.error("Unexpected error getting completed lessons:", err);
      // Fallback to localStorage on error
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        checkPurchase,
        purchaseTopic,
        markLessonCompleted,
        getCompletedLessons,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
