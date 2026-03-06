import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { CREDIT_PACKS } from '@/lib/stripe/config'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const bodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('subscription'),
    tier_id: z.string().min(1),
  }),
  z.object({
    type: z.literal('credit_pack'),
    pack_id: z.string().min(1),
  }),
])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const stripe = getStripe()
  const origin = request.headers.get('origin')
    || process.env.NEXT_PUBLIC_SITE_URL
    || 'https://toolk1t.com'

  const successUrl = `${origin}/billing?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/billing`

  if (parsed.data.type === 'subscription') {
    const { tier_id } = parsed.data

    // Look up tier's stripe_price_id
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('stripe_price_id, monthly_credits')
      .eq('id', tier_id)
      .eq('active', true)
      .single()

    if (tierError || !tier) {
      return API_ERRORS.NOT_FOUND('Subscription tier')
    }

    if (!tier.stripe_price_id) {
      return apiError('Tier has no Stripe price configured', 'TIER_NOT_CONFIGURED', 400)
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: tier.stripe_price_id, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        type: 'subscription',
        tier_id,
        credits: String(tier.monthly_credits),
      },
    })

    return apiSuccess({ url: session.url })
  }

  // credit_pack
  const { pack_id } = parsed.data
  const pack = CREDIT_PACKS.find((p) => p.id === pack_id)

  if (!pack) {
    return API_ERRORS.NOT_FOUND('Credit pack')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: pack.label },
          unit_amount: pack.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: user.id,
      type: 'credit_pack',
      pack_id,
      credits: String(pack.credits),
    },
  })

  return apiSuccess({ url: session.url })
}
