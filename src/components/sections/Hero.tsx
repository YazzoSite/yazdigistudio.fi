/**
 * Hero Section
 *
 * Main hero section with headline, subheadline, and CTAs.
 */

import { useLanguage } from '../../contexts/LanguageContext'
import { useContent } from '../../hooks/useContent'
import { Button } from '../ui/Button'
import type { UIContent } from '../../types/content'
import './Hero.css'

export function Hero() {
  const { language } = useLanguage()
  const uiContent = useContent<UIContent>(`ui-${language}.json`)

  if (!uiContent) {
    return null
  }

  const handleGetStarted = () => {
    const contactSection = document.querySelector('#contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSeeHowWeWork = () => {
    const servicesSection = document.querySelector('#services')
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__headline">
            {uiContent.hero.headline}
          </h1>
          <p className="hero__subheadline">
            {uiContent.hero.subheadline}
          </p>
          <div className="hero__cta-group">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
            >
              {uiContent.hero.ctaPrimary}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSeeHowWeWork}
            >
              {uiContent.hero.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
