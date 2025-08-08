'use client'

import { supabase } from './supabase'

// Generate a unique visitor ID that persists across sessions
function getVisitorId(): string {
  let visitorId = localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2)}`
    localStorage.setItem('visitor_id', visitorId)
  }
  return visitorId
}

// Generate a session ID that changes each browser session
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Detect device type
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet'
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile'
  }
  return 'desktop'
}

// Detect browser
function getBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'Chrome'
  if (userAgent.includes('firefox')) return 'Firefox'
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari'
  if (userAgent.includes('edg')) return 'Edge'
  if (userAgent.includes('opera')) return 'Opera'
  return 'Unknown'
}

// Detect operating system
function getOS(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('windows')) return 'Windows'
  if (userAgent.includes('mac')) return 'macOS'
  if (userAgent.includes('linux')) return 'Linux'
  if (userAgent.includes('android')) return 'Android'
  if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS'
  return 'Unknown'
}

// Get location info (this would typically use a geolocation service)
async function getLocationInfo() {
  try {
    // You can integrate with services like ipapi.co, ipgeolocation.io, etc.
    // For now, we'll return null and you can add your preferred service
    const response = await fetch('https://ipapi.co/json/')
    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country_name || null,
        city: data.city || null,
        ip: data.ip || null
      }
    }
  } catch (error) {
    console.log('Location detection failed:', error)
  }
  return { country: null, city: null, ip: null }
}

// Track page visit
export async function trackPageView(pagePath: string) {
  try {
    const visitorId = getVisitorId()
    const sessionId = getSessionId()
    const locationInfo = await getLocationInfo()

    const analyticsData = {
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: pagePath,
      user_agent: navigator.userAgent,
      ip_address: locationInfo.ip,
      referrer: document.referrer || null,
      country: locationInfo.country,
      city: locationInfo.city,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS()
    }

    const { error } = await supabase
      .from('analytics')
      .insert(analyticsData)

    if (error) {
      console.error('Analytics tracking error:', error)
    }
  } catch (error) {
    console.error('Analytics tracking failed:', error)
  }
}

// Track custom events
export async function trackEvent(eventName: string, eventData?: any) {
  try {
    const visitorId = getVisitorId()
    const sessionId = getSessionId()

    const analyticsData = {
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: `event:${eventName}`,
      user_agent: navigator.userAgent,
      referrer: JSON.stringify(eventData) || null,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS()
    }

    const { error } = await supabase
      .from('analytics')
      .insert(analyticsData)

    if (error) {
      console.error('Event tracking error:', error)
    }
  } catch (error) {
    console.error('Event tracking failed:', error)
  }
}
