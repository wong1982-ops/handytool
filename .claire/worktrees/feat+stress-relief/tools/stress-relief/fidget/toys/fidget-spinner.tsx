'use client'
import type { Language } from '@/tools/stress-relief/stress-relief-types'
import type { I18nStrings } from '@/tools/stress-relief/i18n/en'
export function FidgetSpinner({ language: _l, t: _t }: { language: Language; t: I18nStrings }) {
  return <div className="p-8 text-center text-slate-400">Fidget Spinner — coming soon</div>
}
