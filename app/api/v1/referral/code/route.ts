import { randomBytes } from 'crypto'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://toolk1t.com'

function generateCode(): string {
  return randomBytes(6).toString('base64url').slice(0, 8).toLowerCase()
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  // Check for existing code
  const { data: existing, error: fetchError } = await (supabase.from as any)('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) {
    console.error('referral/code: fetch failed', fetchError)
    return API_ERRORS.INTERNAL()
  }

  if (existing) {
    const code = existing.code as string
    return apiSuccess({ code, url: `${SITE_URL}/?ref=${code}` })
  }

  // Generate a unique code with collision retry
  let code: string | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCode()
    const { data: collision } = await (supabase.from as any)('referral_codes')
      .select('code')
      .eq('code', candidate)
      .maybeSingle()

    if (!collision) {
      code = candidate
      break
    }
  }

  if (!code) {
    console.error('referral/code: failed to generate unique code after 5 attempts')
    return apiError('Could not generate referral code', 'CODE_GENERATION_FAILED', 500)
  }

  const { error: insertError } = await (supabase.from as any)('referral_codes')
    .insert({ user_id: userId, code })

  if (insertError) {
    console.error('referral/code: insert failed', insertError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ code, url: `${SITE_URL}/?ref=${code}` })
}
