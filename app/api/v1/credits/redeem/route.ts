import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const bodySchema = z.object({
  code: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const admin = await createClient()

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { code } = parsed.data

  // Validate promo code exists and is active
  const { data: promo, error: promoError } = await admin
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (promoError || !promo) {
    return apiError('Invalid promo code', 'INVALID_PROMO', 404)
  }

  if (!promo.active) {
    return apiError('Promo code is no longer active', 'PROMO_INACTIVE', 400)
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return apiError('Promo code has expired', 'PROMO_EXPIRED', 400)
  }

  if (promo.max_redemptions && promo.current_redemptions >= promo.max_redemptions) {
    return apiError('Promo code has been fully redeemed', 'PROMO_EXHAUSTED', 400)
  }

  // Check if user has already redeemed this code
  const { data: existing } = await admin
    .from('credit_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'promo_redemption')
    .contains('metadata', { promo_code: code })
    .limit(1)

  if (existing && existing.length > 0) {
    return apiError('You have already redeemed this code', 'ALREADY_REDEEMED', 409)
  }

  // Grant purchased credits
  const { error: grantError } = await admin.rpc('grant_purchased_credits', {
    p_user_id: userId,
    p_amount: promo.credit_amount,
    p_description: `Promo code: ${code}`,
  })

  if (grantError) {
    console.error('credits/redeem: grant_purchased_credits failed', grantError)
    return API_ERRORS.INTERNAL()
  }

  // Update the transaction type to promo_redemption and add metadata
  // The grant_purchased_credits RPC creates a 'purchase' transaction, so update the most recent one
  const { error: updateError } = await admin
    .from('credit_transactions')
    .update({
      type: 'promo_redemption',
      metadata: { promo_code: code },
    })
    .eq('user_id', userId)
    .eq('type', 'purchase')
    .eq('description', `Promo code: ${code}`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (updateError) {
    console.error('credits/redeem: failed to update transaction type', updateError)
    // Non-fatal: credits were granted, just the type tag failed
  }

  // Increment promo redemptions
  const { error: incrError } = await admin
    .from('promo_codes')
    .update({ current_redemptions: promo.current_redemptions + 1 })
    .eq('id', promo.id)

  if (incrError) {
    console.error('credits/redeem: failed to increment redemptions', incrError)
  }

  return apiSuccess({ credits_granted: promo.credit_amount })
}
