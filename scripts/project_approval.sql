-- Add status column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
-- Update RLS policies to reflect status visibility
-- 1. Drop existing "Projects are viewable by everyone" policy
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
-- 2. Create new policy: Public can ONLY see approved projects
CREATE POLICY "Public/Entrepreneurs can view approved projects" ON public.projects FOR
SELECT USING (
        status = 'approved'
        OR auth.uid() = owner_id -- Owners can always see their own
        OR EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin' -- Admins can see all
        )
    );
-- Note: Other policies (insert/update/delete) remain effectively the same or are covered by the Owner/Admin logic already in place.
-- The existing "Admins can update any project" policy allows admins to update the status.