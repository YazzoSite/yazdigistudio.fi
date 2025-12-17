/**
 * useContent Hook
 *
 * Loads JSON content files with language support.
 */

import { useState, useEffect } from 'react'

export function useContent<T>(filename: string): T | null {
  const [content, setContent] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(`/content/${filename}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load ${filename}`)
        }
        return res.json()
      })
      .then(data => setContent(data))
      .catch(err => {
        console.error(`Error loading ${filename}:`, err)
        setError(err)
      })
  }, [filename])

  if (error) {
    console.warn(`Content loading error for ${filename}:`, error)
  }

  return content
}
