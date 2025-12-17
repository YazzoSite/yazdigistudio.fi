/**
 * Header Component
 *
 * Main navigation header with language switcher.
 */

import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import './Header.css'

type NavItem = {
  labelFi: string
  labelEn: string
  href: string
}

const navItems: NavItem[] = [
  { labelFi: 'Palvelut', labelEn: 'Services', href: '#services' },
  { labelFi: 'Miksi Yaz?', labelEn: 'Why Yaz?', href: '#why-yaz' },
  { labelFi: 'Meistä', labelEn: 'About', href: '#about' },
  { labelFi: 'Ota yhteyttä', labelEn: 'Contact', href: '#contact' }
]

export function Header() {
  const { language, toggleLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="header">
      <div className="header__container">
        <a href="#" className="header__logo" onClick={(e) => {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}>
          <span className="header__logo-text">Yaz DigiStudio</span>
        </a>

        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="header__nav-link"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.href)
                  }}
                >
                  {language === 'fi' ? item.labelFi : item.labelEn}
                </a>
              </li>
            ))}
          </ul>

          <button
            className="header__lang-toggle"
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            {language === 'fi' ? 'EN' : 'FI'}
          </button>
        </nav>

        <button
          className="header__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="header__mobile-icon"></span>
        </button>
      </div>
    </header>
  )
}
