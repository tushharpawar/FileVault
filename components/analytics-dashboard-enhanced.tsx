"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Eye, MousePointer, Calendar, TrendingUp, Monitor, Smartphone, Tablet, Globe, Clock, RefreshCw, MapPin, Activity } from 'lucide-react'
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

export function AnalyticsDashboardEnhanced() {
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
    switch (device?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'desktop': return <Monitor className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const getBrowserIcon = (browser: string) => {
    const color = browser === 'Chrome' ? 'text-green-600' : 
                 browser === 'Firefox' ? 'text-orange-600' : 
                 browser === 'Safari' ? 'text-blue-600' : 
                 browser === 'Edge' ? 'text-blue-500' : 'text-gray-600'
    return <div className={`w-3 h-3 rounded-full bg-current ${color}`}></div>
  }

  const getCountryFlag = (country: string) => {
    // Simple country code mapping - you can expand this
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺',
      'Brazil': '🇧🇷',
      'China': '🇨🇳'
    }
    return flags[country] || '🌍'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h2>
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-600 text-sm sm:text-base">Track visitor behavior and platform usage</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
                <div className="text-blue-100 text-xs sm:text-sm">Unique Visitors</div>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{analytics.totalPageViews.toLocaleString()}</div>
                <div className="text-green-100 text-xs sm:text-sm">Page Views</div>
              </div>
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{analytics.totalSessions.toLocaleString()}</div>
                <div className="text-purple-100 text-xs sm:text-sm">Sessions</div>
              </div>
              <MousePointer className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{analytics.todayVisitors.toLocaleString()}</div>
                <div className="text-orange-100 text-xs sm:text-sm">Today</div>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Popular Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Popular Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPages.length > 0 ? (
                analytics.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {page.page === '/' ? 'Home' : page.page}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-500">{page.views}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-slate-500">No page data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.deviceStats.devices).map(([device, count]) => {
                const total = Object.values(analytics.deviceStats.devices).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device)}
                        <span className="text-xs sm:text-sm font-medium capitalize">{device}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Browser Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.deviceStats.browsers).map(([browser, count]) => {
                const total = Object.values(analytics.deviceStats.browsers).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={browser} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getBrowserIcon(browser)}
                        <span className="text-xs sm:text-sm font-medium">{browser}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operating Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Operating Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.deviceStats.os).map(([os, count]) => {
              const total = Object.values(analytics.deviceStats.os).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={os} className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-slate-900">{count}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{os}</div>
                  <div className="text-xs text-slate-500">{percentage}%</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-base">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Recent Activity (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(activity.device_type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {activity.page_path === '/' ? 'Home Page' : activity.page_path}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span>{activity.browser}</span>
                        <span>•</span>
                        <span>{activity.os}</span>
                        {activity.country && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <span>{getCountryFlag(activity.country)}</span>
                              <span>{activity.country}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-slate-500">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Table */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-base">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            All Visitor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Page</th>
                  <th className="text-left p-2">Device</th>
                  <th className="text-left p-2">Browser</th>
                  <th className="text-left p-2">OS</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {rawData.slice(0, 50).map((row, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="p-2 truncate max-w-32">
                      {row.page_path === '/' ? 'Home' : row.page_path}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        {getDeviceIcon(row.device_type)}
                        <span className="capitalize">{row.device_type}</span>
                      </div>
                    </td>
                    <td className="p-2">{row.browser}</td>
                    <td className="p-2">{row.os}</td>
                    <td className="p-2">
                      {row.country ? (
                        <div className="flex items-center space-x-1">
                          <span>{getCountryFlag(row.country)}</span>
                          <span>{row.city ? `${row.city}, ${row.country}` : row.country}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unknown</span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {row.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{analytics.weekVisitors}</div>
              <div className="text-xs sm:text-sm text-blue-800">This Week</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {analytics.totalPageViews > 0 ? (analytics.totalPageViews / analytics.uniqueVisitors).toFixed(1) : '0'}
              </div>
              <div className="text-xs sm:text-sm text-green-800">Pages/Visitor</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {analytics.uniqueVisitors > 0 ? (analytics.totalSessions / analytics.uniqueVisitors).toFixed(1) : '0'}
              </div>
              <div className="text-xs sm:text-sm text-purple-800">Sessions/Visitor</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {Object.values(analytics.deviceStats.devices).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-xs sm:text-sm text-orange-800">Total Visits</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
