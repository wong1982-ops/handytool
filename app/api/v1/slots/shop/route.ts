import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe/client'
import { COIN_PACKS } from '@/tools/slots/slots-types'

const schema = z.object({
  packId: z.string(),
})

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const pack = COIN_PACKS.find(p => p.id === parsed.data.packId)
  if (!pack) return apiError('Invalid pack', 'NOT_FOUND', 404)

  const totalCoins = pack.coins + Math.floor(pack.coins * pack.bonusPercent / 100)

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${pack.name} - ${totalCoins.toLocaleString()} coins` },
          unit_amount: pack.price,
        },
        quantity: 1,
      }],
      metadata: { userId, packId: pack.id, coins: String(totalCoins) },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tools/slots?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tools/slots?purchase=cancelled`,
    })

    return apiSuccess({ sessionUrl: session.url })
  } catch (e) {
    console.error('Stripe error:', e)
    return apiError('Payment failed', 'PAYMENT_ERROR', 500)
  }
}
