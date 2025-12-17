/**
 * Content Types
 *
 * TypeScript types for JSON content structure.
 */

export type UIContent = {
  instructions: {
    desktop: string
    mobile: string
  }
  hero: {
    headline: string
    subheadline: string
    ctaPrimary: string
    ctaSecondary: string
  }
  navigation: {
    services: string
    pricing: string
    about: string
    contact: string
  }
}

export type ProcessStep = {
  number: string
  title: string
  description: string
}

export type ProcessContent = {
  title: string
  shortTitle: string
  steps: ProcessStep[]
}

export type Package = {
  name: string
  price: string
  description: string
  features: string[]
}

export type BuildContent = {
  title: string
  shortTitle: string
  packages: Package[]
}

export type CareContent = {
  title: string
  shortTitle: string
  packages: Package[]
}

export type AboutContent = {
  title: string
  shortTitle: string
  description: string
  mission?: string
}

export type WhyYazContent = {
  title: string
  shortTitle: string
  benefits: Array<{
    title: string
    description: string
  }>
}

export type ContactContent = {
  title: string
  shortTitle: string
  email?: string
  phone?: string
  address?: string
  socialLinks?: Array<{
    platform: string
    url: string
  }>
}
