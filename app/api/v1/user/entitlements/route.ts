import { getAuthUserId } from '@/lib/api/response'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { getUserEntitlements } from '@/lib/entitlements'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const entitlements = await getUserEntitlements(userId)
  return apiSuccess(entitlements)
}
