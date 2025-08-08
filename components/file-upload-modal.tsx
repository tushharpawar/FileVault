"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, CheckCircle, AlertCircle, FolderOpen, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { createStorageBucket } from '@/lib/storage-actions'
import { showUploadToasts, validateFile } from '@/lib/toast-utils'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
}

export function FileUploadModal({ isOpen, onClose, onUploadComplete }: FileUploadModalProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<string>('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const ensureBucketExists = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .list('', { limit: 1 })

      if (!error) return true

      const result = await createStorageBucket()
      if (result.success) {
        return true
      } else {
        showUploadToasts.storageNotReady()
        return false
      }
    } catch (error) {
      showUploadToasts.storageNotReady()
      return false
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (!isOnline) {
      return
    }

    let validFiles: File[] = []

    // Handle rejected files first
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          showUploadToasts.fileTooLarge(file.name, '50MB')
        } else if (error.code === 'file-invalid-type') {
          showUploadToasts.unsupportedFormat(file.name)
        }
      })
    })

    // Validate accepted files with enhanced validation
    acceptedFiles.forEach(file => {
      const validation = validateFile(file)

      if (!validation.isValid) {
        validation.errors.forEach(error => {
          if (error.includes('size')) {
            showUploadToasts.fileTooLarge(file.name, '50MB')
          } else if (error.includes('format')) {
            showUploadToasts.unsupportedFormat(file.name)
          } else {
            showUploadToasts.uploadFailed(file.name, error)
          }
        })
        return
      }

      // Check for duplicates
      const isDuplicate = selectedFiles.some(existing =>
        existing.name === file.name && existing.size === file.size
      )

      if (isDuplicate) {
        showUploadToasts.duplicateFile(file.name)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }, [selectedFiles, isOnline])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noKeyboard: true, // Keep this to prevent keyboard activation
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z']
    },
    disabled: !isOnline
  })

  const removeFile = (index: number) => {
    const removedFile = selectedFiles[index]
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    if (!isOnline) {
      return
    }

    const isBucketReady = await ensureBucketExists()
    if (!isBucketReady) {
      return
    }

    setUploading(true)
    setUploadProgress(0)

    let successCount = 0
    let failCount = 0
    const failedFiles: string[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setCurrentFile(file.name)

        const sanitizedName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '')

        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}_${randomId}_${sanitizedName}`

        try {
          const { data: storageData, error: storageError } = await supabase.storage
            .from('files')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (storageError) {
            throw new Error(storageError.message)
          }

          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(fileName)

          const { error: dbError } = await supabase
            .from('files')
            .insert({
              name: file.name,
              size: file.size,
              type: file.type,
              file_path: fileName,
              preview_url: publicUrl
            })

          if (dbError) {
            await supabase.storage.from('files').remove([fileName])
            throw new Error(dbError.message)
          }

          successCount++
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          failCount++
          failedFiles.push(file.name)
        }

        const progress = ((i + 1) / selectedFiles.length) * 100
        setUploadProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Show appropriate success/error messages
      if (successCount > 0 && failCount === 0) {
        showUploadToasts.uploadSuccess(successCount)
      } else if (successCount > 0 && failCount > 0) {
        showUploadToasts.uploadSuccess(successCount)
        // Show individual failed files
        failedFiles.forEach(fileName => {
          showUploadToasts.uploadFailed(fileName)
        })
      } else if (failCount > 0) {
        failedFiles.forEach(fileName => {
          showUploadToasts.uploadFailed(fileName)
        })
      }

      if (successCount > 0) {
        setSelectedFiles([])
        onUploadComplete()
        onClose()
      }
    } catch (error) {
      console.error('Upload error:', error)
      showUploadToasts.uploadFailed('multiple files', error instanceof Error ? error.message : undefined)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setCurrentFile('')
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([])
      setUploadProgress(0)
      setCurrentFile('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Files
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-xs">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Warning */}
          {!isOnline && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <WifiOff className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <p className="font-medium text-red-800">No Internet Connection</p>
                  <p className="text-sm text-red-600">Please check your connection before uploading files</p>
                </div>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? 'border-blue-500 bg-blue-50 scale-105'
                : !isOnline
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
          >
            <input {...getInputProps()} disabled={!isOnline} />
            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${!isOnline
                  ? 'bg-gray-300'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                <Upload className={`w-8 h-8 ${!isOnline ? 'text-gray-500' : 'text-white'}`} />
              </div>

              {isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-blue-600">Drop the files here!</p>
                  <p className="text-sm text-blue-500">Release to add files</p>
                </div>
              ) : (
                <div>
                  <p className={`text-lg font-medium mb-2 ${!isOnline ? 'text-gray-500' : 'text-slate-700'
                    }`}>
                    {!isOnline
                      ? 'Upload unavailable - No internet connection'
                      : 'Drag & drop files here'
                    }
                  </p>
                  {isOnline && (
                    <p className="text-sm text-slate-500">
                      or click anywhere in this area to browse files
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-slate-400 space-y-1">
                <p>Maximum file size: 50MB</p>
                <p>Supported: Images, PDFs, Documents, Spreadsheets, Videos, Audio, Archives</p>
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">
                  Selected Files ({selectedFiles.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                  className="text-slate-500 hover:text-red-600"
                >
                  Clear All
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="text-slate-400 hover:text-red-600 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Uploading files...
                </span>
                <span className="text-sm text-slate-500">
                  {Math.round(uploadProgress)}%
                </span>
              </div>

              <Progress
                value={uploadProgress}
                className="w-full h-2"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Cancel'}
            </Button>

            <Button
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.length === 0 || !isOnline}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {selectedFiles.length} file(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
