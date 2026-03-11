-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_on_book_complete boolean DEFAULT true,
  email_on_book_complete boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_prefs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can manage their own prefs
CREATE POLICY "Users manage own notification prefs"
  ON user_notification_prefs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can read subscriptions (for sending notifications from background jobs)
CREATE POLICY "Service role reads push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role reads notification prefs"
  ON user_notification_prefs FOR SELECT
  USING (auth.role() = 'service_role');

-- Upsert helper for notification prefs
CREATE OR REPLACE FUNCTION upsert_notification_prefs(
  p_user_id uuid,
  p_push_on_book_complete boolean DEFAULT null,
  p_email_on_book_complete boolean DEFAULT null
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_notification_prefs (user_id, push_on_book_complete, email_on_book_complete, updated_at)
  VALUES (
    p_user_id,
    COALESCE(p_push_on_book_complete, true),
    COALESCE(p_email_on_book_complete, true),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    push_on_book_complete = COALESCE(p_push_on_book_complete, user_notification_prefs.push_on_book_complete),
    email_on_book_complete = COALESCE(p_email_on_book_complete, user_notification_prefs.email_on_book_complete),
    updated_at = now();
END;
$$;
