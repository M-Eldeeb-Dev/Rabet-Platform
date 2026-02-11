-- RLS Policies Fix - Run this in Supabase Dashboard -> SQL Editor
-- This script is idempotent (safe to run multiple times)
-- ==========================================
-- STEP 0: Grant schema-level permissions
-- (Fixes "permission denied for schema public")
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
-- Grant table-level permissions to authenticated users
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- Grant read-only on public tables to anonymous users (for landing page, etc.)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- Allow anonymous users to insert into specific tables (signup profile creation, contact form)
GRANT INSERT ON public.profiles TO anon;
GRANT INSERT ON public.contact_messages TO anon;
-- Ensure future tables also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;
-- ==========================================
-- STEP 1: Enable RLS on all tables
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
-- ==========================================
-- STEP 2: Drop existing policies (safe cleanup)
-- ==========================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Event managers can create events" ON public.events;
DROP POLICY IF EXISTS "Event managers can update their own events" ON public.events;
DROP POLICY IF EXISTS "Submissions viewable by owner and event organizer" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Project interactions viewable by project owner" ON public.project_interactions;
DROP POLICY IF EXISTS "Users can create interactions" ON public.project_interactions;
DROP POLICY IF EXISTS "Users can view their own project limits" ON public.project_limits;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Skills are viewable by everyone" ON public.skills;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
DROP POLICY IF EXISTS "Countries are viewable by everyone" ON public.countries;
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Online presence is public" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can insert their own presence" ON public.user_presence;
-- ==========================================
-- STEP 3: Create all policies
-- ==========================================
-- 1. PROFILES
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id);
-- 2. NOTIFICATIONS
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id);
-- 3. CHATS
CREATE POLICY "Users can view their own chats" ON public.chats FOR
SELECT USING (
        auth.uid() = participant1_id
        OR auth.uid() = participant2_id
    );
CREATE POLICY "Users can create chats" ON public.chats FOR
INSERT WITH CHECK (
        auth.uid() = participant1_id
        OR auth.uid() = participant2_id
    );
CREATE POLICY "Users can update their own chats" ON public.chats FOR
UPDATE USING (
        auth.uid() = participant1_id
        OR auth.uid() = participant2_id
    );
-- 4. MESSAGES
CREATE POLICY "Users can view messages in their chats" ON public.messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.chats
            WHERE id = chat_id
                AND (
                    participant1_id = auth.uid()
                    OR participant2_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can send messages" ON public.messages FOR
INSERT WITH CHECK (auth.uid() = sender_id);
-- 5. PROJECTS
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR
SELECT USING (true);
CREATE POLICY "Users can create projects" ON public.projects FOR
INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR
UPDATE USING (auth.uid() = owner_id);
-- 6. EVENTS
CREATE POLICY "Events are viewable by everyone" ON public.events FOR
SELECT USING (true);
CREATE POLICY "Event managers can create events" ON public.events FOR
INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Event managers can update their own events" ON public.events FOR
UPDATE USING (auth.uid() = organizer_id);
-- 7. SUBMISSIONS
CREATE POLICY "Submissions viewable by owner and event organizer" ON public.submissions FOR
SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1
            FROM public.events
            WHERE id = event_id
                AND organizer_id = auth.uid()
        )
    );
CREATE POLICY "Users can create submissions" ON public.submissions FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.submissions FOR
UPDATE USING (auth.uid() = user_id);
-- 8. PROJECT INTERACTIONS
CREATE POLICY "Project interactions viewable by project owner" ON public.project_interactions FOR
SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1
            FROM public.projects
            WHERE id = project_id
                AND owner_id = auth.uid()
        )
    );
CREATE POLICY "Users can create interactions" ON public.project_interactions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- 9. PROJECT LIMITS
CREATE POLICY "Users can view their own project limits" ON public.project_limits FOR
SELECT USING (auth.uid() = user_id);
-- 10. LOOKUP TABLES (public read access)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR
SELECT USING (true);
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR
SELECT USING (true);
CREATE POLICY "Countries are viewable by everyone" ON public.countries FOR
SELECT USING (true);
-- === CONTACT MESSAGES ===
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR
INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- === USER PRESENCE ===
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'user_presence'
) THEN
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Presence is public" ON public.user_presence FOR
SELECT USING (true);
CREATE POLICY "Users can insert own presence" ON public.user_presence FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presence" ON public.user_presence FOR
UPDATE USING (auth.uid() = user_id);
END IF;
END $$;
-- === LOOKUP TABLES (public read) ===
CREATE POLICY "Categories are public" ON public.categories FOR
SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
CREATE POLICY "Skills are public" ON public.skills FOR
SELECT USING (true);
CREATE POLICY "Tags are public" ON public.tags FOR
SELECT USING (true);
CREATE POLICY "Countries are public" ON public.countries FOR
SELECT USING (true);
-- ==========================================
-- 18. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ==========================================