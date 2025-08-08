-- Create analytics table for tracking visitors and page views
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visitor_id TEXT NOT NULL, -- Unique identifier for each visitor
  session_id TEXT NOT NULL, -- Session identifier
  page_path TEXT NOT NULL, -- Which page was visited
  user_agent TEXT, -- Browser/device info
  ip_address INET, -- Visitor IP (if available)
  referrer TEXT, -- Where they came from
  country TEXT, -- Visitor country (if available)
  city TEXT, -- Visitor city (if available)
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT, -- Chrome, Firefox, Safari, etc.
  os TEXT, -- Operating system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON public.analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON public.analytics(page_path);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow public insert for analytics" ON public.analytics;
DROP POLICY IF EXISTS "Allow admin read analytics" ON public.analytics;

-- Allow anyone to insert analytics data
CREATE POLICY "Allow public insert for analytics" ON public.analytics
  FOR INSERT WITH CHECK (true);

-- Allow admin to read all analytics data
CREATE POLICY "Allow admin read analytics" ON public.analytics
  FOR SELECT USING (true);

-- Grant permissions
GRANT INSERT ON public.analytics TO anon;
GRANT ALL ON public.analytics TO authenticated;
