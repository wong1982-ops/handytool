import { createClient } from '@/lib/supabase/server'

export type UserTier = 'free' | 'premium'

export interface UserLimits {
  scan_images: number
  max_characters: number
  max_series: number
}

const TIER_DEFAULTS: Record<UserTier, UserLimits> = {
  free: {
    scan_images: 10,
    max_characters: 2,
    max_series: 1,
  },
  premium: {
    scan_images: 30,
    max_characters: 20,
    max_series: 10,
  },
}

export interface UserEntitlements {
  tier: UserTier
  limits: UserLimits
}

/**
 * Get the effective entitlements for a user.
 * Merges tier defaults with per-user overrides from the DB.
 * If no DB row exists, returns free-tier defaults.
 */
export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_entitlements')
    .select('tier, limits')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return { tier: 'free' as UserTier, limits: { ...TIER_DEFAULTS.free } }
  }

  const tier = (data.tier as UserTier) || 'free'
  const defaults = TIER_DEFAULTS[tier]
  const overrides = (data.limits as Partial<UserLimits>) || {}

  return {
    tier,
    limits: {
      scan_images: overrides.scan_images ?? defaults.scan_images,
      max_characters: overrides.max_characters ?? defaults.max_characters,
      max_series: overrides.max_series ?? defaults.max_series,
    },
  }
}

/**
 * Check if a feature requires premium and the user has access.
 * For scan, free users can see the page but cannot use the endpoint.
 */
export function isPremiumFeature(tier: UserTier): boolean {
  return tier === 'premium'
}
