import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  type: "adult" | "child";
  parentId?: string;
  streak?: number;
  xp?: number;
  level?: number;
  avatar?: string;
  class?: number;
}

export interface AuthContextType {
  supabase: any;
  user: User | null;
  activeProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    showToast?: boolean,
    phone?: string
  ) => Promise<{ user: any; session: any }>;
  signOut: () => Promise<void>;
  selectProfile: (profile: UserProfile) => void;
  checkPurchase: (topicKey: string) => Promise<boolean>;
  purchaseTopic: (topicKey: string) => Promise<void>;
  markLessonCompleted: (
    topicKey: string,
    lessonId: string
  ) => Promise<{ isFirstCompletion: boolean }>;
  getCompletedLessons: (topicKey: string) => Promise<string[]>;
  lastPurchaseTime: number;
  addXP: (
    amount: number
  ) => Promise<{ xp: number; level: number; leveled_up: boolean } | null>;
}
