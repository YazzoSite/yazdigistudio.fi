/**
 * PricingCard
 *
 * Displays add-on services and pricing
 */

import './Cards.css'

type Addon = {
  id: string
  name: string
  price: string
  icon: string
}

type PricingContent = {
  title: string
  shortTitle?: string
  subtitle: string
  addons: Addon[]
  note: string
}

type PricingCardProps = {
  content: PricingContent
  onClose: () => void
}

export function PricingCard({ content, onClose }: PricingCardProps) {
  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>
      <p className="card-subtitle">{content.subtitle}</p>

      <div className="addons-grid">
        {content.addons.map((addon) => (
          <div key={addon.id} className="addon-card">
            <div className="addon-icon">{addon.icon}</div>
            <h3 className="addon-name">{addon.name}</h3>
            <div className="addon-price">{addon.price}</div>
          </div>
        ))}
      </div>

      <p className="pricing-note">{content.note}</p>
    </div>
  )
}
