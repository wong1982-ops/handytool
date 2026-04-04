import { headers } from 'next/headers'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const CREDITS_PER_REFERRAL = 15
const MAX_REFERRALS_PER_MONTH = 10
const MAX_REFERRALS_PER_IP_PER_MONTH = 3

export async function POST(request: Request) {
  let body: { referralCode?: string; referredUserId?: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { referralCode, referredUserId } = body

  if (!referralCode || typeof referralCode !== 'string') {
    return API_ERRORS.VALIDATION({ field: 'referralCode', message: 'Required' })
  }
  if (!referredUserId || typeof referredUserId !== 'string') {
    return API_ERRORS.VALIDATION({ field: 'referredUserId', message: 'Required' })
  }

  const supabase = getAdminSupabase()

  // 1. Resolve referral code → referrer
  const { data: codeRow, error: codeError } = await (supabase.from as any)('referral_codes')
    .select('user_id, code')
    .eq('code', referralCode.toLowerCase())
    .maybeSingle()

  if (codeError) {
    console.error('referral/claim: code lookup failed', codeError)
    return API_ERRORS.INTERNAL()
  }
  if (!codeRow) {
    return API_ERRORS.NOT_FOUND('Referral code')
  }

  const referrerId = codeRow.user_id as string

  // 2. Block self-referral
  if (referrerId === referredUserId) {
    return apiError('Self-referral is not allowed', 'SELF_REFERRAL', 400)
  }

  // 3. Check referred user hasn't already been referred
  const { data: alreadyReferred, error: dupError } = await (supabase.from as any)('referrals')
    .select('id')
    .eq('referred_id', referredUserId)
    .maybeSingle()

  if (dupError) {
    console.error('referral/claim: duplicate check failed', dupError)
    return API_ERRORS.INTERNAL()
  }
  if (alreadyReferred) {
    return apiError('User has already been referred', 'ALREADY_REFERRED', 409)
  }

  // 4. Check referrer monthly cap
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { count: referrerMonthCount, error: capError } = await (supabase.from as any)('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrerId)
    .gte('created_at', monthStart)

  if (capError) {
    console.error('referral/claim: monthly cap check failed', capError)
    return API_ERRORS.INTERNAL()
  }
  if ((referrerMonthCount ?? 0) >= MAX_REFERRALS_PER_MONTH) {
    return apiError('Referrer has reached the monthly referral limit', 'MONTHLY_CAP_REACHED', 429)
  }

  // 5. IP rate limit
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  if (ip !== 'unknown') {
    const { count: ipCount, error: ipError } = await (supabase.from as any)('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_ip', ip)
      .gte('created_at', monthStart)

    if (ipError) {
      console.error('referral/claim: IP rate limit check failed', ipError)
      return API_ERRORS.INTERNAL()
    }
    if ((ipCount ?? 0) >= MAX_REFERRALS_PER_IP_PER_MONTH) {
      return apiError('Too many referrals from this IP this month', 'IP_RATE_LIMITED', 429)
    }
  }

  // 6. Award credits to referrer
  const { error: referrerCreditError } = await supabase.rpc('award_referral_credits', {
    p_user_id: referrerId,
    p_amount: CREDITS_PER_REFERRAL,
    p_description: `Referral bonus — referred a new user`,
  })

  if (referrerCreditError) {
    console.error('referral/claim: award credits to referrer failed', referrerCreditError)
    return API_ERRORS.INTERNAL()
  }

  // 7. Award credits to referred user
  const { error: referredCreditError } = await supabase.rpc('award_referral_credits', {
    p_user_id: referredUserId,
    p_amount: CREDITS_PER_REFERRAL,
    p_description: `Referral bonus — joined via referral link`,
  })

  if (referredCreditError) {
    console.error('referral/claim: award credits to referred user failed', referredCreditError)
    return API_ERRORS.INTERNAL()
  }

  // 8. Record the referral
  const { error: insertError } = await (supabase.from as any)('referrals').insert({
    referrer_id: referrerId,
    referred_id: referredUserId,
    referral_code: referralCode.toLowerCase(),
    credits_awarded: CREDITS_PER_REFERRAL,
    referrer_ip: ip !== 'unknown' ? ip : null,
  })

  if (insertError) {
    console.error('referral/claim: insert referral record failed', insertError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ success: true, creditsAwarded: CREDITS_PER_REFERRAL })
}
