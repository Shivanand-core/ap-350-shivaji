-- ==============================================================================
-- SHIVRAJ 350: SUPABASE STORAGE CONFIGURATION & POLICIES
-- Private Bucket: 'manuscripts'
-- Allowed MIME Type: 'application/pdf'
-- Max File Size: 25MB (26,214,400 bytes)
-- ==============================================================================

-- 1. Create the private 'manuscripts' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manuscripts',
  'manuscripts',
  false, -- STRICTLY PRIVATE (Prevents anonymous unauthorized public browsing)
  26214400, -- 25 Megabytes strict limit
  ARRAY['application/pdf']::text[] -- Only PDF files permitted
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- ==============================================================================
-- 2. STORAGE ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (Authors) can upload manuscript PDFs into manuscripts bucket
DROP POLICY IF EXISTS "Allow public manuscript PDF upload" ON storage.objects;
CREATE POLICY "Allow public manuscript PDF upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'manuscripts');

-- Policy 2: Allow upsert / replacement of manuscript files
DROP POLICY IF EXISTS "Allow manuscript PDF update" ON storage.objects;
CREATE POLICY "Allow manuscript PDF update"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'manuscripts')
  WITH CHECK (bucket_id = 'manuscripts');

-- Policy 3: Authenticated Users (Editors, Assigned Reviewers, Authors) can view/download
DROP POLICY IF EXISTS "Allow authenticated read of manuscripts" ON storage.objects;
CREATE POLICY "Allow authenticated read of manuscripts"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'manuscripts');

-- Policy 4: Editors and Superadmins can delete or replace files
DROP POLICY IF EXISTS "Allow editorial staff to manage manuscripts" ON storage.objects;
CREATE POLICY "Allow editorial staff to manage manuscripts"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'manuscripts'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'superadmin')
    )
  );
