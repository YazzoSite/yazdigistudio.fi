/**
 * ContactCard
 *
 * Displays contact form and information
 */

import './Cards.css'

type FormField = {
  id: string
  label: string
  type: string
  placeholder: string
  required: boolean
  options?: Array<{ value: string; label: string }>
}

type FormData = {
  fields: FormField[]
  submitButton: string
  successMessage: string
  errorMessage: string
}

type ContactInfo = {
  email: string
  phone: string
  responseTime: string
}

type ContactContent = {
  title: string
  shortTitle?: string
  subtitle: string
  form: FormData
  info: ContactInfo
}

type ContactCardProps = {
  content: ContactContent
  onClose: () => void
}

export function ContactCard({ content, onClose }: ContactCardProps) {
  return (
    <div className="card-content">
      <button className="card-close" onClick={onClose} aria-label="Close">×</button>

      <h1 className="card-title">{content.title}</h1>
      <p className="card-subtitle">{content.subtitle}</p>

      <div className="contact-container">
        <div className="contact-info">
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> <a href={`mailto:${content.info.email}`}>{content.info.email}</a></p>
          <p><strong>Phone:</strong> <a href={`tel:${content.info.phone}`}>{content.info.phone}</a></p>
          <p className="response-time">{content.info.responseTime}</p>
        </div>

        <div className="contact-form">
          <form onSubmit={(e) => e.preventDefault()}>
            {content.form.fields.map((field) => (
              <div key={field.id} className="form-field">
                <label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.id}
                    name={field.id}
                    required={field.required}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="submit-button">
              {content.form.submitButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
