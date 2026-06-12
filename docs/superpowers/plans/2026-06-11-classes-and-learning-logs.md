# Classes, Admin-Created Children & Learning Logs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin create classes (анги), add children with auto-generated unique 6-digit PINs that unlock all topics for free, and view each child's per-lesson learning log (XP, duration, mistakes, start/end) — without slowing the student frontend.

**Architecture:** Admin reads/writes via server-side API routes using a service-role Supabase client, all behind the existing admin auth proxy. The frontend writes one fire-and-forget `lesson_logs` insert per completion under an INSERT-only RLS policy, and short-circuits the paywall for class children (zero DB calls). One SQL migration (run by the user in Supabase SQL Editor) adds `classes`, alters `children`, and adds `lesson_logs`.

**Tech Stack:** Next.js 16.2.9 (App Router, route handlers with `params: Promise<...>`), TypeScript strict, Supabase JS (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS 4, Radix UI dialogs (admin), Playwright + curl for runtime verification. No unit-test framework exists in either app — verification is runtime, matching the prior admin-static-auth plan.

**Branch:** Create `classes-and-logs` off `admin-static-auth` (the new admin pages expose PINs/logs and must sit behind the auth proxy added there). All paths are relative to repo root. Frontend alias `@/*` → `frontend/` root (so `@/src/...`); admin alias `@/*` → `admin/src/*`.

**Service-role safety:** `SUPABASE_SERVICE_ROLE_KEY` already exists in `admin/.env`. The admin client that uses it must only ever be imported by route handlers / server code, never a `"use client"` file.

---

### Task 0: Create the feature branch

- [ ] **Step 1: Branch off admin-static-auth**

```bash
git checkout admin-static-auth
git checkout -b classes-and-logs
git branch --show-current
```

Expected: `classes-and-logs`.

---

### Task 1: SQL migration (user-run)

**Files:**
- Create: `frontend/supabase_classes_and_logs.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- Classes, admin-created children, and per-lesson learning logs.
-- Run this in the Supabase SQL Editor. Idempotent and ordered.

-- 0. PRE-FLIGHT: the unique PIN index below fails if duplicates already exist.
--    This block raises a clear error listing the offending PINs. Resolve them
--    (re-assign duplicates), then re-run the whole file.
do $$
declare
  dup_count int;
begin
  select count(*) into dup_count from (
    select pin_code from children
    where pin_code is not null
    group by pin_code having count(*) > 1
  ) d;
  if dup_count > 0 then
    raise exception
      'Found % duplicate pin_code value(s). Run: select pin_code, count(*) from children where pin_code is not null group by pin_code having count(*) > 1;  Resolve, then re-run.', dup_count;
  end if;
end $$;

-- 1. classes
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. children: allow class children (no parent) + class membership
alter table children alter column parent_id drop not null;
alter table children add column if not exists class_id uuid references classes(id) on delete set null;
create unique index if not exists children_pin_code_unique on children(pin_code) where pin_code is not null;

-- 3. lesson_logs
create table if not exists lesson_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  topic_key text not null,
  lesson_id text not null,
  started_at timestamptz,
  finished_at timestamptz,
  duration_seconds int,
  mistake_count int,
  xp_earned int,
  is_first_completion boolean,
  created_at timestamptz not null default now()
);
create index if not exists lesson_logs_child_finished_idx on lesson_logs(child_id, finished_at desc);

-- 4. RLS
alter table classes enable row level security;
-- classes: no anon/auth policies -> only service_role (admin API) can touch it.

alter table lesson_logs enable row level security;
-- lesson_logs: anon/auth may INSERT only; no SELECT/UPDATE/DELETE policy ->
-- logs are write-only from the browser, readable only via service_role.
drop policy if exists lesson_logs_anon_insert on lesson_logs;
create policy lesson_logs_anon_insert on lesson_logs
  for insert to anon, authenticated
  with check (true);
```

- [ ] **Step 2: Tell the user to run it, and confirm before proceeding**

This step is a hard gate. Output to the user:

> Please run `frontend/supabase_classes_and_logs.sql` in the Supabase SQL Editor and tell me when it's applied. (If it raises a duplicate-PIN error, run the query it prints, fix the duplicates, and re-run.)

Do not start Task 9–11 verification of DB-dependent paths until the user confirms. (Tasks 2–8 can be written without the DB; their *verification* steps that hit the DB wait on this.)

- [ ] **Step 3: Commit**

```bash
git add frontend/supabase_classes_and_logs.sql
git commit -m "feat(db): classes, class children, and lesson_logs migration"
```

---

### Task 2: Admin service-role Supabase client

**Files:**
- Create: `admin/src/utils/supabase/admin.ts`

- [ ] **Step 1: Create the server-only service-role client**

```ts
import { createClient } from "@supabase/supabase-js";

// Server-only. Uses the service-role key, which bypasses RLS.
// NEVER import this from a "use client" component — only route handlers.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add admin/src/utils/supabase/admin.ts
git commit -m "feat(admin): add server-only service-role supabase client"
```

---

### Task 3: Classes CRUD API routes

**Files:**
- Create: `admin/src/app/api/classes/route.ts`
- Create: `admin/src/app/api/classes/[id]/route.ts`

- [ ] **Step 1: Create `admin/src/app/api/classes/route.ts` (GET list + POST create)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach child counts (one grouped query, mapped in memory).
  const { data: children } = await supabase
    .from("children")
    .select("class_id")
    .not("class_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of children || []) {
    counts.set(row.class_id, (counts.get(row.class_id) || 0) + 1);
  }

  const withCounts = (classes || []).map((c) => ({
    ...c,
    child_count: counts.get(c.id) || 0,
  }));

  return NextResponse.json({ classes: withCounts });
}

export async function POST(request: NextRequest) {
  let name = "";
  let description: string | null = null;
  try {
    const body = await request.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    description =
      typeof body.description === "string" ? body.description.trim() : null;
  } catch {
    // fall through to validation
  }

  if (!name) {
    return NextResponse.json({ error: "Нэр шаардлагатай" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({ name, description })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ class: data });
}
```

- [ ] **Step 2: Create `admin/src/app/api/classes/[id]/route.ts` (PATCH + DELETE)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (typeof body.description === "string")
    update.description = body.description.trim();
  if (typeof body.is_active === "boolean") update.is_active = body.is_active;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Өөрчлөх утга алга" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("classes")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ class: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add admin/src/app/api/classes
git commit -m "feat(admin): classes CRUD API routes"
```

---

### Task 4: Class children API routes (with PIN generation)

**Files:**
- Create: `admin/src/lib/pin.ts`
- Create: `admin/src/app/api/classes/[id]/children/route.ts`
- Create: `admin/src/app/api/children/[id]/route.ts`

- [ ] **Step 1: Create `admin/src/lib/pin.ts` (unique PIN generator)**

```ts
import { SupabaseClient } from "@supabase/supabase-js";

// Generate a 6-digit PIN unique against children.pin_code.
// Relies on the children_pin_code_unique index to reject races on insert,
// but pre-checks to minimize retries. Throws after 5 attempts.
export async function generateUniquePin(
  supabase: SupabaseClient
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const pin = String(100000 + Math.floor(Math.random() * 900000));
    const { data, error } = await supabase
      .from("children")
      .select("id")
      .eq("pin_code", pin)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return pin;
  }
  throw new Error("PIN үүсгэж чадсангүй");
}
```

- [ ] **Step 2: Create `admin/src/app/api/classes/[id]/children/route.ts` (GET + POST)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateUniquePin } from "@/lib/pin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: children, error } = await supabase
    .from("children")
    .select("id, name, pin_code, avatar, age, class, xp, level, last_active_at, created_at")
    .eq("class_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Lessons-done count per child (one query, grouped in memory).
  const ids = (children || []).map((c) => c.id);
  const lessonCounts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: progress } = await supabase
      .from("child_progress")
      .select("child_id")
      .in("child_id", ids);
    for (const row of progress || []) {
      lessonCounts.set(row.child_id, (lessonCounts.get(row.child_id) || 0) + 1);
    }
  }

  const withCounts = (children || []).map((c) => ({
    ...c,
    lessons_done: lessonCounts.get(c.id) || 0,
  }));

  return NextResponse.json({ children: withCounts });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let name = "";
  let avatar: string | null = null;
  let age: number | null = null;
  let grade: number | null = null;
  try {
    const body = await request.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    avatar = typeof body.avatar === "string" ? body.avatar : null;
    age = typeof body.age === "number" ? body.age : null;
    // `class` here is the child's GRADE level (integer), not class_id.
    grade = typeof body.class === "number" ? body.class : null;
  } catch {
    // fall through
  }

  if (!name) {
    return NextResponse.json({ error: "Нэр шаардлагатай" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let pin: string;
  try {
    pin = await generateUniquePin(supabase);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PIN алдаа" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("children")
    .insert({
      name,
      pin_code: pin,
      avatar,
      age,
      class: grade,
      class_id: id,
      parent_id: null,
    })
    .select("id, name, pin_code, avatar, age, class")
    .single();

  if (error) {
    // 23505 = unique violation (PIN race) — surface a retryable message.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "PIN давхцал гарлаа, дахин оролдоно уу" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ child: data });
}
```

- [ ] **Step 3: Create `admin/src/app/api/children/[id]/route.ts` (PATCH + DELETE, class children only)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Guard: only class children (class_id not null) may be edited/deleted here.
// Parent-owned children are out of scope and must never be touched.
async function assertClassChild(
  supabase: ReturnType<typeof createAdminClient>,
  id: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { data, error } = await supabase
    .from("children")
    .select("id, class_id")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, status: 500, error: error.message };
  if (!data) return { ok: false, status: 404, error: "Хүүхэд олдсонгүй" };
  if (!data.class_id)
    return { ok: false, status: 403, error: "Энэ хүүхэд ангид харьяалагдахгүй" };
  return { ok: true };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const guard = await assertClassChild(supabase, id);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Буруу хүсэлт" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (typeof body.avatar === "string") update.avatar = body.avatar;
  if (typeof body.age === "number") update.age = body.age;
  if (typeof body.class === "number") update.class = body.class;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Өөрчлөх утга алга" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("children")
    .update(update)
    .eq("id", id)
    .select("id, name, pin_code, avatar, age, class")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ child: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const guard = await assertClassChild(supabase, id);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add admin/src/lib/pin.ts admin/src/app/api/classes/[id]/children admin/src/app/api/children/[id]
git commit -m "feat(admin): class children API routes with unique PIN generation"
```

---

### Task 5: Child learning-logs API route

**Files:**
- Create: `admin/src/app/api/children/[id]/logs/route.ts`

- [ ] **Step 1: Create the logs route (GET, paginated + totals)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;

  const supabase = createAdminClient();

  const { data: logs, error } = await supabase
    .from("lesson_logs")
    .select("*")
    .eq("child_id", id)
    .order("finished_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Totals across ALL logs for this child (not just the page).
  const { data: allForTotals, error: totalsError } = await supabase
    .from("lesson_logs")
    .select("duration_seconds, mistake_count, xp_earned")
    .eq("child_id", id);

  if (totalsError) {
    return NextResponse.json({ error: totalsError.message }, { status: 500 });
  }

  const totals = (allForTotals || []).reduce(
    (acc, row) => ({
      lessons: acc.lessons + 1,
      seconds: acc.seconds + (row.duration_seconds || 0),
      mistakes: acc.mistakes + (row.mistake_count || 0),
      xp: acc.xp + (row.xp_earned || 0),
    }),
    { lessons: 0, seconds: 0, mistakes: 0, xp: 0 }
  );

  return NextResponse.json({ logs: logs || [], totals });
}
```

- [ ] **Step 2: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add admin/src/app/api/children/[id]/logs
git commit -m "feat(admin): child learning-logs API route"
```

---

### Task 6: Admin sidebar link + Classes list page

**Files:**
- Modify: `admin/src/components/constants/Sidebar.tsx` (add Сургалт section)
- Create: `admin/src/app/classes/page.tsx`
- Create: `admin/src/features/ClassesPage.tsx`

- [ ] **Step 1: Add a "Сургалт" section to the Sidebar**

In `admin/src/components/constants/Sidebar.tsx`, extend the `SidebarType` and add a section. The type currently is:

```tsx
type SidebarType = {
  user: string;
  payment: string;
  delivery?: string;
};
```

Replace with:

```tsx
type SidebarType = {
  user: string;
  payment: string;
  delivery?: string;
  classes?: string;
};
```

Then, immediately after the closing `</div>` of the Delivery Section block (the
`<div className="p-2 w-full border-t border-gray-100">` that holds the two
delivery links), add a new section:

```tsx
          {/* Сургалт Section */}
          <div className="p-2 w-full border-t border-gray-100">
            <p className="px-2 py-1 text-xs text-gray-400 uppercase font-Inter">
              Сургалт
            </p>
            <SidebarLink
              href="/classes"
              isActive={props.classes === "classes"}
              label="Ангиуд"
            />
          </div>
```

- [ ] **Step 2: Create the route wrapper `admin/src/app/classes/page.tsx`**

```tsx
import { ClassesPage } from "@/features/ClassesPage";

export default function Classes() {
  return <ClassesPage />;
}
```

- [ ] **Step 3: Create `admin/src/features/ClassesPage.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Plus, Trash2 } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ClassRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  child_count: number;
}

export const ClassesPage = () => {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/classes").catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setClasses(json.classes || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    }).catch(() => null);
    setSubmitting(false);
    if (res?.ok) {
      setDialogOpen(false);
      setName("");
      setDescription("");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ ангийг устгах уу? Хүүхдүүд устахгүй, зөвхөн ангиас гарна.")) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (res?.ok) load();
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" classes="classes" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2563EB]">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-Inter text-2xl font-semibold text-[#020617]">
                    Ангиуд
                  </p>
                  <p className="font-Inter text-sm text-gray-500">
                    Сургалтын ангиуд болон сурагчид
                  </p>
                </div>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus size={16} /> Шинэ анги
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr className="text-left font-Inter text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Ангийн нэр</th>
                    <th className="px-4 py-3 font-medium">Тайлбар</th>
                    <th className="px-4 py-3 font-medium">Сурагчид</th>
                    <th className="px-4 py-3 font-medium">Төлөв</th>
                    <th className="px-4 py-3 font-medium text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Уншиж байна...
                      </td>
                    </tr>
                  ) : classes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Одоогоор анги байхгүй байна
                      </td>
                    </tr>
                  ) : (
                    classes.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-gray-100 hover:bg-gray-50 font-Inter text-sm"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/classes/${c.id}`}
                            className="text-[#2563EB] hover:underline flex items-center gap-1"
                          >
                            {c.name} <ChevronRight size={14} />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {c.description || "-"}
                        </td>
                        <td className="px-4 py-3">{c.child_count}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              c.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-md border border-gray-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ анги</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-Inter text-sm font-medium text-[#334155]">
                Ангийн нэр
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-Inter text-sm font-medium text-[#334155]">
                Тайлбар
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Болих
            </Button>
            <Button onClick={handleCreate} disabled={submitting || !name.trim()}>
              {submitting ? "Үүсгэж байна..." : "Үүсгэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

- [ ] **Step 4: Verify UI component imports exist**

```bash
ls admin/src/components/ui/button.tsx admin/src/components/ui/input.tsx admin/src/components/ui/dialog.tsx
```

Expected: all three paths print (no "No such file"). If `input.tsx` is missing,
check the actual filename with `ls admin/src/components/ui/` and adjust the import
in ClassesPage to match (the admin uses shadcn-style lowercase filenames).

- [ ] **Step 5: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add admin/src/components/constants/Sidebar.tsx admin/src/app/classes/page.tsx admin/src/features/ClassesPage.tsx
git commit -m "feat(admin): classes list page and sidebar link"
```

---

### Task 7: Class detail page (children + PINs)

**Files:**
- Create: `admin/src/app/classes/[id]/page.tsx`
- Create: `admin/src/features/ClassDetailPage.tsx`

- [ ] **Step 1: Create the route wrapper `admin/src/app/classes/[id]/page.tsx`**

```tsx
import { ClassDetailPage } from "@/features/ClassDetailPage";

export default async function ClassDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassDetailPage classId={id} />;
}
```

- [ ] **Step 2: Create `admin/src/features/ClassDetailPage.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Plus, Trash2 } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ChildRow {
  id: string;
  name: string;
  pin_code: string | null;
  avatar: string | null;
  age: number | null;
  class: number | null;
  xp: number | null;
  level: number | null;
  last_active_at: string | null;
  lessons_done: number;
}

export const ClassDetailPage = ({ classId }: { classId: string }) => {
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [newPin, setNewPin] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/classes/${classId}/children`).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setChildren(json.children || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [classId]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/classes/${classId}/children`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: age ? Number(age) : undefined,
      }),
    }).catch(() => null);
    setSubmitting(false);
    if (res?.ok) {
      const json = await res.json();
      setNewPin(json.child?.pin_code || null);
      setName("");
      setAge("");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ сурагчийг устгах уу?")) return;
    const res = await fetch(`/api/children/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (res?.ok) load();
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewPin(null);
    setName("");
    setAge("");
  };

  return (
    <div className="flex">
      <Sidebar user="" payment="" classes="classes" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/classes"
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={20} />
                </Link>
                <p className="font-Inter text-2xl font-semibold text-[#020617]">
                  Ангийн сурагчид
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus size={16} /> Хүүхэд нэмэх
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr className="text-left font-Inter text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Нэр</th>
                    <th className="px-4 py-3 font-medium">PIN код</th>
                    <th className="px-4 py-3 font-medium">Хичээл</th>
                    <th className="px-4 py-3 font-medium">XP</th>
                    <th className="px-4 py-3 font-medium">Түвшин</th>
                    <th className="px-4 py-3 font-medium text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Уншиж байна...
                      </td>
                    </tr>
                  ) : children.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Энэ ангид сурагч алга
                      </td>
                    </tr>
                  ) : (
                    children.map((c) => (
                      <tr
                        key={c.id}
                        className="border-t border-gray-100 hover:bg-gray-50 font-Inter text-sm"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/children/${c.id}/logs`}
                            className="text-[#2563EB] hover:underline"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-mono bg-gray-100 px-2 py-0.5 rounded">
                            <KeyRound size={12} className="text-gray-400" />
                            {c.pin_code || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{c.lessons_done}</td>
                        <td className="px-4 py-3">{c.xp ?? 0}</td>
                        <td className="px-4 py-3">{c.level ?? 1}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-md border border-gray-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хүүхэд нэмэх</DialogTitle>
          </DialogHeader>

          {newPin ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="font-Inter text-sm text-gray-500">
                Сурагчийн PIN код үүсгэгдлээ:
              </p>
              <p className="font-mono text-3xl font-bold tracking-widest text-[#2563EB]">
                {newPin}
              </p>
              <p className="font-Inter text-xs text-gray-400 text-center">
                Энэ кодыг сурагчид өгнө үү. Сурагч үүгээр нэвтэрнэ.
              </p>
              <Button onClick={closeDialog} className="mt-2">
                Болсон
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-Inter text-sm font-medium text-[#334155]">
                    Нэр
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-Inter text-sm font-medium text-[#334155]">
                    Нас (заавал биш)
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Болих
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting || !name.trim()}
                >
                  {submitting ? "Үүсгэж байна..." : "Үүсгэх"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

- [ ] **Step 3: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add admin/src/app/classes/[id]/page.tsx admin/src/features/ClassDetailPage.tsx
git commit -m "feat(admin): class detail page with children and PINs"
```

---

### Task 8: Child learning-logs page

**Files:**
- Create: `admin/src/app/children/[id]/logs/page.tsx`
- Create: `admin/src/features/ChildLogsPage.tsx`

- [ ] **Step 1: Create the route wrapper `admin/src/app/children/[id]/logs/page.tsx`**

```tsx
import { ChildLogsPage } from "@/features/ChildLogsPage";

export default async function ChildLogs({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChildLogsPage childId={id} />;
}
```

- [ ] **Step 2: Create `admin/src/features/ChildLogsPage.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, AlertCircle, Zap } from "lucide-react";
import { Footer, Sidebar } from "@/components/constants";
import { Button } from "@/components/ui/button";

interface LogRow {
  id: string;
  topic_key: string;
  lesson_id: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
  mistake_count: number | null;
  xp_earned: number | null;
  is_first_completion: boolean | null;
}

interface Totals {
  lessons: number;
  seconds: number;
  mistakes: number;
  xp: number;
}

const TOPIC_LABELS: Record<string, string> = {
  fractions: "Бутархай",
  multiplication: "Үржвэр",
};

function fmtTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}м ${s}с` : `${s}с`;
}

export const ChildLogsPage = ({ childId }: { childId: string }) => {
  const router = useRouter();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [totals, setTotals] = useState<Totals>({
    lessons: 0,
    seconds: 0,
    mistakes: 0,
    xp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 50;

  const load = async (nextOffset: number, append: boolean) => {
    setLoading(true);
    const res = await fetch(
      `/api/children/${childId}/logs?limit=${LIMIT}&offset=${nextOffset}`
    ).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      const page: LogRow[] = json.logs || [];
      setLogs((prev) => (append ? [...prev, ...page] : page));
      setTotals(json.totals || { lessons: 0, seconds: 0, mistakes: 0, xp: 0 });
      setHasMore(page.length === LIMIT);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(0, false);
    setOffset(0);
  }, [childId]);

  const loadMore = () => {
    const next = offset + LIMIT;
    setOffset(next);
    load(next, true);
  };

  const cards = [
    { label: "Нийт хичээл", value: totals.lessons, icon: BookOpen },
    { label: "Нийт цаг", value: fmtDuration(totals.seconds), icon: Clock },
    { label: "Нийт алдаа", value: totals.mistakes, icon: AlertCircle },
    { label: "Нийт XP", value: totals.xp, icon: Zap },
  ];

  return (
    <div className="flex">
      <Sidebar user="" payment="" classes="classes" />
      <div className="w-full min-h-screen bg-[#F4F4F5] flex justify-center">
        <div className="max-w-[1654px] w-full h-full p-4 flex flex-col justify-between gap-4">
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <p className="font-Inter text-2xl font-semibold text-[#020617]">
                Сурлагын явц
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-[#EFF6FF]">
                    <c.icon className="text-[#2563EB]" size={18} />
                  </div>
                  <div>
                    <p className="font-Inter text-xs text-gray-500">{c.label}</p>
                    <p className="font-Inter text-xl font-semibold text-[#020617]">
                      {c.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr className="text-left font-Inter text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Сэдэв</th>
                    <th className="px-4 py-3 font-medium">Хичээл</th>
                    <th className="px-4 py-3 font-medium">Эхэлсэн</th>
                    <th className="px-4 py-3 font-medium">Дууссан</th>
                    <th className="px-4 py-3 font-medium">Хугацаа</th>
                    <th className="px-4 py-3 font-medium">Алдаа</th>
                    <th className="px-4 py-3 font-medium">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        Уншиж байна...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        Одоогоор бичлэг алга
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-t border-gray-100 font-Inter text-sm"
                      >
                        <td className="px-4 py-3">
                          {TOPIC_LABELS[l.topic_key] || l.topic_key}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{l.lesson_id}</td>
                        <td className="px-4 py-3">{fmtTime(l.started_at)}</td>
                        <td className="px-4 py-3">{fmtTime(l.finished_at)}</td>
                        <td className="px-4 py-3">{fmtDuration(l.duration_seconds)}</td>
                        <td className="px-4 py-3">{l.mistake_count ?? 0}</td>
                        <td className="px-4 py-3">{l.xp_earned ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Уншиж байна..." : "Цааш"}
                </Button>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Type-check**

```bash
cd admin && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add admin/src/app/children/[id]/logs/page.tsx admin/src/features/ChildLogsPage.tsx
git commit -m "feat(admin): child learning-logs page"
```

---

### Task 9: Frontend — classId on profile + paywall short-circuit

**Files:**
- Modify: `frontend/src/components/auth/types.ts:3-13` (add `classId`)
- Modify: `frontend/src/components/auth/AuthProvider.tsx:341` (checkPurchase child branch)

- [ ] **Step 1: Add `classId` to `UserProfile`**

In `frontend/src/components/auth/types.ts`, the interface currently ends:

```ts
  avatar?: string;
  class?: number;
}
```

Replace with:

```ts
  avatar?: string;
  class?: number;
  classId?: string | null;
}
```

- [ ] **Step 2: Short-circuit the paywall for class children**

In `frontend/src/components/auth/AuthProvider.tsx`, the child branch of
`checkPurchase` begins:

```ts
    // If active profile is child
    if (currentProfile?.type === "child") {
      // Self-healing: If parentId is missing, try to fetch it
```

Insert the class shortcut as the very first thing inside that `if`, before the
self-healing block:

```ts
    // If active profile is child
    if (currentProfile?.type === "child") {
      // Class children get all topics unlocked — no DB call.
      if (currentProfile.classId) {
        return true;
      }
      // Self-healing: If parentId is missing, try to fetch it
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/auth/types.ts frontend/src/components/auth/AuthProvider.tsx
git commit -m "feat(frontend): unlock all topics for class children via classId"
```

---

### Task 10: Frontend — PIN login selects class_id

**Files:**
- Modify: `frontend/src/components/auth/LoginContent.tsx:47-65` (select + selectProfile)

- [ ] **Step 1: Add `class_id` to the PIN login query and pass it through**

In `frontend/src/components/auth/LoginContent.tsx`, the child-code login block is:

```ts
      const { data, error } = await supabase
        .from("children")
        .select("name, id, parent_id, avatar")
        .eq("pin_code", pin)
        .maybeSingle();

      if (error || !data) {
        alert("Буруу код байна!");
        setLoading(false);
        return;
      }

      selectProfile({
        id: data.id,
        name: data.name,
        type: "child",
        avatar: data.avatar,
        parentId: data.parent_id,
      });
```

Replace with:

```ts
      const { data, error } = await supabase
        .from("children")
        .select("name, id, parent_id, avatar, class_id")
        .eq("pin_code", pin)
        .maybeSingle();

      if (error || !data) {
        alert("Буруу код байна!");
        setLoading(false);
        return;
      }

      selectProfile({
        id: data.id,
        name: data.name,
        type: "child",
        avatar: data.avatar,
        parentId: data.parent_id,
        classId: data.class_id,
      });
```

(`selectProfile` builds `profileWithStats = { ...stats, ...profile }` and persists
it to localStorage, so `classId` survives reloads with no further change.)

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/auth/LoginContent.tsx
git commit -m "feat(frontend): carry class_id through PIN login"
```

---

### Task 11: Frontend — fire-and-forget lesson log

**Files:**
- Create: `frontend/src/utils/lessonLog.ts`
- Modify: `frontend/src/features/LessonPage.tsx` (start ref + log call)
- Modify: `frontend/src/features/LessonMultPage.tsx` (start ref + log call)

- [ ] **Step 1: Create the log helper `frontend/src/utils/lessonLog.ts`**

```ts
import { createClient } from "@/src/utils/supabase/client";

export interface LessonLogArgs {
  childId: string;
  topicKey: string;
  lessonId: string;
  startedAt: Date;
  durationSeconds: number;
  mistakeCount: number;
  xpEarned: number;
  isFirstCompletion: boolean;
}

// Fire-and-forget: never awaited by callers, never throws into the UI.
// One INSERT under the lesson_logs anon-insert RLS policy. A failure is
// swallowed with a warning so the reward modal / navigation are never blocked.
export function logLessonCompletion(args: LessonLogArgs): void {
  try {
    const supabase = createClient();
    supabase
      .from("lesson_logs")
      .insert({
        child_id: args.childId,
        topic_key: args.topicKey,
        lesson_id: args.lessonId,
        started_at: args.startedAt.toISOString(),
        finished_at: new Date().toISOString(),
        duration_seconds: args.durationSeconds,
        mistake_count: args.mistakeCount,
        xp_earned: args.xpEarned,
        is_first_completion: args.isFirstCompletion,
      })
      .then(({ error }) => {
        if (error) console.warn("lesson_logs insert failed:", error.message);
      });
  } catch (err) {
    console.warn("lesson_logs insert threw:", err);
  }
}
```

- [ ] **Step 2: LessonPage — import, start ref, log call**

In `frontend/src/features/LessonPage.tsx`:

(a) Add the import near the other util imports (after the existing
`saveLessonTime` import line):

```ts
import { logLessonCompletion } from "@/src/utils/lessonLog";
```

(b) Add a start-time ref next to the existing `elapsedSecondsRef`
(`const elapsedSecondsRef = useRef(0);`):

```ts
  const lessonStartRef = useRef<Date>(new Date());
```

(c) Replace the XP block at the end of the completion handler. It currently reads:

```ts
    // Only award XP on first completion
    if (isFirstCompletion) {
      // Calculate XP based on mistakes
      const mistakes = canvasRef.current?.getMistakeCount() || 0;
      const baseXP = 10;
      const bonusXP = mistakes === 0 ? 5 : 0;
      const totalXP = baseXP + bonusXP;

      // Award XP and show reward modal
      try {
        await addXP(totalXP);
      } catch (err) {
        console.error("Failed to add XP:", err);
      }
      setXpEarned(totalXP);
    } else {
      // No XP for re-completing
      setXpEarned(0);
    }

    setShowReward(true);
```

Replace with:

```ts
    // Compute mistakes once (used for both XP and the learning log).
    const mistakes = canvasRef.current?.getMistakeCount() || 0;
    let xpForLog = 0;

    // Only award XP on first completion
    if (isFirstCompletion) {
      const baseXP = 10;
      const bonusXP = mistakes === 0 ? 5 : 0;
      const totalXP = baseXP + bonusXP;

      // Award XP and show reward modal
      try {
        await addXP(totalXP);
      } catch (err) {
        console.error("Failed to add XP:", err);
      }
      setXpEarned(totalXP);
      xpForLog = totalXP;
    } else {
      // No XP for re-completing
      setXpEarned(0);
    }

    // Fire-and-forget learning log (child profiles only). Not awaited.
    if (activeProfile?.type === "child") {
      logLessonCompletion({
        childId: activeProfile.id,
        topicKey: "fractions",
        lessonId: lesson.id,
        startedAt: lessonStartRef.current,
        durationSeconds: elapsedSecondsRef.current,
        mistakeCount: mistakes,
        xpEarned: xpForLog,
        isFirstCompletion,
      });
    }

    setShowReward(true);
```

- [ ] **Step 3: LessonMultPage — import, start ref, log call**

In `frontend/src/features/LessonMultPage.tsx`:

(a) Add the import after the existing `saveLessonTime` import (line ~34):

```ts
import { logLessonCompletion } from "@/src/utils/lessonLog";
```

(b) Add the start ref next to `const elapsedSecondsRef = useRef(0);` (line ~91):

```ts
  const lessonStartRef = useRef<Date>(new Date());
```

(c) The completion handler's XP block mirrors LessonPage. Locate the block that
starts with `if (isFirstCompletion) {` containing
`const mistakes = canvasRef.current?.getMistakeCount() || 0;` and the
`await addXP(totalXP);` call, ending with `setShowReward(true);`. Apply the same
transformation as Step 2(c), but with `topicKey: "multiplication"`:

```ts
    // Compute mistakes once (used for both XP and the learning log).
    const mistakes = canvasRef.current?.getMistakeCount() || 0;
    let xpForLog = 0;

    if (isFirstCompletion) {
      const baseXP = 10;
      const bonusXP = mistakes === 0 ? 5 : 0;
      const totalXP = baseXP + bonusXP;

      try {
        await addXP(totalXP);
      } catch (err) {
        console.error("Failed to add XP:", err);
      }
      setXpEarned(totalXP);
      xpForLog = totalXP;
    } else {
      setXpEarned(0);
    }

    // Fire-and-forget learning log (child profiles only). Not awaited.
    if (activeProfile?.type === "child") {
      logLessonCompletion({
        childId: activeProfile.id,
        topicKey: "multiplication",
        lessonId: lesson.id,
        startedAt: lessonStartRef.current,
        durationSeconds: elapsedSecondsRef.current,
        mistakeCount: mistakes,
        xpEarned: xpForLog,
        isFirstCompletion,
      });
    }

    setShowReward(true);
```

> Note: read the actual MultPage XP block before editing — variable names
> (`baseXP`, `bonusXP`, `totalXP`, `setXpEarned`) match LessonPage, but confirm
> the surrounding lines so the replacement is exact. If the MultPage block awards
> XP identically, the transformation above is a drop-in.

- [ ] **Step 4: Type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/lessonLog.ts frontend/src/features/LessonPage.tsx frontend/src/features/LessonMultPage.tsx
git commit -m "feat(frontend): fire-and-forget lesson_logs write on completion"
```

---

### Task 12: Full verification

**Files:**
- Create: `/tmp/admin-verify/classes-check.mjs` (throwaway)

This task assumes the user has confirmed the SQL migration (Task 1, Step 2) is
applied. If not, stop and ask first.

- [ ] **Step 1: Restart both dev servers fresh**

The admin needs its server restarted to pick up the new routes/proxy matcher.
Kill any running admin dev server and start admin on 3001 and frontend on 3000:

```bash
# admin (port 3001)
cd admin && npm run dev
# frontend (port 3000), separate background process
cd frontend && npm run dev
```

Wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/login`
returns 200 and the frontend root responds.

- [ ] **Step 2: Admin API smoke test via curl (authenticated cookie)**

```bash
# get an auth cookie for the admin
TOKEN=$(curl -s -D - -o /dev/null -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"happyacademy@gmail.com","password":"12345678"}' \
  | grep -io "admin_auth=[a-f0-9]*" | head -1)

# create a class
CLASS=$(curl -s -X POST http://localhost:3001/api/classes -H "Cookie: $TOKEN" \
  -H "Content-Type: application/json" -d '{"name":"Тест анги","description":"verify"}')
echo "create class: $CLASS"
CLASS_ID=$(echo "$CLASS" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# add a child -> expect a 6-digit pin_code
CHILD=$(curl -s -X POST http://localhost:3001/api/classes/$CLASS_ID/children \
  -H "Cookie: $TOKEN" -H "Content-Type: application/json" -d '{"name":"Тест сурагч"}')
echo "create child: $CHILD"
PIN=$(echo "$CHILD" | sed -n 's/.*"pin_code":"\([0-9]*\)".*/\1/p')
echo "PIN=$PIN (expect 6 digits)"

# list children -> child present
curl -s http://localhost:3001/api/classes/$CLASS_ID/children -H "Cookie: $TOKEN"
```

Expected: class JSON with an `id`; child JSON with a 6-digit `pin_code`; the list
includes the new child. Save `PIN` and the child id for later steps.

- [ ] **Step 3: Verify lesson_logs is write-only from the browser (anon)**

```bash
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL frontend/.env | head -1 | cut -d= -f2)
ANON=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY frontend/.env | head -1 | cut -d= -f2)
# anon SELECT should return [] or be blocked (no rows), never real data
curl -s "$SUPABASE_URL/rest/v1/lesson_logs?select=*&limit=1" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
```

Expected: `[]` (RLS allows no SELECT) — confirms logs aren't browser-readable.

- [ ] **Step 4: Playwright — frontend PIN login, topic unlocked, log write, admin shows it**

Write `/tmp/admin-verify/classes-check.mjs`. It uses the PIN from Step 2 (pass it
via env). Because a bot cannot flood-fill a whole coloring lesson, Step 4 verifies
the **unlock** end-to-end in the real browser and verifies the **log write path**
by calling the same anon insert the helper performs (the helper is a thin wrapper
over this exact insert), then confirms it surfaces in the admin log API.

```js
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const PIN = process.env.PIN;
const CHILD_ID = process.env.CHILD_ID;
const FRONT = 'http://localhost:3000';
const ADMIN = 'http://localhost:3001';

// read frontend supabase creds from its .env
const env = readFileSync('/Users/Munkhsaruul/Desktop/CodeCompanyProjects/happy-teacher/frontend/.env', 'utf8');
const get = (k) => (env.match(new RegExp(`${k}=(.*)`)) || [])[1]?.trim();
const SB_URL = get('NEXT_PUBLIC_SUPABASE_URL');
const SB_ANON = get('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const log = (s) => console.log(s);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. PIN login on frontend
await page.goto(FRONT + '/login', { waitUntil: 'networkidle' });
// the login page has a parent form + a child PIN form; fill the 6-digit PIN input.
const pinInput = page.locator('input[inputmode="numeric"], input[maxlength="6"], input[type="text"]').last();
await pinInput.fill(PIN);
await page.keyboard.press('Enter');
await page.waitForTimeout(3000);
log('1. after PIN login → ' + new URL(page.url()).pathname);

// 2. open a topic → should be unlocked (no paywall). Watch for purchase calls.
let purchaseCall = false;
page.on('request', (r) => {
  if (/purchases|check_child_purchase|qpay|bonum/i.test(r.url())) purchaseCall = true;
});
await page.goto(FRONT + '/topic/fractions', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const body = (await page.locator('body').innerText()).slice(0, 200).replace(/\n+/g, ' | ');
log('2. /topic/fractions body: ' + body);
log('   purchase/paywall network call observed: ' + purchaseCall + ' (expect false)');
await page.screenshot({ path: '/tmp/admin-verify/shots/class_child_topic.png' });

// 3. simulate a lesson-completion log write via the SAME anon insert the helper uses
const sb = createClient(SB_URL, SB_ANON);
const started = new Date(Date.now() - 90_000);
const { error: insErr } = await sb.from('lesson_logs').insert({
  child_id: CHILD_ID,
  topic_key: 'fractions',
  lesson_id: 'verify-lesson-1',
  started_at: started.toISOString(),
  finished_at: new Date().toISOString(),
  duration_seconds: 88,
  mistake_count: 2,
  xp_earned: 10,
  is_first_completion: true,
});
log('3. anon lesson_logs insert error: ' + (insErr ? insErr.message : 'none (ok)'));

// 4. admin log API shows the row + totals
const tokenResp = await fetch(ADMIN + '/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'happyacademy@gmail.com', password: '12345678' }),
});
const cookie = tokenResp.headers.get('set-cookie').split(';')[0];
const logsResp = await fetch(`${ADMIN}/api/children/${CHILD_ID}/logs`, { headers: { Cookie: cookie } });
const logsJson = await logsResp.json();
log('4. admin logs count: ' + (logsJson.logs?.length) + ', totals: ' + JSON.stringify(logsJson.totals));

await browser.close();
```

Run it:

```bash
cd /tmp/admin-verify && npm install @supabase/supabase-js 2>&1 | tail -1
PIN=<pin from step 2> CHILD_ID=<child id from step 2> node classes-check.mjs
```

Expected:
- `1. after PIN login → /` (or the app home, not `/login`)
- `2.` topic page renders lesson content; `purchase/paywall network call observed: false`
- `3. anon lesson_logs insert error: none (ok)`
- `4. admin logs count: 1` (at least), totals reflecting the inserted row

- [ ] **Step 5: Probe — parent-child delete is refused (403)**

Pick any existing parent-owned child id (class_id null). From the DB or admin:

```bash
PARENT_CHILD=$(curl -s "$SUPABASE_URL/rest/v1/children?select=id&class_id=is.null&limit=1" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
curl -s -o /dev/null -w "delete parent child → %{http_code}\n" \
  -X DELETE "http://localhost:3001/api/children/$PARENT_CHILD" -H "Cookie: $TOKEN"
```

Expected: `403` (route refuses to touch parent children). If anon SELECT on
children is blocked (returns `[]`), pick a parent child id from the Supabase
dashboard instead and run only the DELETE line.

- [ ] **Step 6: Clean up the verification class**

```bash
curl -s -o /dev/null -w "cleanup delete class → %{http_code}\n" \
  -X DELETE "http://localhost:3001/api/classes/$CLASS_ID" -H "Cookie: $TOKEN"
```

Expected: `200`. (Deletes the test class; the test child cascades only its
`class_id` to null — delete the test child too if desired via the children API.)

- [ ] **Step 7: Type-check + lint both apps**

```bash
cd admin && npx tsc --noEmit && npm run lint 2>&1 | tail -3
cd ../frontend && npx tsc --noEmit && npm run lint 2>&1 | tail -3
```

Expected: tsc exits 0 in both; lint shows no NEW errors in the files this plan
created (pre-existing warnings in unrelated files are acceptable).

- [ ] **Step 8: Stop the verification dev servers**

Kill the admin and frontend dev servers started in Step 1. Remind the user to
restart their own servers.

---

## Self-review notes

- **Spec coverage:** classes table + children alter + lesson_logs + RLS + unique
  PIN index + pre-flight (Task 1); service-role client (Task 2); classes CRUD
  (Task 3); class children + unique PIN gen + parent-child guard (Task 4); logs
  API with pagination + totals (Task 5); sidebar + classes list (Task 6); class
  detail with visible PINs (Task 7); child log page with summary cards (Task 8);
  classId on profile + paywall short-circuit (Task 9); PIN login selects class_id
  (Task 10); fire-and-forget log on both lesson pages (Task 11); all 7 spec
  verification scenarios incl. write-only RLS, unlock-without-DB, parent-delete
  403 (Task 12). Parent-child logs correctly excluded (non-goal).
- **Type consistency:** `class_id` (DB column) ↔ `classId` (UserProfile);
  `createAdminClient` used identically across Tasks 3–5; `logLessonCompletion`
  signature in Task 11 matches its definition; `Sidebar` `classes` prop added in
  Task 6 and used in Tasks 6–8; route param signature `params: Promise<{id}>`
  consistent across all dynamic routes.
- **Performance:** paywall returns `true` before any await for class children
  (Task 9); log insert is `.then`-only, never awaited, child-guarded, swallows
  errors (Task 11). No new query on the lesson hot path beyond the single insert.
- **No test framework introduced**, matching both apps; verification is runtime.
- **DB gate:** Task 1 Step 2 blocks DB-dependent verification until the user
  applies the migration.
