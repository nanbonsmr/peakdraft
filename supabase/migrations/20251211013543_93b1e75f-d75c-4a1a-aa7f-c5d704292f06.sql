-- Drop all foreign key constraints to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.content_generations DROP CONSTRAINT IF EXISTS content_generations_user_id_fkey;

-- Change column types
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.content_generations ALTER COLUMN user_id TYPE text USING user_id::text;

-- Recreate notifications policy
CREATE POLICY "Users can view notifications intended for them"
ON public.notifications FOR SELECT
USING (
  (is_active = true) AND 
  ((target_users = 'all') OR 
   ((target_users = 'premium') AND EXISTS (SELECT 1 FROM profiles WHERE subscription_plan <> 'free')) OR 
   ((target_users = 'free') AND EXISTS (SELECT 1 FROM profiles WHERE subscription_plan = 'free')))
);