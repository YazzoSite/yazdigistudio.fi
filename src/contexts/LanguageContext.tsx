/**
 * LanguageContext
 *
 * Provides language state management for multilingual support.
 * Supports Finnish (fi) as default and English (en) as secondary language.
 */

import { createContext, useContext, useState, type ReactNode } from 'react'

type Language = 'fi' | 'en'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

type LanguageProviderProps = {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('fi')

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fi' ? 'en' : 'fi')
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
