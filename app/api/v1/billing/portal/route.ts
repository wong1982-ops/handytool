import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  // Find user's active subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (subError || !subscription) {
    return apiError('No active subscription found', 'NO_SUBSCRIPTION', 404)
  }

  if (!subscription.stripe_customer_id) {
    return apiError('No Stripe customer linked', 'NO_CUSTOMER', 400)
  }

  const origin = request.headers.get('origin')
    || process.env.NEXT_PUBLIC_SITE_URL
    || 'https://toolk1t.com'

  const stripe = getStripe()
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/billing`,
  })

  return apiSuccess({ url: portalSession.url })
}
