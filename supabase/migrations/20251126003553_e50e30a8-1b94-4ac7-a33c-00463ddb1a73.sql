-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Premium users can create tasks" ON public.tasks;

-- Create a new policy that allows all authenticated users to create tasks
CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can create tasks" ON public.tasks IS 'Allow any authenticated user to create tasks for themselves';