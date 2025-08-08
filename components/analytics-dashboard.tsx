"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Eye, MousePointer, Calendar, TrendingUp, Monitor, Smartphone, Tablet, Chrome, RefreshCw, Globe, Clock } from 'lucide-react'
import { getAnalyticsData, getVisitorTrend } from '@/lib/analytics-queries'

interface AnalyticsData {
  uniqueVisitors: number
  totalPageViews: number
  totalSessions: number
  todayVisitors: number
  weekVisitors: number
  topPages: Array<{ page: string; views: number }>
  deviceStats: {
    devices: Record<string, number>
    browsers: Record<string, number>
    os: Record<string, number>
  }
  recentActivity: Array<any>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [trend, setTrend] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsData, trendData] = await Promise.all([
        getAnalyticsData(),
        getVisitorTrend(7)
      ])
      setAnalytics(analyticsData)
      setTrend(trendData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'desktop': return <Monitor className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Analytics Data</h3>
        <p className="text-slate-600">Analytics data will appear once visitors start using the platform.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-600">Track visitor behavior and platform usage</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
                <div className="text-blue-100">Unique Visitors</div>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.totalPageViews.toLocaleString()}</div>
                <div className="text-green-100">Total Page Views</div>
              </div>
              <Eye className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.totalSessions.toLocaleString()}</div>
                <div className="text-purple-100">Total Sessions</div>
              </div>
              <MousePointer className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.todayVisitors.toLocaleString()}</div>
                <div className="text-orange-100">Today's Visitors</div>
              </div>
              <Calendar className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Popular Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPages.length > 0 ? (
                analytics.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {page.page === '/' ? 'Home' : page.page}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">{page.views} views</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No page data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.deviceStats.devices).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(device)}
                    <span className="text-sm font-medium capitalize">{device}</span>
                  </div>
                  <span className="text-sm text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Chrome className="w-5 h-5 mr-2" />
              Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.deviceStats.browsers).map(([browser, count]) => (
                <div key={browser} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-slate-200 rounded"></div>
                    <span className="text-sm font-medium">{browser}</span>
                  </div>
                  <span className="text-sm text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Activity (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(activity.device_type)}
                    <div>
                      <p className="text-sm font-medium">
                        {activity.page_path === '/' ? 'Home Page' : activity.page_path}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.browser} • {activity.os} • {activity.country || 'Unknown location'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Visitor Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">
              This week: <strong>{analytics.weekVisitors}</strong> unique visitors
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Detailed trend charts can be added with charting libraries like Chart.js or Recharts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
