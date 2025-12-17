/**
 * ServicesSlideshow Component
 *
 * Carousel displaying three service phases: Process, Build, Care
 */

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useLanguage } from '../../contexts/LanguageContext'
import './ServicesSlideshow.css'

type ServiceContent = {
  title: string
  shortTitle: string
  subtitle?: string
  steps?: Array<{
    number: string
    title: string
    description: string
  }>
  packages?: Array<{
    id: string
    name: string
    price: string
    stars: string
    features: string[]
  }>
}

export function ServicesSlideshow() {
  const { language } = useLanguage()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [processContent, setProcessContent] = useState<ServiceContent | null>(null)
  const [buildContent, setBuildContent] = useState<ServiceContent | null>(null)
  const [careContent, setCareContent] = useState<ServiceContent | null>(null)

  // Load content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [process, build, care] = await Promise.all([
          fetch(`/content/process-${language}.json`).then(res => res.json()),
          fetch(`/content/build-${language}.json`).then(res => res.json()),
          fetch(`/content/care-${language}.json`).then(res => res.json())
        ])
        setProcessContent(process)
        setBuildContent(build)
        setCareContent(care)
      } catch (error) {
        console.error('Failed to load service content:', error)
      }
    }
    loadContent()
  }, [language])

  // Update selected index
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  if (!processContent || !buildContent || !careContent) {
    return null
  }

  return (
    <section className="services-slideshow" id="services">
      <div className="services-slideshow__container">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {/* Process Slide */}
            <div className="embla__slide">
              <div className="service-slide">
                <h2 className="service-slide__title">{processContent.title}</h2>
                <div className="service-slide__steps">
                  {processContent.steps?.map((step) => (
                    <div key={step.number} className="step-card">
                      <div className="step-card__number">{step.number}</div>
                      <h3 className="step-card__title">{step.title}</h3>
                      <p className="step-card__description">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Build/Examples Slide */}
            <div className="embla__slide">
              <div className="service-slide">
                <h2 className="service-slide__title">{buildContent.title}</h2>
                {buildContent.subtitle && (
                  <p className="service-slide__subtitle">{buildContent.subtitle}</p>
                )}
                <div className="service-slide__packages">
                  {buildContent.packages?.map((pkg) => (
                    <div key={pkg.id} className="package-card">
                      <div className="package-card__header">
                        <h3 className="package-card__name">{pkg.name}</h3>
                        <div className="package-card__stars">{pkg.stars}</div>
                      </div>
                      <div className="package-card__price">{pkg.price}</div>
                      <ul className="package-card__features">
                        {pkg.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Care/Maintenance Slide */}
            <div className="embla__slide">
              <div className="service-slide">
                <h2 className="service-slide__title">{careContent.title}</h2>
                {careContent.subtitle && (
                  <p className="service-slide__subtitle">{careContent.subtitle}</p>
                )}
                <div className="service-slide__packages">
                  {careContent.packages?.map((pkg) => (
                    <div key={pkg.id} className="package-card">
                      <div className="package-card__header">
                        <h3 className="package-card__name">{pkg.name}</h3>
                        <div className="package-card__stars">{pkg.stars}</div>
                      </div>
                      <div className="package-card__price">{pkg.price}</div>
                      <ul className="package-card__features">
                        {pkg.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="embla__dots">
          <button
            className={`embla__dot ${selectedIndex === 0 ? 'embla__dot--active' : ''}`}
            onClick={() => scrollTo(0)}
            aria-label="Go to Process"
          >
            <span>{processContent.shortTitle}</span>
          </button>
          <button
            className={`embla__dot ${selectedIndex === 1 ? 'embla__dot--active' : ''}`}
            onClick={() => scrollTo(1)}
            aria-label="Go to Build"
          >
            <span>{buildContent.shortTitle}</span>
          </button>
          <button
            className={`embla__dot ${selectedIndex === 2 ? 'embla__dot--active' : ''}`}
            onClick={() => scrollTo(2)}
            aria-label="Go to Care"
          >
            <span>{careContent.shortTitle}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
