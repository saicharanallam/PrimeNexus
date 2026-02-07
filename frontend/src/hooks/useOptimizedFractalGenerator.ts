import { useState, useRef, useEffect } from 'react'
import { imageCache } from '../utils/imageCache'
import { useDebounce } from './useDebounce'

interface UseOptimizedFractalGeneratorProps {
  rustUrl: string
  params: Record<string, any>
  autoGenerate?: boolean
  debounceMs?: number
}

export const useOptimizedFractalGenerator = ({
  rustUrl,
  params,
  autoGenerate = false,
  debounceMs = 800,
}: UseOptimizedFractalGeneratorProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [renderTime, setRenderTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounce params for auto-generation
  const debouncedParams = useDebounce(params, debounceMs)

  const generate = async (customParams?: Record<string, any>) => {
    const generationParams = customParams || params

    // Check cache first
    if (imageCache.has(generationParams)) {
      const cachedUrl = imageCache.get(generationParams)
      if (cachedUrl) {
        setImageUrl(cachedUrl)
        setError(null)
        setRenderTime(0) // Instant from cache
        return
      }
    }

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setRenderTime(null)

    const startTime = performance.now()

    try {
      const urlParams = new URLSearchParams()
      Object.entries(generationParams).forEach(([key, value]) => {
        urlParams.append(key, value.toString())
      })

      const response = await fetch(`${rustUrl}/api/fractal?${urlParams}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      // Cache the result
      imageCache.set(generationParams, url)

      setImageUrl(url)

      const endTime = performance.now()
      setRenderTime(Math.round(endTime - startTime))
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }
      setError(err.message || 'Failed to generate fractal')
      console.error('Error generating fractal:', err)
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  // Auto-generate when debounced params change
  useEffect(() => {
    if (autoGenerate) {
      generate(debouncedParams)
    }
  }, [debouncedParams, autoGenerate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    imageUrl,
    loading,
    renderTime,
    error,
    generate,
  }
}
