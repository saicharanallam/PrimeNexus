import { useCallback } from 'react'

interface UseInteractiveFractalProps {
  width: number
  height: number
  zoom: number
  centerX: number
  centerY: number
  onZoomChange: (zoom: number) => void
  onCenterChange: (centerX: number, centerY: number) => void
  initialZoom?: number
  initialCenterX?: number
  initialCenterY?: number
}

export const useInteractiveFractal = ({
  width,
  height,
  zoom,
  centerX,
  centerY,
  onZoomChange,
  onCenterChange,
  initialZoom = 1.0,
  initialCenterX = 0.0,
  initialCenterY = 0.0,
}: UseInteractiveFractalProps) => {
  const handleZoomIn = useCallback(
    (clickX: number, clickY: number) => {
      // Calculate the complex plane coordinates at the click point
      const aspectRatio = width / height
      const scale = 4.0 / zoom
      const minX = centerX - scale * aspectRatio
      const maxX = centerX + scale * aspectRatio
      const minY = centerY - scale
      const maxY = centerY + scale

      // Convert click position (0-1) to complex plane
      const newCenterX = minX + clickX * (maxX - minX)
      const newCenterY = minY + clickY * (maxY - minY)

      // Zoom in by 2x
      const newZoom = zoom * 2

      onZoomChange(newZoom)
      onCenterChange(newCenterX, newCenterY)
    },
    [width, height, zoom, centerX, centerY, onZoomChange, onCenterChange]
  )

  const handleZoomOut = useCallback(() => {
    // Zoom out by 0.5x
    const newZoom = Math.max(zoom * 0.5, 0.1)
    onZoomChange(newZoom)
  }, [zoom, onZoomChange])

  const handlePan = useCallback(
    (deltaX: number, deltaY: number) => {
      // Convert pixel delta to complex plane delta
      const aspectRatio = width / height
      const scale = 4.0 / zoom

      const complexDeltaX = -deltaX * (scale * aspectRatio * 2)
      const complexDeltaY = -deltaY * (scale * 2)

      const newCenterX = centerX + complexDeltaX
      const newCenterY = centerY + complexDeltaY

      onCenterChange(newCenterX, newCenterY)
    },
    [width, height, zoom, centerX, centerY, onCenterChange]
  )

  const handleReset = useCallback(() => {
    onZoomChange(initialZoom)
    onCenterChange(initialCenterX, initialCenterY)
  }, [initialZoom, initialCenterX, initialCenterY, onZoomChange, onCenterChange])

  return {
    handleZoomIn,
    handleZoomOut,
    handlePan,
    handleReset,
  }
}
