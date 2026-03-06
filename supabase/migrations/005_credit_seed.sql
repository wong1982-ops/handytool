-- 005_credit_seed.sql
-- Seed subscription tiers and initial tool credit costs

-- Subscription Tiers
INSERT INTO subscription_tiers (id, name, monthly_credits, stripe_price_id, features)
VALUES
  (
    'basic',
    'Basic',
    100,
    'price_basic_placeholder',
    '["100 AI credits/month", "All free tools", "Basic AI tools"]'::jsonb
  ),
  (
    'pro',
    'Pro',
    500,
    'price_pro_placeholder',
    '["500 AI credits/month", "All free tools", "All AI tools", "Priority processing"]'::jsonb
  ),
  (
    'enterprise',
    'Enterprise',
    2000,
    'price_enterprise_placeholder',
    '["2000 AI credits/month", "All free tools", "All AI tools", "Priority processing", "Dedicated support"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Tool Credit Costs
INSERT INTO tool_credit_costs (tool_id, credit_cost, display_name)
VALUES
  ('ai-image-enhance', 5, 'AI Image Enhance'),
  ('ai-content-writer', 10, 'AI Content Writer'),
  ('ai-code-assistant', 8, 'AI Code Assistant'),
  ('ai-translator', 3, 'AI Translator')
ON CONFLICT (tool_id) DO NOTHING;
