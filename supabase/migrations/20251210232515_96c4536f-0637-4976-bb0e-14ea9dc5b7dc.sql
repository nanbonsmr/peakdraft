-- Drop existing RLS policies on profiles that use auth.uid()
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new permissive policies for profiles (Clerk auth doesn't use Supabase auth.uid())
-- Allow public insert (profile creation happens after Clerk signup)
CREATE POLICY "Anyone can create profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view profiles by user_id (verified at app level)
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow updates to profiles (app verifies ownership)
CREATE POLICY "Anyone can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Update notifications policies for admin operations
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;

-- Allow insert for notifications (admin check done at app level)
CREATE POLICY "Admins can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Allow update for notifications
CREATE POLICY "Admins can update notifications" 
ON public.notifications 
FOR UPDATE 
USING (true);

-- Allow delete for notifications
CREATE POLICY "Admins can delete notifications" 
ON public.notifications 
FOR DELETE 
USING (true);

-- Update content_generations policies
DROP POLICY IF EXISTS "Users can create content" ON public.content_generations;
DROP POLICY IF EXISTS "Users can delete their own content" ON public.content_generations;
DROP POLICY IF EXISTS "Users can view their own content" ON public.content_generations;

-- Allow insert for content generations
CREATE POLICY "Anyone can create content" 
ON public.content_generations 
FOR INSERT 
WITH CHECK (true);

-- Allow select for content generations
CREATE POLICY "Anyone can view content" 
ON public.content_generations 
FOR SELECT 
USING (true);

-- Allow delete for content generations
CREATE POLICY "Anyone can delete content" 
ON public.content_generations 
FOR DELETE 
USING (true);