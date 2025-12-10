/**
 * LanguageSwitcher
 *
 * Component for switching between Finnish and English languages.
 * Displays current language and allows toggling with a button.
 */

import { useLanguage } from '../contexts/LanguageContext'
import './LanguageSwitcher.css'

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      className="language-switcher"
      onClick={toggleLanguage}
      aria-label="Switch language"
    >
      <span className="language-current">{language.toUpperCase()}</span>
      <span className="language-separator">/</span>
      <span className="language-other">
        {language === 'fi' ? 'EN' : 'FI'}
      </span>
    </button>
  )
}
