-- Энэ SQL кодыг Supabase SQL Editor дотор ажиллуулснаар
-- хүүхдийн профайлаас эцэг эхийн худалдан авалтыг шалгах боломжтой болно.

-- 1. check_parent_purchase функц үүсгэх
create or replace function check_parent_purchase(p_id uuid, t_key text)
returns boolean
language plpgsql
security definer -- Энэ нь RLS-ийг алгасаж, функц үүсгэсэн хүний эрхээр ажиллана
as $$
begin
  return exists (
    select 1
    from purchases
    where user_id = p_id
    and topic_key = t_key
  );
end;
$$;

-- 2. Функцийг дуудах эрхийг нээх
grant execute on function check_parent_purchase to anon, authenticated, service_role;

-- Тайлбар:
-- Энэ функц нь хүүхэд нэвтэрсэн үед (auth session байхгүй эсвэл өөр)
-- эцэг эхийн (p_id) худалдан авалтыг (purchases table) шалгах боломжийг олгоно.
