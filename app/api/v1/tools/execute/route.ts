import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const bodySchema = z.object({
  tool_id: z.string().min(1),
  input: z.record(z.unknown()),
})

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createAuthClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { tool_id, input } = parsed.data
  const admin = getServiceClient()

  // Look up tool credit cost
  const { data: toolCost, error: costError } = await admin
    .from('tool_credit_costs')
    .select('credit_cost')
    .eq('tool_id', tool_id)
    .single()

  if (costError || !toolCost) {
    return API_ERRORS.NOT_FOUND('Tool')
  }

  const cost = toolCost.credit_cost

  // Deduct credits
  const { data: deductResult, error: deductError } = await admin.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: cost,
    p_tool_id: tool_id,
    p_description: `Tool usage: ${tool_id}`,
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: cost })
    }
    console.error('tools/execute: deduct_credits failed', deductError)
    return API_ERRORS.INTERNAL()
  }

  const row = Array.isArray(deductResult) ? deductResult[0] : deductResult
  const transactionId = row?.transaction_id

  // Placeholder AI execution
  let result: Record<string, unknown>
  try {
    // TODO: Replace with actual AI tool execution
    result = { message: 'AI tool placeholder', tool_id, input }
  } catch (aiError) {
    console.error('tools/execute: AI execution failed', aiError)

    // Refund credits on AI failure
    if (transactionId) {
      const { error: refundError } = await admin.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: cost,
        p_original_transaction_id: transactionId,
        p_description: 'AI call failed — credits refunded',
      })

      if (refundError) {
        console.error('tools/execute: refund_credits failed', refundError)
      }
    }

    return apiError('Tool execution failed', 'EXECUTION_FAILED', 502)
  }

  return apiSuccess({
    result,
    credits_used: cost,
    balance: {
      subscription: row?.new_subscription_balance ?? 0,
      purchased: row?.new_purchased_balance ?? 0,
    },
  })
}
