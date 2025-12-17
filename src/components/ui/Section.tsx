/**
 * Section Component
 *
 * Reusable section wrapper with consistent spacing and max-width.
 */

import type { ReactNode } from 'react'
import './Section.css'

type SectionProps = {
  children: ReactNode
  className?: string
  id?: string
  background?: 'white' | 'gray'
}

export function Section({
  children,
  className = '',
  id,
  background = 'white'
}: SectionProps) {
  return (
    <section
      id={id}
      className={`section section--${background} ${className}`}
    >
      <div className="section__container">
        {children}
      </div>
    </section>
  )
}
