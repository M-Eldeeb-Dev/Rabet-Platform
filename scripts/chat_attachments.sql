-- Create a new storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true) ON CONFLICT (id) DO NOTHING;
-- Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload chat attachments" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments');
-- Policy: Anyone can view (since these are public links, but we rely on random filenames for security)
-- Alternatively, strict RLS would be better, but for simplicity in this iteration:
CREATE POLICY "Public can view chat attachments" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'chat-attachments');
-- Add attachment columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment_url text,
    ADD COLUMN IF NOT EXISTS attachment_type text;
-- 'image', 'file', etc.