import { toast } from '@/hooks/use-toast'

// File upload related toasts
export const showUploadToasts = {
  // Success toasts
  uploadSuccess: (count: number) => {
    toast({
      title: "✅ Upload Successful",
      description: `${count} file${count > 1 ? 's' : ''} uploaded successfully`,
      duration: 4000,
    })
  },

  // Error toasts
  fileTooLarge: (fileName: string, maxSize: string = "50MB") => {
    toast({
      title: "⚠️ File Too Large",
      description: `"${fileName}" exceeds the ${maxSize} limit`,
      color: 'orange', // ❌ This was causing the red box with unreadable text
      duration: 6000,
    })
  },

  unsupportedFormat: (fileName: string) => {
    toast({
      title: "❌ Unsupported File Format",
      description: `"${fileName}" format is not supported`,
      duration: 6000,
    })
  },

  uploadFailed: (fileName: string, error?: string) => {
    toast({
      title: "❌ Upload Failed",
      description: error ? `Failed to upload "${fileName}": ${error}` : `Failed to upload "${fileName}"`,
      duration: 6000,
    })
  },

  storageNotReady: () => {
    toast({
      title: "⚠️ Storage Not Ready",
      description: "Storage bucket is not configured. Please complete setup first",
      duration: 6000,
    })
  },

  duplicateFile: (fileName: string) => {
    toast({
      title: "⚠️ Duplicate File",
      description: `"${fileName}" already selected`,
      duration: 4000,
    })
  }
}

// File actions toasts
export const showFileActionToasts = {
  // Share actions
  linkCopied: (fileName: string) => {
    toast({
      title: "📋 Link Copied",
      description: `Share link for "${fileName}" copied to clipboard`,
      duration: 4000,
    })
  },

  shareSuccess: (fileName: string) => {
    toast({
      title: "✅ Shared Successfully",
      description: `"${fileName}" shared successfully`,
      duration: 4000,
    })
  },

  shareFailed: () => {
    toast({
      title: "❌ Share Failed",
      description: "Unable to share file. Please try again",
      duration: 5000,
    })
  },

  // Delete actions
  deleteSuccess: (fileName: string) => {
    toast({
      title: "🗑️ File Deleted",
      description: `"${fileName}" has been deleted`,
      duration: 4000,
    })
  },

  deleteFailed: (fileName: string) => {
    toast({
      title: "❌ Delete Failed",
      description: `Failed to delete "${fileName}". Please try again`,
      duration: 5000,
    })
  }
}

// Authentication toasts
export const showAuthToasts = {
  loginSuccess: (userType: 'admin' | 'analytics') => {
    toast({
      title: "✅ Login Successful",
      description: `Welcome to ${userType} panel`,
      duration: 4000,
    })
  },

  loginFailed: (error?: string) => {
    toast({
      title: "❌ Login Failed",
      description: error || "Invalid username or password",
      duration: 6000,
    })
  },

  incorrectPassword: () => {
    toast({
      title: "🔒 Incorrect Password",
      description: "Please verify your credentials and try again",
      duration: 4000,
    })
  },

  incorrectUsername: () => {
    toast({
      title: "👤 Username Not Found",
      description: "Please check the username and try again",
      duration: 4000,
    })
  },

  logoutSuccess: () => {
    toast({
      title: "👋 Logged Out",
      description: "You have been successfully logged out",
      duration: 3000,
    })
  },

  sessionExpired: () => {
    toast({
      title: "⏰ Session Expired",
      description: "Please log in again to continue",
      duration: 5000,
    })
  }
}

// Utility functions for file validation
export const getSupportedFormats = () => {
  return {
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    spreadsheets: ['xls', 'xlsx', 'csv'],
    presentations: ['ppt', 'pptx'],
    videos: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    audio: ['mp3', 'wav', 'm4a', 'aac', 'ogg'],
    archives: ['zip', 'rar', '7z', 'tar', 'gz']
  }
}

export const isFileFormatSupported = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (!extension) return false

  const supportedFormats = getSupportedFormats()
  const allSupported = [
    ...supportedFormats.images,
    ...supportedFormats.documents,
    ...supportedFormats.spreadsheets,
    ...supportedFormats.presentations,
    ...supportedFormats.videos,
    ...supportedFormats.audio,
    ...supportedFormats.archives
  ]

  return allSupported.includes(extension)
}

export const getFileCategory = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (!extension) return 'unknown'

  const formats = getSupportedFormats()
  
  if (formats.images.includes(extension)) return 'image'
  if (formats.documents.includes(extension)) return 'document'
  if (formats.spreadsheets.includes(extension)) return 'spreadsheet'
  if (formats.presentations.includes(extension)) return 'presentation'
  if (formats.videos.includes(extension)) return 'video'
  if (formats.audio.includes(extension)) return 'audio'
  if (formats.archives.includes(extension)) return 'archive'
  
  return 'unknown'
}

// Enhanced validation with detailed feedback
export const validateFile = (file: File) => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const errors: string[] = []

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 50MB limit`)
  }

  // Check file format
  if (!isFileFormatSupported(file.name)) {
    errors.push(`File format not supported`)
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push(`File name too long (max 255 characters)`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
