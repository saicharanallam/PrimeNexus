import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useSidebar } from '../src/hooks/useSidebar'
import FractalSidebar from './sidebars/FractalSidebar'

interface FractalViewerProps {
  rustServiceUrl?: string
}

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy' | 'error'
  message: string
}

export default function FractalViewer({ rustServiceUrl }: FractalViewerProps) {
  const { registerSidebar, unregisterSidebar } = useSidebar()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
  const [zoom, setZoom] = useState(1.0)
  const [centerX, setCenterX] = useState(0.0)
  const [centerY, setCenterY] = useState(0.0)
  const [maxIterations, setMaxIterations] = useState(100)

  // Register sidebar
  useEffect(() => {
    registerSidebar('fractal', <FractalSidebar collapsed={sidebarCollapsed} />)
    return () => unregisterSidebar('fractal')
  }, [registerSidebar, unregisterSidebar, sidebarCollapsed])

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
        width: width.toString(),
        height: height.toString(),
        zoom: zoom.toString(),
        center_x: centerX.toString(),
        center_y: centerY.toString(),
        max_iterations: maxIterations.toString(),
      })

      const response = await fetch(`${rustUrl}/api/mandelbrot?${params}`)

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

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SparklesIcon className="h-8 w-8 text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Fractal Explorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mandelbrot Set Generator powered by Rust
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
              <p className="font-medium text-slate-900 dark:text-slate-50">
                Service Status
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {healthStatus.message}
              </p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={healthStatus.status === 'checking'}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Check Status
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
          Fractal Parameters
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Width
            </label>
            <input
              type="number"
              min="100"
              max="4096"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Height
            </label>
            <input
              type="number"
              min="100"
              max="4096"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Zoom
            </label>
            <input
              type="number"
              min="0.1"
              max="1000000"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value) || 1.0)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Iterations
            </label>
            <input
              type="number"
              min="10"
              max="10000"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Center X
            </label>
            <input
              type="number"
              step="0.01"
              value={centerX}
              onChange={(e) => setCenterX(parseFloat(e.target.value) || 0.0)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Center Y
            </label>
            <input
              type="number"
              step="0.01"
              value={centerY}
              onChange={(e) => setCenterY(parseFloat(e.target.value) || 0.0)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50"
            />
          </div>
        </div>
        <button
          onClick={generateFractal}
          disabled={loading || healthStatus.status !== 'healthy'}
          className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {loading ? 'Generating Fractal...' : 'Generate Mandelbrot Set'}
        </button>
      </div>

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
      {imageUrl && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
            Generated Fractal
          </h2>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Mandelbrot Set"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
