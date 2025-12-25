-- Drop unused tables and their related objects
-- Note: Drop tables with foreign key dependencies first

-- Drop task_tag_relations first (has FK to task_tags and tasks)
DROP TABLE IF EXISTS public.task_tag_relations CASCADE;

-- Drop task_activity_log (has FK to tasks)
DROP TABLE IF EXISTS public.task_activity_log CASCADE;

-- Drop task_attachments (has FK to tasks)
DROP TABLE IF EXISTS public.task_attachments CASCADE;

-- Drop task_comments (has FK to tasks)
DROP TABLE IF EXISTS public.task_comments CASCADE;

-- Drop task_tags (no dependencies after task_tag_relations is dropped)
DROP TABLE IF EXISTS public.task_tags CASCADE;

-- Drop signup_otps (no dependencies)
DROP TABLE IF EXISTS public.signup_otps CASCADE;