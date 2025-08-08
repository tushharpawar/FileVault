-- Create storage policies for the files bucket
-- Run this after creating the bucket

-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'files');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'files');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'files');
