"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createStorageBucket } from '@/lib/storage-actions'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'

export function BucketSetup() {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    checkBucket()
  }, [])

  const checkBucket = async () => {
    setChecking(true)
    try {
      // Try to list files in the bucket - this will fail if bucket doesn't exist
      const { data, error } = await supabase.storage
        .from('files')
        .list('', { limit: 1 })

      setBucketExists(!error)
    } catch (error) {
      setBucketExists(false)
    } finally {
      setChecking(false)
    }
  }

  const handleCreateBucket = async () => {
    setCreating(true)
    try {
      const result = await createStorageBucket()
      
      if (result.success) {
        setBucketExists(true)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create bucket",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create storage bucket",
        variant: "destructive"
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
          <p>Checking storage setup...</p>
        </CardContent>
      </Card>
    )
  }

  if (bucketExists) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-4" />
          <p className="text-green-700 font-medium">Storage is ready!</p>
          <p className="text-green-600 text-sm mt-2">You can now upload files.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Storage Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-orange-700">
            The storage bucket needs to be created before you can upload files.
          </p>
          
          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Automatic Setup:</h4>
            <p className="text-sm text-orange-700 mb-3">
              Click the button below to automatically create the storage bucket with proper configuration.
            </p>
            <Button 
              onClick={handleCreateBucket}
              disabled={creating}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {creating ? 'Creating Bucket...' : 'Create Storage Bucket'}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Manual Setup (Alternative):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to Storage section</li>
              <li>Click "New Bucket"</li>
              <li>Create a bucket named: <code className="bg-orange-100 px-1 rounded">files</code></li>
              <li>Make it public and set 50MB file size limit</li>
            </ol>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={checkBucket}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Check Again
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
