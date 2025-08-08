import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type FileRecord = {
  id: string
  name: string
  size: number
  type: string
  file_path: string
  preview_url: string
  created_at: string
  updated_at: string
}
