-- Sync words_used from actual content_generations data
UPDATE profiles p 
SET words_used = COALESCE(
  (SELECT SUM(word_count) FROM content_generations cg WHERE cg.user_id = p.user_id), 
  0
);