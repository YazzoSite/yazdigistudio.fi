/**
 * useContentData
 *
 * Custom hook for loading multilingual content from JSON files.
 * Fetches content based on content type (face) and current language.
 */

import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

type ContentType = 'process' | 'build' | 'care' | 'pricing' | 'why-yaz' | 'contact'

export function useContentData<T>(contentType: ContentType) {
  const { language } = useLanguage()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/content/${contentType}-${language}.json`)

        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.statusText}`)
        }

        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        console.error(`Error loading ${contentType} content:`, err)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [contentType, language])

  return { data, loading, error }
}
