import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'

// ---------- Admin Supabase (service role, no user session) ----------

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ---------- Idempotency helpers ----------

async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = getAdminSupabase()
  const { data } = await supabase
    .from('processed_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle()
  return !!data
}

async function markEventProcessed(
  eventId: string,
  eventType: string,
): Promise<void> {
  const supabase = getAdminSupabase()
  await supabase.from('processed_events').insert({
    event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  })
}

// ---------- Event handlers ----------

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const supabase = getAdminSupabase()
  const stripe = getStripe()
  const metadata = session.metadata ?? {}
  const userId = metadata.user_id
  const type = metadata.type // 'subscription' | 'credit_pack'

  if (!userId || !type) {
    console.error('Webhook: missing user_id or type in checkout metadata')
    return
  }

  if (type === 'subscription') {
    const tierId = metadata.tier_id
    if (!tierId) {
      console.error('Webhook: missing tier_id for subscription checkout')
      return
    }

    // Look up the tier to get monthly_credits
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('monthly_credits')
      .eq('id', tierId)
      .single()

    if (tierError || !tier) {
      console.error('Webhook: tier not found', tierId, tierError)
      return
    }

    // Retrieve Stripe subscription for period dates
    const stripeSubscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId,
    )

    const periodStart = new Date(
      subscription.current_period_start * 1000,
    ).toISOString()
    const periodEnd = new Date(
      subscription.current_period_end * 1000,
    ).toISOString()

    // Create the user_subscriptions row
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        tier_id: tierId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: session.customer as string,
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
      })

    if (insertError) {
      console.error('Webhook: failed to create user_subscriptions', insertError)
      return
    }

    // Grant subscription credits
    const { error: rpcError } = await supabase.rpc(
      'grant_subscription_credits',
      {
        p_user_id: userId,
        p_credits: tier.monthly_credits,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      },
    )

    if (rpcError) {
      console.error('Webhook: grant_subscription_credits failed', rpcError)
    }
  } else if (type === 'credit_pack') {
    const credits = parseInt(metadata.credits, 10)
    if (!credits || isNaN(credits)) {
      console.error('Webhook: invalid credits in credit_pack metadata')
      return
    }

    const { error: rpcError } = await supabase.rpc(
      'grant_purchased_credits',
      {
        p_user_id: userId,
        p_credits: credits,
      },
    )

    if (rpcError) {
      console.error('Webhook: grant_purchased_credits failed', rpcError)
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getAdminSupabase()
  const stripe = getStripe()

  const stripeSubscriptionId = invoice.subscription as string | null
  if (!stripeSubscriptionId) return

  // Find our user_subscriptions record
  const { data: userSub, error: subError } = await supabase
    .from('user_subscriptions')
    .select('user_id, tier_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()

  if (subError || !userSub) {
    console.error(
      'Webhook: user_subscriptions not found for',
      stripeSubscriptionId,
      subError,
    )
    return
  }

  // Look up tier monthly_credits
  const { data: tier, error: tierError } = await supabase
    .from('subscription_tiers')
    .select('monthly_credits')
    .eq('id', userSub.tier_id)
    .single()

  if (tierError || !tier) {
    console.error('Webhook: tier not found', userSub.tier_id, tierError)
    return
  }

  // Retrieve Stripe subscription for period dates
  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
  )

  const periodStart = new Date(
    subscription.current_period_start * 1000,
  ).toISOString()
  const periodEnd = new Date(
    subscription.current_period_end * 1000,
  ).toISOString()

  // Update user_subscriptions period
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      current_period_start: periodStart,
      current_period_end: periodEnd,
      status: 'active',
    })
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (updateError) {
    console.error('Webhook: failed to update user_subscriptions', updateError)
  }

  // Grant subscription credits (resets balance for new period)
  const { error: rpcError } = await supabase.rpc(
    'grant_subscription_credits',
    {
      p_user_id: userSub.user_id,
      p_credits: tier.monthly_credits,
      p_period_start: periodStart,
      p_period_end: periodEnd,
    },
  )

  if (rpcError) {
    console.error('Webhook: grant_subscription_credits failed', rpcError)
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  const supabase = getAdminSupabase()

  const { error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error(
      'Webhook: failed to cancel user_subscriptions',
      subscription.id,
      error,
    )
  }
}

// ---------- Main webhook handler ----------

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Webhook: STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    )
  }

  // Read raw body and signature header
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    )
  }

  // Verify webhook signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook: signature verification failed', message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    )
  }

  // Idempotency: skip if already processed
  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true })
  }

  // Route event to handler
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        )
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        )
        break
      default:
        console.log(`Webhook: unhandled event type ${event.type}`)
    }

    // Mark event as processed
    await markEventProcessed(event.id, event.type)

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook: error handling ${event.type}`, message)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}
