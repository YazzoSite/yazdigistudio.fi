/**
 * Card Component
 *
 * Reusable card container with consistent styling.
 */

import type { ReactNode } from 'react'
import './Card.css'

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({
  children,
  className = '',
  hover = false
}: CardProps) {
  return (
    <div className={`card ${hover ? 'card--hover' : ''} ${className}`}>
      {children}
    </div>
  )
}
