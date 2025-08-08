"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, RefreshCw, Database, HardDrive, Upload, Settings } from 'lucide-react'
import { EnvironmentCheck } from './environment-check'
import { DatabaseSetup } from './database-setup'
import { BucketSetup } from './bucket-setup'
import { supabase } from '@/lib/supabase'

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  checking: boolean
}

export function SetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'environment',
      title: 'Environment Variables',
      description: 'Configure Supabase credentials',
      icon: <Settings className="w-5 h-5" />,
      completed: false,
      checking: false
    },
    {
      id: 'database',
      title: 'Database Setup',
      description: 'Create files table and policies',
      icon: <Database className="w-5 h-5" />,
      completed: false,
      checking: false
    },
    {
      id: 'storage',
      title: 'Storage Setup',
      description: 'Create storage bucket for files',
      icon: <HardDrive className="w-5 h-5" />,
      completed: false,
      checking: false
    },
    {
      id: 'testing',
      title: 'Test Upload',
      description: 'Verify file upload functionality',
      icon: <Upload className="w-5 h-5" />,
      completed: false,
      checking: false
    }
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [overallStatus, setOverallStatus] = useState<'checking' | 'incomplete' | 'complete'>('checking')

  useEffect(() => {
    checkAllSteps()
  }, [])

  const checkAllSteps = async () => {
    // Check environment variables
    await checkEnvironment()
    
    // Check database
    await checkDatabase()
    
    // Check storage
    await checkStorage()
    
    // Update overall status
    updateOverallStatus()
  }

  const checkEnvironment = async () => {
    updateStepStatus('environment', true, false)
    try {
      // Simple check for required env vars
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
      
      const completed = hasUrl && hasAnonKey && hasServiceKey
      updateStepStatus('environment', false, completed)
    } catch (error) {
      updateStepStatus('environment', false, false)
    }
  }

  const checkDatabase = async () => {
    updateStepStatus('database', true, false)
    try {
      const { data, error } = await supabase
        .from('files')
        .select('id')
        .limit(1)

      updateStepStatus('database', false, !error)
    } catch (error) {
      updateStepStatus('database', false, false)
    }
  }

  const checkStorage = async () => {
    updateStepStatus('storage', true, false)
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .list('', { limit: 1 })

      updateStepStatus('storage', false, !error)
    } catch (error) {
      updateStepStatus('storage', false, false)
    }
  }

  const updateStepStatus = (stepId: string, checking: boolean, completed: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, checking, completed }
        : step
    ))
  }

  const updateOverallStatus = () => {
    const allCompleted = steps.every(step => step.completed)
    const anyChecking = steps.some(step => step.checking)
    
    if (anyChecking) {
      setOverallStatus('checking')
    } else if (allCompleted) {
      setOverallStatus('complete')
    } else {
      setOverallStatus('incomplete')
    }
  }

  const getStepComponent = (stepId: string) => {
    switch (stepId) {
      case 'environment':
        return <EnvironmentCheck />
      case 'database':
        return <DatabaseSetup />
      case 'storage':
        return <BucketSetup />
      case 'testing':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <Upload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Test!</h3>
              <p className="text-slate-600 mb-4">
                Your setup is complete. Visit the admin panel to test file uploads.
              </p>
              <Button onClick={() => window.open('/admin', '_blank')}>
                Open Admin Panel
              </Button>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Setup Wizard</h1>
          <p className="text-slate-600">Configure your file platform step by step</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.checking
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {step.checking ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 text-left">
                  <p className={`text-sm font-medium ${step.completed ? 'text-green-700' : 'text-slate-900'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <Button
                key={step.id}
                variant={currentStep === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(index)}
                className="flex items-center space-x-2"
              >
                {step.icon}
                <span>{step.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {getStepComponent(steps[currentStep].id)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={checkAllSteps}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
            
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        {overallStatus === 'complete' && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">🎉 Setup Complete!</h3>
            <p className="text-green-700 mb-4">
              Your file platform is ready to use. You can now upload and manage files.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.open('/admin', '_blank')}>
                Open Admin Panel
              </Button>
              <Button variant="outline" onClick={() => window.open('/', '_blank')}>
                View User Interface
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
