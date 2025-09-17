-- Update admin function to use the specified admin email
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user's email matches admin email
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid 
    AND email = 'nanbondev@gmail.com'
  );
$$;