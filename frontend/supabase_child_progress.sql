-- Хүүхдийн ахиц дэвшлийг хадгалах хүснэгт болон функцууд

-- 1. child_progress хүснэгт үүсгэх
create table if not exists child_progress (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references children(id) on delete cascade,
  topic_key text not null,
  lesson_id text not null,
  completed_at timestamptz default now(),
  unique(child_id, topic_key, lesson_id)
);

-- RLS идэвхжүүлэх
alter table child_progress enable row level security;

-- 2. Ахиц тэмдэглэх функц (RPC)
create or replace function mark_child_progress(p_child_id uuid, p_topic_key text, p_lesson_id text)
returns void
language plpgsql
security definer
as $$
begin
  insert into child_progress (child_id, topic_key, lesson_id, completed_at)
  values (p_child_id, p_topic_key, p_lesson_id, now())
  on conflict (child_id, topic_key, lesson_id)
  do update set completed_at = now();
end;
$$;

-- 3. Ахиц авах функц (RPC)
create or replace function get_child_progress(p_child_id uuid, p_topic_key text)
returns table (lesson_id text)
language plpgsql
security definer
as $$
begin
  return query
  select cp.lesson_id
  from child_progress cp
  where cp.child_id = p_child_id
  and cp.topic_key = p_topic_key;
end;
$$;

-- 4. Эрх олгох
grant execute on function mark_child_progress to anon, authenticated, service_role;
grant execute on function get_child_progress to anon, authenticated, service_role;
grant all on child_progress to anon, authenticated, service_role;
