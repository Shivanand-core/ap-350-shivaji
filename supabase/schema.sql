-- ==============================================================================
-- SHIVRAJ 350: INTERNATIONAL PEER REVIEWED MULTIDISCIPLINARY JOURNAL
-- OFFICIAL SUPABASE BACKEND SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATION
-- Publisher: Shivaji College, University of Delhi
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES & ROLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('superadmin', 'editor', 'reviewer', 'author')),
  designation TEXT,
  department TEXT,
  institution TEXT DEFAULT 'Shivaji College, University of Delhi',
  assigned_disciplines TEXT[] DEFAULT '{}',
  is_reviewing_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ==============================================================================
-- 3. MANUSCRIPT SUBMISSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  article_type TEXT DEFAULT 'Original Research',
  authors TEXT NOT NULL,
  co_authors TEXT,
  email TEXT NOT NULL,
  institution TEXT,
  department TEXT,
  designation TEXT,
  orcid TEXT,
  discipline TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Submitted' 
    CHECK (status IN ('Submitted', 'Screening', 'Under Review', 'Under Evaluation', 'Revision Required', 'Passed', 'Accepted', 'Rejected', 'Published')),
  submitted_date DATE DEFAULT CURRENT_DATE,
  assigned_reviewer_id UUID REFERENCES public.profiles(id),
  assigned_reviewer_name TEXT,
  assigned_reviewer_email TEXT,
  assigned_date DATE,
  similarity_score INTEGER,
  decision_notes TEXT,
  recommendation TEXT,
  review_date DATE,
  files JSONB DEFAULT '[]'::jsonb,
  audit_trail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_tracking_id ON public.submissions(tracking_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer ON public.submissions(assigned_reviewer_email);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Submissions Policies:
-- 1. Anyone (public or author) can submit a new manuscript
DROP POLICY IF EXISTS "Anyone can submit a manuscript" ON public.submissions;
CREATE POLICY "Anyone can submit a manuscript"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Authors can view their own submission using trackingId or author email
DROP POLICY IF EXISTS "Authors can view their own submissions" ON public.submissions;
CREATE POLICY "Authors can view their own submissions"
  ON public.submissions FOR SELECT
  TO anon, authenticated
  USING (
    email = auth.jwt() ->> 'email' 
    OR (auth.uid() IS NOT NULL AND auth.uid() IN (SELECT id FROM public.profiles WHERE email = submissions.email))
  );

-- 3. Reviewers can view submissions assigned to them
DROP POLICY IF EXISTS "Reviewers can view assigned manuscripts" ON public.submissions;
CREATE POLICY "Reviewers can view assigned manuscripts"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    assigned_reviewer_email = auth.jwt() ->> 'email'
    OR assigned_reviewer_id = auth.uid()
  );

-- 4. Editors and Superadmins can view, update, and manage all submissions
DROP POLICY IF EXISTS "Editors and Superadmins have full access to submissions" ON public.submissions;
CREATE POLICY "Editors and Superadmins have full access to submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('editor', 'superadmin')
    )
  );

-- ==============================================================================
-- 4. PUBLISHED ARTICLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  article_number TEXT,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  affiliation TEXT,
  category TEXT,
  discipline TEXT,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  doi TEXT,
  pages TEXT,
  page_range TEXT,
  volume TEXT DEFAULT 'Volume 1',
  issue TEXT DEFAULT 'Issue 1',
  year INTEGER DEFAULT 2026,
  month_year TEXT DEFAULT 'Jan–June 2026',
  published_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  "references" TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for published articles
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_discipline ON public.articles(discipline);
CREATE INDEX IF NOT EXISTS idx_articles_year_volume_issue ON public.articles(year, volume, issue);

-- Enable RLS on articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles Policies:
-- Public can read published articles
DROP POLICY IF EXISTS "Public can read published articles" ON public.articles;
CREATE POLICY "Public can read published articles"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Only editors and superadmins can create, edit, or delete articles
DROP POLICY IF EXISTS "Editors and Superadmins can manage articles" ON public.articles;
CREATE POLICY "Editors and Superadmins can manage articles"
  ON public.articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('editor', 'superadmin')
    )
  );

-- ==============================================================================
-- 5. JOURNAL SETTINGS & PARTICULARS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.journal_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.journal_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view journal settings" ON public.journal_settings;
CREATE POLICY "Public can view journal settings"
  ON public.journal_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Superadmins can update journal settings" ON public.journal_settings;
CREATE POLICY "Superadmins can update journal settings"
  ON public.journal_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'superadmin'
    )
  );

-- ==============================================================================
-- 6. AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, automatically create their profile row
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, designation, department, institution)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'work.shivanand@gmail.com' THEN 'superadmin'
      WHEN NEW.email LIKE '%@shivaji.du.ac.in' OR NEW.email LIKE '%.du.ac.in' THEN 'editor'
      ELSE 'author'
    END,
    COALESCE(NEW.raw_user_meta_data->>'designation', 'Academic Scholar'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Faculty'),
    'Shivaji College, University of Delhi'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon new user registration in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. AUDIT LOGGING FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_submissions ON public.submissions;
CREATE TRIGGER set_timestamp_submissions
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_articles ON public.articles;
CREATE TRIGGER set_timestamp_articles
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
