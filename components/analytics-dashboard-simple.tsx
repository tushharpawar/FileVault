"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Upload, Download, Share, Trash2, RefreshCw, FileText, FolderOpen } from 'lucide-react'

interface FileAnalytics {
  totalUploads: number
  totalDownloads: number
  totalShares: number
  totalDeletes: number
  todayUploads: number
  weekUploads: number
  storageUsed: number
  storageLimit: number
  popularFiles: Array<{ name: string; downloads: number }>
  recentActivity: Array<{
    action: string
    fileName: string
    timestamp: string
  }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<FileAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration - replace with actual API call
      const mockData: FileAnalytics = {
        totalUploads: 1247,
        totalDownloads: 3856,
        totalShares: 892,
        totalDeletes: 143,
        todayUploads: 23,
        weekUploads: 189,
        storageUsed: 2.3, // GB
        storageLimit: 10, // GB
        popularFiles: [
          { name: "project-proposal.pdf", downloads: 89 },
          { name: "presentation.pptx", downloads: 76 },
          { name: "budget-sheet.xlsx", downloads: 54 },
          { name: "team-photo.jpg", downloads: 43 },
          { name: "meeting-notes.docx", downloads: 38 }
        ],
        recentActivity: [
          { action: "upload", fileName: "new-document.pdf", timestamp: "2 minutes ago" },
          { action: "share", fileName: "presentation.pptx", timestamp: "5 minutes ago" },
          { action: "download", fileName: "budget-sheet.xlsx", timestamp: "8 minutes ago" },
          { action: "delete", fileName: "old-file.txt", timestamp: "12 minutes ago" },
          { action: "upload", fileName: "image.jpg", timestamp: "15 minutes ago" }
        ]
      }
      setAnalytics(mockData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload': return <Upload className="w-4 h-4 text-blue-500" />
      case 'download': return <Download className="w-4 h-4 text-green-500" />
      case 'share': return <Share className="w-4 h-4 text-purple-500" />
      case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const formatFileSize = (sizeInGB: number) => {
    if (sizeInGB < 1) {
      return `${(sizeInGB * 1024).toFixed(0)} MB`
    }
    return `${sizeInGB.toFixed(1)} GB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Analytics Data</h3>
        <p className="text-slate-600">Analytics data will appear once files are uploaded and used.</p>
      </div>
    )
  }

  const storagePercentage = (analytics.storageUsed / analytics.storageLimit) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">File Analytics</h1>
          <p className="text-slate-600">Track file usage and platform activity</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.totalUploads.toLocaleString()}</div>
                <div className="text-blue-100">Total Uploads</div>
              </div>
              <Upload className="w-8 h-8 text-blue-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="secondary" className="bg-blue-400 text-blue-50">
                +{analytics.todayUploads} today
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</div>
                <div className="text-green-100">Total Downloads</div>
              </div>
              <Download className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.totalShares.toLocaleString()}</div>
                <div className="text-purple-100">Files Shared</div>
              </div>
              <Share className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatFileSize(analytics.storageUsed)}</div>
                <div className="text-slate-100">Storage Used</div>
              </div>
              <FileText className="w-8 h-8 text-slate-200" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-200 mb-1">
                <span>Used</span>
                <span>{formatFileSize(analytics.storageLimit)} limit</span>
              </div>
              <div className="w-full bg-slate-400 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300" 
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Files */}
        <Card>
          <CardHeader>
            <CardTitle>Most Downloaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.popularFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 truncate max-w-48">
                      {file.name}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {file.downloads} downloads
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                {getActionIcon(activity.action)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {activity.fileName}
                  </div>
                  <div className="text-sm text-slate-500 capitalize">
                    {activity.action} · {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.weekUploads}</div>
              <div className="text-sm text-blue-500">Uploads This Week</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.totalDownloads}</div>
              <div className="text-sm text-green-500">Total Downloads</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.totalShares}</div>
              <div className="text-sm text-purple-500">Files Shared</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.totalDeletes}</div>
              <div className="text-sm text-red-500">Files Deleted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
