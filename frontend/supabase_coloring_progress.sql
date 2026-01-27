-- Coloring Progress: Table + Storage Bucket + RLS Policies
-- Run this in the Supabase SQL Editor

-- 1. Create coloring_progress metadata table
CREATE TABLE IF NOT EXISTS coloring_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('adult', 'child')),
  parent_id TEXT,
  lesson_image TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, lesson_image)
);

-- 2. Enable RLS
ALTER TABLE coloring_progress ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for coloring_progress table
CREATE POLICY "Adults manage own coloring progress" ON coloring_progress
  FOR ALL USING (
    profile_type = 'adult' AND profile_id = auth.uid()::text
  );

CREATE POLICY "Children coloring progress via parent" ON coloring_progress
  FOR ALL USING (
    profile_type = 'child' AND parent_id = auth.uid()::text
  );

-- 4. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('coloring-progress', 'coloring-progress', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS policies
CREATE POLICY "Users upload coloring progress" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'coloring-progress' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read coloring progress" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'coloring-progress' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update coloring progress" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'coloring-progress' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete coloring progress" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'coloring-progress' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
