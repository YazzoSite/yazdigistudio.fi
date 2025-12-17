/**
 * Contact Component
 *
 * Displays contact information (email, phone, response time)
 */

import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import './Contact.css'

type ContactContent = {
  title: string
  shortTitle: string
  subtitle: string
  info: {
    email: string
    phone: string
    responseTime: string
  }
}

export function Contact() {
  const { language } = useLanguage()
  const [content, setContent] = useState<ContactContent | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/content/contact-${language}.json`)
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('Failed to load contact content:', error)
      }
    }
    loadContent()
  }, [language])

  if (!content) {
    return null
  }

  return (
    <section className="contact" id="contact">
      <div className="contact__container">
        <h2 className="contact__title">{content.title}</h2>
        <p className="contact__subtitle">{content.subtitle}</p>

        <div className="contact__info">
          <div className="contact__item">
            <div className="contact__icon">✉️</div>
            <div className="contact__details">
              <div className="contact__label">Email</div>
              <a
                href={`mailto:${content.info.email}`}
                className="contact__link"
              >
                {content.info.email}
              </a>
            </div>
          </div>

          <div className="contact__item">
            <div className="contact__icon">📱</div>
            <div className="contact__details">
              <div className="contact__label">{language === 'fi' ? 'Puhelin' : 'Phone'}</div>
              <a
                href={`tel:${content.info.phone.replace(/\s/g, '')}`}
                className="contact__link"
              >
                {content.info.phone}
              </a>
            </div>
          </div>
        </div>

        <p className="contact__response-time">{content.info.responseTime}</p>
      </div>
    </section>
  )
}
