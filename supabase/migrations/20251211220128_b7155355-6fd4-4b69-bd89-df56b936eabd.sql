-- Fix update_word_usage to use correct parameter name (text type for Clerk IDs)
DROP FUNCTION IF EXISTS public.update_word_usage(text, integer);

CREATE OR REPLACE FUNCTION public.update_word_usage(user_uuid text, words_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET words_used = COALESCE(words_used, 0) + words_to_add,
      updated_at = now()
  WHERE user_id = user_uuid;
END;
$$;