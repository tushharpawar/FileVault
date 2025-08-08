-- Enhanced table creation script with better error handling
-- Run this in Supabase SQL Editor if automatic creation fails

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if exists (for clean setup)
-- DROP TABLE IF EXISTS public.files CASCADE;

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  preview_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_type ON public.files(type);
CREATE INDEX IF NOT EXISTS idx_files_name ON public.files(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_files_updated_at ON public.files;
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.files;
DROP POLICY IF EXISTS "Allow admin full access" ON public.files;

-- Allow public read access for users
CREATE POLICY "Allow public read access" ON public.files
  FOR SELECT USING (true);

-- Allow all operations for authenticated users (admin)
CREATE POLICY "Allow admin full access" ON public.files
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.files TO authenticated;
GRANT SELECT ON public.files TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Insert sample data (optional - remove if you don't want sample data)
INSERT INTO public.files (name, size, type, file_path, preview_url) VALUES
  ('Sample Document.pdf', 1024000, 'application/pdf', 'sample-doc.pdf', '/placeholder.svg?height=200&width=300&text=PDF'),
  ('Sample Image.jpg', 512000, 'image/jpeg', 'sample-image.jpg', '/placeholder.svg?height=200&width=300&text=Image'),
  ('Sample Spreadsheet.xlsx', 2048000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'sample-sheet.xlsx', '/placeholder.svg?height=200&width=300&text=Excel')
ON CONFLICT (file_path) DO NOTHING;

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'files' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show table info
SELECT 
  'Table created successfully' as status,
  COUNT(*) as row_count
FROM public.files;
