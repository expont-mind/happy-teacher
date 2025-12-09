-- Policies for child_progress to allow parents to view their children's data

-- 1. Create a secure function to check parent-child relationship
create or replace function is_parent_of_child(child_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 
    from children 
    where id = child_uuid 
    and parent_id = auth.uid()
  );
$$;

-- 2. Add RLS policy for child_progress
-- Allow users to select rows where they are the parent of the child_id
create policy "Parents can view their children's progress"
on child_progress
for select
using (
  is_parent_of_child(child_id)
);

-- 3. Grant execute on the helper function (optional, but good practice)
grant execute on function is_parent_of_child to authenticated;
