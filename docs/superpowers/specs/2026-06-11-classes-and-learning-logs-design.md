# Classes, Admin-Created Children & Learning Logs — Design

**Date:** 2026-06-11
**Status:** Approved by user
**Branches from:** `admin-static-auth` (the new admin pages expose child PINs and
learning data, so they must sit behind the auth proxy added on that branch)
**Scope:** `admin/` (new UI + API routes) and `frontend/` (PIN login, paywall,
log writes) + one SQL migration the user runs in Supabase SQL Editor.

## Problem

Today every child belongs to a parent account (`children.parent_id` is
required) and each topic is bought per-child for ₮29,900. The user wants a
school/academy model: an admin creates **classes** (анги), adds children to a
class, and each child gets a unique 6-digit PIN that unlocks **all** topics for
free. The admin must also see a **per-child learning log** — XP earned,
duration, mistake count, start time, end time — for every completed lesson.

Hard constraint: **the student frontend must not get slower.** Logging is one
fire-and-forget insert per completion; paywall checks for class children skip
the DB entirely.

## Approach (chosen by user: "A")

Admin reads/writes through its own **server-side API routes** using a
service-role Supabase client. Those routes are already protected by the admin
auth proxy. The frontend writes logs through the anon client under an
**INSERT-only** RLS policy (it can write, never read others' logs). No existing
RLS policy is loosened.

**Non-goals:** parent-owned children's logs in admin (explicitly deferred);
changing the existing parent registration / per-topic purchase flow; fixing the
separate Supabase anon-key REST exposure noted in the 2026-06-10 audit.

## Architecture

### 1. Database — one migration: `frontend/supabase_classes_and_logs.sql`

The user runs this in the Supabase SQL Editor (agent cannot execute it). The
file is ordered and idempotent (`if not exists` / `create or replace`), and
starts with a **pre-flight check** that fails loudly if duplicate `pin_code`
values already exist (the unique index below would otherwise error).

**`classes`** (new)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `default gen_random_uuid()` |
| `name` | text not null | e.g. "5А анги" |
| `description` | text | nullable |
| `is_active` | boolean | default `true` |
| `created_at` | timestamptz | default `now()` |

**`children`** (alter — additive only)

- `alter column parent_id drop not null` — class children have no parent.
- `add column if not exists class_id uuid references classes(id) on delete set null` — deleting a class detaches children, never deletes them.
- Backfill-safe: existing parent children keep `class_id = null`.
- `create unique index if not exists children_pin_code_unique on children(pin_code) where pin_code is not null` — PIN login does `eq("pin_code", pin).maybeSingle()`; duplicates silently break it today.

**`lesson_logs`** (new)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `default gen_random_uuid()` |
| `child_id` | uuid not null | `references children(id) on delete cascade` |
| `topic_key` | text not null | `"fractions"` \| `"multiplication"` |
| `lesson_id` | text not null | lesson identifier |
| `started_at` | timestamptz | wall-clock when the lesson opened |
| `finished_at` | timestamptz | wall-clock at completion |
| `duration_seconds` | int | active coloring time (from `elapsedSecondsRef`) |
| `mistake_count` | int | from `getMistakeCount()` |
| `xp_earned` | int | total XP awarded for this completion |
| `is_first_completion` | boolean | mirrors `markLessonCompleted` result |
| `created_at` | timestamptz | default `now()` |

Index: `create index if not exists lesson_logs_child_finished_idx on lesson_logs(child_id, finished_at desc)`.

**RLS**

- `classes`: enable RLS, **no anon policies** → anon/auth blocked; only the
  service-role client (admin API routes) reads/writes. (Service role bypasses
  RLS.)
- `lesson_logs`: enable RLS + `create policy lesson_logs_anon_insert on lesson_logs for insert to anon, authenticated with check (true)`. Anon can INSERT only — no SELECT/UPDATE/DELETE policy, so logs are never readable from the browser. Admin reads via service role.
- `children`: **unchanged** RLS. The admin API uses service role for class-child
  CRUD; the frontend PIN lookup already works under existing policies.

### 2. Frontend — minimal, performance-first

**`frontend/src/components/auth/LoginContent.tsx`** — child PIN login query adds
`class_id` to the existing `select` (same single round-trip):
`select("name, id, parent_id, avatar, class_id")`. The selected profile carries
`classId` (and `parentId` may be null).

**`frontend/src/components/auth/AuthProvider.tsx`**
- `UserProfile` gains `classId?: string | null`.
- `selectProfile` / localStorage round-trip preserves `classId`.
- `checkPurchase(topicKey)`: **if `activeProfile.classId` is set, return `true`
  immediately** — no Supabase call. (Class children get all topics; this is
  strictly fewer queries than today.) Parent children keep the existing path.

**`frontend/src/features/LessonPage.tsx` and `LessonMultPage.tsx`**
- A `lessonStartRef` captures `new Date()` when the lesson view mounts (a ref —
  no re-render).
- In the existing completion handler, after XP is computed, fire a
  **non-awaited** insert into `lesson_logs` via the anon client:
  `started_at = lessonStartRef`, `finished_at = new Date()`,
  `duration_seconds = elapsedSecondsRef.current`,
  `mistake_count = getMistakeCount()`, `xp_earned = totalXP`,
  `is_first_completion`. Wrapped so a failure is swallowed (`.then`/`.catch`,
  never `await`) → zero added latency to the reward modal or navigation.
- Guard: only insert when `activeProfile?.type === "child"`. Applies to both
  class children and parent children (one code path); admin only surfaces class
  children per the non-goal.

A tiny shared helper `frontend/src/utils/lessonLog.ts` (`logLessonCompletion(args)`)
holds the insert so both lesson pages stay DRY.

### 3. Admin — service-role client, API routes, UI

**`admin/src/utils/supabase/admin.ts`** (new) — `createAdminClient()` using
`SUPABASE_SERVICE_ROLE_KEY` (already in `admin/.env`), server-only, never
imported by a client component.

**API routes** (all under the auth proxy):

| Route | Method | Purpose |
|---|---|---|
| `/api/classes` | GET | list classes (+ child count) |
| `/api/classes` | POST | create class `{name, description}` |
| `/api/classes/[id]` | PATCH | edit `{name, description, is_active}` |
| `/api/classes/[id]` | DELETE | delete class (children detach via FK) |
| `/api/classes/[id]/children` | GET | children in class (id, name, pin, xp, level, last_active, lesson count) |
| `/api/classes/[id]/children` | POST | create child `{name, avatar?, age?, class}`; **server generates a unique 6-digit PIN** (retry on collision against the unique index) |
| `/api/children/[id]` | PATCH | edit class child `{name, avatar, age, class}` |
| `/api/children/[id]` | DELETE | delete child — **only if `class_id is not null`** (refuse to touch parent children) |
| `/api/children/[id]/logs` | GET | `lesson_logs` for child, newest first, `?limit=50&offset=` pagination + aggregate totals (lessons, seconds, mistakes, XP) |

PIN generation: random 6-digit (`100000`–`999999`), insert, on unique-violation
retry up to 5 times, then 500. Keeps PINs globally unique.

**Naming note:** `children` already has a `class` column (an integer **grade
level**, set by the existing `AddChildModal` as `class: childGrade`). The new
`class_id` (FK to `classes`) is the **анги** membership — a distinct concept.
The admin "add child" form may collect grade (`class`) as optional; class
membership comes from the route's `[id]` (`class_id`), not the form body.

**UI** (mirrors existing admin look — white cards on `#F4F4F5`, `font-Inter`,
the Sidebar pattern):

- Sidebar: new "Сургалт" section → **Ангиуд** link to `/classes` (active-state
  prop extended like the existing `delivery` prop).
- `/classes` (`ClassesPage`): table of classes (name, description, child count,
  status, edit/delete) + "Шинэ анги" create dialog. Same dialog/table idiom as
  `DeliveryZonesPage`.
- `/classes/[id]` (`ClassDetailPage`): class header + children table — name,
  **PIN (visible)**, lessons done, XP, level, last active — with "Хүүхэд нэмэх"
  dialog (name/age/avatar; PIN shown after creation) and edit/delete per row.
  Each row links to the log page.
- `/children/[id]/logs` (`ChildLogsPage`): summary cards (total lessons, total
  time, total mistakes, total XP) + a table: date, topic, lesson, start, end,
  duration, mistakes, XP. Pagination ("Цааш").

## Data flow

1. Admin creates class → `POST /api/classes` → service role insert.
2. Admin adds child → `POST /api/classes/[id]/children` → server makes unique
   PIN, inserts `children` row with `class_id`, `parent_id = null`.
3. Child logs in on frontend with PIN → existing query (now selecting
   `class_id`) → profile has `classId`.
4. Child opens a topic → `checkPurchase` sees `classId` → unlocked, no DB call.
5. Child finishes a lesson → existing XP/progress flow runs → one fire-and-forget
   `lesson_logs` insert.
6. Admin opens child's log page → `GET /api/children/[id]/logs` → service role
   reads `lesson_logs` + totals.

## Error handling

- SQL pre-flight aborts the migration if duplicate PINs exist, with a query to
  find them (the user resolves, re-runs).
- Frontend log insert: failure is swallowed and `console.warn`'d — never blocks
  UI, matches the codebase's existing localStorage-fallback philosophy.
- Admin API: input validation → 400; service-role/DB error → 500 with a logged
  reason; child DELETE refuses parent children → 403.
- PIN collision on create → server retries; exhausted → 500 "PIN үүсгэж чадсангүй".

## Verification (no unit tests — matches both apps)

Runtime, against dev servers, Playwright + curl:

1. **SQL applied by user** (gate — agent confirms tables exist via a service-role
   probe before frontend/admin verification of the DB-dependent paths).
2. Admin: create class → appears in list; add child → 6-digit PIN shown and is
   unique; child row shows in class detail.
3. Frontend: log in with that PIN → lands in app; open a topic → unlocked with
   **no** purchase/paywall network call (observed in devtools/network log).
4. Log write: drive a lesson completion (or, where full canvas completion isn't
   bot-feasible, invoke the same `logLessonCompletion` helper through the anon
   client) → a `lesson_logs` row appears; confirm anon **cannot** SELECT it back.
5. Admin: open child log page → the row and correct totals render.
6. Probe: `DELETE /api/children/[id]` on a parent child → 403; class child → ok.
7. Perf check: confirm the lesson completion handler issues the log insert
   without `await` (no added wait before reward modal).
