-- Gamification System

-- 1. Add XP and Level columns to children table
alter table children 
add column if not exists xp int default 0,
add column if not exists level int default 1;

-- 2. Function to add XP and handle leveling up
create or replace function add_child_xp(p_child_id uuid, p_amount int)
returns json
language plpgsql
security definer
as $$
declare
  v_current_xp int;
  v_current_level int;
  v_new_xp int;
  v_new_level int;
  v_leveled_up boolean := false;
begin
  select xp, level into v_current_xp, v_current_level
  from children where id = p_child_id;
  
  -- Initialize if null
  v_current_xp := coalesce(v_current_xp, 0);
  v_current_level := coalesce(v_current_level, 1);
  
  v_new_xp := v_current_xp + p_amount;
  
  -- Simple formula: Level up every 100 XP
  -- Level 1: 0-99
  -- Level 2: 100-199
  -- etc.
  v_new_level := (v_new_xp / 100) + 1;
  
  if v_new_level > v_current_level then
    v_leveled_up := true;
  end if;
  
  update children
  set xp = v_new_xp,
      level = v_new_level
  where id = p_child_id;
  
  return json_build_object(
    'xp', v_new_xp,
    'level', v_new_level,
    'leveled_up', v_leveled_up,
    'xp_gained', p_amount
  );
end;
$$;

-- 3. Grant permissions
grant execute on function add_child_xp to anon, authenticated, service_role;
