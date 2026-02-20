import type { Metadata } from 'next'
import { ProfileForm } from './profile-form'

export const metadata: Metadata = {
  title: 'My Profile | Toolk1t',
}

export default function ProfilePage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        My Profile
      </h1>
      <ProfileForm />
    </main>
  )
}
