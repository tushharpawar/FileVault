"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { createStorageBucket } from '@/lib/storage-actions'

interface FileUploadProps {
  onUploadComplete: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [bucketReady, setBucketReady] = useState<boolean | null>(null)

  const checkBucket = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .list('', { limit: 1 })

      const exists = !error
      setBucketReady(exists)
      return exists
    } catch (error) {
      setBucketReady(false)
      return false
    }
  }

  const ensureBucketExists = async () => {
    // First check if bucket exists
    const exists = await checkBucket()
    if (exists) return true

    // Try to create bucket
    try {
      const result = await createStorageBucket()
      if (result.success) {
        setBucketReady(true)
        return true
      } else {
        toast({
          title: "Storage setup failed",
          description: result.error || "Could not create storage bucket",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Storage setup failed",
        description: "Could not create storage bucket",
        variant: "destructive"
      })
      return false
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check bucket before allowing file selection
    const isBucketReady = await checkBucket()
    if (!isBucketReady) {
      toast({
        title: "Storage not ready",
        description: "Please set up the storage bucket first",
        variant: "destructive"
      })
      return
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
        })
        return false
      }
      return true
    })
    setSelectedFiles(prev => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  })

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    // Ensure bucket exists before upload
    const isBucketReady = await ensureBucketExists()
    if (!isBucketReady) {
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        // Sanitize filename - remove spaces, special characters, and ensure safe naming
        const sanitizedName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscore
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}_${randomId}_${sanitizedName}`
        
        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (storageError) {
          console.error('Storage error:', storageError)
          throw new Error(`Upload failed: ${storageError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(fileName)

        // Save metadata to database with original filename
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name, // Keep original name for display
            size: file.size,
            type: file.type,
            file_path: fileName, // Use sanitized name for storage
            preview_url: publicUrl
          })

        if (dbError) {
          console.error('Database error:', dbError)
          // Try to clean up the uploaded file
          await supabase.storage.from('files').remove([fileName])
          throw new Error(`Database save failed: ${dbError.message}`)
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100)
      }

      toast({
        title: "Upload successful",
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      })

      setSelectedFiles([])
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Check bucket status on component mount
  useState(() => {
    checkBucket()
  })

  return (
    <div className="space-y-4">
      {bucketReady === false && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
            <p className="text-orange-700 text-sm">
              Storage bucket is not ready. Please set up the storage bucket first using the setup section above.
            </p>
          </div>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : bucketReady === false
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input {...getInputProps()} disabled={bucketReady === false} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${bucketReady === false ? 'text-gray-400' : 'text-slate-400'}`} />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className={`mb-2 ${bucketReady === false ? 'text-gray-500' : 'text-slate-600'}`}>
              {bucketReady === false 
                ? 'Storage not ready - please set up bucket first'
                : 'Drag & drop files here, or click to browse'
              }
            </p>
            <p className="text-sm text-slate-500">Maximum file size: 50MB</p>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm text-slate-500">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {selectedFiles.length > 0 && (
        <Button 
          onClick={uploadFiles} 
          disabled={uploading || bucketReady === false}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
        </Button>
      )}
    </div>
  )
}
