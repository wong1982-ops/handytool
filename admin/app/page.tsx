import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = [
  'loicwong1982@gmail.com',
]

export default async function AdminHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/analytics')
  }

  redirect('/login')
}
