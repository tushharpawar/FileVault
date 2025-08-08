"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createFilesTable } from '@/lib/database-actions'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Database, ExternalLink } from 'lucide-react'

export function DatabaseSetup() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    checkTable()
  }, [])

  const checkTable = async () => {
    setChecking(true)
    try {
      // Try to query the files table
      const { data, error } = await supabase
        .from('files')
        .select('id')
        .limit(1)

      setTableExists(!error)
    } catch (error) {
      setTableExists(false)
    } finally {
      setChecking(false)
    }
  }

  const handleCreateTable = async () => {
    setCreating(true)
    try {
      const result = await createFilesTable()
      
      if (result.success) {
        setTableExists(true)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create table",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create database table",
      })
    } finally {
      setCreating(false)
    }
  }

  if (checking) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4" />
          <p>Checking database setup...</p>
        </CardContent>
      </Card>
    )
  }

  if (tableExists) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-4" />
          <p className="text-green-700 font-medium">Database is ready!</p>
          <p className="text-green-600 text-sm mt-2">Files table is properly configured.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center text-red-700">
          <Database className="w-5 h-5 mr-2" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-red-700">
            The files table needs to be created in your database before the application can work.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Automatic Setup:</h4>
            <p className="text-sm text-red-700 mb-3">
              Click the button below to automatically create the database table with proper configuration.
            </p>
            <Button 
              onClick={handleCreateTable}
              disabled={creating}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {creating ? 'Creating Table...' : 'Create Database Table'}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Manual Setup (Alternative):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-red-700 mb-3">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Run the SQL script: <code className="bg-red-100 px-1 rounded">create-tables.sql</code></li>
              <li>This will create the files table with proper permissions</li>
              <li>Refresh this page after running the script</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Dashboard
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Important:</p>
                <p>Make sure your <code className="bg-yellow-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is set in your environment variables for automatic setup to work.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={checkTable}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Check Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
