'use server'

import { supabase } from './supabase'

export async function getAnalyticsData() {
  try {
    // Get total unique visitors
    const { data: uniqueVisitors, error: visitorsError } = await supabase
      .from('analytics')
      .select('visitor_id')
      .not('page_path', 'like', 'event:%')

    if (visitorsError) throw visitorsError

    const uniqueVisitorCount = new Set(uniqueVisitors?.map(v => v.visitor_id)).size

    // Get total page views
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('analytics')
      .select('id')
      .not('page_path', 'like', 'event:%')

    if (pageViewsError) throw pageViewsError

    const totalPageViews = pageViews?.length || 0

    // Get total sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics')
      .select('session_id')
      .not('page_path', 'like', 'event:%')

    if (sessionsError) throw sessionsError

    const uniqueSessionCount = new Set(sessions?.map(s => s.session_id)).size

    // Get today's visitors
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayVisitors, error: todayError } = await supabase
      .from('analytics')
      .select('visitor_id')
      .gte('created_at', today.toISOString())
      .not('page_path', 'like', 'event:%')

    if (todayError) throw todayError

    const todayUniqueVisitors = new Set(todayVisitors?.map(v => v.visitor_id)).size

    // Get this week's data
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: weekVisitors, error: weekError } = await supabase
      .from('analytics')
      .select('visitor_id')
      .gte('created_at', weekAgo.toISOString())
      .not('page_path', 'like', 'event:%')

    if (weekError) throw weekError

    const weekUniqueVisitors = new Set(weekVisitors?.map(v => v.visitor_id)).size

    // Get popular pages
    const { data: popularPages, error: pagesError } = await supabase
      .from('analytics')
      .select('page_path')
      .not('page_path', 'like', 'event:%')

    if (pagesError) throw pagesError

    const pageStats = popularPages?.reduce((acc: any, curr) => {
      acc[curr.page_path] = (acc[curr.page_path] || 0) + 1
      return acc
    }, {})

    const topPages = Object.entries(pageStats || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([page, views]) => ({ page, views }))

    // Get device/browser stats
    const { data: deviceData, error: deviceError } = await supabase
      .from('analytics')
      .select('device_type, browser, os')
      .not('page_path', 'like', 'event:%')

    if (deviceError) throw deviceError

    const deviceStats = deviceData?.reduce((acc: any, curr) => {
      acc.devices[curr.device_type] = (acc.devices[curr.device_type] || 0) + 1
      acc.browsers[curr.browser] = (acc.browsers[curr.browser] || 0) + 1
      acc.os[curr.os] = (acc.os[curr.os] || 0) + 1
      return acc
    }, { devices: {}, browsers: {}, os: {} })

    // Get recent activity (last 24 hours)
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)

    const { data: recentActivity, error: recentError } = await supabase
      .from('analytics')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (recentError) throw recentError

    return {
      uniqueVisitors: uniqueVisitorCount,
      totalPageViews,
      totalSessions: uniqueSessionCount,
      todayVisitors: todayUniqueVisitors,
      weekVisitors: weekUniqueVisitors,
      topPages,
      deviceStats,
      recentActivity: recentActivity || []
    }
  } catch (error) {
    console.error('Analytics query error:', error)
    return {
      uniqueVisitors: 0,
      totalPageViews: 0,
      totalSessions: 0,
      todayVisitors: 0,
      weekVisitors: 0,
      topPages: [],
      deviceStats: { devices: {}, browsers: {}, os: {} },
      recentActivity: []
    }
  }
}

export async function getVisitorTrend(days: number = 7) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('analytics')
      .select('created_at, visitor_id')
      .gte('created_at', startDate.toISOString())
      .not('page_path', 'like', 'event:%')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Group by date
    const dailyStats = data?.reduce((acc: any, curr) => {
      const date = new Date(curr.created_at).toDateString()
      if (!acc[date]) {
        acc[date] = new Set()
      }
      acc[date].add(curr.visitor_id)
      return acc
    }, {})

    const trend = Object.entries(dailyStats || {}).map(([date, visitors]) => ({
      date,
      visitors: (visitors as Set<string>).size,
      views: Array.from(visitors as Set<string>).length
    }))

    return trend
  } catch (error) {
    console.error('Visitor trend error:', error)
    return []
  }
}
