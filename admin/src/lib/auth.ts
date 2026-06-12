const textEncoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "admin_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "happyacademy@gmail.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345678";
const AUTH_SECRET =
  process.env.AUTH_SECRET || "happy-teacher-admin-static-fallback-secret";

// Deterministic token so the proxy can verify the cookie without session
// storage. Web Crypto only — this module must run on the Edge runtime too.
export async function computeAuthToken(): Promise<string> {
  const data = textEncoder.encode(
    `${ADMIN_EMAIL}:${ADMIN_PASSWORD}:${AUTH_SECRET}`
  );
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
