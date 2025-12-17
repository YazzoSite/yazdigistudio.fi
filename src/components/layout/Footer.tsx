/**
 * Footer Component
 *
 * Site footer with brand, contact info, and copyright.
 */

import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import './Footer.css'

type FooterContent = {
  brand: {
    name: string
    tagline: string
  }
  contact: {
    email: string
    phone: string
  }
  copyright: string
}

export function Footer() {
  const { language } = useLanguage()
  const [content, setContent] = useState<FooterContent | null>(null)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/content/footer-${language}.json`)
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('Failed to load footer content:', error)
      }
    }
    loadContent()
  }, [language])

  if (!content) {
    return null
  }

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <h3 className="footer__brand-name">{content.brand.name}</h3>
          <p className="footer__brand-tagline">{content.brand.tagline}</p>
        </div>

        <div className="footer__contact">
          <a
            href={`mailto:${content.contact.email}`}
            className="footer__contact-link"
          >
            {content.contact.email}
          </a>
          <span className="footer__contact-separator">•</span>
          <a
            href={`tel:${content.contact.phone}`}
            className="footer__contact-link"
          >
            {content.contact.phone}
          </a>
        </div>

        <p className="footer__copyright">
          © {currentYear} {content.brand.name}. {content.copyright}
        </p>
      </div>
    </footer>
  )
}
