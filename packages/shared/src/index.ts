// Supabase utilities
export { createClient } from "./utils/supabase/client";
export {
  createClient as createServerClient,
  createServiceRoleClient,
} from "./utils/supabase/server";

// Types
export type {
  UserProfile,
  AdminUser,
  AuthContextType,
  Coupon,
  PurchasedCoupon,
  BonumInvoiceItem,
  BonumExtra,
  QPayLink,
  QPayResponse,
  CreateInvoiceRequest,
  SupabaseErrorCode,
} from "./types";
export { SUPABASE_ERROR_CODES } from "./types";

// Utilities
export { cn } from "./lib/utils";

// Error handling
export {
  translateAuthError,
  isTableNotFoundError,
  isNotFoundError,
  isDuplicateError,
  isRLSError,
  isRecoverableError,
} from "./errors";
