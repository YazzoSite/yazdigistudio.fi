/**
 * AboutCard
 *
 * Displays information about Timo Saari and Yazzo.io Oy
 */

import './Cards.css'

type AboutSection = {
  title: string
  content: string
}

type AboutContent = {
  title: string
  shortTitle?: string
  subtitle: string
  sections: AboutSection[]
  company: {
    name: string
    link: string
  }
}

type AboutCardProps = {
  content: AboutContent
  onClose: () => void
}

export function AboutCard({ content, onClose }: AboutCardProps) {
  if (!content || !content.sections) {
    return null
  }

  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>
      <p className="card-subtitle">{content.subtitle}</p>

      <div className="about-sections">
        {content.sections.map((section, index) => (
          <div key={index} className="about-section">
            <h3 className="about-section-title">{section.title}</h3>
            <p className="about-section-content">{section.content}</p>
          </div>
        ))}
      </div>

      {content.company && (
        <div className="about-company">
          <p>
            {content.company.name} •{' '}
            <a
              href={content.company.link}
              target="_blank"
              rel="noopener noreferrer"
              className="company-link"
            >
              {content.company.link.replace('https://', '')}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
