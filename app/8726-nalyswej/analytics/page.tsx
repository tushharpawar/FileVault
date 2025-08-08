"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkAnalyticsAuth, analyticsLogout } from '@/lib/auth'
import { AnalyticsDashboardEnhanced } from '@/components/analytics-dashboard-enhanced'
import { Button } from '@/components/ui/button'
import { LogOut, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAnalyticsAuth()
      if (!isAuthenticated) {
        router.push('/8726-nalyswej/analytics/login')
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await analyticsLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics
              </h1>
            </div>
            
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AnalyticsDashboardEnhanced />
      </main>
    </div>
  )
}
