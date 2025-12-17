/**
 * WhyYaz Component
 *
 * Displays benefits and reasons to choose Yaz DigiStudio
 */

import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import './WhyYaz.css'

type WhyYazContent = {
  title: string
  shortTitle: string
  subtitle: string
  benefits: Array<{
    id: string
    title: string
    tech: string
    description: string
    icon: string
  }>
}

export function WhyYaz() {
  const { language } = useLanguage()
  const [content, setContent] = useState<WhyYazContent | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/content/why-yaz-${language}.json`)
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('Failed to load why-yaz content:', error)
      }
    }
    loadContent()
  }, [language])

  if (!content) {
    return null
  }

  return (
    <section className="why-yaz" id="why-yaz">
      <div className="why-yaz__container">
        <h2 className="why-yaz__title">{content.title}</h2>
        <p className="why-yaz__subtitle">{content.subtitle}</p>

        <div className="why-yaz__grid">
          {content.benefits.map((benefit) => (
            <div key={benefit.id} className="why-yaz__card">
              <div className="why-yaz__icon">{benefit.icon}</div>
              <h3 className="why-yaz__card-title">{benefit.title}</h3>
              <p className="why-yaz__card-tech">{benefit.tech}</p>
              <p className="why-yaz__card-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
