import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  type: "adult" | "child";
  parentId?: string;
}

export interface AuthContextType {
  user: User | null;
  activeProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectProfile: (profile: UserProfile) => void;
  checkPurchase: (topicKey: string) => Promise<boolean>;
  purchaseTopic: (topicKey: string) => Promise<void>;
  markLessonCompleted: (topicKey: string, lessonId: string) => Promise<void>;
  getCompletedLessons: (topicKey: string) => Promise<string[]>;
}
