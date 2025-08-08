# Environment Setup Guide

## 🔧 Environment Variables Setup

### 1. Create Environment File
Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

### 2. Get Supabase Credentials

#### From Supabase Dashboard:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**

#### Required Values:
- **Project URL**: Copy the URL (starts with `https://`)
- **Anon Key**: Copy the `anon` `public` key
- **Service Role Key**: Copy the `service_role` `secret` key ⚠️ **Keep this secret!**

### 3. Database Configuration (Optional)
If you need direct database access:
1. Go to **Settings** → **Database**
2. Copy the connection strings

### 4. Update .env.local
Replace all placeholder values with your actual credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
\`\`\`

## 🔒 Security Notes

### ⚠️ **IMPORTANT SECURITY WARNINGS**

1. **Never commit `.env.local` to git** - it's already in `.gitignore`
2. **Service Role Key is DANGEROUS** - it has admin privileges
3. **Only use Service Role Key on the server** - never expose to client
4. **Use different keys for production** - create separate Supabase projects

### Environment Variable Types:
- `NEXT_PUBLIC_*` - Exposed to browser (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only (admin privileges)
- `POSTGRES_*` - Server-only (database access)

## 🚀 Quick Start

1. **Copy environment file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Fill in your Supabase credentials**

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Visit the admin panel:**
   - Go to `/admin/login`
   - Username: `admin`
   - Password: `Admin@1234`

## 🔍 Troubleshooting

### Common Issues:

**"Supabase client not initialized"**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**"Bucket not found"**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Use the bucket creation feature in admin panel

**"Database connection failed"**
- Check your database credentials
- Ensure your Supabase project is active

### Environment Variable Checklist:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)
- [ ] All values are from the same Supabase project
- [ ] No trailing spaces or quotes in values
- [ ] `.env.local` file is in project root

## 📝 Production Deployment

For production (Vercel, Netlify, etc.):
1. **Create separate Supabase project** for production
2. **Add environment variables** in your hosting platform
3. **Never use development keys** in production
4. **Enable RLS policies** in production database
