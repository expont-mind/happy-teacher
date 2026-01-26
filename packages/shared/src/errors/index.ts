import { SUPABASE_ERROR_CODES, type SupabaseErrorCode } from "../types";

/**
 * Mongolian translations for common authentication errors
 */
const AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid login credentials": "Имэйл эсвэл нууц үг буруу байна",
  "Email not confirmed": "Имэйл баталгаажуулаагүй байна",
  "User already registered": "Энэ имэйл бүртгэлтэй байна",
  "Password should be at least 6 characters":
    "Нууц үг 6-с дээш тэмдэгт байх ёстой",
  "Unable to validate email address: invalid format":
    "Имэйл хаягийн формат буруу байна",
  "Signup requires a valid password": "Нууц үг оруулна уу",
  "Anonymous sign-ins are disabled": "Нэвтрэх боломжгүй байна",
  "Email rate limit exceeded": "Хэт олон оролдлого хийсэн, түр хүлээнэ үү",
  "For security purposes, you can only request this after":
    "Аюулгүй байдлын үүднээс та дараа дахин оролдоно уу",
};

/**
 * Translates Supabase auth errors to Mongolian
 */
export function translateAuthError(error: string): string {
  // Check for exact match
  if (AUTH_ERROR_TRANSLATIONS[error]) {
    return AUTH_ERROR_TRANSLATIONS[error];
  }

  // Check for partial match
  for (const [key, value] of Object.entries(AUTH_ERROR_TRANSLATIONS)) {
    if (error.includes(key)) {
      return value;
    }
  }

  return error;
}

/**
 * Checks if a Supabase error indicates a missing table
 */
export function isTableNotFoundError(error: { code?: string }): boolean {
  return error?.code === SUPABASE_ERROR_CODES.TABLE_NOT_FOUND;
}

/**
 * Checks if a Supabase error indicates a not found record
 */
export function isNotFoundError(error: { code?: string }): boolean {
  return error?.code === SUPABASE_ERROR_CODES.NOT_FOUND;
}

/**
 * Checks if a Supabase error indicates a duplicate record
 */
export function isDuplicateError(error: { code?: string }): boolean {
  return error?.code === SUPABASE_ERROR_CODES.DUPLICATE;
}

/**
 * Checks if a Supabase error indicates an RLS permission denied
 */
export function isRLSError(error: { code?: string }): boolean {
  return error?.code === SUPABASE_ERROR_CODES.RLS_DENIED;
}

/**
 * Checks if an error is a recoverable Supabase error
 * (missing table, not found, etc.)
 */
export function isRecoverableError(error: { code?: string }): boolean {
  return (
    isTableNotFoundError(error) || isNotFoundError(error) || isRLSError(error)
  );
}
