ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS color_preference TEXT DEFAULT 'surprise';
