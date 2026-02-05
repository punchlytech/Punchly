-- Punchly Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'engineer');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold');
CREATE TYPE unit_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE snag_category AS ENUM ('electrical', 'plumbing', 'finishing', 'structural', 'hvac', 'other');
CREATE TYPE snag_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE snag_status AS ENUM ('open', 'in_progress', 'resolved', 'verified');
CREATE TYPE report_type AS ENUM ('unit_snag_list', 'project_summary', 'handover');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'engineer',
    company_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status project_status NOT NULL DEFAULT 'active',
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    target_completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UNITS TABLE
-- =====================================================
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    floor TEXT NOT NULL,
    block TEXT,
    status unit_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, unit_number)
);

-- =====================================================
-- SNAGS TABLE
-- =====================================================
CREATE TABLE snags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category snag_category NOT NULL,
    priority snag_priority NOT NULL DEFAULT 'medium',
    status snag_status NOT NULL DEFAULT 'open',
    location TEXT NOT NULL,
    photo_url TEXT,
    annotated_photo_url TEXT,
    reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    report_type report_type NOT NULL,
    pdf_url TEXT NOT NULL,
    qr_code_url TEXT NOT NULL,
    generated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_units_project_id ON units(project_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_snags_unit_id ON snags(unit_id);
CREATE INDEX idx_snags_project_id ON snags(project_id);
CREATE INDEX idx_snags_status ON snags(status);
CREATE INDEX idx_snags_priority ON snags(priority);
CREATE INDEX idx_snags_reported_by ON snags(reported_by);
CREATE INDEX idx_snags_assigned_to ON snags(assigned_to);
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_unit_id ON reports(unit_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snags_updated_at BEFORE UPDATE ON snags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE snags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can create profiles (staff management)
CREATE POLICY "Admins can create profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update other profiles
CREATE POLICY "Admins can update profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PROJECTS POLICIES
-- Authenticated users can view projects
CREATE POLICY "Users can view projects" ON projects
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins can create projects
CREATE POLICY "Admins can create projects" ON projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update projects
CREATE POLICY "Admins can update projects" ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete projects
CREATE POLICY "Admins can delete projects" ON projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- UNITS POLICIES
-- Authenticated users can view units
CREATE POLICY "Users can view units" ON units
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins can manage units
CREATE POLICY "Admins can create units" ON units
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update units" ON units
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete units" ON units
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SNAGS POLICIES
-- Users can view snags (admins see all, engineers see their own)
CREATE POLICY "Users can view snags" ON snags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND (
                role = 'admin' OR
                id = snags.reported_by OR
                id = snags.assigned_to
            )
        )
    );

-- Authenticated users can create snags
CREATE POLICY "Users can create snags" ON snags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update snags (admins can update all, engineers only their own)
CREATE POLICY "Users can update snags" ON snags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND (
                role = 'admin' OR
                id = snags.reported_by OR
                id = snags.assigned_to
            )
        )
    );

-- Only admins can delete snags
CREATE POLICY "Admins can delete snags" ON snags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- REPORTS POLICIES
-- Authenticated users can view reports
CREATE POLICY "Users can view reports" ON reports
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins can create reports
CREATE POLICY "Admins can create reports" ON reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete reports
CREATE POLICY "Admins can delete reports" ON reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- STORAGE BUCKETS (Run these separately if needed)
-- =====================================================
-- You'll need to create these in Supabase Storage UI:
-- 1. "snag-photos" - for original photos
-- 2. "annotated-photos" - for annotated images
-- 3. "reports" - for generated PDF reports
-- 4. "qr-codes" - for QR code images
-- 5. "avatars" - for user profile pictures

-- =====================================================
-- SEED DATA (Optional - First Admin User)
-- =====================================================
-- After creating your first user via Supabase Auth,
-- run this to make them an admin:
--
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';

-- =====================================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- =====================================================

-- View all snags with project and unit details
CREATE VIEW snags_detailed AS
SELECT
    s.id,
    s.title,
    s.description,
    s.category,
    s.priority,
    s.status,
    s.location,
    s.created_at,
    p.name as project_name,
    u.unit_number,
    u.unit_type,
    reporter.full_name as reported_by_name,
    assignee.full_name as assigned_to_name
FROM snags s
JOIN projects p ON s.project_id = p.id
JOIN units u ON s.unit_id = u.id
JOIN profiles reporter ON s.reported_by = reporter.id
LEFT JOIN profiles assignee ON s.assigned_to = assignee.id;

-- Project summary with snag counts
CREATE VIEW project_summary AS
SELECT
    p.id,
    p.name,
    p.location,
    p.status,
    COUNT(DISTINCT u.id) as total_units,
    COUNT(s.id) as total_snags,
    COUNT(CASE WHEN s.status = 'open' THEN 1 END) as open_snags,
    COUNT(CASE WHEN s.status = 'in_progress' THEN 1 END) as in_progress_snags,
    COUNT(CASE WHEN s.status = 'resolved' THEN 1 END) as resolved_snags,
    COUNT(CASE WHEN s.status = 'verified' THEN 1 END) as verified_snags
FROM projects p
LEFT JOIN units u ON p.id = u.project_id
LEFT JOIN snags s ON u.id = s.unit_id
GROUP BY p.id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Schema created successfully!
-- Next steps:
-- 1. Set up Supabase Storage buckets
-- 2. Configure authentication settings
-- 3. Test RLS policies
-- 4. Create your first admin user
