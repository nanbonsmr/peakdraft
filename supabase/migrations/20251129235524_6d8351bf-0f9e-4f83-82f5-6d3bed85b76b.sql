-- Drop the existing check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;

-- Add the updated check constraint that includes all plan types
ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_plan_check 
CHECK (subscription_plan IS NULL OR subscription_plan IN ('free', 'basic', 'pro', 'enterprise'));