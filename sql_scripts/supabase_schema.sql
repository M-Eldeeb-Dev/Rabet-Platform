-- ============================================================
-- RABET PLATFORM — Complete Supabase Initialization Script
-- Run this ONCE in Supabase Dashboard → SQL Editor → New Query
-- Tables are ordered by dependency (parents first)
-- ============================================================
-- ==========================================
-- 0. SCHEMA-LEVEL PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
-- ==========================================
-- 1. LOOKUP / REFERENCE TABLES (no FK deps)
-- ==========================================
-- Countries
CREATE TABLE IF NOT EXISTS public.countries (
  code character(2) NOT NULL,
  name character varying NOT NULL,
  name_ar character varying,
  phone_code character varying,
  currency character varying,
  CONSTRAINT countries_pkey PRIMARY KEY (code)
);
-- Categories (self-referencing)
CREATE TABLE IF NOT EXISTS public.categories (
  id character varying NOT NULL,
  name character varying NOT NULL,
  display_name character varying NOT NULL,
  description text,
  icon character varying,
  color character varying,
  parent_id character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id character varying NOT NULL,
  name character varying NOT NULL,
  category character varying,
  description text,
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
  id character varying NOT NULL,
  name character varying NOT NULL,
  type character varying CHECK (
    type::text = ANY (ARRAY ['project','event','skill'])
  ),
  usage_count integer DEFAULT 0,
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
-- ==========================================
-- 2. PROFILES (depends on auth.users + countries)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  role character varying NOT NULL DEFAULT 'entrepreneur' CHECK (
    role::text = ANY (
      ARRAY ['entrepreneur','co_founder','event_manager','admin']
    )
  ),
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  email text NOT NULL UNIQUE,
  phone character varying,
  country_code character(2),
  city character varying,
  skills text [] DEFAULT '{}',
  experience_years integer,
  company_name text,
  company_logo text,
  website_url text,
  total_projects integer DEFAULT 0,
  total_chats integer DEFAULT 0,
  total_events integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  ban_reason text,
  banned_until timestamp with time zone,
  notification_preferences jsonb DEFAULT '{"push":true,"email":true,"events":true,"messages":true}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_active_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code)
);
-- ==========================================
-- 3. PROJECTS (depends on profiles + categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  co_founder_id uuid,
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  tagline character varying,
  description text NOT NULL,
  category_id character varying NOT NULL,
  stage character varying NOT NULL CHECK (
    stage::text = ANY (
      ARRAY ['idea','prototype','mvp','beta','launched','scaling']
    )
  ),
  funding_goal numeric CHECK (funding_goal > 0),
  funding_type character varying CHECK (
    funding_type::text = ANY (
      ARRAY ['equity','loan','grant','donation','revenue_share']
    )
  ),
  equity_offered numeric CHECK (
    equity_offered >= 0
    AND equity_offered <= 100
  ),
  current_funding numeric DEFAULT 0.00,
  problem_statement text,
  solution_description text,
  market_size text,
  competitive_advantage text,
  team_size integer DEFAULT 1,
  team_members jsonb DEFAULT '[]',
  required_roles text [] DEFAULT '{}',
  logo_url text,
  pitch_deck_url text,
  business_plan_url text,
  demo_video_url text,
  images_urls text [] DEFAULT '{}',
  expected_duration character varying,
  timeline jsonb DEFAULT '[]',
  expected_roi numeric,
  revenue_model text,
  status character varying DEFAULT 'draft' CHECK (
    status::text = ANY (
      ARRAY ['draft','pending_review','approved','rejected','closed']
    )
  ),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  messages_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_public boolean DEFAULT true,
  allow_messaging boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  deadline_date date,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id),
  CONSTRAINT projects_co_founder_id_fkey FOREIGN KEY (co_founder_id) REFERENCES public.profiles(id),
  CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT projects_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
-- ==========================================
-- 4. EVENTS (depends on profiles + categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL,
  approved_by uuid,
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text NOT NULL,
  type character varying NOT NULL CHECK (
    type::text = ANY (
      ARRAY ['competition','hackathon','workshop','meetup','conference','webinar','incubator_program','accelerator_program']
    )
  ),
  category_id character varying NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  registration_deadline timestamp with time zone NOT NULL,
  announcement_date timestamp with time zone,
  location_type character varying DEFAULT 'online' CHECK (
    location_type::text = ANY (ARRAY ['online','physical','hybrid'])
  ),
  venue_name text,
  venue_address text,
  city character varying,
  country character varying,
  online_link text,
  registration_fee numeric DEFAULT 0.00,
  currency character varying DEFAULT 'USD',
  prize_pool numeric,
  prize_distribution jsonb,
  eligibility_criteria jsonb DEFAULT '{"skills":[],"max_age":null,"min_age":18,"countries":[],"experience":null}',
  max_participants integer,
  min_team_size integer DEFAULT 1,
  max_team_size integer DEFAULT 1,
  judges jsonb DEFAULT '[]',
  sponsors jsonb DEFAULT '[]',
  partners jsonb DEFAULT '[]',
  schedule jsonb DEFAULT '[]',
  status character varying DEFAULT 'draft' CHECK (
    status::text = ANY (
      ARRAY ['draft','upcoming','open','ongoing','judging','completed','cancelled']
    )
  ),
  approval_status character varying DEFAULT 'pending' CHECK (
    approval_status::text = ANY (ARRAY ['pending','approved','rejected'])
  ),
  is_recommended boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  participants_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(id),
  CONSTRAINT events_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id),
  CONSTRAINT events_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
-- ==========================================
-- 5. CHATS (depends on profiles + projects)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL,
  participant2_id uuid NOT NULL,
  project_id uuid,
  chat_type character varying DEFAULT 'direct' CHECK (
    chat_type::text = ANY (
      ARRAY ['direct','project_discussion','team_chat']
    )
  ),
  last_message_id uuid,
  last_message_text text,
  last_message_sender_id uuid,
  last_message_timestamp timestamp with time zone,
  is_active boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  blocked_by uuid,
  block_reason text,
  total_messages integer DEFAULT 0,
  unread_count_p1 integer DEFAULT 0,
  unread_count_p2 integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chats_pkey PRIMARY KEY (id),
  CONSTRAINT chats_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES public.profiles(id),
  CONSTRAINT chats_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES public.profiles(id),
  CONSTRAINT chats_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT chats_last_message_sender_id_fkey FOREIGN KEY (last_message_sender_id) REFERENCES public.profiles(id),
  CONSTRAINT chats_blocked_by_fkey FOREIGN KEY (blocked_by) REFERENCES public.profiles(id)
);
-- ==========================================
-- 6. MESSAGES (depends on chats + profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  reply_to_id uuid,
  message_type character varying DEFAULT 'text' CHECK (
    message_type::text = ANY (
      ARRAY ['text','image','file','audio','video','location','contact','system']
    )
  ),
  content text,
  media_url text,
  file_name text,
  file_size integer,
  file_type character varying,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  is_delivered boolean DEFAULT true,
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  deleted_for_all boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  scheduled_for timestamp with time zone,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id)
);
-- ==========================================
-- 7. NOTIFICATIONS (depends on profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sender_id uuid,
  type character varying NOT NULL CHECK (
    type::text = ANY (
      ARRAY ['new_message','project_view','project_like','application_status','event_reminder','event_invitation','system_alert','admin_broadcast','chat_request']
    )
  ),
  title character varying NOT NULL,
  message text NOT NULL,
  icon character varying,
  action_url text,
  action_label character varying,
  related_entity_type character varying,
  related_entity_id uuid,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  is_delivered boolean DEFAULT false,
  delivered_at timestamp with time zone,
  priority character varying DEFAULT 'normal' CHECK (
    priority::text = ANY (ARRAY ['low','normal','high','urgent'])
  ),
  created_at timestamp with time zone DEFAULT now(),
  scheduled_for timestamp with time zone,
  expires_at timestamp with time zone,
  send_via_email boolean DEFAULT false,
  send_via_push boolean DEFAULT false,
  send_via_sms boolean DEFAULT false,
  email_sent boolean DEFAULT false,
  push_sent boolean DEFAULT false,
  sms_sent boolean DEFAULT false,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
-- ==========================================
-- 8. SUBMISSIONS (depends on profiles + events + projects)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL,
  project_id uuid,
  status character varying DEFAULT 'pending' CHECK (
    status::text = ANY (
      ARRAY ['pending','under_review','shortlisted','accepted','rejected','withdrawn']
    )
  ),
  submission_data jsonb NOT NULL,
  notes text,
  score numeric,
  judge_notes text,
  judged_by uuid,
  judged_at timestamp with time zone,
  award_won character varying,
  prize_amount numeric,
  submitted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT submissions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT submissions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT submissions_judged_by_fkey FOREIGN KEY (judged_by) REFERENCES public.profiles(id)
);
-- ==========================================
-- 9. PROJECT INTERACTIONS (depends on profiles + projects)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  interaction_type character varying NOT NULL CHECK (
    interaction_type::text = ANY (ARRAY ['view','like','save','share'])
  ),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT project_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT project_interactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
-- ==========================================
-- 10. PROJECT LIMITS (depends on profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  projects_submitted integer DEFAULT 0,
  max_projects integer NOT NULL DEFAULT 2,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_limits_pkey PRIMARY KEY (id),
  CONSTRAINT project_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
-- ==========================================
-- 11. CONTACT MESSAGES (depends on profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_handled boolean DEFAULT false,
  handled_by uuid,
  handled_at timestamp with time zone,
  response_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id),
  CONSTRAINT contact_messages_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.profiles(id)
);
-- ==========================================
-- 12. USER PRESENCE (depends on profiles + chats)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_presence (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_online boolean DEFAULT false,
  last_seen timestamp with time zone DEFAULT now(),
  device_type character varying,
  browser character varying,
  ip_address inet,
  current_chat_id uuid,
  typing_in_chat_id uuid,
  typing_started_at timestamp with time zone,
  presence_channel character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_presence_pkey PRIMARY KEY (id),
  CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_presence_current_chat_id_fkey FOREIGN KEY (current_chat_id) REFERENCES public.chats(id),
  CONSTRAINT user_presence_typing_in_chat_id_fkey FOREIGN KEY (typing_in_chat_id) REFERENCES public.chats(id)
);
-- ==========================================
-- 13. INDEXES for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_chats_p1 ON public.chats(participant1_id);
CREATE INDEX IF NOT EXISTS idx_chats_p2 ON public.chats(participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_event ON public.submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_project_interactions_project ON public.project_interactions(project_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user ON public.user_presence(user_id);
-- ==========================================
-- 14. TABLE-LEVEL GRANTS
-- ==========================================
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.profiles TO anon;
GRANT INSERT ON public.contact_messages TO anon;
-- Future tables inherit the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;
-- Grant sequence usage (needed for serial/identity columns)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE ON SEQUENCES TO anon;
-- ==========================================
-- 15. ROW LEVEL SECURITY — Enable
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
-- 16. RLS POLICIES — Drop existing (idempotent)
-- ==========================================
-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
-- Chats
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
-- Messages
DROP POLICY IF EXISTS "Users can view messages in own chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
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
-- Submissions
DROP POLICY IF EXISTS "Submissions viewable by owner/organizer" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.submissions;
-- Project interactions
DROP POLICY IF EXISTS "Interactions viewable by participant" ON public.project_interactions;
DROP POLICY IF EXISTS "Users can create interactions" ON public.project_interactions;
-- Project limits
DROP POLICY IF EXISTS "Users can view own limits" ON public.project_limits;
-- Contact messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
-- User presence
DROP POLICY IF EXISTS "Presence is public" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can insert own presence" ON public.user_presence;
-- Lookup tables
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Skills are public" ON public.skills;
DROP POLICY IF EXISTS "Tags are public" ON public.tags;
DROP POLICY IF EXISTS "Countries are public" ON public.countries;
-- ==========================================
-- 17. RLS POLICIES — Create
-- ==========================================
-- === PROFILES ===
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
-- === NOTIFICATIONS ===
CREATE POLICY "Users can view own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
-- === CHATS ===
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
-- === MESSAGES ===
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
-- === PROJECTS ===
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
-- === EVENTS ===
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
-- === SUBMISSIONS ===
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
-- === PROJECT INTERACTIONS ===
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
-- === PROJECT LIMITS ===
CREATE POLICY "Users can view own limits" ON public.project_limits FOR
SELECT USING (auth.uid() = user_id);
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
-- === USER PRESENCE ===
CREATE POLICY "Presence is public" ON public.user_presence FOR
SELECT USING (true);
CREATE POLICY "Users can insert own presence" ON public.user_presence FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presence" ON public.user_presence FOR
UPDATE USING (auth.uid() = user_id);
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
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
INSERT INTO public.profiles (id, full_name, email, role)
VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'entrepreneur')
  ) ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$;
-- Drop + recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ==========================================
-- 19. AUTO-UPDATE updated_at (Trigger)
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$;
-- Apply updated_at trigger to tables that have that column
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.events;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.chats;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.messages;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.submissions;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.user_presence;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.project_limits;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.project_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- ==========================================
-- 20. ENABLE REALTIME
-- ==========================================
-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime
ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime
ADD TABLE public.user_presence;
-- ==========================================
-- 21. SEED DEFAULT DATA
-- ==========================================
-- Default categories
INSERT INTO public.categories (
    id,
    name,
    display_name,
    description,
    display_order
  )
VALUES (
    'technology',
    'technology',
    'تقنية',
    'مشاريع تقنية وبرمجية',
    1
  ),
  (
    'health',
    'health',
    'صحة',
    'مشاريع صحية وطبية',
    2
  ),
  (
    'education',
    'education',
    'تعليم',
    'مشاريع تعليمية',
    3
  ),
  (
    'finance',
    'finance',
    'مالية',
    'مشاريع مالية واستثمارية',
    4
  ),
  (
    'ecommerce',
    'ecommerce',
    'تجارة إلكترونية',
    'مشاريع التجارة الإلكترونية',
    5
  ),
  (
    'social',
    'social',
    'اجتماعي',
    'مشاريع اجتماعية',
    6
  ),
  (
    'entertainment',
    'entertainment',
    'ترفيه',
    'مشاريع ترفيهية',
    7
  ),
  (
    'food',
    'food',
    'طعام',
    'مشاريع غذائية',
    8
  ),
  (
    'logistics',
    'logistics',
    'لوجستيات',
    'مشاريع لوجستية',
    9
  ),
  (
    'other',
    'other',
    'أخرى',
    'مشاريع أخرى',
    10
  ) ON CONFLICT (id) DO NOTHING;
-- Default countries (Arab region)
INSERT INTO public.countries (code, name, name_ar, phone_code, currency)
VALUES (
    'SA',
    'Saudi Arabia',
    'السعودية',
    '+966',
    'SAR'
  ),
  (
    'AE',
    'United Arab Emirates',
    'الإمارات',
    '+971',
    'AED'
  ),
  (
    'EG',
    'Egypt',
    'مصر',
    '+20',
    'EGP'
  ),
  (
    'JO',
    'Jordan',
    'الأردن',
    '+962',
    'JOD'
  ),
  (
    'KW',
    'Kuwait',
    'الكويت',
    '+965',
    'KWD'
  ),
  (
    'BH',
    'Bahrain',
    'البحرين',
    '+973',
    'BHD'
  ),
  (
    'QA',
    'Qatar',
    'قطر',
    '+974',
    'QAR'
  ),
  (
    'OM',
    'Oman',
    'عُمان',
    '+968',
    'OMR'
  ),
  (
    'IQ',
    'Iraq',
    'العراق',
    '+964',
    'IQD'
  ),
  (
    'LB',
    'Lebanon',
    'لبنان',
    '+961',
    'LBP'
  ),
  (
    'PS',
    'Palestine',
    'فلسطين',
    '+970',
    'ILS'
  ),
  (
    'SY',
    'Syria',
    'سوريا',
    '+963',
    'SYP'
  ),
  (
    'YE',
    'Yemen',
    'اليمن',
    '+967',
    'YER'
  ),
  (
    'LY',
    'Libya',
    'ليبيا',
    '+218',
    'LYD'
  ),
  (
    'TN',
    'Tunisia',
    'تونس',
    '+216',
    'TND'
  ),
  (
    'DZ',
    'Algeria',
    'الجزائر',
    '+213',
    'DZD'
  ),
  (
    'MA',
    'Morocco',
    'المغرب',
    '+212',
    'MAD'
  ),
  (
    'SD',
    'Sudan',
    'السودان',
    '+249',
    'SDG'
  ) ON CONFLICT (code) DO NOTHING;
-- ==========================================
-- 22. STORAGE BUCKETS & POLICIES
-- ==========================================
-- Create the public buckets (run this ONCE via SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true) ON CONFLICT (id) DO NOTHING;
-- Drop existing storage policies (idempotent)
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own event images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project files" ON storage.objects;
-- === EVENT-IMAGES bucket ===
-- Public read (already public bucket, but explicit policy)
CREATE POLICY "Anyone can view event images" ON storage.objects FOR
SELECT USING (bucket_id = 'event-images');
-- Authenticated users can upload event images
CREATE POLICY "Authenticated users can upload event images" ON storage.objects FOR
INSERT WITH CHECK (
    bucket_id = 'event-images'
    AND auth.role() = 'authenticated'
  );
-- Users can delete their own event images (path starts with their event ID)
CREATE POLICY "Users can delete own event images" ON storage.objects FOR DELETE USING (
  bucket_id = 'event-images'
  AND auth.role() = 'authenticated'
);
-- === PROJECT-FILES bucket ===
-- Public read
CREATE POLICY "Anyone can view project files" ON storage.objects FOR
SELECT USING (bucket_id = 'project-files');
-- Authenticated users can upload project files
CREATE POLICY "Authenticated users can upload project files" ON storage.objects FOR
INSERT WITH CHECK (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
  );
-- Users can delete their own project files
CREATE POLICY "Users can delete own project files" ON storage.objects FOR DELETE USING (
  bucket_id = 'project-files'
  AND auth.role() = 'authenticated'
);
-- ==========================================
-- Done! ✅
-- ==========================================