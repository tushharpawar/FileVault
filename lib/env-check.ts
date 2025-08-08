'use server'

export async function verifyEnvironmentSetup() {
  const checks = {
    supabaseUrl: {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
      public: true
    },
    supabaseAnonKey: {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
      public: true
    },
    supabaseServiceKey: {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      required: true,
      public: false
    },
    supabaseJwtSecret: {
      key: 'SUPABASE_JWT_SECRET',
      value: process.env.SUPABASE_JWT_SECRET,
      required: false,
      public: false
    }
  }

  const results = Object.entries(checks).map(([name, config]) => ({
    name,
    key: config.key,
    exists: !!config.value,
    hasValue: config.value ? config.value.length > 0 : false,
    isPublic: config.public,
    required: config.required,
    preview: config.value ? 
      (config.public ? config.value : `${config.value.substring(0, 20)}...`) : 
      'Not set'
  }))

  const allRequired = results.filter(r => r.required).every(r => r.exists && r.hasValue)
  
  return {
    success: allRequired,
    results,
    message: allRequired ? 'All required environment variables are set!' : 'Some required environment variables are missing'
  }
}
