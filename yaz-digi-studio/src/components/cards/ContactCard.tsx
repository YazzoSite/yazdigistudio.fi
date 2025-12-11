/**
 * ContactCard
 *
 * Displays contact information
 */

import './Cards.css'

type ContactInfo = {
  email: string
  phone: string
  responseTime?: string
}

type ContactContent = {
  title: string
  shortTitle?: string
  subtitle: string
  info: ContactInfo
}

type ContactCardProps = {
  content: ContactContent
  onClose: () => void
}

export function ContactCard({ content, onClose }: ContactCardProps) {
  if (!content || !content.info) {
    return null
  }

  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>
      <p className="card-subtitle">{content.subtitle}</p>

      <div className="contact-info-centered">
        <div className="contact-item">
          <div className="contact-icon">📧</div>
          <h3>Email</h3>
          <a href={`mailto:${content.info.email}`} className="contact-link">
            {content.info.email}
          </a>
        </div>

        <div className="contact-item">
          <div className="contact-icon">📱</div>
          <h3>Phone</h3>
          <a href={`tel:${content.info.phone}`} className="contact-link">
            {content.info.phone}
          </a>
        </div>
      </div>

      {content.info.responseTime && (
        <p className="response-time">{content.info.responseTime}</p>
      )}
    </div>
  )
}
