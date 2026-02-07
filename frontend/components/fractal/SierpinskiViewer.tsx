import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ColorScheme } from '../../src/types/fractal'
import FractalControls from './FractalControls'
import ColorSchemeSelector from './ColorSchemeSelector'
import PresetSelector from './PresetSelector'

interface SierpinskiViewerProps {
  rustServiceUrl?: string
}

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy' | 'error'
  message: string
}

export default function SierpinskiViewer({ rustServiceUrl }: SierpinskiViewerProps) {
  const rustUrl = rustServiceUrl || import.meta.env.VITE_RUST_SERVICE_URL || 'http://localhost:8001'

  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'checking',
    message: 'Checking service status...',
  })
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [renderTime, setRenderTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fractal parameters
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [recursionDepth, setRecursionDepth] = useState(6)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default')

  // Check health on mount
  useEffect(() => {
    checkHealth()
  }, [rustUrl])

  const checkHealth = async () => {
    setHealthStatus({ status: 'checking', message: 'Checking service status...' })
    try {
      const response = await fetch(`${rustUrl}/health`)
      if (response.ok) {
        const data = await response.json()
        setHealthStatus({
          status: 'healthy',
          message: `${data.service} is ${data.status}`,
        })
      } else {
        setHealthStatus({
          status: 'unhealthy',
          message: `Service returned status ${response.status}`,
        })
      }
    } catch (err) {
      setHealthStatus({
        status: 'error',
        message: 'Service is not available. Make sure rust-service is running.',
      })
    }
  }

  const generateFractal = async () => {
    if (healthStatus.status !== 'healthy') {
      setError('Service is not healthy. Please check the service status first.')
      return
    }

    setLoading(true)
    setError(null)
    setImageUrl(null)
    setRenderTime(null)

    const startTime = performance.now()

    try {
      const params = new URLSearchParams({
        type: 'sierpinski',
        width: width.toString(),
        height: height.toString(),
        recursion_depth: recursionDepth.toString(),
        color_scheme: colorScheme,
      })

      const response = await fetch(`${rustUrl}/api/fractal?${params}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setImageUrl(url)

      const endTime = performance.now()
      setRenderTime(Math.round(endTime - startTime))
    } catch (err: any) {
      setError(err.message || 'Failed to generate fractal')
      console.error('Error generating fractal:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePresetSelect = (preset: any) => {
    if (preset.params.recursionDepth !== undefined) setRecursionDepth(preset.params.recursionDepth)
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SparklesIcon className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Sierpinski Triangle
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Classic geometric fractal with self-similar triangles
          </p>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {healthStatus.status === 'healthy' && (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            )}
            {healthStatus.status === 'unhealthy' && (
              <XCircleIcon className="h-6 w-6 text-yellow-500" />
            )}
            {healthStatus.status === 'error' && (
              <XCircleIcon className="h-6 w-6 text-red-500" />
            )}
            {healthStatus.status === 'checking' && (
              <div className="h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            )}
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">Service Status</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{healthStatus.message}</p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={healthStatus.status === 'checking'}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Check Status
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Presets */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <PresetSelector
              fractalType="sierpinski"
              onSelectPreset={handlePresetSelect}
              disabled={loading}
            />
          </div>

          {/* Parameters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-50">
              Parameters
            </h3>
            <FractalControls
              width={width}
              height={height}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              recursionDepth={recursionDepth}
              onRecursionDepthChange={setRecursionDepth}
              disabled={loading}
            />
          </div>

          {/* Color Scheme */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <ColorSchemeSelector
              value={colorScheme}
              onChange={setColorScheme}
              disabled={loading}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateFractal}
            disabled={loading || healthStatus.status !== 'healthy'}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {loading ? 'Generating Fractal...' : 'Generate Fractal'}
          </button>
        </div>

        {/* Image Display - Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Render Time */}
          {renderTime !== null && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Fractal generated in {renderTime}ms
              </p>
            </div>
          )}

          {/* Image Display */}
          {imageUrl ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Sierpinski Triangle"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Adjust parameters and click "Generate Fractal" to see the visualization
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
