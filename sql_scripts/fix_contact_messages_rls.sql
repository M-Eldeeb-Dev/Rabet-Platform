-- Fix Contact Messages CRUD — Run in Supabase Dashboard → SQL Editor
-- Adds missing UPDATE and DELETE policies for admins
-- Drop if they already exist (safe to re-run)
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
-- Allow admins to update contact messages (mark as handled)
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Allow admins to delete contact messages
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);