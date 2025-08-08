import { supabase } from './supabase'

export async function checkBucketExists() {
  try {
    // Try to list files in the bucket - this will fail if bucket doesn't exist
    const { data, error } = await supabase.storage
      .from('files')
      .list('', { limit: 1 })

    return { exists: !error, error: error?.message }
  } catch (error) {
    return { exists: false, error: 'Bucket check failed' }
  }
}

export async function testUpload() {
  try {
    // Create a small test file
    const testFile = new Blob(['test'], { type: 'text/plain' })
    const testFileName = `test-${Date.now()}.txt`

    // Try to upload
    const { data, error } = await supabase.storage
      .from('files')
      .upload(testFileName, testFile)

    if (error) throw error

    // Clean up test file
    await supabase.storage
      .from('files')
      .remove([testFileName])

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Upload test failed' }
  }
}
