-- Day Streak System

-- 1. Add streak columns to children table
alter table children 
add column if not exists streak_count int default 0,
add column if not exists last_active_at timestamptz;

-- 2. Create user_streaks table for adults
create table if not exists user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak_count int default 0,
  last_active_at timestamptz
);

-- Enable RLS for user_streaks
alter table user_streaks enable row level security;

-- Policies for user_streaks
create policy "Users can view own streak" on user_streaks for select using (auth.uid() = user_id);
create policy "Users can update own streak" on user_streaks for update using (auth.uid() = user_id);
create policy "Users can insert own streak" on user_streaks for insert with check (auth.uid() = user_id);

-- 3. Function to update child streak
create or replace function update_child_streak(p_child_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  v_streak int;
  v_last_active timestamptz;
  v_now timestamptz := now();
  v_today date := current_date;
  v_last_date date;
begin
  select streak_count, last_active_at into v_streak, v_last_active
  from children where id = p_child_id;
  
  v_streak := coalesce(v_streak, 0);
  v_last_date := v_last_active::date;
  
  if v_last_date = v_today then
    -- Already active today, do nothing (or maybe return existing streak)
    return v_streak;
  elsif v_last_date = v_today - 1 then
    -- Active yesterday, increment
    v_streak := v_streak + 1;
  else
    -- Missed a day or first time, reset to 1
    v_streak := 1;
  end if;
  
  update children
  set streak_count = v_streak,
      last_active_at = v_now
  where id = p_child_id;
  
  return v_streak;
end;
$$;

-- 4. Function to update adult streak
create or replace function update_user_streak()
returns int
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_streak int;
  v_last_active timestamptz;
  v_now timestamptz := now();
  v_today date := current_date;
  v_last_date date;
begin
  select streak_count, last_active_at into v_streak, v_last_active
  from user_streaks where user_id = v_user_id;
  
  if not found then
    insert into user_streaks (user_id, streak_count, last_active_at)
    values (v_user_id, 1, v_now)
    returning streak_count into v_streak;
    return v_streak;
  end if;
  
  v_streak := coalesce(v_streak, 0);
  v_last_date := v_last_active::date;
  
  if v_last_date = v_today then
    return v_streak;
  elsif v_last_date = v_today - 1 then
    v_streak := v_streak + 1;
  else
    v_streak := 1;
  end if;
  
  update user_streaks
  set streak_count = v_streak,
      last_active_at = v_now
  where user_id = v_user_id;
  
  return v_streak;
end;
$$;

-- 5. Grant permissions
grant execute on function update_child_streak to anon, authenticated, service_role;
grant execute on function update_user_streak to anon, authenticated, service_role;
grant all on user_streaks to anon, authenticated, service_role;
