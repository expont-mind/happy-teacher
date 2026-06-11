# Admin User Detail Page — Design

**Date:** 2026-06-11
**Status:** Approved by user
**Branch:** `classes-and-logs` (continues the admin work; reuses the service-role + auth-proxy pattern from the classes feature)
**Scope:** `admin/` only — one new API route, the `/user/[id]` route wrapper, and the `UserDetailPage` feature component.

## Problem

The admin User Detail page (`admin/src/features/UserDetailPage.tsx`) is an empty
stub — its content components are commented out, so clicking a user from the home
table shows only a "User Detail" header. Even if wired up with the existing
browser anon client, it could not read another user's children/purchases/orders:
those tables have parent-scoped RLS and the admin is not the parent. The user
wants the page to show the user's profile plus payment/purchase information.

## Goal

Show, for a selected parent user:
1. **Profile card** — avatar, name, email, phone, registration date, user ID, plus
   two summary numbers (topics purchased, total paid).
2. **Payment / Purchases** — two tables: topics the user bought (with which child
   and when), and the user's payment invoices (amount, topic, status, date).

Out of scope (not selected by user): a Children section and a product-orders
(`child_coupons`) section.

## Approach

Same as the classes feature: the admin reads through a **server-side API route
using the service-role client**, behind the existing auth proxy. This is the only
sound option — the browser anon client is blocked by RLS on `children`/
`purchases`/`pending_invoices` for a non-owner, and loosening that RLS would
expose the data publicly.

## Architecture

### 1. API route — `admin/src/app/api/users/[id]/route.ts` (GET)

Service-role (`createAdminClient`). Returns `{ profile, purchases, invoices, summary }`:

- **profile**: from `profiles` (`id, full_name, email, avatar_url, created_at`),
  enriched with phone + metadata from `supabase.auth.admin.getUserById(id)`
  (`user.user_metadata.phone`, `.full_name` as fallbacks; `user.email` as the
  authoritative email). If `getUserById` errors, fall back to the `profiles` row
  alone (phone shown as "-"). 404 if the `profiles` row is missing.
- **purchases**: from `purchases` (`id, topic_key, child_id, created_at`) where
  `user_id = id`, newest first. Resolve child names in one batched query
  (`children` `id, name` `.in(child_ids)`) and attach `child_name`.
- **invoices**: from `pending_invoices` (`id, amount, topic_key, status,
  created_at`) where `user_id = id`, newest first. (Table may not exist in every
  environment — on a "relation does not exist"/42P01 error, return `invoices: []`
  rather than 500, matching the codebase's defensive pattern.)
- **summary**: `{ topics_purchased: purchases.length, total_paid }` where
  `total_paid` sums `amount` of invoices whose `status` is `paid` or `completed`.

### 2. Route wrapper — `admin/src/app/user/[id]/page.tsx`

Currently renders `<UserDetailPage />` with no id. Change to the async-params
pattern used by the other detail routes and pass `userId`:

```tsx
export default async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailPage userId={id} />;
}
```

### 3. Feature — `admin/src/features/UserDetailPage.tsx`

Becomes a client component `({ userId }: { userId: string })` that fetches
`/api/users/${userId}` on mount and renders:

- **Header**: back button (`router.back()`) + "User Detail" title (keep existing).
- **Profile card**: avatar circle (image if `avatar_url`, else initial), name,
  email, phone, "Бүртгүүлсэн" date, user ID (mono, truncated), and a small
  right-aligned stat block: "Авсан сэдэв: N", "Нийт төлсөн: ₮X".
- **Purchases table**: columns Сэдэв (mapped: fractions→Бутархай,
  multiplication→Үржвэр; unknown→raw key), Хүүхэд (`child_name` or "-"), Огноо.
  Empty → "Худалдан авалт алга".
- **Invoices table**: columns Дүн (`amount`₮), Сэдэв, Төлөв (status mapped:
  pending→Хүлээгдэж буй, paid→Төлсөн, completed→Дууссан, expired→Хугацаа
  дууссан; else raw), Огноо. Empty → "Төлбөрийн бичлэг алга".
- **States**: loading → spinner; fetch fails or 404 → "Хэрэглэгч олдсонгүй".

Styling matches the admin convention (white cards on `#F4F4F5`, `font-Inter`,
the card/table idiom from `ChildLogsPage`). Date formatting via `date-fns`
`format` (already an admin dependency).

## Data flow

home table → `/user/[id]` → `page.tsx` passes `userId` → `UserDetailPage` fetches
`GET /api/users/[id]` → service-role reads profiles + auth admin + purchases +
children-names + invoices → renders profile card + two payment tables.

## Error handling

- Missing profile → API 404 → UI "Хэрэглэгч олдсонгүй".
- `pending_invoices` table absent (42P01) → `invoices: []`, page still renders.
- `getUserById` failure → profile from `profiles` only, phone "-".
- Any service-role/DB error on the core profile/purchases queries → 500 with a
  logged reason → UI "Хэрэглэгч олдсонгүй".

## Verification (runtime, no unit tests)

1. Pick a real user id from the home list; `GET /api/users/[id]` with the admin
   auth cookie returns profile + purchases + invoices + summary (curl).
2. Browser: click a user in the admin home table → profile card renders with
   name/email/date; purchase and invoice tables render (or their empty states).
3. Probe: a fake/nonexistent user id → "Хэрэглэгч олдсонгүй", no crash.
4. Confirm the route is behind auth (no cookie → redirect to /login).
