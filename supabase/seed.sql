-- Seed data for local development
-- Idempotent: uses ON CONFLICT DO NOTHING throughout

-- =============================================================================
-- 1. Test user in auth.users
-- =============================================================================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'loicwong1982@gmail.com',
  crypt('localdev123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Local Dev User", "email": "loicwong1982@gmail.com"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required for auth to work)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'loicwong1982@gmail.com',
  'email',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "loicwong1982@gmail.com"}',
  now(),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE provider_id = 'loicwong1982@gmail.com' AND provider = 'email'
);

-- =============================================================================
-- 2. User entitlements — premium tier
-- =============================================================================
INSERT INTO public.user_entitlements (user_id, tier, limits)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'premium',
  '{"scan_images": 30, "max_characters": 20, "max_series": 10}'
) ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- 3. Credits — 100 credits
-- =============================================================================
INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
VALUES ('00000000-0000-0000-0000-000000000001', 50, 50)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- 4. Series — "The Adventures of Luna"
-- =============================================================================
INSERT INTO public.series (id, user_id, title, description, setting, art_style)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'The Adventures of Luna',
  'A brave little fox who explores magical forests and helps woodland creatures.',
  'An enchanted forest with glowing mushrooms, crystal streams, and ancient talking trees.',
  'Watercolor storybook'
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. Characters — Luna + Whiskers
-- =============================================================================
INSERT INTO public.series_characters (id, series_id, name, description, voice, status)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  'Luna',
  'A small orange fox with bright green eyes, a fluffy white-tipped tail, and a tiny red scarf around her neck. She is curious, brave, and always ready for adventure.',
  'Kore',
  'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.series_characters (id, series_id, name, description, voice, status)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000010',
  'Whiskers',
  'A wise old grey tabby cat with round spectacles perched on his nose and a tattered blue vest. He speaks slowly and always has sage advice, though he tends to nap at the worst times.',
  'Puck',
  'approved'
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. Sample books
-- =============================================================================
INSERT INTO public.books (id, user_id, slug, data, is_public, series_id)
VALUES (
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'luna-and-the-crystal-stream',
  '{
    "title": "Luna and the Crystal Stream",
    "authors": ["Local Dev User"],
    "coverImageUrl": null,
    "concept": {
      "plot": "Luna discovers a crystal stream that grants wishes, but learns that the best wishes are the ones you work for.",
      "tags": {"audience": "Children 4-8", "style": "Watercolor storybook"}
    },
    "pages": [
      {
        "sequence": 1,
        "narrativeText": "One bright morning, Luna the fox woke up to the sound of tinkling water. She had never heard anything so beautiful in all her days in the enchanted forest.",
        "imageUrl": null,
        "imagePrompt": "A small orange fox with a red scarf waking up in a cozy den, morning light streaming through the entrance, watercolor style"
      },
      {
        "sequence": 2,
        "narrativeText": "She followed the sound through ferns and flowers until she found a stream made entirely of crystal-clear water that sparkled like diamonds.",
        "imageUrl": null,
        "imagePrompt": "An orange fox discovering a magical crystal stream in an enchanted forest with glowing mushrooms, watercolor style"
      },
      {
        "sequence": 3,
        "narrativeText": "\"Make a wish!\" whispered the stream. Luna closed her eyes tight and wished for the biggest adventure ever. And that is exactly what she got.",
        "imageUrl": null,
        "imagePrompt": "An orange fox with eyes closed standing by a sparkling crystal stream, magical sparkles in the air, watercolor style"
      }
    ],
    "createdAt": "2026-03-09T10:00:00.000Z",
    "updatedAt": "2026-03-09T10:00:00.000Z"
  }',
  false,
  '00000000-0000-0000-0000-000000000010'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.books (id, user_id, slug, data, is_public, series_id)
VALUES (
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000001',
  'whiskers-big-nap',
  '{
    "title": "Whiskers'' Big Nap",
    "authors": ["Local Dev User"],
    "coverImageUrl": null,
    "concept": {
      "plot": "Whiskers falls asleep during an important meeting with the forest council, and Luna must cover for him.",
      "tags": {"audience": "Children 4-8", "style": "Watercolor storybook"}
    },
    "pages": [
      {
        "sequence": 1,
        "narrativeText": "The forest council was gathering for the most important meeting of the year. Every creature was there — except Whiskers, who was still snoring in his favourite armchair.",
        "imageUrl": null,
        "imagePrompt": "A grey tabby cat with spectacles sleeping in an armchair, forest creatures gathering outside, watercolor style"
      },
      {
        "sequence": 2,
        "narrativeText": "Luna tugged at his vest. \"Whiskers! Wake up! You are supposed to give the opening speech!\" But Whiskers just mumbled something about fish and rolled over.",
        "imageUrl": null,
        "imagePrompt": "An orange fox pulling on the vest of a sleeping grey cat, looking worried, watercolor style"
      }
    ],
    "createdAt": "2026-03-08T14:00:00.000Z",
    "updatedAt": "2026-03-08T14:00:00.000Z"
  }',
  true,
  '00000000-0000-0000-0000-000000000010'
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. Storage bucket — story-assets (public)
-- Note: Bucket is also configured in config.toml [storage.buckets.story-assets]
-- This ensures it exists even if config.toml bucket creation is skipped.
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-assets',
  'story-assets',
  true,
  52428800, -- 50MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'audio/wav', 'audio/mpeg', 'audio/mp4']
) ON CONFLICT (id) DO NOTHING;
