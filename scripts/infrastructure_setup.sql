-- ============================================================
-- RABET PLATFORM — Storage Infrastructure Setup
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This script is IDEMPOTENT (safe to run multiple times)
-- ============================================================
-- ==========================================
-- 1. CREATE STORAGE BUCKETS
-- ==========================================
-- Project Files bucket (pitch decks, business plans, etc.)
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'project-files',
        'project-files',
        true,
        52428800,
        -- 50MB limit
        ARRAY ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4']
    ) ON CONFLICT (id) DO
UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
-- Event Images bucket
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'event-images',
        'event-images',
        true,
        10485760,
        -- 10MB limit
        ARRAY ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ) ON CONFLICT (id) DO
UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
-- Avatars bucket
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'avatars',
        'avatars',
        true,
        5242880,
        -- 5MB limit
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO
UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
-- ==========================================
-- 2. STORAGE POLICIES — Drop existing
-- ==========================================
-- Project Files
DROP POLICY IF EXISTS "Public read project-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload project-files" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete project-files" ON storage.objects;
-- Event Images
DROP POLICY IF EXISTS "Public read event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload event-images" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete event-images" ON storage.objects;
-- Avatars
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Owner update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete avatars" ON storage.objects;
-- ==========================================
-- 3. STORAGE POLICIES — Create
-- ==========================================
-- === PROJECT FILES ===
-- Anyone can read (public bucket)
CREATE POLICY "Public read project-files" ON storage.objects FOR
SELECT USING (bucket_id = 'project-files');
-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated upload project-files" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'project-files'
        AND auth.role() = 'authenticated'
    );
-- Users can delete their own uploads
CREATE POLICY "Owner delete project-files" ON storage.objects FOR DELETE USING (
    bucket_id = 'project-files'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- === EVENT IMAGES ===
CREATE POLICY "Public read event-images" ON storage.objects FOR
SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Authenticated upload event-images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'event-images'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Owner delete event-images" ON storage.objects FOR DELETE USING (
    bucket_id = 'event-images'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- === AVATARS ===
CREATE POLICY "Public read avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated upload avatars" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Owner update avatars" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Owner delete avatars" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- ==========================================
-- DONE: Storage buckets and policies configured
-- ==========================================