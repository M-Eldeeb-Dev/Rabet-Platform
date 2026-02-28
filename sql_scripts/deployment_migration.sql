-- ============================================================
-- RABET PLATFORM — Deployment Migration Script
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This script adds missing columns, new tables, and fixes policies
-- ============================================================
-- ==========================================
-- 1. FIX MISSING COLUMNS ON EXISTING TABLES
-- ==========================================
-- Messages: attachment support (used in ChatBox.jsx)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment_type character varying;
-- Events: image and apply link (used in Events.jsx, EventDetails.jsx)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS apply_url text;
-- ==========================================
-- 2. NEW TABLE: project_applications
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    applicant_id uuid NOT NULL,
    status character varying DEFAULT 'pending' CHECK (
        status::text = ANY (ARRAY ['pending','approved','rejected'])
    ),
    message text,
    responded_by uuid,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT project_applications_pkey PRIMARY KEY (id),
    CONSTRAINT project_applications_unique UNIQUE (project_id, applicant_id),
    CONSTRAINT project_applications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
    CONSTRAINT project_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.profiles(id),
    CONSTRAINT project_applications_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.profiles(id)
);
-- ==========================================
-- 3. NEW TABLE: event_applications
-- ==========================================
CREATE TABLE IF NOT EXISTS public.event_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL,
    applicant_id uuid NOT NULL,
    status character varying DEFAULT 'pending' CHECK (
        status::text = ANY (ARRAY ['pending','approved','rejected'])
    ),
    message text,
    responded_by uuid,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_applications_pkey PRIMARY KEY (id),
    CONSTRAINT event_applications_unique UNIQUE (event_id, applicant_id),
    CONSTRAINT event_applications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
    CONSTRAINT event_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.profiles(id),
    CONSTRAINT event_applications_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.profiles(id)
);
-- ==========================================
-- 4. INDEXES for new tables
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_project_applications_project ON public.project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_applicant ON public.project_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON public.project_applications(status);
CREATE INDEX IF NOT EXISTS idx_event_applications_event ON public.event_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_applications_applicant ON public.event_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_event_applications_status ON public.event_applications(status);
-- ==========================================
-- 5. ENABLE RLS on new tables
-- ==========================================
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;
-- ==========================================
-- 6. GRANTS for new tables
-- ==========================================
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.project_applications TO authenticated;
GRANT SELECT ON public.project_applications TO anon;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.event_applications TO authenticated;
GRANT SELECT ON public.event_applications TO anon;
-- ==========================================
-- 7. RLS POLICIES — Project Applications
-- ==========================================
-- Applicants can view their own applications
CREATE POLICY "Users can view own project applications" ON public.project_applications FOR
SELECT USING (auth.uid() = applicant_id);
-- Project owners can view applications to their projects
CREATE POLICY "Owners can view project applications" ON public.project_applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.projects
            WHERE id = project_applications.project_id
                AND owner_id = auth.uid()
        )
    );
-- Admins can view all project applications
CREATE POLICY "Admins can view all project applications" ON public.project_applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Users can submit applications
CREATE POLICY "Users can create project applications" ON public.project_applications FOR
INSERT WITH CHECK (auth.uid() = applicant_id);
-- Project owners can update application status (approve/reject)
CREATE POLICY "Owners can update project applications" ON public.project_applications FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.projects
            WHERE id = project_applications.project_id
                AND owner_id = auth.uid()
        )
    );
-- Applicants can delete (withdraw) their own applications
CREATE POLICY "Users can delete own project applications" ON public.project_applications FOR DELETE USING (auth.uid() = applicant_id);
-- ==========================================
-- 8. RLS POLICIES — Event Applications
-- ==========================================
-- Applicants can view their own event applications
CREATE POLICY "Users can view own event applications" ON public.event_applications FOR
SELECT USING (auth.uid() = applicant_id);
-- Event organizers can view applications to their events
CREATE POLICY "Organizers can view event applications" ON public.event_applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.events
            WHERE id = event_applications.event_id
                AND organizer_id = auth.uid()
        )
    );
-- Admins can view all event applications
CREATE POLICY "Admins can view all event applications" ON public.event_applications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Users can submit event applications
CREATE POLICY "Users can create event applications" ON public.event_applications FOR
INSERT WITH CHECK (auth.uid() = applicant_id);
-- Event organizers can update application status
CREATE POLICY "Organizers can update event applications" ON public.event_applications FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.events
            WHERE id = event_applications.event_id
                AND organizer_id = auth.uid()
        )
    );
-- Applicants can delete (withdraw) their own event applications
CREATE POLICY "Users can delete own event applications" ON public.event_applications FOR DELETE USING (auth.uid() = applicant_id);
-- ==========================================
-- 9. FIX MISSING RLS POLICIES on existing tables
-- ==========================================
-- project_interactions: allow delete
DROP POLICY IF EXISTS "Users can delete own interactions" ON public.project_interactions;
CREATE POLICY "Users can delete own interactions" ON public.project_interactions FOR DELETE USING (auth.uid() = user_id);
-- user_presence: allow delete for cleanup
DROP POLICY IF EXISTS "Users can delete own presence" ON public.user_presence;
CREATE POLICY "Users can delete own presence" ON public.user_presence FOR DELETE USING (auth.uid() = user_id);
-- project_limits: insert and update
DROP POLICY IF EXISTS "Users can insert own limits" ON public.project_limits;
CREATE POLICY "Users can insert own limits" ON public.project_limits FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own limits" ON public.project_limits;
CREATE POLICY "Users can update own limits" ON public.project_limits FOR
UPDATE USING (auth.uid() = user_id);
-- ==========================================
-- 10. AUTO-UPDATE updated_at for new tables
-- ==========================================
DROP TRIGGER IF EXISTS set_updated_at ON public.project_applications;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.project_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.event_applications;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.event_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- ==========================================
-- 11. ENABLE REALTIME for new tables
-- ==========================================
ALTER PUBLICATION supabase_realtime
ADD TABLE public.project_applications;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.event_applications;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.messages;
-- ==========================================
-- 12. INCREMENT VIEWS FUNCTION (RPC)
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_project_views(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.projects
SET views_count = COALESCE(views_count, 0) + 1
WHERE id = p_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_event_views(e_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.events
SET views_count = COALESCE(views_count, 0) + 1
WHERE id = e_id;
END;
$$;
-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_project_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_event_views(uuid) TO authenticated;
-- ============================================================
-- DONE! All migrations applied successfully.
-- ============================================================