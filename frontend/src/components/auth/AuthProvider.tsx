"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/src/utils/supabase/client";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "@/src/components/ui/CharacterToast";
import { AuthContextType, UserProfile } from "./types";

const translateAuthError = (message: string) => {
  if (message.includes("Email address") && message.includes("is invalid")) {
    return "Имэйл хаяг буруу байна";
  }
  if (message.includes("Password should be at least 6 characters")) {
    return "Нууц үг дор хаяж 6 оронтой байх ёстой";
  }
  if (message.includes("Invalid login credentials")) {
    return "Нэвтрэх мэдээлэл буруу байна";
  }
  if (message.includes("User already registered")) {
    return "Хэрэглэгч бүртгэлтэй байна";
  }
  return message;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastPurchaseTime, setLastPurchaseTime] = useState<number>(0);
  const supabase = createClient();
  const activeProfileRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      const savedProfile = localStorage.getItem("activeProfile");
      if (savedProfile) {
        setActiveProfile(JSON.parse(savedProfile));
      } else if (session?.user) {
        setActiveProfile({
          id: session.user.id,
          name:
            session.user.user_metadata.full_name ||
            session.user.email?.split("@")[0] ||
            "Adult",
          type: "adult",
        });
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (!session) {
        // Handle logout or child session restore
        const savedProfileStr = localStorage.getItem("activeProfile");
        let restoredChild = false;

        if (savedProfileStr) {
          try {
            const saved = JSON.parse(savedProfileStr);
            if (saved.type === "child") {
              // It's a child profile, so we keep it even without a supabase session
              setActiveProfile(saved);
              activeProfileRef.current = saved;
              restoredChild = true;
            }
          } catch (e) {
            console.error("Error parsing saved profile on logout check", e);
          }
        }

        if (!restoredChild) {
          setActiveProfile(null);
          activeProfileRef.current = null;
          localStorage.removeItem("activeProfile");
        }
      } else {
        // Check if we have a saved profile in localStorage first
        const savedProfileStr = localStorage.getItem("activeProfile");
        let profileToSet: UserProfile | null = null;

        if (savedProfileStr) {
          try {
            profileToSet = JSON.parse(savedProfileStr);
          } catch (e) {
            console.error("Error parsing saved profile", e);
          }
        }

        // If no saved profile, or if effective profile is missing, default to adult
        if (!profileToSet && !activeProfileRef.current) {
          profileToSet = {
            id: session.user.id,
            name:
              session.user.user_metadata.full_name ||
              session.user.email?.split("@")[0] ||
              "Adult",
            type: "adult",
          };
        }

        if (profileToSet) {
          // Validate if the saved child profile belongs to the current user (if it's a child)
          if (
            profileToSet.type === "child" &&
            profileToSet.parentId !== session.user.id
          ) {
            // Dangerous: The saved child profile doesn't belong to the signed-in parent.
            // Fallback to adult.
            profileToSet = {
              id: session.user.id,
              name:
                session.user.user_metadata.full_name ||
                session.user.email?.split("@")[0] ||
                "Adult",
              type: "adult",
            };
          }

          setActiveProfile(profileToSet);
          activeProfileRef.current = profileToSet;
          localStorage.setItem("activeProfile", JSON.stringify(profileToSet));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      showErrorToast(translateAuthError(error.message));
      throw error;
    }

    // Set default adult profile on login
    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        name:
          data.user.user_metadata.full_name ||
          data.user.email?.split("@")[0] ||
          "Adult",
        type: "adult",
      };
      setActiveProfile(profile);
      localStorage.setItem("activeProfile", JSON.stringify(profile));
    }

    showSuccessToast("Амжилттай нэвтэрлээ!");
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    showToast: boolean = true,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
          username: username,
          phone: phone || "",
        },
      },
    });
    if (error) {
      showErrorToast(translateAuthError(error.message));
      throw error;
    }
    if (showToast) {
      showSuccessToast("Бүртгэл амжилттай! Имэйлээ шалгана уу.");
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showErrorToast(translateAuthError(error.message));
      throw error;
    }
    setActiveProfile(null);
    localStorage.removeItem("activeProfile");
    showSuccessToast("Гарах амжилттай!");
  };

  const fetchProfileStats = async (profile: UserProfile) => {
    try {
      if (profile.type === "child") {
        const { data, error } = await supabase
          .from("children")
          .select("streak_count, xp, level")
          .eq("id", profile.id)
          .single();
        if (!error && data) {
          return {
            streak: data.streak_count || 0,
            xp: data.xp || 0,
            level: data.level || 1,
          };
        }
      } else {
        const { data, error } = await supabase
          .from("user_streaks")
          .select("streak_count")
          .eq("user_id", profile.id)
          .single();
        if (!error && data) {
          return { streak: data.streak_count || 0 };
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
    return { streak: 0 };
  };

  const selectProfile = async (profile: UserProfile) => {
    // Fetch stats before setting profile
    const stats = await fetchProfileStats(profile);
    // Important: spread stats first, then profile to preserve parentId, avatar, etc.
    const profileWithStats = { ...stats, ...profile };

    setActiveProfile(profileWithStats);
    activeProfileRef.current = profileWithStats;
    localStorage.setItem("activeProfile", JSON.stringify(profileWithStats));
    showSuccessToast(`${profile.name} профайл руу шилжлээ!`);
  };

  const addXP = async (
    amount: number
  ): Promise<{ xp: number; level: number; leveled_up: boolean } | null> => {
    if (activeProfile?.type !== "child") return null;

    try {
      const { data, error } = await supabase.rpc("add_child_xp", {
        p_child_id: activeProfile.id,
        p_amount: amount,
      });

      if (error) throw error;

      // Update local state
      const updatedProfile = {
        ...activeProfile,
        xp: data.xp,
        level: data.level,
      };
      setActiveProfile(updatedProfile);
      activeProfileRef.current = updatedProfile;
      localStorage.setItem("activeProfile", JSON.stringify(updatedProfile));

      return data;
    } catch (err) {
      console.error("Error adding XP:", err);
      return null;
    }
  };

  const checkPurchase = async (topicKey: string): Promise<boolean> => {
    // Use state first, then fallback to localStorage to be safe
    let currentProfile = activeProfile;
    if (!currentProfile) {
      const saved = localStorage.getItem("activeProfile");
      if (saved) {
        try {
          currentProfile = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved profile", e);
        }
      }
    }

    // If active profile is child
    if (currentProfile?.type === "child") {
      // Self-healing: If parentId is missing, try to fetch it
      if (!currentProfile.parentId) {
        try {
          const { data: childData, error: childError } = await supabase
            .from("children")
            .select("parent_id")
            .eq("id", currentProfile.id)
            .maybeSingle();

          if (!childError && childData && childData.parent_id) {
            // Update profile with parentId
            const updatedProfile = {
              ...currentProfile,
              parentId: childData.parent_id,
            };
            currentProfile = updatedProfile;
            setActiveProfile(updatedProfile);
            activeProfileRef.current = updatedProfile;
            localStorage.setItem(
              "activeProfile",
              JSON.stringify(updatedProfile)
            );
          } else {
            console.warn("❌ Could not fetch parentId for child profile");
            return false;
          }
        } catch (err) {
          console.error("❌ Error fetching missing parentId:", err);
          return false;
        }
      }

      if (currentProfile.parentId) {
        try {
          // Use RPC to check purchase (bypasses RLS for code login)
          const { data, error } = await supabase.rpc("check_child_purchase", {
            p_child_id: currentProfile.id,
            p_topic_key: topicKey,
          });

          if (error) {
            console.warn("❌ Error checking child purchase via RPC:", error);
            // Fallback to direct query if RPC fails (e.g. function doesn't exist yet)
            const { data: directData, error: directError } = await supabase
              .from("purchases")
              .select("id")
              .eq("user_id", currentProfile.parentId)
              .eq("topic_key", topicKey)
              .eq("child_id", currentProfile.id)
              .maybeSingle();

            if (directError) return false;
            return !!directData;
          }

          return !!data;
        } catch (err) {
          console.warn("❌ Unexpected error checking parent purchase:", err);
          return false;
        }
      } else {
        // If still no parentId after self-healing, return false
        console.warn("❌ No parentId available for child profile");
        return false;
      }
    }

    // Only check adult purchases if the active profile is adult
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("topic_key", topicKey)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") return false;
        if (
          error.code === "42P01" ||
          error.code === "PGRST204" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          console.warn("⚠️ Purchases table issue:", error.message);
          return false;
        }
        console.warn(
          "❌ Error checking adult purchase:",
          error.message || error
        );
        return false;
      }

      return !!data;
    } catch (err) {
      console.warn("❌ Unexpected error checking adult purchase:", err);
      return false;
    }
  };

  const purchaseTopic = async (topicKey: string) => {
    if (!user) {
      throw new Error("Нэвтэрнэ үү");
    }

    try {
      const alreadyPurchased = await checkPurchase(topicKey);
      if (alreadyPurchased) {
        showInfoToast("Та энэ сэдвийг аль хэдийн худалдаж авсан байна.");
        return;
      }

      const { error } = await supabase.from("purchases").insert({
        user_id: user.id,
        topic_key: topicKey,
      });

      if (error) {
        if (error.code === "23505") {
          showInfoToast("Та энэ сэдвийг аль хэдийн худалдаж авсан байна.");
          return;
        }
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache")
        ) {
          showErrorToast("Database table байхгүй байна.");
          throw error;
        }
        showErrorToast(error.message || "Худалдан авалт амжилтгүй боллоо.");
        throw error;
      }

      showSuccessToast("Худалдан авалт амжилттай!");
    } catch (err) {
      throw err;
    }
  };

  const markLessonCompleted = async (
    topicKey: string,
    lessonId: string
  ): Promise<{ isFirstCompletion: boolean }> => {
    // Use state first, then fallback to localStorage to be safe
    let currentProfile = activeProfile;
    if (!currentProfile) {
      const saved = localStorage.getItem("activeProfile");
      if (saved) {
        try {
          currentProfile = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved profile", e);
        }
      }
    }

    // If child profile
    if (currentProfile?.type === "child") {
      try {
        // Check if lesson was already completed
        const { data: existingProgress } = await supabase
          .from("child_progress")
          .select("id")
          .eq("child_id", currentProfile.id)
          .eq("topic_key", topicKey)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        const isFirstCompletion = !existingProgress;

        const { error } = await supabase.rpc("mark_child_progress", {
          p_child_id: currentProfile.id,
          p_topic_key: topicKey,
          p_lesson_id: lessonId,
        });

        if (error) {
          console.error("Error marking child lesson completed:", error);
          // Fallback to localStorage
          const key = `child_progress:${currentProfile.id}:${topicKey}`;
          const saved = localStorage.getItem(key);
          const list: string[] = saved ? JSON.parse(saved) : [];
          const wasNew = !list.includes(lessonId);
          if (wasNew) {
            const updated = [...list, lessonId];
            localStorage.setItem(key, JSON.stringify(updated));
          }
          return { isFirstCompletion: wasNew };
        } else {
          // Update streak
          const { data: newStreak, error: streakError } = await supabase.rpc(
            "update_child_streak",
            {
              p_child_id: currentProfile.id,
            }
          );

          if (!streakError && newStreak !== null) {
            const updatedProfile = { ...currentProfile, streak: newStreak };
            setActiveProfile(updatedProfile);
            activeProfileRef.current = updatedProfile;
            localStorage.setItem(
              "activeProfile",
              JSON.stringify(updatedProfile)
            );
          }

          // Check if we should send progress notification (every 3 lessons)
          if (isFirstCompletion && currentProfile.parentId) {
            try {
              // Get total completed lessons count
              const { count } = await supabase
                .from("child_progress")
                .select("*", { count: "exact", head: true })
                .eq("child_id", currentProfile.id);

              // Send notification every 3 lessons
              if (count && count % 3 === 0) {
                // Send email notification to parent
                await fetch("/api/send-notification", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: currentProfile.parentId,
                    type: "lesson_progress",
                    title: `${currentProfile.name} - Хичээлийн явц`,
                    message: `${currentProfile.name} ${count} хичээл дууссан байна. Гайхалтай ахиц! 🎉`,
                  }),
                });
              }
            } catch (notifError) {
              console.error("Error sending progress notification:", notifError);
              // Don't throw - notification failure shouldn't break lesson completion
            }
          }
        }

        return { isFirstCompletion };
      } catch (err) {
        console.error("Unexpected error marking child lesson completed:", err);
        return { isFirstCompletion: false };
      }
    }

    if (!user) {
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      const wasNew = !list.includes(lessonId);
      if (wasNew) {
        const updated = [...list, lessonId];
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return { isFirstCompletion: wasNew };
    }

    try {
      // Check if already completed for adult
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("topic_key", topicKey)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      const isFirstCompletion = !existingProgress;

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
          const wasNew = !list.includes(lessonId);
          if (wasNew) {
            const updated = [...list, lessonId];
            localStorage.setItem(key, JSON.stringify(updated));
          }
          return { isFirstCompletion: wasNew };
        }
        console.error("Error marking lesson completed:", error);
        throw error;
      } else {
        // Update streak for adult
        const { data: newStreak, error: streakError } = await supabase.rpc(
          "update_user_streak"
        );

        if (!streakError && newStreak !== null && currentProfile) {
          const updatedProfile = { ...currentProfile, streak: newStreak };
          setActiveProfile(updatedProfile);
          activeProfileRef.current = updatedProfile;
          localStorage.setItem("activeProfile", JSON.stringify(updatedProfile));
        }
      }

      return { isFirstCompletion };
    } catch (err) {
      console.error("Unexpected error marking lesson completed:", err);
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      const wasNew = !list.includes(lessonId);
      if (wasNew) {
        const updated = [...list, lessonId];
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return { isFirstCompletion: wasNew };
    }
  };

  const getCompletedLessons = async (topicKey: string): Promise<string[]> => {
    // Use state first, then fallback to localStorage to be safe
    let currentProfile = activeProfile;
    if (!currentProfile) {
      const saved = localStorage.getItem("activeProfile");
      if (saved) {
        try {
          currentProfile = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved profile", e);
        }
      }
    }

    // If child profile
    if (currentProfile?.type === "child") {
      try {
        const { data, error } = await supabase.rpc("get_child_progress", {
          p_child_id: currentProfile.id,
          p_topic_key: topicKey,
        });

        if (error) {
          console.error("Error getting child completed lessons:", error);
          // Fallback to localStorage
          const key = `child_progress:${currentProfile.id}:${topicKey}`;
          const saved = localStorage.getItem(key);
          return saved ? JSON.parse(saved) : [];
        }

        return data?.map((item: any) => item.lesson_id) || [];
      } catch (err) {
        console.error("Unexpected error getting child completed lessons:", err);
        const key = `child_progress:${currentProfile.id}:${topicKey}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      }
    }

    if (!user) {
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
        const key = `progress:${topicKey}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      }

      return data?.map((item) => item.lesson_id) || [];
    } catch (err) {
      console.error("Unexpected error getting completed lessons:", err);
      const key = `progress:${topicKey}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        supabase,
        user,
        activeProfile,
        loading,
        signIn,
        signUp,
        signOut,
        selectProfile,
        checkPurchase,
        purchaseTopic,
        markLessonCompleted,
        getCompletedLessons,
        lastPurchaseTime,
        addXP,
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
