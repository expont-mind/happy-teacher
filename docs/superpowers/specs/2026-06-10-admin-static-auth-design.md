# Admin Static Auth — Design

**Date:** 2026-06-10
**Status:** Approved by user
**Scope:** `admin/` app only

## Problem

The admin app (localhost:3001, deployed via Vercel) has zero authentication.
Anyone who reaches the URL can view all user emails, customer phones/addresses,
and orders. Verified by runtime check on 2026-06-10: no middleware, no login,
no session checks anywhere in `admin/src`.

## Goal

Gate every admin page behind a static single-account login, with no database
or Supabase Auth dependency.

- Credentials: `happyacademy@gmail.com` / `12345678` (user-specified)
- Server-side protection: typing a URL directly must not bypass the gate

**Non-goal:** Fixing the Supabase RLS exposure (anon key allows direct REST
reads/writes). That is a separate, pre-existing issue and stays out of scope.

## Approach (chosen by user from 3 options)

Middleware + httpOnly cookie. Rejected alternatives: client-side localStorage
gate (trivially bypassable), HTTP Basic Auth (no logout, poor UX).

## Architecture

Five small pieces, all inside the admin app:

| File | Responsibility |
|---|---|
| `admin/src/proxy.ts` | Route protection. Next 16 convention (renamed from `middleware.ts`; both supported in 16.2.9, `proxy.ts` is current). Checks `admin_auth` cookie on every request; missing/wrong → redirect to `/login`. Skips `/login`, `/api/auth/*`, `/_next/*`, static assets. Authenticated visit to `/login` → redirect to `/`. |
| `admin/src/lib/auth.ts` | Single source of truth: cookie name, credential constants (env with hardcoded fallback), async `computeAuthToken()` via Web Crypto SHA-256 (Edge-compatible). |
| `admin/src/app/login/page.tsx` | Login UI. Client component styled like existing admin (white card, Tailwind, Expont Mind branding). Posts JSON to `/api/auth/login`; on 401 shows "Имэйл эсвэл нууц үг буруу байна"; on success `router.replace("/")`. |
| `admin/src/app/api/auth/login/route.ts` | POST. Compares submitted email/password to configured credentials; match → set cookie, 200; mismatch → 401. |
| `admin/src/app/api/auth/logout/route.ts` | POST. Clears the cookie, 200. |

Plus one edit: logout button at the bottom of `Sidebar`
(`admin/src/components/constants/Sidebar.tsx`), which calls
`/api/auth/logout` then redirects to `/login`.

## Cookie & token

- Name: `admin_auth`
- Value: hex `SHA-256("{email}:{password}:{secret}")` — deterministic, so the
  Edge middleware can recompute and compare without storing sessions. Not a
  plain flag, so a cookie cannot be forged without knowing the secret.
- Attributes: `httpOnly`, `sameSite=lax`, `path=/`, `secure` when
  `NODE_ENV=production`, `maxAge` 7 days.

## Configuration

`.env` in `admin/` (and Vercel project settings when deployed):

```bash
ADMIN_EMAIL=happyacademy@gmail.com
ADMIN_PASSWORD=12345678
AUTH_SECRET=<implementation writes a concrete generated random value here>
```

`lib/auth.ts` falls back to these same email/password defaults and a fixed
fallback secret constant when env vars are absent, so the app works out of
the box per user request. Changing the password later is an env edit, not a
code change.

## Error handling

- Wrong credentials → 401 JSON; form shows Mongolian error, stays on page.
- Malformed/missing request body → 401 (same path as wrong credentials).
- Unauthenticated page request → 307 redirect to `/login` (no return-URL
  tracking — YAGNI for a single-admin tool).
- Already authenticated on `/login` → redirect to `/`.

## Verification (no unit tests)

The admin codebase has no test framework; introducing one for this feature is
out of proportion. Instead, runtime verification with Playwright against the
dev server, matching the 2026-06-10 audit method:

1. Logged out: `/`, `/payment`, `/delivery`, `/delivery/pickup` all redirect
   to `/login` (server-side, checked via response status/URL).
2. Wrong password → error message shown, still on `/login`.
3. Correct credentials → lands on `/`, data renders.
4. Cookie tamper probe: edit cookie value → next navigation redirects to
   `/login`.
5. Logout → back to `/login`; revisiting `/` stays locked.
