"use client"

import { useEffect, useState } from 'react'
import { verifyEnvironmentSetup } from '@/lib/env-check'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EnvResult {
  name: string
  key: string
  exists: boolean
  hasValue: boolean
  isPublic: boolean
  required: boolean
  preview: string
}

export function EnvironmentCheck() {
  const [results, setResults] = useState<EnvResult[]>([])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showValues, setShowValues] = useState(false)

  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      const result = await verifyEnvironmentSetup()
      setResults(result.results)
      setSuccess(result.success)
    } catch (error) {
      console.error('Environment check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4" />
          <p>Checking environment variables...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${success ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center ${success ? 'text-green-700' : 'text-orange-700'}`}>
          {success ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          Environment Variables Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {success ? (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">✅ All environment variables are properly configured!</p>
              <p className="text-green-600 text-sm mt-1">Your application is ready to use.</p>
            </div>
          ) : (
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-700 font-medium">⚠️ Some environment variables need attention</p>
              <p className="text-orange-600 text-sm mt-1">Please check the details below.</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="font-medium text-slate-900">Environment Variables</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValues(!showValues)}
              >
                {showValues ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showValues ? 'Hide Values' : 'Show Values'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={checkEnvironment}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.name} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {result.exists && result.hasValue ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                          {result.key}
                        </code>
                        {result.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {result.isPublic && (
                          <Badge variant="secondary" className="text-xs">Public</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Status: {result.exists && result.hasValue ? 'Set' : 'Missing'}
                      </p>
                    </div>
                  </div>
                  
                  {showValues && (
                    <div className="text-right">
                      <code className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                        {result.preview}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">🚀 Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Database setup - Create the files table</li>
                <li>Storage setup - Create the storage bucket</li>
                <li>Test file upload functionality</li>
                <li>Access admin panel at <code className="bg-blue-100 px-1 rounded">/admin</code></li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
