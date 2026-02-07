import { useState, useEffect } from 'react'
import { useSidebar } from '../../src/hooks/useSidebar'
import { FractalType } from '../../src/types/fractal'
import FractalSidebar from '../sidebars/FractalSidebar'
import MandelbrotViewer from './MandelbrotViewer'
import JuliaViewer from './JuliaViewer'
import SierpinskiViewer from './SierpinskiViewer'
import KochViewer from './KochViewer'

interface FractalSelectorProps {
  rustServiceUrl?: string
}

export default function FractalSelector({ rustServiceUrl }: FractalSelectorProps) {
  const [fractalType, setFractalType] = useState<FractalType>('mandelbrot')
  const [sidebarCollapsed, _setSidebarCollapsed] = useState(false)
  const { registerSidebar, unregisterSidebar } = useSidebar()

  // Register sidebar
  useEffect(() => {
    registerSidebar(
      'fractal',
      <FractalSidebar
        collapsed={sidebarCollapsed}
        fractalType={fractalType}
        onFractalTypeChange={setFractalType}
      />
    )
    return () => unregisterSidebar('fractal')
  }, [registerSidebar, unregisterSidebar, sidebarCollapsed, fractalType])

  // Route to appropriate viewer based on fractal type
  const renderViewer = () => {
    switch (fractalType) {
      case 'mandelbrot':
        return <MandelbrotViewer rustServiceUrl={rustServiceUrl} />
      case 'julia':
        return <JuliaViewer rustServiceUrl={rustServiceUrl} />
      case 'sierpinski':
        return <SierpinskiViewer rustServiceUrl={rustServiceUrl} />
      case 'koch':
        return <KochViewer rustServiceUrl={rustServiceUrl} />
      default:
        return null
    }
  }

  return renderViewer()
}
