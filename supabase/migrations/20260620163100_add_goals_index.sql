-- Add index for efficient fetching of user goals ordered by creation date
CREATE INDEX idx_goals_user_created ON public.goals (user_id, created_at DESC);
