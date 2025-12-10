/**
 * BuildCard
 *
 * Displays build packages with pricing and features
 */

import './Cards.css'

type Package = {
  id: string
  name: string
  price: string
  stars: string
  features: string[]
}

type BuildContent = {
  title: string
  shortTitle?: string
  subtitle: string
  packages: Package[]
}

type BuildCardProps = {
  content: BuildContent
  onClose: () => void
}

export function BuildCard({ content, onClose }: BuildCardProps) {
  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>
      <p className="card-subtitle">{content.subtitle}</p>

      <div className="packages-grid">
        {content.packages.map((pkg) => (
          <div key={pkg.id} className="package-card">
            <div className="package-header">
              <h3 className="package-name">{pkg.name}</h3>
              <div className="package-stars">{pkg.stars}</div>
            </div>
            <div className="package-price">{pkg.price}</div>
            <ul className="package-features">
              {pkg.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
