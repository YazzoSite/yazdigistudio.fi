/**
 * WhyYazCard
 *
 * Displays benefits and reasons to choose Yaz DigiStudio
 */

import './Cards.css'

type Benefit = {
  id: string
  title: string
  description: string
  icon: string
}

type WhyYazContent = {
  title: string
  shortTitle?: string
  subtitle: string
  benefits: Benefit[]
}

type WhyYazCardProps = {
  content: WhyYazContent
  onClose: () => void
}

export function WhyYazCard({ content, onClose }: WhyYazCardProps) {
  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>
      <p className="card-subtitle">{content.subtitle}</p>

      <div className="benefits-grid">
        {content.benefits.map((benefit) => (
          <div key={benefit.id} className="benefit-card">
            <div className="benefit-icon">{benefit.icon}</div>
            <h3 className="benefit-title">{benefit.title}</h3>
            <p className="benefit-description">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
