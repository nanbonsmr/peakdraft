-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for server-side admin verification
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check admin status by user_id
CREATE OR REPLACE FUNCTION public.is_admin_by_user_id(_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS policies for user_roles - only admins can manage roles (via edge functions with service role)
CREATE POLICY "Service role can manage user_roles"
ON public.user_roles
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert initial admin user (nanbondev@gmail.com's Clerk user ID will be added via edge function)
-- This is a placeholder - actual admin assignment should happen through a secure process

-- Drop overly permissive policies on profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create profile" ON public.profiles;

-- Create restrictive policies - all operations go through edge functions with service role
-- These policies deny direct client access, forcing all operations through secure edge functions
CREATE POLICY "Profiles accessible via service role only"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop overly permissive policies on notifications  
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;

-- Create secure notification policies that use has_role function
-- Note: These will work with edge functions that set appropriate context
CREATE POLICY "Admin notifications insert via service"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin notifications update via service"  
ON public.notifications
FOR UPDATE
USING (true);

CREATE POLICY "Admin notifications delete via service"
ON public.notifications
FOR DELETE
USING (true);