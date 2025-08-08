"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Search, Grid3X3, List, Upload, LogOut, Eye, Download, Share2, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { FileCardSkeleton, FileListSkeleton } from "@/components/file-skeleton"
import { FileUploadModal } from "@/components/file-upload-modal"
import { supabase, FileRecord } from "@/lib/supabase"
import { adminLogout, checkAdminAuth } from "@/lib/auth"
import { DatabaseSetup } from "@/components/database-setup"
import { showFileActionToasts } from "@/lib/toast-utils"

const getFileIcon = (type: string) => {
  switch (type.split('/')[0]) {
    case "application":
      if (type.includes('pdf')) return { bg: 'bg-red-500', text: 'PDF' }
      if (type.includes('document')) return { bg: 'bg-blue-500', text: 'DOC' }
      if (type.includes('spreadsheet')) return { bg: 'bg-emerald-500', text: 'XLS' }
      if (type.includes('presentation')) return { bg: 'bg-orange-500', text: 'PPT' }
      return { bg: 'bg-gray-500', text: 'FILE' }
    case "image":
      return { bg: 'bg-green-500', text: 'IMG' }
    case "video":
      return { bg: 'bg-purple-500', text: 'VID' }
    default:
      return { bg: 'bg-gray-500', text: 'FILE' }
  }
}

export default function AdminDashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [databaseReady, setDatabaseReady] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    checkDatabaseAndFetchFiles()
  }, [])

  const checkAuth = async () => {
    const isAuthenticated = await checkAdminAuth()
    if (!isAuthenticated) {
      router.push('/6754382-thdbsa-637239/admin/login')
    }
  }

  const checkDatabaseAndFetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .limit(1)

      if (error) {
        console.error('Database check error:', error)
        setDatabaseReady(false)
        setLoading(false)
        return
      }

      setDatabaseReady(true)
      await fetchFiles()
    } catch (error) {
      console.error('Database check error:', error)
      setDatabaseReady(false)
      setLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePreview = (file: FileRecord) => {
    window.open(file.preview_url, '_blank')
  }

  const handleDownload = async (file: FileRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleShare = async (file: FileRecord) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.name,
          text: `Check out this file: ${file.name}`,
          url: file.preview_url
        })
        showFileActionToasts.shareSuccess(file.name)
      } else {
        await navigator.clipboard.writeText(file.preview_url)
        showFileActionToasts.linkCopied(file.name)
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(file.preview_url)
        showFileActionToasts.linkCopied(file.name)
      } catch (clipboardError) {
        showFileActionToasts.shareFailed()
      }
    }
  }

  const handleDelete = async (file: FileRecord) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([file.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id)

      if (dbError) throw dbError

      setFiles(prev => prev.filter(f => f.id !== file.id))
      showFileActionToasts.deleteSuccess(file.name)
    } catch (error) {
      console.error('Delete error:', error)
      showFileActionToasts.deleteFailed(file.name)
    }
  }

  const handleLogout = async () => {
    await adminLogout()
  }

  if (databaseReady === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  Setup Required
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <DatabaseSetup />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent truncate">
                Admin Panel
              </h1>
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs flex-shrink-0">
                Admin
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {/* Desktop Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-60 xl:w-80 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  title="List View"
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Upload Button */}
              <Button 
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-8 sm:h-9"
                size="sm"
              >
                <Upload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Button>

              {/* Logout Button */}
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                size="sm"
                className="h-8 sm:h-9"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="lg:hidden pb-3 sm:pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-slate-50 border-slate-200 focus:bg-white h-9"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">{files.length}</div>
              <div className="text-blue-100 text-xs sm:text-sm">Total Files</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">
                {files.length > 0 ? (files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1) : '0'} MB
              </div>
              <div className="text-purple-100 text-xs sm:text-sm">Total Size</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">{filteredFiles.length}</div>
              <div className="text-emerald-100 text-xs sm:text-sm">Search Results</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="text-xl sm:text-2xl font-bold">
                {files.filter(f => new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-orange-100 text-xs sm:text-sm">This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              Manage Files ({filteredFiles.length})
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Upload, preview, and delete files
            </p>
          </div>

          {loading ? (
            <div className="p-4 sm:p-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <FileCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <FileListSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No files uploaded yet</h3>
              <p className="text-slate-600 text-sm sm:text-base">Upload your first file to get started.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                {filteredFiles.map((file) => {
                  const fileIcon = getFileIcon(file.type)
                  return (
                    <Card key={file.id} className="group hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative cursor-pointer" onClick={() => handlePreview(file)}>
                          {file.type.startsWith('image/') ? (
                            <img
                              src={file.preview_url || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${fileIcon.bg} rounded-lg flex items-center justify-center text-white text-sm sm:text-lg font-bold`}>
                                {fileIcon.text}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="absolute top-3 left-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${fileIcon.bg}`}>
                              {fileIcon.text}
                            </div>
                          </div>

                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 sm:transition-all sm:duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-slate-700 shadow-lg"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={4}>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePreview(file)
                                  }}
                                  className="cursor-pointer focus:bg-slate-100"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownload(file)
                                  }}
                                  className="cursor-pointer focus:bg-slate-100"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShare(file)
                                  }}
                                  className="cursor-pointer focus:bg-slate-100"
                                >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(file)
                                  }} 
                                  className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                                {file.name}
                              </h3>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <span className="text-xs sm:text-sm font-medium text-slate-600">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(file.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 group-hover:w-full ${fileIcon.bg.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').replace('500', '500')} w-3/4`}></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-slate-200">
              {filteredFiles.map((file) => {
                const fileIcon = getFileIcon(file.type)
                return (
                  <div key={file.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors duration-150 group">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${fileIcon.bg} rounded flex items-center justify-center text-white text-xs font-bold`}>
                          {fileIcon.text}
                        </div>
                      </div>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer" 
                        onClick={() => handlePreview(file)}
                      >
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-slate-900 truncate">
                            {file.name}
                          </h3>
                          <Badge variant="secondary" className={`${fileIcon.bg.replace('bg-', 'bg-').replace('-500', '-100')} text-xs hidden sm:inline-flex`}>
                            {fileIcon.text}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                          <span>Modified {new Date(file.created_at).toLocaleDateString()}</span>
                          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 hidden sm:block">
                        <div className="w-16 h-12 bg-slate-100 rounded overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={file.preview_url || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className={`w-6 h-6 ${fileIcon.bg} rounded flex items-center justify-center text-white text-xs font-bold`}>
                                {fileIcon.text}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 sm:transition-opacity sm:duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-50" sideOffset={4}>
                            <DropdownMenuItem 
                              onClick={() => handlePreview(file)}
                              className="cursor-pointer focus:bg-slate-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDownload(file)}
                              className="cursor-pointer focus:bg-slate-100"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleShare(file)}
                              className="cursor-pointer focus:bg-slate-100"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(file)} 
                              className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      
      <FileUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={() => {
          fetchFiles()
        }}
      />
    </div>
  )
}
