import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = ['loicwong1982@gmail.com']

export async function requireAdminApi() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return { user: null, error: 'Unauthorized' as const }
  }

  return { user, error: null }
}
