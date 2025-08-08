'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME 
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const ANALYTICS_USERNAME = process.env.ANALYTICS_USERNAME
const ANALYTICS_PASSWORD = process.env.ANALYTICS_PASSWORD

// Track failed login attempts (in production, use Redis or database)
const failedAttempts = new Map<string, { count: number, lastAttempt: number }>()

export async function adminLogin(username: string, password: string) {
  const clientId = `admin_${username}`
  const now = Date.now()
  const attempts = failedAttempts.get(clientId) || { count: 0, lastAttempt: 0 }

  // Check if account is locked (5 failed attempts, 15 minute lockout)
  if (attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
    return { 
      success: false, 
      error: 'Account temporarily locked due to too many failed attempts',
      locked: true,
      lockDuration: '15 minutes'
    }
  }

  // Reset attempts if lockout period has passed
  if (attempts.count >= 5 && now - attempts.lastAttempt >= 15 * 60 * 1000) {
    failedAttempts.delete(clientId)
  }

  // Validate credentials
  if (username !== ADMIN_USERNAME) {
    // Increment failed attempts
    failedAttempts.set(clientId, { count: attempts.count + 1, lastAttempt: now })
    return { 
      success: false, 
      error: 'Username not found',
      incorrectUsername: true
    }
  }

  if (password !== ADMIN_PASSWORD) {
    // Increment failed attempts
    const newCount = attempts.count + 1
    failedAttempts.set(clientId, { count: newCount, lastAttempt: now })
    return { 
      success: false, 
      error: 'Incorrect password',
      incorrectPassword: true,
      attempts: newCount
    }
  }

  // Success - clear failed attempts
  failedAttempts.delete(clientId)
  
  cookies().set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })
  
  return { success: true }
}

export async function analyticsLogin(username: string, password: string) {
  const clientId = `analytics_${username}`
  const now = Date.now()
  const attempts = failedAttempts.get(clientId) || { count: 0, lastAttempt: 0 }

  // Check if account is locked
  if (attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
    return { 
      success: false, 
      error: 'Account temporarily locked due to too many failed attempts',
      locked: true,
      lockDuration: '15 minutes'
    }
  }

  // Reset attempts if lockout period has passed
  if (attempts.count >= 5 && now - attempts.lastAttempt >= 15 * 60 * 1000) {
    failedAttempts.delete(clientId)
  }

  // Validate credentials
  if (username !== ANALYTICS_USERNAME) {
    failedAttempts.set(clientId, { count: attempts.count + 1, lastAttempt: now })
    return { 
      success: false, 
      error: 'Username not found',
      incorrectUsername: true
    }
  }

  if (password !== ANALYTICS_PASSWORD) {
    const newCount = attempts.count + 1
    failedAttempts.set(clientId, { count: newCount, lastAttempt: now })
    return { 
      success: false, 
      error: 'Incorrect password',
      incorrectPassword: true,
      attempts: newCount
    }
  }

  // Success - clear failed attempts
  failedAttempts.delete(clientId)
  
  cookies().set('analytics_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })
  
  return { success: true }
}

export async function adminLogout() {
  cookies().delete('admin_session')
  redirect('/6754382-thdbsa-637239/admin/login')
}

export async function analyticsLogout() {
  cookies().delete('analytics_session')
  redirect('/8726-nalyswej/analytics/login')
}

export async function checkAdminAuth() {
  const session = await cookies().get('admin_session')
  return session?.value === 'authenticated'
}

export async function checkAnalyticsAuth() {
  const session = await cookies().get('analytics_session')
  return session?.value === 'authenticated'
}
