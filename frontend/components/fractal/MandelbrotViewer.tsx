import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ColorScheme } from '../../src/types/fractal'
import FractalControls from './FractalControls'
import ColorSchemeSelector from './ColorSchemeSelector'
import PresetSelector from './PresetSelector'
import ExportControls from './ExportControls'
import InteractiveFractalImage from './InteractiveFractalImage'
import { useExport } from '../../src/hooks/useExport'
import { useInteractiveFractal } from '../../src/hooks/useInteractiveFractal'

interface MandelbrotViewerProps {
  rustServiceUrl?: string
}

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy' | 'error'
  message: string
}

export default function MandelbrotViewer({ rustServiceUrl }: MandelbrotViewerProps) {
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
  const [centerX, setCenterX] = useState(-0.5)
  const [centerY, setCenterY] = useState(0.0)
  const [maxIterations, setMaxIterations] = useState(100)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default')

  // Export hook
  const { exportHighRes, exporting } = useExport({
    rustUrl,
    fractalType: 'mandelbrot',
    params: {
      type: 'mandelbrot',
      width,
      height,
      zoom,
      center_x: centerX,
      center_y: centerY,
      max_iterations: maxIterations,
      color_scheme: colorScheme,
    },
  })

  // Interactive fractal hook
  const { handleZoomIn, handleZoomOut, handlePan, handleReset } = useInteractiveFractal({
    width,
    height,
    zoom,
    centerX,
    centerY,
    onZoomChange: setZoom,
    onCenterChange: (x, y) => {
      setCenterX(x)
      setCenterY(y)
    },
    initialZoom: 1.0,
    initialCenterX: -0.5,
    initialCenterY: 0.0,
  })

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
        type: 'mandelbrot',
        width: width.toString(),
        height: height.toString(),
        zoom: zoom.toString(),
        center_x: centerX.toString(),
        center_y: centerY.toString(),
        max_iterations: maxIterations.toString(),
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
    if (preset.params.zoom !== undefined) setZoom(preset.params.zoom)
    if (preset.params.centerX !== undefined) setCenterX(preset.params.centerX)
    if (preset.params.centerY !== undefined) setCenterY(preset.params.centerY)
    if (preset.params.maxIterations !== undefined) setMaxIterations(preset.params.maxIterations)
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SparklesIcon className="h-8 w-8 text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Mandelbrot Set
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Explore the iconic fractal discovered by Benoit Mandelbrot
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

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Presets */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <PresetSelector
              fractalType="mandelbrot"
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
              zoom={zoom}
              onZoomChange={setZoom}
              centerX={centerX}
              centerY={centerY}
              onCenterXChange={setCenterX}
              onCenterYChange={setCenterY}
              maxIterations={maxIterations}
              onMaxIterationsChange={setMaxIterations}
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

          {/* Export Controls */}
          {imageUrl && (
            <ExportControls
              imageUrl={imageUrl}
              params={{
                type: 'mandelbrot',
                width,
                height,
                zoom,
                centerX,
                centerY,
                maxIterations,
                colorScheme,
              }}
              fractalType="mandelbrot"
              onExportHighRes={exportHighRes}
              disabled={loading || exporting}
            />
          )}

          {/* Generate Button */}
          <button
            onClick={generateFractal}
            disabled={loading || healthStatus.status !== 'healthy'}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
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
                <InteractiveFractalImage
                  imageUrl={imageUrl}
                  alt="Mandelbrot Set"
                  onZoomIn={(clickX, clickY) => {
                    handleZoomIn(clickX, clickY)
                    // Auto-generate after zoom
                    setTimeout(() => generateFractal(), 100)
                  }}
                  onZoomOut={() => {
                    handleZoomOut()
                    setTimeout(() => generateFractal(), 100)
                  }}
                  onPan={(deltaX, deltaY) => {
                    handlePan(deltaX, deltaY)
                    setTimeout(() => generateFractal(), 100)
                  }}
                  onReset={() => {
                    handleReset()
                    setTimeout(() => generateFractal(), 100)
                  }}
                  width={width}
                  height={height}
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
