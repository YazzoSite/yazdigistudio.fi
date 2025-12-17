/**
 * About Component
 *
 * Displays information about Timo Saari and Yazzo.io Oy
 */

import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import './About.css'

type AboutContent = {
  title: string
  shortTitle: string
  subtitle: string
  sections: Array<{
    title: string
    content: string
  }>
  company: {
    name: string
    link: string
  }
}

export function About() {
  const { language } = useLanguage()
  const [content, setContent] = useState<AboutContent | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/content/about-${language}.json`)
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error('Failed to load about content:', error)
      }
    }
    loadContent()
  }, [language])

  if (!content) {
    return null
  }

  return (
    <section className="about" id="about">
      <div className="about__container">
        <h2 className="about__title">{content.title}</h2>
        <p className="about__subtitle">{content.subtitle}</p>

        <div className="about__layout">
          <div className="about__image-wrapper">
            <img
              src="/images/optimized/timo.webp"
              alt="Timo Saari - Web Developer at Yaz DigiStudio"
              className="about__image"
            />
          </div>

          <div className="about__content">
            {content.sections.map((section, index) => (
              <div key={index} className="about__section">
                <h3 className="about__section-title">{section.title}</h3>
                <p className="about__section-content">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
