-- supabase/migrations/036_casino_slots.sql

-- Player state
CREATE TABLE IF NOT EXISTS public.casino_players (
  user_id UUID PRIMARY KEY,
  coins BIGINT NOT NULL DEFAULT 500000,
  xp BIGINT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  daily_streak INT NOT NULL DEFAULT 0,
  last_daily TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction log
CREATE TABLE IF NOT EXISTS public.casino_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount BIGINT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Friends
CREATE TABLE IF NOT EXISTS public.casino_friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Gifts
CREATE TABLE IF NOT EXISTS public.casino_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  amount BIGINT NOT NULL DEFAULT 1000,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS public.casino_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL,
  coins_won BIGINT NOT NULL DEFAULT 0,
  biggest_win BIGINT NOT NULL DEFAULT 0,
  spins_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS public.casino_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL
);

-- Event entries
CREATE TABLE IF NOT EXISTS public.casino_event_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES casino_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_casino_transactions_user ON public.casino_transactions(user_id);
CREATE INDEX idx_casino_transactions_created ON public.casino_transactions(created_at);
CREATE INDEX idx_casino_friends_user ON public.casino_friends(user_id);
CREATE INDEX idx_casino_friends_friend ON public.casino_friends(friend_id);
CREATE INDEX idx_casino_gifts_receiver ON public.casino_gifts(receiver_id);
CREATE INDEX idx_casino_leaderboard_period ON public.casino_leaderboard(period, coins_won DESC);
CREATE INDEX idx_casino_events_dates ON public.casino_events(starts_at, ends_at);

-- RLS
ALTER TABLE public.casino_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_event_entries ENABLE ROW LEVEL SECURITY;

-- Players RLS
CREATE POLICY "Users can view own player" ON public.casino_players FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own player" ON public.casino_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own player" ON public.casino_players FOR UPDATE USING (auth.uid() = user_id);

-- Transactions RLS
CREATE POLICY "Users can view own transactions" ON public.casino_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.casino_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friends RLS
CREATE POLICY "Users can view own friends" ON public.casino_friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can add friends" ON public.casino_friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friend status" ON public.casino_friends FOR UPDATE USING (auth.uid() = friend_id);
CREATE POLICY "Users can delete friends" ON public.casino_friends FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Gifts RLS
CREATE POLICY "Users can view received gifts" ON public.casino_gifts FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
CREATE POLICY "Users can send gifts" ON public.casino_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can claim gifts" ON public.casino_gifts FOR UPDATE USING (auth.uid() = receiver_id);

-- Leaderboard RLS (public read)
CREATE POLICY "Anyone can view leaderboard" ON public.casino_leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard" ON public.casino_leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leaderboard entry" ON public.casino_leaderboard FOR UPDATE USING (auth.uid() = user_id);

-- Event entries RLS
CREATE POLICY "Users can view own event entries" ON public.casino_event_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join events" ON public.casino_event_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.casino_event_entries FOR UPDATE USING (auth.uid() = user_id);
