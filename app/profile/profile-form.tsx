'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'

const AGE_RANGES = [
  { value: '', label: 'Select age range' },
  { value: 'under-18', label: 'Under 18' },
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
]

const GENDERS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

const OCCUPATIONS = [
  { value: '', label: 'Select occupation' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'student', label: 'Student' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'content-creator', label: 'Content Creator' },
  { value: 'other', label: 'Other' },
]

const COUNTRIES = [
  { code: '', name: 'Select country' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PL', name: 'Poland' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
]

const INTERESTS = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'photography', label: 'Photography' },
  { value: 'documents', label: 'Documents' },
  { value: 'networking', label: 'Networking' },
  { value: 'data', label: 'Data' },
]

interface ProfileData {
  display_name: string
  age_range: string
  gender: string
  country: string
  occupation: string
  interests: string[]
}

const TOTAL_FIELDS = 6

function calculateCompletion(data: ProfileData): number {
  let filled = 0
  if (data.display_name.trim()) filled++
  if (data.age_range) filled++
  if (data.gender) filled++
  if (data.country) filled++
  if (data.occupation) filled++
  if (data.interests.length > 0) filled++
  return Math.round((filled / TOTAL_FIELDS) * 100)
}

function getInitials(name: string, email?: string): string {
  if (name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return '?'
}

const inputClasses =
  'w-full px-3 py-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] transition-shadow'

const labelClasses = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'

export function ProfileForm() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<ProfileData>({
    display_name: '',
    age_range: '',
    gender: '',
    country: '',
    occupation: '',
    interests: [],
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Load existing profile
  useEffect(() => {
    if (!user) return

    async function loadProfile() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (!error && data) {
        setFormData({
          display_name: data.display_name || '',
          age_range: data.age_range || '',
          gender: data.gender || '',
          country: data.country || '',
          occupation: data.occupation || '',
          interests: data.interests || [],
        })
        setAvatarUrl(data.avatar_url || null)
      }

      setProfileLoading(false)
    }

    loadProfile()
  }, [user])

  // Auto-detect country from IP if not already set
  useEffect(() => {
    if (!user || profileLoading) return
    if (formData.country) return

    async function detectCountry() {
      try {
        const res = await fetch('/api/v1/myip')
        if (!res.ok) return
        const json = await res.json()
        const countryCode = json.data?.countryCode
        if (countryCode && COUNTRIES.some((c) => c.code === countryCode)) {
          setFormData((prev) => ({ ...prev, country: countryCode }))
        }
      } catch {
        // Silently ignore — country detection is best-effort
      }
    }

    detectCountry()
  }, [user, profileLoading, formData.country])

  const handleChange = useCallback(
    (field: keyof Omit<ProfileData, 'interests'>) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
        setMessage(null)
      },
    []
  )

  const toggleInterest = useCallback((interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
    setMessage(null)
  }, [])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    const isComplete =
      formData.display_name.trim() !== '' &&
      formData.age_range !== '' &&
      formData.gender !== '' &&
      formData.country !== '' &&
      formData.occupation !== '' &&
      formData.interests.length > 0

    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_name: formData.display_name.trim() || null,
        age_range: formData.age_range || null,
        gender: formData.gender || null,
        country: formData.country || null,
        occupation: formData.occupation || null,
        interests: formData.interests.length > 0 ? formData.interests : null,
        profile_completed: isComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } else {
      setMessage({ type: 'success', text: 'Profile saved! Redirecting...' })
      // Navigate back after a brief delay so user sees the success message
      setTimeout(() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }, 1000)
    }
  }

  // Loading state
  if (authLoading || (!user && true)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[var(--tk-color-primary-500)]" />
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[var(--tk-color-primary-500)]" />
      </div>
    )
  }

  const completion = calculateCompletion(formData)
  const initials = getInitials(formData.display_name, user?.email)

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8 shadow-xl">
      {/* Avatar & Progress */}
      <div className="flex flex-col items-center mb-8">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--tk-color-primary-500)] flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Profile {completion}% complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--tk-color-primary-500)] transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
        className="space-y-5"
      >
        {/* Display Name */}
        <div>
          <label htmlFor="display_name" className={labelClasses}>
            Display Name
          </label>
          <input
            id="display_name"
            type="text"
            value={formData.display_name}
            onChange={handleChange('display_name')}
            placeholder="How should we call you?"
            className={inputClasses}
          />
        </div>

        {/* Age Range */}
        <div>
          <label htmlFor="age_range" className={labelClasses}>
            Age Range
          </label>
          <select
            id="age_range"
            value={formData.age_range}
            onChange={handleChange('age_range')}
            className={inputClasses}
          >
            {AGE_RANGES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className={labelClasses}>
            Gender
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={handleChange('gender')}
            className={inputClasses}
          >
            {GENDERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className={labelClasses}>
            Country
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={handleChange('country')}
            className={inputClasses}
          >
            {COUNTRIES.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Occupation */}
        <div>
          <label htmlFor="occupation" className={labelClasses}>
            Occupation
          </label>
          <select
            id="occupation"
            value={formData.occupation}
            onChange={handleChange('occupation')}
            className={inputClasses}
          >
            {OCCUPATIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className={labelClasses}>Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const selected = formData.interests.includes(interest.value)
              return (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => toggleInterest(interest.value)}
                  className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? 'bg-[var(--tk-color-primary-500)] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[var(--tk-color-primary-500)] hover:text-[var(--tk-color-primary-500)]'
                  }`}
                  aria-pressed={selected}
                >
                  {interest.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            role="alert"
            className={`text-sm px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] w-full px-6 py-3 rounded-lg bg-[var(--tk-color-primary-500)] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
