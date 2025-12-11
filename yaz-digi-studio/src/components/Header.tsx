/**
 * Header Component
 *
 * Navigation header with branding, face navigation buttons, and language selector
 */

import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Header.css'

const FACES = [
  { contentType: 'process', color: 0x0044ff },      // Deep Electric Blue
  { contentType: 'build', color: 0xff0033 },        // Deep Crimson Red
  { contentType: 'care', color: 0xaa00ff },          // Deep Violet Purple
  { contentType: 'about', color: 0xffbb00 },         // Golden Amber
  { contentType: 'why-yaz', color: 0xff0099 },       // Hot Magenta
  { contentType: 'contact', color: 0x00ccff },       // Bright Cyan
] as const

type HeaderProps = {
  onNavigate: (faceIndex: number) => void
}

export function Header({ onNavigate }: HeaderProps) {
  const { language } = useLanguage()
  const [faceLabels, setFaceLabels] = useState<string[]>([
    'Process', 'Build', 'Care', 'About', 'Why Yaz', 'Contact'
  ])

  // Load face labels when language changes (same pattern as Cube)
  useEffect(() => {
    const loadAllLabels = async () => {
      try {
        const labels: string[] = []

        for (const face of FACES) {
          const response = await fetch(`/content/${face.contentType}-${language}.json`)
          if (response.ok) {
            const data = await response.json()
            // Use shortTitle for navigation buttons
            labels.push(data.shortTitle || data.title || face.contentType)
          } else {
            labels.push(face.contentType)
          }
        }

        setFaceLabels(labels)
      } catch (error) {
        console.error('Error loading face labels:', error)
      }
    }

    loadAllLabels()
  }, [language])

  return (
    <header className="header">
      <div className="header-content">
        {/* Branding */}
        <div className="header-branding">
          <h1 className="brand-text">YAZ DigiStudio</h1>
        </div>

        {/* Navigation buttons */}
        <nav className="header-nav">
          {FACES.map((face, index) => (
            <button
              key={face.contentType}
              className="nav-button"
              style={{
                '--button-color': `#${face.color.toString(16).padStart(6, '0')}`
              } as React.CSSProperties}
              onClick={() => onNavigate(index)}
            >
              {faceLabels[index]}
            </button>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="header-lang">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
