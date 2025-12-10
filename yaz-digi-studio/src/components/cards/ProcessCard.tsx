/**
 * ProcessCard
 *
 * Displays the 3-step process for building websites
 */

import './Cards.css'

type ProcessStep = {
  number: string
  title: string
  description: string
}

type ProcessContent = {
  title: string
  shortTitle?: string
  steps: ProcessStep[]
}

type ProcessCardProps = {
  content: ProcessContent
  onClose: () => void
}

export function ProcessCard({ content, onClose }: ProcessCardProps) {
  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>

      <div className="process-steps">
        {content.steps.map((step) => (
          <div key={step.number} className="process-step">
            <div className="step-number">{step.number}</div>
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
