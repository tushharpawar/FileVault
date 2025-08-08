-- Create storage bucket for files (this needs to be run as admin in Supabase dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'files', 
  'files', 
  true, 
  52428800, -- 50MB limit
  ARRAY[
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/*',
    'video/*',
    'audio/*'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies
DROP POLICY IF EXISTS "Allow public read access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete files" ON storage.objects;

CREATE POLICY "Allow public read access to files" ON storage.objects
  FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Allow admin upload to files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'files');

CREATE POLICY "Allow admin update files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'files');

CREATE POLICY "Allow admin delete files" ON storage.objects
  FOR DELETE USING (bucket_id = 'files');
