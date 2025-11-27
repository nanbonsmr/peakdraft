-- Add DELETE RLS policy for content_generations table
-- This allows users to delete their own generated content

CREATE POLICY "Users can delete their own content"
ON public.content_generations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);