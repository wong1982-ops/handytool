'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Language } from './types'
import type { I18nStrings } from './i18n/en'
import { en } from './i18n/en'
import { zh } from './i18n/zh'

const STORAGE_KEY = 'toolk1t-story-studio-lang'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: I18nStrings
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with 'en' to match SSR, then sync from localStorage after hydration
  const [language, setLang] = useState<Language>('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'zh') setLang('zh')
    } catch { /* ignore */ }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang)
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }, [language, setLanguage])

  const t: I18nStrings = language === 'zh' ? zh : en

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
