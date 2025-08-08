'use server'

import { createClient } from '@supabase/supabase-js'

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createFilesTable() {
  try {
    // Create the files table with all necessary columns and constraints
    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Enable UUID extension if not already enabled
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create files table
        CREATE TABLE IF NOT EXISTS public.files (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          size BIGINT NOT NULL,
          type TEXT NOT NULL,
          file_path TEXT NOT NULL,
          preview_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

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
      `
    })

    if (tableError) {
      // If RPC doesn't work, try direct SQL execution
      const { error: directError } = await supabaseAdmin
        .from('_temp_table_creation')
        .select('*')
        .limit(1)

      // Since the above will fail, let's try a different approach
      // Create table using individual queries
      const queries = [
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
        `CREATE TABLE IF NOT EXISTS public.files (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          size BIGINT NOT NULL,
          type TEXT NOT NULL,
          file_path TEXT NOT NULL,
          preview_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        `CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'`,
        'DROP TRIGGER IF EXISTS update_files_updated_at ON public.files',
        `CREATE TRIGGER update_files_updated_at
            BEFORE UPDATE ON public.files
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()`,
        'ALTER TABLE public.files ENABLE ROW LEVEL SECURITY',
        'DROP POLICY IF EXISTS "Allow public read access" ON public.files',
        'DROP POLICY IF EXISTS "Allow admin full access" ON public.files',
        `CREATE POLICY "Allow public read access" ON public.files
          FOR SELECT USING (true)`,
        `CREATE POLICY "Allow admin full access" ON public.files
          FOR ALL USING (true)`,
        'GRANT ALL ON public.files TO authenticated',
        'GRANT SELECT ON public.files TO anon'
      ]

      // For now, we'll return an error asking for manual setup
      return {
        success: false,
        error: 'Automatic table creation failed. Please run the SQL script manually.',
        needsManualSetup: true
      }
    }

    return { success: true, message: 'Files table created successfully' }
  } catch (error) {
    console.error('Error creating table:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create table',
      needsManualSetup: true
    }
  }
}

export async function checkTableExists() {
  try {
    // Try to query the files table
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('id')
      .limit(1)

    return { exists: !error }
  } catch (error) {
    return { exists: false }
  }
}
