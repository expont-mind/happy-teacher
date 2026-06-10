# Admin Static Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate every page of the `admin/` Next.js app behind a static single-account login (`happyacademy@gmail.com` / `12345678`) using a proxy (middleware) + signed httpOnly cookie.

**Architecture:** A deterministic auth token (`SHA-256("{email}:{password}:{secret}")`) is set as an httpOnly cookie by `/api/auth/login` and verified on every request by `admin/src/proxy.ts` (Next 16's renamed middleware). No database, no Supabase Auth, no sessions. Spec: `docs/superpowers/specs/2026-06-10-admin-static-auth-design.md`.

**Tech Stack:** Next.js 16.2.9 (App Router), TypeScript strict, Tailwind CSS 4, Web Crypto API (`crypto.subtle`, works in both Node and Edge runtimes), lucide-react icons. No test framework exists in `admin/` — per approved spec, verification is runtime-based (curl + Playwright), not unit tests.

**Working directory:** All file paths are relative to the repo root. The admin path alias is `@/*` → `admin/src/*`.

**Verification server:** The user's own dev server runs on port 3001 and won't pick up a new `proxy.ts` until restarted. Each task verifies against a disposable dev server on **port 3005** (started in Task 2, killed in Task 6).

---

### Task 1: Auth config and token helper

**Files:**
- Create: `admin/src/lib/auth.ts`
- Modify: `admin/.env` (append three lines)

- [ ] **Step 1: Append auth env vars to `admin/.env`**

Generate a real secret and append (do NOT overwrite the file — it holds live keys):

```bash
cd admin
printf '\nADMIN_EMAIL=happyacademy@gmail.com\nADMIN_PASSWORD=12345678\nAUTH_SECRET=%s\n' "$(openssl rand -hex 32)" >> .env
tail -4 .env
```

Expected output: blank line, then the three new lines, `AUTH_SECRET` being 64 hex chars.

- [ ] **Step 2: Create `admin/src/lib/auth.ts`**

```ts
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
```

- [ ] **Step 3: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0, no output.

- [ ] **Step 4: Commit**

```bash
git add admin/src/lib/auth.ts
git commit -m "feat(admin): add static auth config and token helper"
```

Note: `admin/.env` is gitignored — verify with `git status --short admin/.env` (expect no output); never force-add it.

---

### Task 2: Login and logout API routes

**Files:**
- Create: `admin/src/app/api/auth/login/route.ts`
- Create: `admin/src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Create `admin/src/app/api/auth/login/route.ts`**

```ts
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
    // which fails with the same 401 as wrong credentials (per spec).
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
```

- [ ] **Step 2: Create `admin/src/app/api/auth/logout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
```

- [ ] **Step 3: Start the disposable verification dev server**

```bash
cd admin && PORT=3005 npm run dev
```

Run in background. Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/login` returns a non-000 code (~10s; /login 404s for now — fine, the server is up).

- [ ] **Step 4: Verify routes with curl**

```bash
# wrong password → 401
curl -s -w "\n%{http_code}" -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"happyacademy@gmail.com","password":"wrong"}'
# malformed body → 401
curl -s -w "\n%{http_code}" -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" -d 'not-json'
# correct → 200 + Set-Cookie: admin_auth=<64 hex>; HttpOnly
curl -s -D - -o /dev/null -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"happyacademy@gmail.com","password":"12345678"}' | grep -i "set-cookie\|HTTP/"
# logout → 200 + Set-Cookie clearing admin_auth (Max-Age=0)
curl -s -D - -o /dev/null -X POST http://localhost:3005/api/auth/logout | grep -i "set-cookie\|HTTP/"
```

Expected, in order: `{"error":"INVALID_CREDENTIALS"} 401`, same for malformed, then `200` with `Set-Cookie: admin_auth=<64 hex chars>... HttpOnly`, then `200` with `Set-Cookie: admin_auth=;` and `Max-Age=0`.

- [ ] **Step 5: Commit**

```bash
git add admin/src/app/api/auth
git commit -m "feat(admin): add login/logout API routes"
```

---

### Task 3: Route protection proxy

**Files:**
- Create: `admin/src/proxy.ts`

- [ ] **Step 1: Create `admin/src/proxy.ts`**

Next 16 renamed `middleware.ts` → `proxy.ts`; the loader resolves `mod.proxy || mod.default`, so a default export named `proxy` works.

```ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, computeAuthToken } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = cookieToken === (await computeAuthToken());

  const isPublic =
    pathname === "/login" || pathname.startsWith("/api/auth/");

  if (isPublic) {
    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
```

- [ ] **Step 2: Restart the port-3005 dev server**

New root files (`proxy.ts`) are only picked up at boot. Kill the background dev server from Task 2, start it again the same way, wait for readiness.

- [ ] **Step 3: Verify protection with curl**

```bash
# no cookie → redirect to /login
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3005/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3005/payment
# garbage cookie → still redirected
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  -H "Cookie: admin_auth=forged" http://localhost:3005/delivery
# /login without cookie → 200 (no redirect loop)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3005/login
# real cookie → 200; and /login with real cookie → redirect to /
TOKEN=$(curl -s -D - -o /dev/null -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"happyacademy@gmail.com","password":"12345678"}' \
  | grep -io "admin_auth=[a-f0-9]*" | head -1)
curl -s -o /dev/null -w "%{http_code}\n" -H "Cookie: $TOKEN" http://localhost:3005/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Cookie: $TOKEN" http://localhost:3005/login
```

Expected, in order: `307 http://localhost:3005/login` twice, `307 .../login` for forged cookie, `200` for bare /login, `200` for authed /, `307 http://localhost:3005/` for authed /login.

- [ ] **Step 4: Commit**

```bash
git add admin/src/proxy.ts
git commit -m "feat(admin): protect all routes with auth proxy"
```

---

### Task 4: Login page UI

**Files:**
- Create: `admin/src/app/login/page.tsx`

- [ ] **Step 1: Create `admin/src/app/login/page.tsx`**

Styling mirrors the existing admin look (white card on `#F4F4F5`, `font-Inter`, blue `#2563EB` accents, the Sidebar's logo block).

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WhiteCircle } from "@/components/svg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (response?.ok) {
      router.replace("/");
      router.refresh();
      return;
    }

    setError("Имэйл эсвэл нууц үг буруу байна");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white border border-[#E2E8F0] rounded-lg p-8 flex flex-col gap-6">
        <div className="flex gap-2 items-center justify-center">
          <div className="p-2 rounded-lg bg-[#2563EB]">
            <WhiteCircle />
          </div>
          <div className="flex flex-col">
            <p className="font-Inter text-sm font-medium text-[#334155]">
              Expont Mind
            </p>
            <p className="font-Inter text-xs font-normal text-[#334155]">
              Admin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-Inter text-sm font-medium text-[#334155]"
            >
              Имэйл
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] font-Inter text-sm text-[#020617] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-Inter text-sm font-medium text-[#334155]"
            >
              Нууц үг
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] font-Inter text-sm text-[#020617] outline-none focus:border-[#2563EB]"
            />
          </div>

          {error && (
            <p className="font-Inter text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-lg bg-[#2563EB] font-Inter text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Playwright (deps already in `/tmp/admin-verify`) against port 3005: open `/login`, expect the form to render (email + password inputs, Нэвтрэх button), screenshot it. Submit wrong password → red "Имэйл эсвэл нууц үг буруу байна" appears, URL still `/login`.

- [ ] **Step 3: Commit**

```bash
git add admin/src/app/login/page.tsx
git commit -m "feat(admin): add login page"
```

---

### Task 5: Logout button in sidebar

**Files:**
- Create: `admin/src/components/constants/LogoutButton.tsx`
- Modify: `admin/src/components/constants/Sidebar.tsx:79` (add bottom section before the closing inner div)

- [ ] **Step 1: Create `admin/src/components/constants/LogoutButton.tsx`**

Separate client component so `Sidebar` stays a server component.

```tsx
"use client";

import { LogOut } from "lucide-react";

export const LogoutButton = () => {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full py-1.5 px-2 flex items-center gap-2 rounded-sm bg-white hover:bg-[#F4F4F5] transition-colors cursor-pointer"
    >
      <LogOut size={16} className="text-gray-500" />
      <p className="font-Inter text-sm font-normal text-gray-500">Гарах</p>
    </button>
  );
};
```

- [ ] **Step 2: Modify `admin/src/components/constants/Sidebar.tsx`**

Add the import at the top:

```tsx
import { LogoutButton } from "./LogoutButton";
```

The component currently ends with (lines 63–82):

```tsx
          {/* Delivery Section */}
          <div className="p-2 w-full border-t border-gray-100">
            ...
          </div>
        </div>
      </div>
    </div>
  );
```

Insert a bottom section as the second child of the `justify-between` container — after the closing `</div>` of `<div className="w-full h-full relative">` and before the closing `</div>` of `<div className="h-full flex flex-col justify-between">`:

```tsx
        <div className="p-2 w-full border-t border-gray-100">
          <LogoutButton />
        </div>
```

- [ ] **Step 3: Verify in browser**

Playwright against 3005: log in, expect "Гарах" button at sidebar bottom on `/`; screenshot. Click it → lands on `/login`; navigating to `/` redirects back to `/login`.

- [ ] **Step 4: Commit**

```bash
git add admin/src/components/constants/LogoutButton.tsx admin/src/components/constants/Sidebar.tsx
git commit -m "feat(admin): add logout button to sidebar"
```

---

### Task 6: Full verification suite (spec section "Verification")

**Files:**
- Create: `/tmp/admin-verify/auth-check.mjs` (throwaway, not committed)

- [ ] **Step 1: Write the Playwright script covering all 5 spec scenarios**

```js
import { chromium } from 'playwright';

const BASE = 'http://localhost:3005';
const EMAIL = 'happyacademy@gmail.com';
const PASS = '12345678';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const log = (s) => console.log(s);

// 1. logged out: protected routes redirect to /login
for (const route of ['/', '/payment', '/delivery', '/delivery/pickup']) {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
  log(`1. ${route} → ${new URL(page.url()).pathname}`);
}

// 2. wrong password: error shown, stays on /login
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.fill('#email', EMAIL);
await page.fill('#password', 'wrongpass');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
const errVisible = await page.getByText('Имэйл эсвэл нууц үг буруу байна').count();
log(`2. wrong password → error visible: ${errVisible}, path: ${new URL(page.url()).pathname}`);

// 3. correct credentials: lands on /, data renders
await page.fill('#password', PASS);
await page.click('button[type="submit"]');
await page.waitForURL(BASE + '/', { timeout: 15000 });
await page.waitForTimeout(3000);
const hasUsers = (await page.locator('body').innerText()).includes('Users');
log(`3. correct login → path: ${new URL(page.url()).pathname}, Users table: ${hasUsers}`);
await page.screenshot({ path: '/tmp/admin-verify/shots/auth_logged_in.png' });

// 4. cookie tamper: corrupt the cookie value → locked out
const cookies = await context.cookies(BASE);
const auth = cookies.find((c) => c.name === 'admin_auth');
await context.clearCookies();
await context.addCookies([{ ...auth, value: 'deadbeef' + auth.value.slice(8) }]);
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
log(`4. tampered cookie → ${new URL(page.url()).pathname}`);

// 5. real login again, then logout via sidebar button
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.fill('#email', EMAIL);
await page.fill('#password', PASS);
await page.click('button[type="submit"]');
await page.waitForURL(BASE + '/', { timeout: 15000 });
await page.getByText('Гарах').click();
await page.waitForURL('**/login', { timeout: 15000 });
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
log(`5. after logout, / → ${new URL(page.url()).pathname}`);

await browser.close();
```

- [ ] **Step 2: Run it**

```bash
cd /tmp/admin-verify && node auth-check.mjs
```

Expected output:

```
1. / → /login            (×4, all four routes)
2. wrong password → error visible: 1, path: /login
3. correct login → path: /, Users table: true
4. tampered cookie → /login
5. after logout, / → /login
```

Any deviation = stop and fix before proceeding.

- [ ] **Step 3: Type-check and lint**

```bash
cd admin && npx tsc --noEmit && npm run lint
```

Expected: both exit 0.

- [ ] **Step 4: Kill the port-3005 dev server**

Stop the background process from Task 3. Remind the user to restart their own dev server on 3001 so `proxy.ts` takes effect there.

---

## Self-review notes

- Spec coverage: config/env (Task 1), API routes + error handling (Task 2), proxy incl. authed-/login redirect and static-asset matcher (Task 3), login UI with Mongolian error (Task 4), sidebar logout (Task 5), all 5 verification scenarios (Task 6). RLS fix is an explicit non-goal.
- Types: `computeAuthToken(): Promise<string>` awaited everywhere; cookie name/max-age only from `lib/auth.ts`; login page selectors (`#email`, `#password`) match Task 4 markup; "Гарах" label matches Task 5.
- No unit-test framework introduced, per spec.
