import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  computeAuthToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    // Malformed/missing JSON falls through to the credential check,
    // which fails with the same 401 as wrong credentials.
  }

  const emailMatches =
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  if (!emailMatches || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, await computeAuthToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}
