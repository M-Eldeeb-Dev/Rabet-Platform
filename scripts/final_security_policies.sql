-- ============================================================
-- RABET PLATFORM — Consolidated RLS Policies
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This script is IDEMPOTENT (safe to run multiple times)
-- ============================================================
-- ==========================================
-- 0. SCHEMA & TABLE-LEVEL PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.profiles TO anon;
GRANT INSERT ON public.contact_messages TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE ON SEQUENCES TO anon;
-- ==========================================
-- 1. ENABLE RLS ON ALL TABLES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
-- ==========================================
-- 2. DROP ALL EXISTING POLICIES (idempotent)
-- ==========================================
-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
-- Projects
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update any project" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON public.projects;
-- Events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Managers can create events" ON public.events;
DROP POLICY IF EXISTS "Managers can update own events" ON public.events;
DROP POLICY IF EXISTS "Admins can update any event" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete own events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete any event" ON public.events;
-- Chats
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;
DROP POLICY IF EXISTS "Admins can delete any chat" ON public.chats;
-- Messages
DROP POLICY IF EXISTS "Users can view messages in own chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON public.messages;
-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete any notification" ON public.notifications;
-- Submissions
DROP POLICY IF EXISTS "Submissions viewable by owner/organizer" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can update any submission" ON public.submissions;
-- Project Interactions
DROP POLICY IF EXISTS "Interactions viewable by participant" ON public.project_interactions;
DROP POLICY IF EXISTS "Users can create interactions" ON public.project_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.project_interactions;
-- Project Limits
DROP POLICY IF EXISTS "Users can view own limits" ON public.project_limits;
DROP POLICY IF EXISTS "Admins can view all limits" ON public.project_limits;
DROP POLICY IF EXISTS "Admins can update any limit" ON public.project_limits;
-- Contact Messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
-- User Presence
DROP POLICY IF EXISTS "Presence is public" ON public.user_presence;
DROP POLICY IF EXISTS "Users can insert own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Admins can view all presence" ON public.user_presence;
-- Lookup Tables
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Skills are public" ON public.skills;
DROP POLICY IF EXISTS "Admins can manage skills" ON public.skills;
DROP POLICY IF EXISTS "Tags are public" ON public.tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
DROP POLICY IF EXISTS "Countries are public" ON public.countries;
-- ==========================================
-- 3. CREATE ALL POLICIES
-- ==========================================
-- ========== PROFILES ==========
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can delete any profile" ON public.profiles FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ========== PROJECTS ==========
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR
SELECT USING (true);
CREATE POLICY "Users can create projects" ON public.projects FOR
INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own projects" ON public.projects FOR
UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can update any project" ON public.projects FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Owners can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can delete any project" ON public.projects FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ========== EVENTS ==========
CREATE POLICY "Events are viewable by everyone" ON public.events FOR
SELECT USING (true);
CREATE POLICY "Managers can create events" ON public.events FOR
INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Managers can update own events" ON public.events FOR
UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Admins can update any event" ON public.events FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Organizers can delete own events" ON public.events FOR DELETE USING (auth.uid() = organizer_id);
CREATE POLICY "Admins can delete any event" ON public.events FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ========== CHATS ==========
CREATE POLICY "Users can view own chats" ON public.chats FOR
SELECT USING (
        auth.uid() = participant1_id
        OR auth.uid() = participant2_id
    );
CREATE POLICY "Users can create chats" ON public.chats FOR
INSERT WITH CHECK (
        auth.uid() = participant1_id
        OR auth.uid() = participant2_id
    );
CREATE POLICY "Users can update own chats" ON public.chats FOR
UPDATE USING (
        auth.uid() = participant1_id
        OR auth.uid() = participant2_id
    );
-- NEW: Admin moderation access to chats
CREATE POLICY "Admins can view all chats" ON public.chats FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can delete any chat" ON public.chats FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ========== MESSAGES ==========
CREATE POLICY "Users can view messages in own chats" ON public.messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.chats
            WHERE id = messages.chat_id
                AND (
                    participant1_id = auth.uid()
                    OR participant2_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can send messages" ON public.messages FOR
INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR
UPDATE USING (auth.uid() = sender_id);
-- NEW: Admin moderation access to messages
CREATE POLICY "Admins can view all messages" ON public.messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can delete any message" ON public.messages FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ========== NOTIFICATIONS ==========
CREATE POLICY "Users can view own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
-- NEW: Admin broadcast management
CREATE POLICY "Admins can view all notifications" ON public.notifications FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can delete any notification" ON public.notifications FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ========== SUBMISSIONS ==========
CREATE POLICY "Submissions viewable by owner/organizer" ON public.submissions FOR
SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1
            FROM public.events
            WHERE id = submissions.event_id
                AND organizer_id = auth.uid()
        )
    );
CREATE POLICY "Users can create submissions" ON public.submissions FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON public.submissions FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own submissions" ON public.submissions FOR DELETE USING (auth.uid() = user_id);
-- NEW: Admin review access
CREATE POLICY "Admins can view all submissions" ON public.submissions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can update any submission" ON public.submissions FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ========== PROJECT INTERACTIONS ==========
CREATE POLICY "Interactions viewable by participant" ON public.project_interactions FOR
SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1
            FROM public.projects
            WHERE id = project_interactions.project_id
                AND owner_id = auth.uid()
        )
    );
CREATE POLICY "Users can create interactions" ON public.project_interactions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- NEW: Admin analytics access
CREATE POLICY "Admins can view all interactions" ON public.project_interactions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ========== PROJECT LIMITS ==========
CREATE POLICY "Users can view own limits" ON public.project_limits FOR
SELECT USING (auth.uid() = user_id);
-- NEW: Admin override
CREATE POLICY "Admins can view all limits" ON public.project_limits FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Admins can update any limit" ON public.project_limits FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ========== CONTACT MESSAGES ==========
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
-- ========== USER PRESENCE ==========
CREATE POLICY "Presence is public" ON public.user_presence FOR
SELECT USING (true);
CREATE POLICY "Users can insert own presence" ON public.user_presence FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presence" ON public.user_presence FOR
UPDATE USING (auth.uid() = user_id);
-- NEW: Admin monitoring
CREATE POLICY "Admins can view all presence" ON public.user_presence FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ========== LOOKUP TABLES ==========
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
CREATE POLICY "Admins can manage skills" ON public.skills FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
CREATE POLICY "Tags are public" ON public.tags FOR
SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
CREATE POLICY "Countries are public" ON public.countries FOR
SELECT USING (true);
-- ==========================================
-- DONE: All 15 tables secured with comprehensive RLS
-- ==========================================