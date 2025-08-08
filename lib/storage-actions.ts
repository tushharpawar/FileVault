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

export async function createStorageBucket() {
  try {
    // Check if bucket already exists
    const { data: existingBucket } = await supabaseAdmin.storage.getBucket('files')
    
    if (existingBucket) {
      return { success: true, message: 'Bucket already exists' }
    }

    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket('files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
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
    })

    if (error) {
      throw error
    }

    return { success: true, message: 'Bucket created successfully' }
  } catch (error) {
    console.error('Error creating bucket:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create bucket' 
    }
  }
}

export async function checkBucketExists() {
  try {
    const { data, error } = await supabaseAdmin.storage.getBucket('files')
    return { exists: !error && data !== null }
  } catch (error) {
    return { exists: false }
  }
}
