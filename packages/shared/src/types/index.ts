import { User } from "@supabase/supabase-js";

// ============================================
// User & Profile Types
// ============================================

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

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
  avatar_url?: string;
}

// ============================================
// Auth Context Types
// ============================================

export interface AuthContextType {
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>;
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
  ) => Promise<{ user: User | null; session: unknown }>;
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

// ============================================
// Coupon Types
// ============================================

export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  color: string;
  codePrefix: string;
}

export interface PurchasedCoupon {
  id: string;
  coupon_id: string;
  code: string;
  created_at: string;
  is_used: boolean;
}

// ============================================
// Payment / Bonum Types
// ============================================

export interface BonumInvoiceItem {
  image?: string;
  title: string;
  remark?: string;
  amount: number;
  count: number;
}

export interface BonumExtra {
  placeholder: string;
  type: "PHONE" | "NUMBER" | "EMAIL" | "TEXT" | "ALL";
  required: boolean;
}

export interface QPayLink {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface QPayResponse {
  qr_text: string;
  qr_image: string;
  urls: QPayLink[];
  invoice_id: string;
}

export interface CreateInvoiceRequest {
  amount: number;
  callback: string;
  transactionId: string;
  expiresIn?: number;
  items?: BonumInvoiceItem[];
  extras?: BonumExtra[];
}

// ============================================
// Supabase Error Codes
// ============================================

export const SUPABASE_ERROR_CODES = {
  TABLE_NOT_FOUND: "42P01",
  NOT_FOUND: "PGRST116",
  DUPLICATE: "23505",
  RLS_DENIED: "42501",
} as const;

export type SupabaseErrorCode =
  (typeof SUPABASE_ERROR_CODES)[keyof typeof SUPABASE_ERROR_CODES];
