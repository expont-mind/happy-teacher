-- Spend XP Function
-- Atomically checks balance and deducts XP from a child.
-- Level never decreases (high-water-mark) to avoid demoralizing children.

create or replace function spend_child_xp(p_child_id uuid, p_amount int)
returns json
language plpgsql
security definer
as $$
declare
  v_current_xp int;
  v_current_level int;
  v_new_xp int;
begin
  select xp, level into v_current_xp, v_current_level
  from children where id = p_child_id;

  v_current_xp := coalesce(v_current_xp, 0);
  v_current_level := coalesce(v_current_level, 1);

  if v_current_xp < p_amount then
    return json_build_object(
      'success', false,
      'error', 'insufficient_xp',
      'current_xp', v_current_xp,
      'required', p_amount
    );
  end if;

  v_new_xp := v_current_xp - p_amount;

  -- Level never decreases (high-water-mark)
  update children
  set xp = v_new_xp
  where id = p_child_id;

  return json_build_object(
    'success', true,
    'xp', v_new_xp,
    'level', v_current_level,
    'xp_spent', p_amount
  );
end;
$$;

-- Add purchase_type column to child_coupons
alter table child_coupons
add column if not exists purchase_type text default 'qpay';

-- Grant permissions
grant execute on function spend_child_xp to anon, authenticated, service_role;
